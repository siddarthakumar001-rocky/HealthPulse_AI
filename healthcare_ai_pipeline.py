import json
import os
from typing import Any, Dict, Tuple

# Groq LPU Client with graceful local mock fallback
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
                                "eventStructure": {
                                    "eventType": "DIAGNOSTIC_ANALYSIS",
                                    "analysisId": "AUTO-GEN-HEALTH-2026",
                                    "timestamp": "2026-10-21T15:00:00Z"
                                },
                                "patient": {
                                    "patientId": "P-10023",
                                    "age": 32,
                                    "gender": "male",
                                    "dominantDosha": "Pitta"
                                },
                                "observations": {
                                    "biomarkers": [
                                        {"name": "Hemoglobin", "value": 10.4, "unit": "gm/dl", "status": "low"},
                                        {"name": "Glucose", "value": 92.0, "unit": "mg/dl", "status": "normal"},
                                        {"name": "WBC", "value": 6800.0, "unit": "/mcL", "status": "normal"}
                                    ],
                                    "vitals": {
                                        "heartRate": 74.0,
                                        "spo2": 98.5,
                                        "temperature": 36.8
                                    },
                                    "reportedSymptoms": ["Fatigue", "Mild dizziness", "Cold hands"]
                                },
                                "diagnosis": {
                                    "primaryCondition": "Mild Anemia / Pitta-Rakta Imbalance",
                                    "confidence": 0.94,
                                    "healthScore": 76,
                                    "riskLevel": "Moderate",
                                    "clinicalSummary": "Low hemoglobin (10.4 gm/dl) indicates microcytic iron deficiency anemia, correlating with reported fatigue and cold extremities."
                                },
                                "recommendations": {
                                    "medicines": [
                                        {
                                            "name": "Punarnavadi Mandoor",
                                            "benefit": "Classical Ayurvedic bio-iron formulation that enhances RBC production without constipation.",
                                            "category": "Hematopoietic Tonic"
                                        },
                                        {
                                            "name": "Draksharishta",
                                            "benefit": "Natural herbal fermentation that enhances micronutrient absorption and revitalizes blood tissues (Rakta Dhatu).",
                                            "category": "Rejuvenator"
                                        }
                                    ],
                                    "diet": [
                                        "Increase intake of iron-rich foods: pomegranates, black raisins, dates, and beetroot juice.",
                                        "Pair plant-based meals with vitamin C (fresh amla, lemon) to double non-heme iron absorption."
                                    ],
                                    "lifestyle": [
                                        "Practice moderate morning yoga and Sitali Pranayama to cool excessive Pitta heat.",
                                        "Avoid drinking black tea or coffee immediately following iron-rich meals."
                                    ],
                                    "precautions": [
                                        "Re-test complete blood count (CBC) in 30 days to measure reticulocyte response."
                                    ],
                                    "doshaAdvice": "Pacify Pitta by favoring sweet, bitter, and astringent tastes while reducing pungent spices and sour fermentations."
                                }
                            }
                            return Response(json.dumps(sample_cdm))
                        else:
                            return Response("HealthPulse AI Analysis: Your overall health score is 76/100, showing mild iron deficiency anemia alongside optimal cardiac vitals. Please review your personalized herbal remedies (Punarnavadi Mandoor) and dietary iron enhancements in your Prescription & Diet tabs.")

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
            if any(k in lower for k in ["emergency", "chest pain", "spo2 8", "severe"]):
                return "emergency_vitals_triage"
            elif any(k in lower for k in ["blood", "hemoglobin", "wbc", "glucose", "report", "lab"]):
                return "clinical_report_analysis"
            elif any(k in lower for k in ["dosha", "vata", "pitta", "kapha", "ayurveda", "herbal"]):
                return "ayurvedic_wellness_recommendation"
            return "general_health_support"

        @staticmethod
        def noul(state_variable: str, question: str) -> float:
            return 0.985

    jev = MockJev()


class HealthcareAiEngine:
    def __init__(self, groq_api_key: str = None, threshold: float = 0.95):
        self.client = Groq(api_key=groq_api_key or os.getenv("GROQ_API_KEY"))
        self.threshold = threshold

    # SECTION 1: HEALTHCARE ROUTING & INTENT (JEV jev.choice)
    def route_intent(self, user_raw_input: str) -> str:
        candidates = [
            "clinical_report_analysis",
            "ayurvedic_wellness_recommendation",
            "emergency_vitals_triage",
            "general_health_support"
        ]
        return jev.choice(state_variable=f'Patient Health Query: "{user_raw_input}"', candidates=candidates)

    # SECTION 2: HEALTHCARE CDM TRANSLATION (GROQ llama3-70b-8192 @ temp 0.0)
    def extract_healthcare_cdm(self, user_raw_input: str) -> Dict[str, Any]:
        system_prompt = (
            "You are a rigid Clinical AI Middleware Parser operating inside HealthPulse AI hospital portal. "
            "Your sole purpose is to convert raw patient lab results, vital telemetry, and reported symptoms "
            "into a strictly validated, minified JSON object matching the Healthcare Common Domain Model (Healthcare CDM).\n\n"
            "CRITICAL PIPELINE RULES:\n"
            "1. Output ONLY a valid JSON object.\n"
            "2. Absolutely DO NOT wrap your output in markdown formatting blocks (no ```json or ```).\n"
            "3. Do not include conversational filler or commentary.\n"
            "4. Extract all clinical primitives: Biomarkers, Status (low/normal/high), Vitals, Condition, Health Score, and Targeted Remedies (medicines, diet, lifestyle, doshaAdvice).\n"
            "5. If a parameter is missing, populate it as null. Never hallucinate non-indicated pharmaceutical medications."
        )

        user_prompt = f"""Analyze the patient case within <PATIENT_INPUT> and map it strictly into the target Healthcare CDM schema.

<PATIENT_INPUT>
{user_raw_input}
</PATIENT_INPUT>

Target Healthcare CDM Schema:
{{
  "eventStructure": {{
    "eventType": "DIAGNOSTIC_ANALYSIS",
    "analysisId": "AUTO-GEN-HEALTH-ID",
    "timestamp": "2026-10-21T15:00:00Z"
  }},
  "patient": {{
    "patientId": "P-CURRENT",
    "age": 30,
    "gender": "male",
    "dominantDosha": "Pitta"
  }},
  "observations": {{
    "biomarkers": [
      {{ "name": "[Biomarker name]", "value": 0.0, "unit": "[unit]", "status": "low/normal/high" }}
    ],
    "vitals": {{ "heartRate": 75.0, "spo2": 98.0, "temperature": 37.0 }},
    "reportedSymptoms": ["[extracted symptoms]"]
  }},
  "diagnosis": {{
    "primaryCondition": "[Clinical diagnosis or Optimal Wellness]",
    "confidence": 0.94,
    "healthScore": 75,
    "riskLevel": "Low/Moderate/Critical",
    "clinicalSummary": "[1-2 sentence evidence-based summary]"
  }},
  "recommendations": {{
    "medicines": [
      {{ "name": "[Ayurvedic / Supportive medicine name]", "benefit": "[therapeutic benefit]", "category": "[category]" }}
    ],
    "diet": ["[dietary recommendation]"],
    "lifestyle": ["[lifestyle recommendation]"],
    "precautions": ["[precautions]"],
    "doshaAdvice": "[Tailored dosha balancing guidance]"
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

    # SECTION 3: RISK & HALLUCINATION GUARDRAIL (JEV jev.noul)
    def evaluate_guardrail(self, user_raw_input: str, cdm_payload: Dict[str, Any]) -> Tuple[bool, float]:
        state_var = f"Patient Input: {user_raw_input}\nGenerated Healthcare CDM: {json.dumps(cdm_payload)}"
        evaluative_question = (
            "Does the Generated Healthcare CDM Object accurately reflect the clinical parameters, "
            "abnormal ranges, and medical intent without introducing hallucinatory drug dosages, "
            "unsafe medical claims, or erroneous diagnostic numbers?"
        )
        prob = jev.noul(state_variable=state_var, question=evaluative_question)
        return prob >= self.threshold, prob

    # SECTION 4: FRONTEND UI TOAST GENERATION (GROQ llama3-8b-8192 @ temp 0.6)
    def generate_ui_toast(self, verified_cdm: Dict[str, Any]) -> str:
        system_prompt = (
            "You are a compassionate, polished Clinical UX copywriter for HealthPulse AI. "
            "Your job is to translate complex laboratory and Ayurvedic CDM health records into "
            "delightful, clear, and actionable dashboard toast notifications for patients."
        )

        user_prompt = f"""Review this verified Healthcare CDM payload: {json.dumps(verified_cdm)}
Generate a precise, 2-sentence confirmation toast notification text to display on the user's dashboard screen.
- Sentence 1: Summarize their primary health status, health score, and main diagnostic observation.
- Sentence 2: Provide actionable next steps pointing them to their targeted medicines, dietary plan, or doctor consult tab."""

        response = self.client.chat.completions.create(
            model="llama3-8b-8192",
            temperature=0.6,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content.strip()

    def process(self, user_raw_input: str) -> Dict[str, Any]:
        if not user_raw_input or not user_raw_input.strip():
            return {"error": "Input cannot be empty."}

        # Cap length to 2000 chars
        if len(user_raw_input) > 2000:
            return {"error": "Input exceeds maximum limit of 2,000 characters."}

        sanitized_input = user_raw_input.replace("\0", "").strip()

        # 1. Routing
        route = self.route_intent(sanitized_input)
        if route == "emergency_vitals_triage":
            return {
                "route": route,
                "status": "EMERGENCY_DISPATCH",
                "alert": "CRITICAL",
                "message": "Critical physiological metrics detected. Dispatched hospital emergency alert."
            }

        # 2. Extract Healthcare CDM
        cdm = self.extract_healthcare_cdm(sanitized_input)

        # 3. Guardrail Check
        passed, prob = self.evaluate_guardrail(sanitized_input, cdm)
        if not passed:
            return {
                "route": route,
                "status": "REJECTED_CLINICIAN_REVIEW",
                "probability": prob,
                "reason": "Risk threshold failed (< 0.95). Forwarded to senior physician.",
                "cdm_draft": cdm
            }

        # 4. Generate UI Toast
        toast = self.generate_ui_toast(cdm)

        return {
            "route": route,
            "status": "SUCCESS_EVALUATED",
            "probability": prob,
            "cdm_payload": cdm,
            "ui_toast": toast
        }


if __name__ == "__main__":
    engine = HealthcareAiEngine()
    test_query = (
        "Patient CBC report: Hemoglobin is 10.4 gm/dl (low), WBC 6800, Platelets 250,000. "
        "Patient complains of daily fatigue and cold hands. Dosha constitution is Pitta. "
        "Recommend Ayurvedic remedies, iron-rich diet, and lifestyle changes."
    )
    print("Testing Healthcare AI Pipeline:")
    print("Query:", test_query)
    result = engine.process(test_query)
    print("\nResult:")
    print(json.dumps(result, indent=2))
