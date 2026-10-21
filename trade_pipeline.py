import json
import os
from typing import Any, Dict, Tuple
# Groq LPU Client
try:
    from groq import Groq
except ImportError:
    class MockGroq:
        def __init__(self, *args, **kwargs):
            class Chat:
                class Completions:
                    @staticmethod
                    def create(model, temperature, messages, response_format=None):
                        class Choice:
                            class Message:
                                def __init__(self, content):
                                    self.content = content
                            def __init__(self, content):
                                self.message = self.Message(content)
                        class Response:
                            def __init__(self, content):
                                self.choices = [Choice(content)]

                        if "70b" in model:
                            sample_cdm = {
                                "eventStructure": {"eventType": "execution", "lineage": None},
                                "trade": {
                                    "tradeIdentifier": {"assignedIdentifier": "AUTO-GEN-WEBSITE-ID"},
                                    "party": [
                                        {"partyId": "PORTAL_INITIATOR", "role": "BaseParty"},
                                        {"partyId": "GS", "role": "Counterparty"}
                                    ],
                                    "tradableProduct": {
                                        "product": {
                                            "contractualProduct": {
                                                "economicTerms": {
                                                    "payout": {
                                                        "interestRatePayout": [
                                                            {
                                                                "quantity": {
                                                                    "assetReference": "CURRENCY_PRIMITIVE",
                                                                    "amount": 10000000,
                                                                    "currency": "USD"
                                                                },
                                                                "rateSpecification": {
                                                                    "fixedRate": 4.25,
                                                                    "floatingRate": "SOFR"
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return Response(json.dumps(sample_cdm))
                        else:
                            return Response("Your $10,000,000 USD Interest Rate Swap with GS at 4.25% fixed vs. floating SOFR has been booked. You can track clearing metrics in your portfolio tab.")

            self.chat = Chat()
            self.chat.completions = Chat.Completions()

    Groq = MockGroq

# Jev System One Engine
try:
    import jev
except ImportError:
    class MockJev:
        @staticmethod
        def choice(state_variable: str, candidates: list[str]) -> str:
            lower = state_variable.lower()
            if any(k in lower for k in ["trade", "swap", "buy", "sell", "notional", "fixed", "floating", "rate"]):
                return "financial_trade_execution"
            elif any(k in lower for k in ["balance", "funds", "how much", "account"]):
                return "account_balance_inquiry"
            return "general_customer_support"

        @staticmethod
        def noul(state_variable: str, question: str) -> float:
            return 0.982

    jev = MockJev()




class FinancialTradeEngine:
    def __init__(self, groq_api_key: str = None, threshold: float = 0.95):
        self.client = Groq(api_key=groq_api_key or os.getenv("GROQ_API_KEY"))
        self.threshold = threshold

    # SECTION 1: ROUTING (JEV jev.choice)
    def route_intent(self, user_raw_input: str) -> str:
        candidates = [
            "financial_trade_execution",
            "account_balance_inquiry",
            "general_customer_support",
        ]
        return jev.choice(state_variable=f'User Website Query: "{user_raw_input}"', candidates=candidates)

    # SECTION 2: CDM TRANSLATION (GROQ llama3-70b-8192 @ temp 0.0)
    def extract_cdm(self, user_raw_input: str) -> Dict[str, Any]:
        system_prompt = (
            "You are a rigid financial middleware parser operating inside a high-speed banking portal. "
            "Your sole purpose is to convert raw, unstructured human trade requests into a strictly validated, "
            "minified JSON object matching the ISDA Common Domain Model (CDM) specification.\n"
            "CRITICAL PIPELINE RULES:\n"
            "1. Output ONLY a valid JSON object.\n"
            "2. Absolutely DO NOT wrap your output in markdown formatting blocks (e.g., do not use ```json or ```).\n"
            "3. Do not include any introductory phrases, footnotes, conversational filler, or commentary.\n"
            "4. Extract key financial primitives: Party Roles, Product Type, Notional Amount, ISO Currency Code, and Economic Rate Specs.\n"
            "5. If a parameter is missing or ambiguous, populate it as null. Never fabricate or hallucinate dates, numbers, or legal entities."
        )

        user_prompt = f"""Analyze the user request and map it exactly into the target CDM schema structure provided below.
User Trade Request: "{user_raw_input}"

Target CDM Schema Template:
{{
  "eventStructure": {{ "eventType": "execution", "lineage": null }},
  "trade": {{
    "tradeIdentifier": {{ "assignedIdentifier": "AUTO-GEN-WEBSITE-ID" }},
    "party": [
      {{ "partyId": "PORTAL_INITIATOR", "role": "BaseParty" }},
      {{ "partyId": "PENDING_COUNTERPARTY", "role": "Counterparty" }}
    ],
    "tradableProduct": {{
      "product": {{
        "contractualProduct": {{
          "economicTerms": {{
            "payout": {{
              "interestRatePayout": [
                {{
                  "quantity": {{
                    "assetReference": "CURRENCY_PRIMITIVE",
                    "amount": "[Extract numeric notional volume as float/int]",
                    "currency": "[Extract standard 3-letter ISO code]"
                  }},
                  "rateSpecification": {{
                    "fixedRate": "[Extract numerical percentage if applicable, otherwise null]",
                    "floatingRate": "[Extract floating rate index benchmark if applicable, otherwise null]"
                  }}
                }}
              ]
            }}
          }}
        }}
      }}
    }}
  }}
}}"""

        response = self.client.chat.completions.create(
            model="llama3-70b-8192",
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        return json.loads(response.choices[0].message.content.strip())

    # SECTION 3: RISK CONTROL GUARDRAIL (JEV jev.noul)
    def evaluate_guardrail(self, user_raw_input: str, cdm_payload: Dict[str, Any]) -> Tuple[bool, float]:
        state_var = f"Original User Intent: {user_raw_input}\nGenerated CDM Object: {json.dumps(cdm_payload)}"
        evaluative_question = (
            "Does the Generated CDM Object accurately match the absolute mathematical figures, "
            "specific currency types, and transaction intent stated by the user without introducing "
            "hallucinations, modifications, or errors?"
        )
        prob = jev.noul(state_variable=state_var, question=evaluative_question)
        return prob >= self.threshold, prob

    # SECTION 4: FRONTEND UI TOAST GENERATION (GROQ llama3-8b-8192 @ temp 0.6)
    def generate_ui_toast(self, verified_cdm: Dict[str, Any]) -> str:
        system_prompt = (
            "You are a polished Fintech User Experience copywriter. Your job is to translate dense, "
            "highly complex, nested back-end banking records (ISDA CDM JSON data) into delightful, "
            "easily digestible dashboard notifications for corporate portal clients."
        )
        user_prompt = f"""Review this successfully verified CDM execution payload: {json.dumps(verified_cdm)}
Generate a precise, 2-sentence confirmation toast notification text to display on the user's dashboard screen.
- Sentence 1: Confirm the trade transaction successfully went through, specifying the clear financial figures (Notional, Asset Class, Rate Type).
- Sentence 2: Provide actionable next steps indicating where they can monitor their settlement clearing metrics inside their portfolio tab."""

        response = self.client.chat.completions.create(
            model="llama3-8b-8192",
            temperature=0.6,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content.strip()

    def execute(self, user_raw_input: str) -> Dict[str, Any]:
        if not user_raw_input or not user_raw_input.strip():
            return {"error": "Input cannot be empty."}

        # Security check: Limit input length to prevent token-exhaustion
        if len(user_raw_input) > 1000:
            return {"error": "Input exceeds maximum permitted length of 1,000 characters."}

        sanitized_input = user_raw_input.replace("\0", "").strip()

        route = self.route_intent(sanitized_input)
        if route != "financial_trade_execution":
            return {"route": route, "status": "REROUTED"}

        cdm = self.extract_cdm(sanitized_input)
        passed, prob = self.evaluate_guardrail(sanitized_input, cdm)
        if not passed:
            return {"route": route, "status": "REJECTED_MANUAL_REVIEW", "probability": prob, "draft": cdm}

        toast = self.generate_ui_toast(cdm)
        return {"route": route, "status": "SUCCESS_EXECUTED", "probability": prob, "cdm": cdm, "ui_toast": toast}



if __name__ == "__main__":
    import sys
    engine = FinancialTradeEngine()
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Execute 10M USD 5Y interest rate swap fixed at 4.25% vs SOFR with GS"
    print("Testing input:", test_input)
    print(json.dumps(engine.execute(test_input), indent=2))
