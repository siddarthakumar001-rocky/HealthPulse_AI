/**
 * HealthPulse AI - Deterministic Clinical Red-Flag Safety Layer
 * Evaluates patient clinical prompts BEFORE any network or LLM execution.
 * Intercepts life-threatening emergencies deterministically without model latency.
 */

export interface RedFlagResult {
  isRedFlag: boolean;
  category?: 'CARDIAC' | 'STROKE_NEURO' | 'RESPIRATORY' | 'ANAPHYLAXIS' | 'HEMORRHAGE' | 'TRAUMA_CRISIS' | 'CRISIS_MENTAL';
  reason?: string;
  matchedTrigger?: string;
}

// 1. Deterministic Red-Flag Dictionaries (Multilingual & Clinical Keywords)
const RED_FLAG_PATTERNS = [
  // Cardiac Emergency
  {
    category: 'CARDIAC' as const,
    reason: 'Symptoms indicative of acute coronary syndrome or myocardial infarction.',
    pattern: /(chest\s*pain|crushing\s*chest|radiat(ing|es)?\s*(to\s*)?(left\s*arm|jaw|neck)|heart\s*attack|cardiac\s*arrest|choking\s*sensation\s*in\s*chest|छाती\s*में\s*दर्द|ಎದೆ\s*ನೋವು|நெஞ்சு\s*வலி|ఛాతీ\s*నొప్పి)/i
  },
  // Stroke / Neuro (FAST)
  {
    category: 'STROKE_NEURO' as const,
    reason: 'Symptoms indicative of acute cerebrovascular accident (Stroke / TIA).',
    pattern: /(facial\s*droop|face\s*numb|slurr(ed|ing)\s*speech|can'?t\s*speak|arm\s*weakness|one\s*side(d)?\s*(paralysis|numbness)|sudden\s*thunderclap\s*headache|लकवा|ಪಾರ್ಶ್ವವಾಯು|பக்கவாதம்|పక్షవాతం)/i
  },
  // Respiratory Distress
  {
    category: 'RESPIRATORY' as const,
    reason: 'Symptoms indicative of acute respiratory distress, severe airway compromise, or hypoxia.',
    pattern: /(can'?t\s*breathe|severe\s*shortness\s*of\s*breath|gasping\s*for\s*air|suffocat(ing|ion)|lips\s*turning\s*blue|stridor|choking|सांस\s*लेने\s*में\s*तकलीफ|ಉಸಿರಾಟದ\s*ತೊಂದರೆ|சுவாசக்\s*கோளாறு|శ్వాస\s*తీసుకోవడంలో\s*ఇబ్బంది)/i
  },
  // Anaphylaxis
  {
    category: 'ANAPHYLAXIS' as const,
    reason: 'Symptoms indicative of acute systemic allergic reaction / anaphylaxis.',
    pattern: /(throat\s*closing|tongue\s*swelling|unable\s*to\s*swallow|anaphyla(xis|ctic)|severe\s*allergic\s*reaction)/i
  },
  // Severe Hemorrhage
  {
    category: 'HEMORRHAGE' as const,
    reason: 'Symptoms indicative of acute gastrointestinal or pulmonary hemorrhage.',
    pattern: /(coughing\s*up\s*blood|vomiting\s*blood|hematemesis|hemoptysis|massive\s*bleeding|uncontrolled\s*bleeding)/i
  },
  // Acute Trauma / Loss of Consciousness
  {
    category: 'TRAUMA_CRISIS' as const,
    reason: 'Symptoms indicative of severe trauma or acute loss of consciousness.',
    pattern: /(unconscious|passed\s*out|unresponsive|severe\s*head\s*injury|concussion\s*with\s*vomiting)/i
  },
  // Mental Health Crisis
  {
    category: 'CRISIS_MENTAL' as const,
    reason: 'Expressions of self-harm or suicidal ideation requiring immediate crisis intervention.',
    pattern: /(kill\s*myself|suicid(e|al)|end\s*my\s*life|want\s*to\s*die|self[\s-]harm)/i
  }
];

/**
 * Deterministically checks user input for acute clinical red flags.
 * Must execute before making any external AI/LLM API calls.
 */
export function checkClinicalRedFlags(userInput: string): RedFlagResult {
  if (!userInput || typeof userInput !== 'string') {
    return { isRedFlag: false };
  }

  const clean = userInput.trim();

  for (const item of RED_FLAG_PATTERNS) {
    const match = clean.match(item.pattern);
    if (match) {
      return {
        isRedFlag: true,
        category: item.category,
        reason: item.reason,
        matchedTrigger: match[0],
      };
    }
  }

  return { isRedFlag: false };
}

/**
 * Strips direct personal identifiers (PII) before sending health questions to external AI models.
 */
export function redactPersonalIdentifiers(text: string): string {
  if (!text) return "";
  let redacted = text;
  // Redact email addresses
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  // Redact phone numbers (standard 10-digit, 5+5, or formatted numbers)
  redacted = redacted.replace(/(\+?\d{1,3}[-.\s]?)?(\d{5}[-.\s]?\d{5}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/g, "[REDACTED_PHONE]");
  // Redact names introduced by "My name is X" or "I am X"
  redacted = redacted.replace(/(my name is|i am|patient:)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)?)/gi, "$1 [PATIENT]");
  // Redact dates of birth (DD/MM/YYYY or MM/DD/YYYY)
  redacted = redacted.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, "[REDACTED_DATE]");
  return redacted;
}

/**
 * Structured clinical output shape enforced for all AI Doctor consultations.
 * Explicitly forbids: numeric confidence scores, definitive diagnoses, prescriptions, drug dosages.
 */
export interface StructuredClinicalAdvice {
  urgencyLevel: 'EMERGENCY' | 'URGENT_EVALUATION' | 'ROUTINE_CONSULT' | 'SELF_CARE';
  possibleCausesToDiscuss: string[];
  whatToWatchFor: string[];
  followUpQuestionsForDoctor: string[];
  clinicalNotes: string;
  disclaimer: string;
}

/**
 * Sanitizes any AI output to guarantee no prescription drug dosages are displayed.
 */
export function sanitizeAIOuput(text: string): string {
  if (!text) return "";
  // Strip drug dosages like "500 mg", "10ml", "2 tablets"
  let sanitized = text.replace(/\b\d+\s*(mg|mcg|ml|tablets?|capsules?|drops?|pills?)\b/gi, "[Dosage must be determined by your physician]");
  // Strip definitive diagnosis claims
  sanitized = sanitized.replace(/(you have|you are diagnosed with)\s+([a-zA-Z\s]+)/gi, "your symptoms may be related to $2, which should be evaluated by a doctor");
  return sanitized;
}
