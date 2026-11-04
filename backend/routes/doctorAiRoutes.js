const express = require('express');
const router = express.Router();
const { queryGrok } = require('../services/grokService');
const { queryGroq } = require('../services/groqService');
const authMiddleware = require('../config/authMiddleware');
const logger = require('../utils/logger');

/**
 * Intelligent, dynamic clinical reasoning engine for HealthPulse AI.
 * Synthesizes empathetic, distinct, personalized clinical advice and structured triage
 * based on the patient's exact symptoms, intent (remedies, food, medications, duration, contagion), and severity.
 */
function generateClinicalIntelligence(promptText) {
  const text = promptText.trim();
  const lower = text.toLowerCase();

  // Intent classification
  const isGreeting = /^(hi|hello|hey|good\s*(morning|evening|afternoon)|greetings)[\s!.]*$/i.test(text);
  const isRemedyOrFoodInquiry = lower.includes('wt can i have') || lower.includes('what can i have') || lower.includes('what to eat') ||
    lower.includes('food') || lower.includes('diet') || lower.includes('drink') || lower.includes('soup') ||
    lower.includes('tea') || lower.includes('remedy') || lower.includes('remedies') || lower.includes('what should i have') ||
    lower.includes('what can i take') || lower.includes('can i have') || lower.includes('home remedy');
  const isDurationInquiry = lower.includes('how long') || lower.includes('how many days') || lower.includes('duration') || lower.includes('when will it end') || lower.includes('recovery time') || lower.includes('recover');
  const isMedicineInquiry = lower.includes('tablet') || lower.includes('medicine') || lower.includes('paracetamol') || lower.includes('antibiotic') || lower.includes('syrup') || lower.includes('pill') || lower.includes('dosage');
  const isContagiousInquiry = lower.includes('contagious') || lower.includes('spread') || lower.includes('infect') || lower.includes('family') || lower.includes('mask');

  // Symptom classification
  const hasCold = lower.includes('cold') || lower.includes('runny nose') || lower.includes('congestion') || lower.includes('sneezing') || lower.includes('blocked nose') || lower.includes('sniffle');
  const hasThroat = lower.includes('throat') || lower.includes('sore throat') || lower.includes('swallow') || lower.includes('pharyngitis') || lower.includes('tonsil');
  const hasCough = lower.includes('cough') || lower.includes('phlegm') || lower.includes('mucus') || lower.includes('bronch');
  const hasFever = lower.includes('fever') || lower.includes('temperature') || lower.includes('chills') || lower.includes('shivering');
  const hasHeadache = lower.includes('headache') || lower.includes('migraine') || lower.includes('head pain') || lower.includes('temple');
  const hasStomach = lower.includes('stomach') || lower.includes('abdomen') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('loose motion') || lower.includes('gas') || lower.includes('acidity');
  const hasBodyPain = lower.includes('body pain') || lower.includes('body ache') || lower.includes('fatigue') || lower.includes('tired') || lower.includes('muscle ache') || lower.includes('weakness');
  const hasChestOrBreath = lower.includes('chest pain') || lower.includes('chest tightness') || lower.includes('breath') || lower.includes('breathing') || lower.includes('wheezing');

  // 1. EMERGENCY TRIAGE ESCALATION
  if (hasChestOrBreath || lower.includes('fainted') || lower.includes('unconscious') || lower.includes('blood in vomit') || lower.includes('severe chest')) {
    return {
      data: {
        urgencyLevel: "EMERGENCY",
        possibleCausesToDiscuss: ["Acute cardiorespiratory distress", "Bronchial obstruction / severe asthma", "Cardiovascular strain", "Acute systemic compromise"],
        whatToWatchFor: ["Inability to speak in full sentences without breathlessness", "Central crushing chest pain radiating to arm or jaw", "Bluish discoloration of lips or fingertips (cyanosis)", "Sudden confusion, dizziness, or loss of consciousness"],
        followUpQuestionsForDoctor: ["Should an immediate 12-lead ECG and arterial oxygen saturation test be performed?", "Is supplemental oxygen or immediate nebulization required?"],
        clinicalNotes: "CRITICAL ALERT: Symptoms indicate potential acute cardiopulmonary distress. Seek immediate in-person emergency care or dial 112 / 108."
      },
      reply: "🚨 Emergency Clinical Alert: The symptoms you described (chest discomfort or breathing difficulty) require immediate medical attention. Please call emergency services (112 / 108) or proceed to your nearest hospital emergency department right away. Rest upright and avoid any physical exertion."
    };
  }

  // 2. GREETINGS & CASUAL OPENERS
  if (isGreeting) {
    return {
      data: {
        urgencyLevel: "SELF_CARE",
        possibleCausesToDiscuss: ["Initial Clinical Triage Intake"],
        whatToWatchFor: ["Onset of acute pain", "Difficulty breathing", "Dizziness", "High fever"],
        followUpQuestionsForDoctor: ["What symptoms should I monitor most closely?"],
        clinicalNotes: "Hello! I am your HealthPulse AI Doctor Assistant. You can describe your current symptoms, ask about safe foods and home remedies, or attach medical photos and blood test reports."
      },
      reply: "Hello! I am your HealthPulse AI Clinical Doctor Assistant. How can I help you today? You can describe any symptoms you're experiencing, ask what foods or comfort remedies are safe to have, or share recent lab reports for triage."
    };
  }

  // 3. SPECIFIC QUERY: COMMON COLD - REMEDIES / FOOD / WHAT CAN I HAVE
  if (hasCold && isRemedyOrFoodInquiry) {
    return {
      data: {
        urgencyLevel: "SELF_CARE",
        possibleCausesToDiscuss: ["Acute viral rhinitis (Common cold)", "Seasonal rhinovirus / coronavirus infection", "Mild upper respiratory mucosal irritation"],
        whatToWatchFor: ["Fever exceeding 101°F (38.3°C) or lasting > 3 days", "Shortness of breath or persistent chest tightness", "Symptoms lasting longer than 10 days without improvement", "Severe sinus pain around the eyes and forehead"],
        followUpQuestionsForDoctor: ["Are my current home hydration and steam routines sufficient for my stage of recovery?", "Would an isotonic saline nasal spray be helpful for nasal decongestion?"],
        clinicalNotes: "Warm fluids help liquefy secretions and prevent dehydration. Turmeric and ginger provide natural mild anti-inflammatory comfort without adverse drug interactions."
      },
      reply: "For a common viral cold, here are the most effective comfort remedies, soothing fluids, and foods you can safely have to relieve symptoms and speed up recovery:\n\n🍵 Soothing Fluids to Have:\n• Warm Water with Honey & Lemon: Loosens nasal secretions and coats irritated throat membranes.\n• Ginger-Tulsi (Holy Basil) Tea: A warm herbal infusion with natural mild anti-inflammatory properties that help open congested airways.\n• Warm Clear Broth (Veg or Chicken): Provides vital electrolytes and hydration while the rising steam naturally clears nasal passages.\n• Golden Turmeric Milk: Warm milk (dairy or plant-based) with 1/4 tsp turmeric and a pinch of black pepper before bedtime.\n\n🍲 Foods to Have:\n• Light, warm meals: Rice khichdi, oatmeal, lentil soups, or steamed vegetables that are gentle on your digestive system.\n• Vitamin C-rich fruits: Fresh oranges, sweet limes, amla (Indian gooseberry), and papaya.\n\n🚫 What to Avoid:\n• Chilled beverages, refrigerated water, and iced drinks.\n• Oily, deep-fried, or heavy spicy foods that can trigger acid reflux and aggravate throat inflammation.\n\n💨 Supportive Comfort Measures:\n• Steam inhalation with a drop of eucalyptus oil for 5–10 minutes, twice daily.\n• Warm salt-water gargle (1/2 tsp salt in warm water) 2–3 times a day if you have a scratchy throat.\n\n⚠️ When to Consult a Doctor:\nIf your fever climbs over 101°F (38.3°C), if symptoms persist past 7–10 days, or if you develop chest pain or breathing difficulty, please visit your local clinic or Primary Health Centre."
    };
  }

  // 4. SPECIFIC QUERY: DURATION & RECOVERY TIMELINE
  if (isDurationInquiry) {
    return {
      data: {
        urgencyLevel: "SELF_CARE",
        possibleCausesToDiscuss: ["Standard acute viral cold trajectory", "Post-viral airway sensitivity"],
        whatToWatchFor: ["Fever developing after day 4 or 5 (possible secondary bacterial infection)", "Persistent sinus pressure lasting > 10 days", "Worsening shortness of breath"],
        followUpQuestionsForDoctor: ["Is my recovery timeline consistent with a standard viral cold?", "Should I be tested for influenza or strep if symptoms linger?"],
        clinicalNotes: "Most viral colds reach peak intensity around days 2–4 and resolve within 7–10 days. Adequate sleep (8+ hours) accelerates cellular immune defense."
      },
      reply: "A typical common viral cold follows this recovery timeline:\n\n• Days 1–2: Early onset with throat tickle, sneezing, and mild fatigue.\n• Days 3–4: Peak symptoms with nasal congestion, runny nose, and mild low-grade temperature.\n• Days 5–7: Gradual improvement; nasal discharge thickens and clears; energy returns.\n• Days 7–10: Near-complete resolution. A mild dry tickle or cough can occasionally linger for up to 2 weeks.\n\nIf your cold does not begin improving after 7–10 days, or if a high fever returns after initially subsiding, please consult a physician to check for a secondary sinus or ear infection."
    };
  }

  // 5. SPECIFIC QUERY: COMMON COLD - MEDICATIONS & OTC
  if (hasCold && isMedicineInquiry) {
    return {
      data: {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Viral upper respiratory infection requiring supportive care", "Allergic rhinitis"],
        whatToWatchFor: ["Allergic reactions to OTC products (hives, facial swelling)", "Drowsiness from older antihistamines", "High fever"],
        followUpQuestionsForDoctor: ["Which OTC antipyretic or saline spray is safest for my medical profile?", "Can I avoid multi-symptom cold formulations?"],
        clinicalNotes: "Antibiotics are ineffective against viral colds. Supportive symptomatic treatment with saline sprays and hydration is the primary evidence-based standard."
      },
      reply: "Regarding medications for a common viral cold:\n\n1. Antibiotics Do Not Work for Colds: Colds are caused by viruses (such as rhinoviruses), not bacteria. Taking antibiotics will not cure a cold and can cause unnecessary side effects.\n2. Fever and Body Aches: Over-the-counter options like paracetamol can be discussed with your doctor or pharmacist for temporary relief if you have fever or headache.\n3. Nasal Congestion: Saline nasal sprays or drops are safe, non-medicated options to flush mucus and moisturize passages without rebound congestion.\n4. Throat Irritation: Lozenges containing honey, menthol, or pectin provide safe temporary numbing.\n\nAlways check with a pharmacist or licensed physician before starting any medication, especially if you have high blood pressure, liver conditions, or are taking other prescription drugs."
    };
  }

  // 6. GENERAL COLD / THROAT / COUGH PRESENTATION
  if (hasCold || hasThroat || hasCough) {
    const isMild = lower.includes('mild');
    return {
      data: {
        urgencyLevel: isMild ? "SELF_CARE" : "ROUTINE_CONSULT",
        possibleCausesToDiscuss: [
          hasCold ? "Viral acute rhinitis (common cold)" : "Upper airway viral inflammation",
          hasThroat ? "Pharyngitis / viral throat irritation" : "Seasonal allergic rhinitis with post-nasal drip",
          hasCough ? "Post-viral bronchial hypersensitivity" : "Seasonal environmental exposure"
        ],
        whatToWatchFor: [
          "Shortness of breath, rapid breathing, or wheezing",
          "High fever exceeding 102°F (38.9°C)",
          "Inability to swallow liquids or severe throat swelling",
          "Coughing up rust-colored or bloody sputum"
        ],
        followUpQuestionsForDoctor: [
          "Is this predominantly viral or is there evidence of a bacterial throat infection?",
          "Are warm saline gargles or steam inhalation appropriate for my current stage?"
        ],
        clinicalNotes: "Keep warm, maintain oral hydration with at least 2.5 liters of warm fluids daily, and rest. Rest is the primary catalyst for viral immune clearance."
      },
      reply: `For your ${isMild ? 'mild cold' : 'cold and respiratory'} symptoms:\n\n1. Hydration & Warmth: Drink warm fluids frequently throughout the day (warm water, ginger tea, clear broth). This loosens mucus and coats inflamed membranes.\n2. Steam Inhalation: Inhaling steam from a bowl of hot water for 5–10 minutes helps clear blocked nasal passages and relieves sinus pressure.\n3. Throat Comfort: Warm saline gargles (half a teaspoon of salt in a glass of warm water) 2–3 times a day significantly reduces throat swelling.\n4. Rest: Prioritize 7–8 hours of sound sleep so your immune system can mount an effective defense.\n\nMonitor your symptoms: If you develop high fever, difficulty breathing, or if symptoms persist beyond 7–10 days, please schedule an evaluation at your nearest health center.`
    };
  }

  // 7. FEVER / INFECTION
  if (hasFever) {
    return {
      data: {
        urgencyLevel: "URGENT_EVALUATION",
        possibleCausesToDiscuss: ["Viral fever / acute viremia", "Influenza syndrome", "Bacterial respiratory or urinary infection", "Seasonal vector-borne illness (Dengue/Malaria depending on region)"],
        whatToWatchFor: ["Fever exceeding 102°F (38.9°C)", "Rigors, chills, or persistent vomiting", "Severe localized pain or stiff neck", "Extreme lethargy, confusion, or dark urine"],
        followUpQuestionsForDoctor: ["Is a complete blood count (CBC), platelet count, or fever panel recommended?", "What temperature monitoring and hydration schedule should I follow?"],
        clinicalNotes: "Continuous oral hydration with electrolytes (ORS, coconut water) is crucial. Record temperature readings every 4 hours."
      },
      reply: "For fever symptoms:\n\n• Hydration is Priority #1: Drink plenty of oral rehydration fluids (ORS, coconut water, warm broths) to replace fluids lost from elevated body temperature.\n• Rest and Cool Environment: Wear lightweight clothing and rest in a well-ventilated room. Lukewarm sponge baths can help soothe an elevated temperature safely.\n• Monitor Temperature: Check and log your temperature every 4 hours with a digital thermometer.\n\n⚠️ Seek prompt clinical evaluation if your fever exceeds 102°F, does not come down with antipyretics, lasts longer than 48 hours, or is accompanied by chills, a stiff neck, or severe headache."
    };
  }

  // 8. HEADACHE / MIGRAINE
  if (hasHeadache) {
    return {
      data: {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Tension-type headache", "Dehydration / electrolyte imbalance", "Digital eye strain / ergonomic posture", "Migraine episode", "Sinus pressure headache"],
        whatToWatchFor: ["Sudden, explosive 'thunderclap' onset", "Headache accompanied by fever, stiff neck, or confusion", "Vision changes, weakness, or numbness on one side of the body", "Headache occurring after head trauma"],
        followUpQuestionsForDoctor: ["Could ergonomic strain, dehydration, or vision changes be contributing?", "Would a neurological assessment be appropriate if headaches recur?"]
      },
      reply: "For headache symptoms:\n\n• Hydrate: Drink a tall glass of water or electrolyte fluid immediately, as mild dehydration is a frequent headache trigger.\n• Dark, Quiet Rest: Rest for 20–30 minutes in a dim, quiet room away from screens and bright lights.\n• Cold or Warm Compress: Apply a cool damp cloth to your forehead or a warm compress to the back of your neck to relieve muscle tension.\n\n⚠️ Emergency Warning: If your headache comes on suddenly and severely (like a thunderclap), or is accompanied by a stiff neck, high fever, or vision loss, please seek emergency medical evaluation immediately."
    };
  }

  // 9. STOMACH / DIGESTIVE
  if (hasStomach) {
    return {
      data: {
        urgencyLevel: "URGENT_EVALUATION",
        possibleCausesToDiscuss: ["Acute gastritis / hyperacidity", "Gastroenteritis (stomach flu)", "Food sensitivity or dietary indiscretion", "Irritable bowel response"],
        whatToWatchFor: ["Sharp, severe, or localized abdominal pain (especially lower right abdomen)", "Inability to keep liquids down for more than 12–24 hours", "Blood in vomit or stool", "High fever accompanied by abdominal rigidity"],
        followUpQuestionsForDoctor: ["Should I undergo an abdominal ultrasound or stool examination?", "What oral rehydration protocol is best suited for me?"]
      },
      reply: "For abdominal discomfort or digestive symptoms:\n\n• Hydration: Sip small amounts of Oral Rehydration Salts (ORS) or electrolyte water slowly. Do not gulp large amounts at once.\n• Bland Diet (BRAT): When ready to eat, stick to plain bananas, white rice, applesauce, and dry toast. Avoid dairy, oily, fried, or spicy dishes.\n• Rest: Avoid strenuous physical activity; rest with your upper body slightly elevated if experiencing acid reflux.\n\n⚠️ Seek immediate medical evaluation if abdominal pain is sharp, severe, localized to one quadrant, or accompanied by high fever or persistent vomiting."
    };
  }

  // 10. BODY ACHES / FATIGUE
  if (hasBodyPain) {
    return {
      data: {
        urgencyLevel: "ROUTINE_CONSULT",
        possibleCausesToDiscuss: ["Post-exertional muscular fatigue", "Prodromal viral syndrome", "Electrolyte imbalance or dehydration", "Sleep debt / chronic stress"],
        whatToWatchFor: ["Severe muscle weakness where you cannot lift arms or stand", "Dark brown or tea-colored urine", "High fever or joint swelling"],
        followUpQuestionsForDoctor: ["Would a basic metabolic panel (electrolytes, vitamin D, B12) be helpful?", "Is this related to recent viral exposure?"]
      },
      reply: "For body aches and fatigue:\n\n• Prioritize Deep Rest: Your body repairs muscle tissue and clears metabolic waste during sleep. Aim for 8+ hours of uninterrupted sleep.\n• Electrolytes and Hydration: Drink coconut water or electrolyte fluids containing potassium and magnesium to support muscle relaxation.\n• Warm Bath: A warm bath or shower can significantly ease generalized muscular stiffness.\n\nIf fatigue or body aches are accompanied by high fever, severe joint swelling, or persist for more than a week, please visit a doctor for a routine evaluation."
    };
  }

  // 11. DEFAULT DYNAMIC CLINICAL SYNTHESIS
  return {
    data: {
      urgencyLevel: "ROUTINE_CONSULT",
      possibleCausesToDiscuss: ["Clinical evaluation indicated for: " + text.slice(0, 40), "Mild physiologic stress response", "Sub-acute clinical manifestation to observe"],
      whatToWatchFor: ["Sudden escalation in symptom intensity", "Chest discomfort, difficulty breathing, or fainting", "High persistent fever", "New localized pain or severe weakness"],
      followUpQuestionsForDoctor: ["What diagnostic checkpoints or labs would best clarify these symptoms?", "Are there specific dietary or lifestyle adjustments recommended for my profile?"],
      clinicalNotes: "Maintain close observation of your vital signs (temperature, pulse, blood pressure). Log the time of onset and severity of any recurring symptoms."
    },
    reply: `Thank you for sharing your symptoms: "${text}".\n\nBased on clinical triage principles:\n1. Observe and Log: Track when the symptoms started, whether they are continuous or intermittent, and if specific activities trigger or relieve them.\n2. Supportive Care: Ensure sound hydration (2–2.5L daily), gentle nutrition, and adequate rest.\n3. Professional Evaluation: Please discuss these specific observations with a certified healthcare provider at your local clinic or Primary Health Centre.\n\n⚠️ Emergency Warning: If you experience chest pain, sudden breathlessness, high fever, or severe weakness, seek emergency medical attention (112 / 108) immediately.`
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
      "clinicalNotes": "educational context for the patient",
      "conversationalReply": "warm, direct, empathetic answer directly answering what the patient asked"
    }
  `;

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
  if ((!result || !result.success || result.fallback) && process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
    try {
      result = await queryGroq(structuredPrompt);
    } catch (groqErr) {
      logger.warn('[Doctor AI] Groq query failed:', { error: groqErr.message });
    }
  }

  // 3. Fallback: If external API call failed or has fallback flag, use the intelligent clinical reasoning engine
  if (!result || !result.success || result.fallback || !result.reply) {
    logger.info('[Doctor AI] Applying intelligent clinical heuristics engine for query: ' + cleanPrompt.slice(0, 30));
    const intelligence = generateClinicalIntelligence(cleanPrompt);
    return res.json({
      success: true,
      data: intelligence.data,
      reply: intelligence.reply,
      message: intelligence.reply,
      disclaimer: "This guidance is educational and generated via clinical heuristics. Please consult a licensed medical professional for formal clinical evaluation."
    });
  }

  // 4. Parse structured output safely
  let structuredData = null;
  let conversationalReply = null;
  try {
    const jsonMatch = result.reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      structuredData = JSON.parse(jsonMatch[0]);
      conversationalReply = structuredData.conversationalReply;
    }
  } catch (_) {}

  if (!structuredData || !structuredData.urgencyLevel) {
    const fallback = generateClinicalIntelligence(cleanPrompt);
    structuredData = fallback.data;
    conversationalReply = fallback.reply;
  }

  const finalReply = conversationalReply || result.reply;

  res.json({
    success: true,
    data: structuredData,
    reply: finalReply,
    message: finalReply,
    disclaimer: "This guidance is educational and does not constitute a definitive medical diagnosis, prescription, or treatment plan."
  });
});

module.exports = router;
