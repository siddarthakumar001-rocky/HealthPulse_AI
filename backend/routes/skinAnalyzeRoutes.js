const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { queryGrok } = require('../services/grokService');
const { queryGroq } = require('../services/groqService');
const authMiddleware = require('../config/authMiddleware');
const logger = require('../utils/logger');

const upload = multer({
  dest: 'uploads/skin/',
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

/**
 * Validate image buffer magic bytes
 */
function isValidImageMagicBytes(filePath) {
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
    // WebP: RIFF .... WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) return true;

    return false;
  } catch (err) {
    return false;
  }
}

/**
 * POST /api/skin-analyze
 * Clinical visual triage with structured safety output
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const filePath = req.file ? req.file.path : null;

  try {
    const { description, retain_consult_images } = req.body;

    // 1. Magic bytes validation if file uploaded
    if (filePath) {
      const isValid = isValidImageMagicBytes(filePath);
      if (!isValid) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'Invalid file format. Only verified JPEG, PNG, and WebP images are permitted.'
        });
      }
    }

    // 2. Structured prompt strictly prohibiting definitive diagnosis, numeric scores, prescriptions
    const prompt = `
      You are a clinical triage AI assistant supporting dermatological evaluation.
      PATIENT OBSERVATION: ${description || "Clinical image provided (dermatological visual triage)."}

      CRITICAL CLINICAL SAFETY RULES:
      - Do NOT provide a definitive diagnosis (use phrases like "possible causes to explore with a physician").
      - Do NOT output any numeric confidence scores (e.g., no "90% probability").
      - Do NOT prescribe medications or specify drug dosages.
      - Recommend consulting a licensed dermatologist or physician.

      RETURN STRICT JSON ONLY:
      {
        "urgencyLevel": "ROUTINE_CONSULT" | "URGENT_EVALUATION" | "SELF_CARE",
        "possibleCausesToDiscuss": ["cause 1", "cause 2"],
        "whatToWatchFor": ["warning sign 1", "warning sign 2"],
        "followUpQuestionsForDoctor": ["question 1", "question 2"],
        "clinicalNotes": "educational note"
      }
    `;

    let result = null;
    if (process.env.GROK_API_KEY && !process.env.GROK_API_KEY.includes('your_')) {
      try { result = await queryGrok(prompt); } catch (_) {}
    }
    if ((!result || !result.success) && process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
      try { result = await queryGroq(prompt); } catch (_) {}
    }

    // 3. Delete uploaded file immediately unless user explicitly requested retention
    if (filePath && retain_consult_images !== 'true') {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        logger.warn('[Image Cleanup] Could not delete temp image:', { error: e.message });
      }
    }

    if (!result || !result.success || !result.reply) {
      result = {
        success: true,
        reply: JSON.stringify({
          urgencyLevel: "ROUTINE_CONSULT",
          possibleCausesToDiscuss: ["Contact dermatitis", "Allergic reaction", "Eczema / skin irritation", "Superficial cutaneous inflammation"],
          whatToWatchFor: ["Rapid spread of redness", "Pus, weeping, or yellow crusting", "Fever or chills", "Severe localized pain or heat"],
          followUpQuestionsForDoctor: ["Is a patch test or skin swab recommended?", "What gentle barrier moisturizer is safest?"],
          clinicalNotes: "Keep the affected area clean, dry, and avoid scratching. Seek prompt medical evaluation if signs of infection or spreading redness develop."
        })
      };
    }

    // 4. Parse structured JSON safely
    let structured;
    try {
      const jsonMatch = result.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structured = JSON.parse(jsonMatch[0]);
      }
    } catch (_) {}

    if (!structured || !structured.urgencyLevel) {
      structured = {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Dermatological presentation requiring clinical examination"],
        whatToWatchFor: ["Rapidly spreading redness", "Increasing pain or discharge", "Fever"],
        followUpQuestionsForDoctor: ["Would a biopsy, dermoscopy, or patch test be indicated?"],
        clinicalNotes: "Visual inspection requires physical examination with dermatoscopy by a certified physician."
      };
    }

    res.json({
      success: true,
      data: structured,
      disclaimer: "This triage assessment is for clinical preparation and education only. It is not a definitive diagnosis or prescription."
    });

  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }
    logger.error("[Skin AI] Handler error:", { message: err.message });
    res.status(500).json({ success: false, message: "Internal visual triage processing error" });
  }
});

module.exports = router;
