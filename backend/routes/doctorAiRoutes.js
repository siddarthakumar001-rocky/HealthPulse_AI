const express = require('express');
const router = express.Router();
const { queryGrok } = require('../services/grokService');
const { queryGroq } = require('../services/groqService');
const authMiddleware = require('../config/authMiddleware');
const logger = require('../utils/logger');

/**
 * Generate compassionate, clinically sound fallback advice when external LLM is offline
 */
function generateClinicalFallback(promptText) {
  const lower = promptText.toLowerCase();

  // General conversational greeting (e.g. "hi", "hello", "hey")
  if (/^(hi|hello|hey|goods*(morning|evening|afternoon)|greetings)[s!.]*$/i.test(promptText.trim())) {
    return {
      data: {
        urgencyLevel: "SELF_CARE",
        possibleCausesToDiscuss: ["Initial Clinical Triage Intake"],
        whatToWatchFor: ["Onset of acute pain", "Difficulty breathing", "Dizziness", "High fever"],
        followUpQuestionsForDoctor: ["What symptoms should I monitor most closely?"],
        clinicalNotes: "Hello! I am your HealthPulse AI Doctor Assistant. Please describe any symptoms you are experiencing, questions about your blood test reports, or any discomfort you would like triaged."
      },
      reply: "Hello! I am your HealthPulse AI Doctor Assistant. Please describe any symptoms you are experiencing, ask about your blood or lab reports, or dictate your query via voice or image. How can I assist you with your health today?"
    };
  }

  // Headache / Migraine
  if (lower.includes('headache') || lower.includes('migraine') || lower.includes('head pain')) {
    return {
      data: {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Tension headache", "Dehydration", "Digital eye strain", "Migraine episode", "Sinus pressure"],
        whatToWatchFor: ["Sudden severe 'thunderclap' onset", "Stiff neck or high fever", "Visual aura or confusion", "Headache after head trauma"],
        followUpQuestionsForDoctor: ["Would a neurological or ophthalmic assessment be helpful?", "Could ergonomic factors or hydration contribute?"],
        clinicalNotes: "Ensure quiet rest in a darkened room, hydrate well with electrolytes, and track headache triggers. Seek immediate emergency evaluation if the headache is sudden and extraordinarily severe."
      },
      reply: "Based on clinical triage principles for headache: Potential factors to discuss with a physician include tension, dehydration, or eye strain. Stay well hydrated, rest in a dim environment, and seek emergency care if accompanied by neck stiffness, high fever, or vision loss."
    };
  }

  // Fever / Infection
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
    return {
      data: {
        urgencyLevel: "URGENT_EVALUATION",
        possibleCausesToDiscuss: ["Viral respiratory infection", "Influenza", "Bacterial infection", "Systemic inflammatory response"],
        whatToWatchFor: ["Fever exceeding 102°F (38.9°C)", "Difficulty breathing or chest pressure", "Severe lethargy or confusion", "Persistent vomiting"],
        followUpQuestionsForDoctor: ["Is a complete blood count (CBC) or viral panel indicated?", "What fever monitoring schedule is best?"],
        clinicalNotes: "Hydrate frequently, monitor body temperature every 4 hours, and rest. Do not hesitate to seek direct clinical care if fever persists beyond 48 hours or escalates."
      },
      reply: "For fever symptoms: Ensure continuous hydration, rest, and temperature charting. If your fever exceeds 102°F, persists over 48 hours, or is accompanied by breathing difficulty, please visit your nearest primary health center or clinic promptly."
    };
  }

  // Cough / Cold / Throat
  if (lower.includes('cough') || lower.includes('cold') || lower.includes('sore throat') || lower.includes('phlegm')) {
    return {
      data: {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Upper respiratory viral infection", "Pharyngitis", "Allergic rhinitis", "Bronchial irritation"],
        whatToWatchFor: ["Shortness of breath or wheezing", "Blood in phlegm", "Inability to swallow liquids", "High fever"],
        followUpQuestionsForDoctor: ["Is this viral or bacterial?", "Are warm saline gargles or steam inhalation recommended?"],
        clinicalNotes: "Warm fluids, honey-lemon soothing remedies, and saline gargles can alleviate throat irritation. Seek medical attention if wheezing or breathing difficulty develops."
      },
      reply: "For cough and cold symptoms: Keep warm, hydrate with soothing fluids, and practice warm saline gargles. Consult a doctor promptly if you develop shortness of breath, high fever, or chest tightness."
    };
  }

  // Stomach / Abdominal pain
  if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('diarrhea')) {
    return {
      data: {
        urgencyLevel: "URGENT_EVALUATION",
        possibleCausesToDiscuss: ["Acute gastritis", "Gastroenteritis (stomach flu)", "Food sensitivity", "Acid reflux episode"],
        whatToWatchFor: ["Severe localized abdominal tenderness (especially lower right)", "Inability to keep liquids down for 24h", "High fever or blood in stool"],
        followUpQuestionsForDoctor: ["Should I undergo an abdominal ultrasound or stool analysis?", "What oral rehydration protocol should I follow?"],
        clinicalNotes: "Sip oral rehydration salts (ORS) slowly. Avoid heavy, oily, or spicy foods. Seek in-person emergency evaluation if pain is severe, sharp, or localized."
      },
      reply: "For abdominal discomfort or digestive symptoms: Maintain oral hydration with electrolytes, adhere to a bland diet (toast, rice, bananas), and consult a doctor immediately if pain becomes sharp, severe, or is accompanied by fever or persistent vomiting."
    };
  }

  // Default general clinical guidance
  return {
    data: {
      urgencyLevel: "ROUTINE_CONSULT",
      possibleCausesToDiscuss: ["General physiological response", "Mild lifestyle or environmental stressor", "Sub-acute clinical symptom"],
      whatToWatchFor: ["Sudden severe pain", "Chest pressure", "Shortness of breath", "High fever", "Dizziness or fainting"],
      followUpQuestionsForDoctor: ["What diagnostic tests would be most helpful for this?", "Are there specific warning signs I should watch for?"],
      clinicalNotes: "Please discuss your symptoms directly with a licensed medical professional. Maintain good hydration, rest, and keep a log of when the symptoms occur and their intensity."
    },
    reply: `Based on your description ("${promptText.trim()}"): It is advisable to monitor your vital signs (heart rate, temperature, blood pressure) and discuss these observations directly with a healthcare provider. If symptoms worsen, cause significant distress, or are accompanied by breathing difficulty or chest discomfort, seek direct medical evaluation immediately.`
  };
}

/**
 * POST /api/doctor-ai
 * Consult the AI Doctor with structured clinical guidance
 */
router.post('/doctor-ai', authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Clinical prompt is required." });
  }

  const cleanPrompt = prompt.trim();

  // Enforce structured clinical prompt format
  const structuredPrompt = `
    You are an AI Clinical Assistant for HealthPulse AI.
    PATIENT SYMPTOM / QUERY: ${cleanPrompt}

    CRITICAL CLINICAL SAFETY RULES:
    1. NEVER make a definitive diagnosis (use "potential causes to discuss with your doctor").
    2. NEVER output numeric confidence scores or probabilities (e.g. no "95% confidence").
    3. NEVER prescribe medications, specify drug doses, or suggest specific drug quantities.
    4. Focus on red flags, warning signs, questions for the doctor, and safe comfort measures.

    RETURN STRICT JSON FORMAT ONLY:
    {
      "urgencyLevel": "EMERGENCY" | "URGENT_EVALUATION" | "ROUTINE_CONSULT" | "SELF_CARE",
      "possibleCausesToDiscuss": ["cause 1", "cause 2"],
      "whatToWatchFor": ["warning sign 1", "warning sign 2"],
      "followUpQuestionsForDoctor": ["question 1", "question 2"],
      "clinicalNotes": "educational context for the patient"
    }
  `;

  // Log only telemetry metadata, NEVER patient medical query content
  logger.info('[Doctor AI] Processing consultation request', {
    userId: req.user?.id ? 'authenticated' : 'anonymous',
    timestamp: new Date().toISOString()
  });

  let result = null;

  // 1. Try Grok first if GROK_API_KEY is present
  if (process.env.GROK_API_KEY && !process.env.GROK_API_KEY.includes('your_')) {
    try {
      result = await queryGrok(structuredPrompt);
    } catch (grokErr) {
      logger.warn('[Doctor AI] Grok query failed, falling back:', { error: grokErr.message });
    }
  }

  // 2. Try Groq if GROQ_API_KEY is present
  if ((!result || !result.success) && process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
    try {
      result = await queryGroq(structuredPrompt);
    } catch (groqErr) {
      logger.warn('[Doctor AI] Groq query failed:', { error: groqErr.message });
    }
  }

  // 3. Fallback: If external API call failed, generate reliable offline clinical heuristics
  if (!result || !result.success || !result.reply) {
    logger.info('[Doctor AI] External LLM unavailable, applying clinical heuristic engine');
    const fallback = generateClinicalFallback(cleanPrompt);
    return res.json({
      success: true,
      data: fallback.data,
      reply: fallback.reply,
      message: fallback.reply,
      disclaimer: "This guidance is educational and generated via clinical heuristics. Please consult a licensed medical professional for formal clinical evaluation."
    });
  }

  // 4. Parse structured output safely
  let structuredData = null;
  try {
    const jsonMatch = result.reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      structuredData = JSON.parse(jsonMatch[0]);
    }
  } catch (_) {}

  if (!structuredData || !structuredData.urgencyLevel) {
    const fallback = generateClinicalFallback(cleanPrompt);
    structuredData = fallback.data;
  }

  res.json({
    success: true,
    data: structuredData,
    reply: result.reply,
    message: result.reply,
    disclaimer: "This guidance is educational and does not constitute a definitive medical diagnosis, prescription, or treatment plan."
  });
});

module.exports = router;
