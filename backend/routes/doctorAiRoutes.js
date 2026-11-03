const express = require('express');
const router = express.Router();
const { queryGroq } = require('../services/groqService');
const authMiddleware = require('../config/authMiddleware');
const logger = require('../utils/logger');

/**
 * POST /api/doctor-ai
 * Consult the AI Doctor with structured clinical guidance
 */
router.post('/doctor-ai', authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Clinical prompt is required." });
  }

  // Enforce structured clinical prompt format
  const structuredPrompt = `
    You are an AI Clinical Assistant for HealthPulse AI.
    PATIENT SYMPTOM / QUERY: ${prompt.trim()}

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

  const result = await queryGroq(structuredPrompt);
  
  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: "AI Clinical consultation service temporarily unavailable."
    });
  }

  // Parse structured output safely
  let structuredData = null;
  try {
    const jsonMatch = result.reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      structuredData = JSON.parse(jsonMatch[0]);
    }
  } catch (_) {}

  if (!structuredData || !structuredData.urgencyLevel) {
    structuredData = {
      urgencyLevel: "ROUTINE_CONSULT",
      possibleCausesToDiscuss: ["Symptoms require direct physical clinical evaluation"],
      whatToWatchFor: ["Persistent or escalating pain", "Difficulty breathing", "High fever", "Dizziness"],
      followUpQuestionsForDoctor: ["What diagnostic tests would be most helpful?", "Are there specific warning signs I should watch for?"],
      clinicalNotes: result.reply || "Please discuss your symptoms directly with a licensed medical professional."
    };
  }

  res.json({
    success: true,
    data: structuredData,
    reply: result.reply,
    disclaimer: "This guidance is educational and does not constitute a definitive medical diagnosis, prescription, or treatment plan."
  });
});

module.exports = router;
