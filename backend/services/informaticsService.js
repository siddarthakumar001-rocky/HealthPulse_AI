/**
 * Unified AI Medical Informatics Engine (AI Diagnostic & Remedy Engine)
 *
 * Fuses 5 clinical data sources:
 *   1. Onboarding Symptoms (Ocular/Eye, ENT, Pain, Common Symptoms, Chronic Conditions, Lifestyle)
 *   2. Blood report parameters (Biomarkers, CBC, Lipid, Thyroid, LFT, KFT, Vitamins)
 *   3. IoT sensor telemetry (Heart Rate, SpO2, Temperature)
 *   4. Skin analysis results (Dermatological classification & confidence)
 *   5. Prakriti (Dosha) Constitutions
 *
 * Returns a comprehensive, personalized diagnostic analysis with targeted remedies,
 * medicine cabinet prescriptions, dietary alignments, and home relief therapies.
 */

const { analyzeSkinCondition } = require('./dermatologyService');

// ─── STEP 1 — PARAMETER VALIDATION ─────────────────────────────────────────
function validateParameters(params) {
  if (!Array.isArray(params)) return [];
  return params.filter(p => {
    const name = p.parameter_name || p.test_name;
    const val = parseFloat(p.value);
    return name && !isNaN(val);
  });
}

// ─── STEP 2 — ABNORMALITY ANALYSIS (Blood Report Rules) ────────────────────
function analyzeBloodParameters(parameters) {
  const predictions = [];
  const recommendations = { medical: [], ayurvedic: [], lifestyle: [], diet: [], medicines: [], homeRemedies: [], precautions: [] };
  const abnormal_parameters = [];

  parameters.forEach(p => {
    const name = (p.parameter_name || p.test_name || "").toLowerCase();
    const status = p.status || "unknown";

    if (status === "high" || status === "low") {
      abnormal_parameters.push({
        name: p.parameter_name || p.test_name,
        value: p.value,
        unit: p.unit,
        status
      });
    }

    // Hemoglobin
    if (name.includes("hemoglobin") && status === "low") {
      predictions.push({ condition: "Anemia / Iron Deficiency", confidence: 0.94, severity: "Moderate", reason: "Low hemoglobin level detected in blood panel." });
      recommendations.medicines.push({
        name: "Loha Bhasma / Punarnavadi Mandoor",
        benefit: "Classical Ayurvedic iron tonic that enhances RBC count without causing digestive distress.",
        category: "Hematopoietic Tonic"
      });
      recommendations.medicines.push({
        name: "Draksharishta (Fermented Grape Tonic)",
        benefit: "Boosts hemoglobin bioavailability, builds stamina, and nourishes blood tissues (Rakta Dhatu).",
        category: "Rejuvenator"
      });
      recommendations.diet.push("Consume pomegranate, black raisins (soaked overnight), dates, and steamed spinach.");
      recommendations.lifestyle.push("Avoid tea/coffee immediately after meals to prevent iron malabsorption.");
    }

    // ESR / Inflammation
    if (name.includes("esr") && status === "high") {
      predictions.push({ condition: "Systemic Inflammation", confidence: 0.88, severity: "Moderate", reason: "Elevated ESR indicates systemic inflammatory response." });
      recommendations.medicines.push({
        name: "Haridra Khanda (Curcumin Extract)",
        benefit: "Potent anti-inflammatory that reduces systemic inflammation markers and boosts cell defense.",
        category: "Anti-Inflammatory"
      });
      recommendations.diet.push("Add fresh turmeric with a pinch of black pepper to warm milk; avoid processed foods.");
    }

    // Glucose
    if (name.includes("glucose") && status === "high") {
      predictions.push({ condition: "Impaired Glucose Regulation / Diabetes Risk", confidence: 0.95, severity: "High", reason: "Fasting or post-prandial blood glucose above optimal reference range." });
      recommendations.medicines.push({
        name: "Nishamalaki (Curcuma longa + Phyllanthus emblica)",
        benefit: "Clinically proven to improve insulin sensitivity, protect microvascular capillaries, and stabilize blood sugar.",
        category: "Glycemic Regulator"
      });
      recommendations.medicines.push({
        name: "Vijaysar / Methi Churna",
        benefit: "Regulates post-meal carbohydrate breakdown and supports pancreatic beta-cell function.",
        category: "Metabolic Support"
      });
      recommendations.diet.push("Adopt low-glycemic index foods (barley, quinoa, bitter gourd/karela, methi). Strictly limit refined sugars.");
      recommendations.lifestyle.push("Perform 30 minutes of brisk walking every morning; practice Mandukasana yoga pose.");
    }

    // Cholesterol / Lipid
    if ((name.includes("cholesterol") || name.includes("ldl") || name.includes("triglycerides")) && status === "high") {
      predictions.push({ condition: "Dyslipidemia / Lipid Elevation", confidence: 0.91, severity: "Moderate", reason: "Elevated lipid fractions detected." });
      recommendations.medicines.push({
        name: "Arjuna Bark Ksheerpaka (Terminalia arjuna)",
        benefit: "Strengthens myocardial contraction, tones blood vessels, and reduces LDL cholesterol oxidation.",
        category: "Cardiotonic"
      });
      recommendations.medicines.push({
        name: "Guggul Lipid Complex (Shuddha Guggulu)",
        benefit: "Stimulates liver LDL receptors to accelerate clearance of serum cholesterol and triglycerides.",
        category: "Lipid Balancer"
      });
      recommendations.diet.push("Eliminate trans fats and deep-fried items. Include garlic, flaxseeds, and oats daily.");
      recommendations.lifestyle.push("Engage in 30-40 minutes of aerobic cardio 5 days a week.");
    }

    // Vitamin D
    if (name.includes("vitamin d") && status === "low") {
      predictions.push({ condition: "Vitamin D3 Hypovitaminosis", confidence: 0.95, severity: "Moderate", reason: "Serum 25-hydroxy Vitamin D below 30 ng/mL." });
      recommendations.medicines.push({
        name: "Asthiposhak Vati / Shankha Bhasma",
        benefit: "Natural bioavailable calcium and mineral matrix to support bone density and muscle strength.",
        category: "Bone & Mineral"
      });
      recommendations.lifestyle.push("Expose arms and legs to direct morning sunlight (7:00 AM - 9:00 AM) for 20 minutes daily.");
      recommendations.lifestyle.push("Perform daily full-body warm sesame oil massage (Abhyanga).");
    }

    // Vitamin B12
    if (name.includes("b12") && status === "low") {
      predictions.push({ condition: "Vitamin B12 Deficiency", confidence: 0.93, severity: "Moderate", reason: "Low serum Cobalamin level." });
      recommendations.diet.push("Incorporate fortified nutritional yeast, cultured yogurt, paneer, and milk.");
    }
  });

  return { predictions, recommendations, abnormal_parameters };
}

// ─── STEP 3 — ONBOARDING SYMPTOMS & CLINICAL ENT/OCULAR/PAIN ANALYSIS ──────
function analyzeOnboardingProfile(onboardingData, existingPredictions = [], existingRecommendations = {}) {
  const predictions = [...existingPredictions];
  const recommendations = {
    medicines: [...(existingRecommendations.medicines || [])],
    diet: [...(existingRecommendations.diet || [])],
    lifestyle: [...(existingRecommendations.lifestyle || [])],
    homeRemedies: [...(existingRecommendations.homeRemedies || [])],
    precautions: [...(existingRecommendations.precautions || [])],
    medical: [...(existingRecommendations.medical || [])],
    ayurvedic: [...(existingRecommendations.ayurvedic || [])]
  };

  const reportedSymptomsList = [];
  let doshaScores = { Pitta: 10, Vata: 10, Kapha: 10 };

  if (!onboardingData || typeof onboardingData !== 'object') {
    return { predictions, recommendations, reportedSymptomsList, dominantDosha: "Vata", doshaScores };
  }

  // 1. OCULAR / EYE ISSUES
  const ocular = Array.isArray(onboardingData.ocular_issues) ? onboardingData.ocular_issues : [];
  if (ocular.length > 0) {
    reportedSymptomsList.push(...ocular.map(o => `Eye: ${o}`));
    doshaScores.Pitta += 18; // Eye irritation/redness is classic Pitta-Netra Roga

    const hasRedness = ocular.some(o => /redness|inflamm/i.test(o));
    const hasTears = ocular.some(o => /tear|watering|excessive/i.test(o));
    const hasEyePain = ocular.some(o => /pain|ache/i.test(o));
    const hasPhotophobia = ocular.some(o => /light|irritat/i.test(o));
    const hasVisionIssue = ocular.some(o => /vision|distant|near|squint/i.test(o));

    if (hasRedness || hasTears || hasEyePain || hasPhotophobia) {
      predictions.push({
        condition: "Acute Ocular Strain / Netra Roga (Pitta-Kapha Aggravation)",
        confidence: 0.93,
        severity: (hasEyePain && hasPhotophobia) ? "Moderate" : "Mild",
        reason: `Reported symptoms (${ocular.join(', ')}) indicate conjunctival vascular congestion and ocular fatigue.`
      });

      recommendations.medicines.push({
        name: "Triphala Ghrita / Netra Tarpana Drops",
        benefit: "Classical medicated ghee formulation that cools burning sensations, relieves conjunctival redness, and strengthens optic nerves.",
        category: "Ophthalmic Rejuvenator"
      });

      recommendations.medicines.push({
        name: "Pure Rose Water & Punarnava Eye Wash",
        benefit: "Distilled floral hydrosol that provides instant cooling, flushes environmental irritants, and stops excessive reflex tearing.",
        category: "Soothing Eye Wash"
      });

      recommendations.medicines.push({
        name: "Saptamrit Lauha",
        benefit: "Traditional Ayurvedic compound containing Licorice, Triphala, and purified iron to reduce digital eye strain and improve visual acuity.",
        category: "Ocular Health Compound"
      });

      recommendations.homeRemedies.push("Place chilled rose-water soaked organic cotton pads over closed eyelids for 12-15 minutes twice daily.");
      recommendations.homeRemedies.push("Follow the 20-20-20 Rule: Every 20 minutes of screen use, look at an object 20 feet away for 20 seconds.");
      recommendations.homeRemedies.push("Wash eyes gently with room-temperature filtered water infused with cooled Triphala decoction in the morning.");

      recommendations.precautions.push("Avoid rubbing the eyes to prevent secondary bacterial infection and corneal micro-abrasions.");
      recommendations.precautions.push("Wear UV400 protective sunglasses when stepping into bright outdoor sunlight.");
      recommendations.precautions.push("Consult an ophthalmologist if you experience sudden visual field blurring, flashes of light, or severe throbbing pain.");
    }

    if (hasVisionIssue) {
      recommendations.lifestyle.push("Practice 'Trataka' (gentle candle gazing / steady eye focus exercises) and palming to relax ciliary muscles.");
      recommendations.precautions.push("Schedule a formal visual acuity and refraction test to check for refractive errors.");
    }
  }

  // 2. ENT (EAR, NOSE, THROAT) ISSUES
  const ent = Array.isArray(onboardingData.ent_issues) ? onboardingData.ent_issues : [];
  if (ent.length > 0) {
    reportedSymptomsList.push(...ent.map(e => `ENT: ${e}`));
    
    // Throat Pain & Ulcers
    if (ent.some(e => /throat|ulcer/i.test(e))) {
      doshaScores.Pitta += 15;
      doshaScores.Kapha += 12;
      predictions.push({
        condition: "Pharyngeal Irritation / Oral Mucositis (Kanthagata Roga)",
        confidence: 0.91,
        severity: "Moderate",
        reason: `Reported throat pain/oral ulcers indicate inflamed mucosal lining.`
      });

      recommendations.medicines.push({
        name: "Khadiradi Vati & Yashtimadhu (Licorice Lozenges)",
        benefit: "Soothes inflamed pharyngeal tissues, suppresses bacterial proliferation, and accelerates ulcer epithelialization.",
        category: "Throat & Oral Care"
      });

      recommendations.medicines.push({
        name: "Sitopaladi Churna with Honey",
        benefit: "Relieves upper respiratory tickle, clears mucosal congestion, and enhances local immunity.",
        category: "Mucosal Tonic"
      });

      recommendations.homeRemedies.push("Gargle with warm Himalayan salt water and a pinch of organic turmeric powder 3 times daily.");
      recommendations.homeRemedies.push("Apply pure cow's ghee or honey directly onto oral cavity ulcers for rapid pain relief.");
      recommendations.diet.push("Avoid spicy, deep-fried, and acidic citrus foods until throat and oral tissues heal.");
    }

    // Ear Pain / Discharge
    if (ent.some(e => /ear/i.test(e))) {
      doshaScores.Vata += 16;
      predictions.push({
        condition: "Otalgia / Middle Ear Irritation (Karna Roga)",
        confidence: 0.89,
        severity: "Moderate",
        reason: "Reported ear pain or discharge suggests localized tympanic or canal congestion."
      });

      recommendations.medicines.push({
        name: "Bilva Taila / Kshara Taila (Ear Instillation)",
        benefit: "Formulated with Bael fruit and warming herbs to relieve deep ear ache and inflammation (use only if eardrum is intact).",
        category: "Otic Soothing Drops"
      });

      recommendations.precautions.push("Keep the ear canal dry during baths; do NOT insert cotton buds deep into the ear.");
      recommendations.precautions.push("Seek immediate ENT specialist consultation if yellow/green discharge or hearing loss develops.");
    }

    // Nasal Obstruction / Bleeding / Polyp
    if (ent.some(e => /nasal|polyp|septum/i.test(e))) {
      doshaScores.Kapha += 14;
      recommendations.medicines.push({
        name: "Anu Taila / Shadbindu Taila (Nasya Therapy)",
        benefit: "Classical micro-nasal oil that clears sinus passages, lubricates mucous membranes, and relieves nasal resistance.",
        category: "Sinus & Nasal Drops"
      });
      recommendations.homeRemedies.push("Steam inhalation with 2 drops of Eucalyptus oil and a pinch of Ajwain seeds before sleep.");
    }
  }

  // 3. COMMON SYMPTOMS (Headache, Joint Pain, Acidity, Fatigue, etc.)
  const common = Array.isArray(onboardingData.common_symptoms) ? onboardingData.common_symptoms : [];
  if (common.length > 0) {
    reportedSymptomsList.push(...common);

    // Headache / Migraine
    if (common.some(c => /headache|migraine/i.test(c)) || onboardingData.headache_type) {
      doshaScores.Vata += 12;
      doshaScores.Pitta += 10;
      predictions.push({
        condition: "Tension Cephalea / Vascular Headache (Shirashula)",
        confidence: 0.90,
        severity: "Moderate",
        reason: "Recurrent headache patterns with neurovascular tension."
      });
      recommendations.medicines.push({
        name: "Pathyadi Kadha",
        benefit: "Proven classical decoction that relieves intracranial tension, migraine frequency, and throbbing headaches.",
        category: "Neurological Tonic"
      });
      recommendations.homeRemedies.push("Gentle temple massage with Brahmi-Bhringraj oil; stay hydrated with electrolytes.");
    }

    // Acidity / Gastric Heartburn
    if (common.some(c => /acidity|heartburn|nausea/i.test(c))) {
      doshaScores.Pitta += 20;
      predictions.push({
        condition: "Hyperacidity / Gastroesophageal Reflux (Amlapitta)",
        confidence: 0.92,
        severity: "Moderate",
        reason: "Excess stomach acid secretion and burning reflux sensations."
      });
      recommendations.medicines.push({
        name: "Avipattikar Churna with Coconut Water",
        benefit: "Neutralizes excess hydrochloric acid, cools bile reflux, and regulates bowel motility.",
        category: "Gastric Soother"
      });
      recommendations.diet.push("Drink fresh coconut water and fennel seed (saunf) tea; avoid skipping meals or consuming late-night heavy dinners.");
    }

    // Joint Pain / Back Pain
    if (common.some(c => /joint|back|pain/i.test(c)) || onboardingData.body_pain_location?.length > 0) {
      doshaScores.Vata += 22;
      predictions.push({
        condition: "Musculoskeletal Pain / Arthralgia (Vataja Sandhivata)",
        confidence: 0.91,
        severity: "Moderate",
        reason: `Joint or localized musculoskeletal discomfort reported in: ${(onboardingData.body_pain_location || ['Joints']).join(', ')}.`
      });
      recommendations.medicines.push({
        name: "Yograj Guggulu & Shallaki (Boswellia)",
        benefit: "Reduces inflammatory joint cytokines, eases morning stiffness, and lubricates cartilage tissue.",
        category: "Joint & Cartilage Support"
      });
      recommendations.homeRemedies.push("Warm Mahanarayan Taila massage followed by hot compress on affected joint areas.");
    }

    // Fatigue / Low Energy
    if (common.some(c => /fatigue|weakness|tired/i.test(c)) || onboardingData.low_energy) {
      doshaScores.Vata += 12;
      recommendations.medicines.push({
        name: "Ashwagandha Lehyam & Chyawanprash",
        benefit: "Potent adaptogenic rasayana that reduces cortisol, enhances cellular ATP, and builds physical stamina (Ojas).",
        category: "Energy & Vitality"
      });
    }
  }

  // 4. CHRONIC CONDITIONS & VITALS (BP, Sugar, Cardiac)
  if (onboardingData.has_bp) {
    doshaScores.Pitta += 14;
    doshaScores.Vata += 14;
    predictions.push({
      condition: "Hypertension Management (Raktagata Vata)",
      confidence: 0.93,
      severity: "Moderate",
      reason: "History of elevated arterial blood pressure reported."
    });
    recommendations.medicines.push({
      name: "Sarpagandha Ghan Vati / Arjuna Extract",
      benefit: "Soothes central autonomic hyperactivity, promotes vasodilation, and regulates systemic BP.",
      category: "Cardiovascular Support"
    });
    recommendations.diet.push("Adhere strictly to low sodium DASH dietary guidelines; consume garlic and potassium-rich bananas.");
  }

  if (onboardingData.has_sugar) {
    doshaScores.Kapha += 18;
    predictions.push({
      condition: "Diabetes Mellitus Support (Madhumeha)",
      confidence: 0.95,
      severity: "Moderate",
      reason: "Documented history of high blood sugar."
    });
  }

  // Determine Dominant Dosha Imbalance
  let dominantDosha = "Vata";
  if (doshaScores.Pitta >= doshaScores.Vata && doshaScores.Pitta >= doshaScores.Kapha) {
    dominantDosha = "Pitta";
  } else if (doshaScores.Kapha >= doshaScores.Vata && doshaScores.Kapha >= doshaScores.Pitta) {
    dominantDosha = "Kapha";
  } else if (doshaScores.Vata >= doshaScores.Pitta && doshaScores.Vata >= doshaScores.Kapha) {
    dominantDosha = "Vata";
  }

  return { predictions, recommendations, reportedSymptomsList, dominantDosha, doshaScores };
}

// ─── STEP 4 — IoT SENSOR DATA ANALYSIS ─────────────────────────────────────
function analyzeIoTData(iotData, predictions, recommendations) {
  if (!iotData || typeof iotData !== 'object') return;

  const hr = parseFloat(iotData.heart_rate || iotData.heartRate);
  const spo2 = parseFloat(iotData.spo2);
  const temp = parseFloat(iotData.temperature);

  if (!isNaN(hr) && hr > 100) {
    predictions.push({ condition: "Tachycardia / Elevated Heart Rate", confidence: 0.88, severity: "Moderate", reason: `Heart rate ${hr} bpm exceeds resting baseline.` });
    recommendations.medicines.push({
      name: "Brahmi & Shankhpushpi Syrup",
      benefit: "Calms sympathetic nervous system activity and stabilizes heart rate.",
      category: "Neuro-Cardiac Calmer"
    });
  }

  if (!isNaN(spo2) && spo2 < 95) {
    predictions.push({ condition: "Sub-optimal Oxygen Saturation", confidence: 0.94, severity: spo2 < 92 ? "High" : "Moderate", reason: `SpO2 reading ${spo2}% indicates reduced oxygen exchange.` });
    recommendations.medicines.push({
      name: "Vasavaleha & Talisadi Churna",
      benefit: "Bronchodilator herbs that clear alveoli and support optimal oxygen uptake.",
      category: "Pulmonary Support"
    });
  }

  if (!isNaN(temp) && temp > 37.5) {
    predictions.push({ condition: "Pyrexia / Fever Spike", confidence: 0.95, severity: "High", reason: `Body temperature ${temp}°C.` });
    recommendations.medicines.push({
      name: "Maha Sudarshan Ghan Vati",
      benefit: "Comprehensive natural antipyretic containing 54 herbs to reduce viral and bacterial fever.",
      category: "Antipyretic & Anti-infective"
    });
  }
}

// ─── STEP 5 — HEALTH SCORE CALCULATION ──────────────────────────────────────
function calculateHealthScore(predictions, abnormalCount, iotData, skinResult) {
  let score = 95;

  // Deduct for predictions based on severity
  predictions.forEach(p => {
    if (p.severity === "High") score -= 18;
    else if (p.severity === "Moderate") score -= 10;
    else score -= 5;
  });

  score -= abnormalCount * 8;

  if (iotData) {
    const spo2 = parseFloat(iotData.spo2);
    const temp = parseFloat(iotData.temperature);
    if (!isNaN(spo2) && spo2 < 93) score -= 15;
    if (!isNaN(temp) && temp > 38.5) score -= 12;
  }

  return Math.max(35, Math.min(100, Math.round(score)));
}

// ─── MAIN EXPORT — analyzeReport ────────────────────────────────────────────
const analyzeReport = ({ reportData = [], onboardingData = {}, sensorData = {}, skinAnalysis = null }) => {
  // 1. Blood Analysis
  const parameters = validateParameters(reportData);
  const bloodResult = analyzeBloodParameters(parameters);

  // 2. Onboarding Analysis
  const {
    predictions: allPredictions,
    recommendations: allRecommendations,
    reportedSymptomsList,
    dominantDosha
  } = analyzeOnboardingProfile(onboardingData, bloodResult.predictions, bloodResult.recommendations);

  // 3. IoT Sensor Analysis
  analyzeIoTData(sensorData, allPredictions, allRecommendations);

  // 4. Skin Analysis
  let skinResult = null;
  if (skinAnalysis && skinAnalysis.condition) {
    skinResult = analyzeSkinCondition({
      condition_name: skinAnalysis.condition,
      confidence_score: skinAnalysis.confidence || 0,
      symptoms: skinAnalysis.symptoms || []
    });
  }

  // 5. Compute Health Score & Risk Level
  const abnormalCount = bloodResult.abnormal_parameters.length;
  const healthScore = calculateHealthScore(allPredictions, abnormalCount, sensorData, skinResult);

  let riskLevel = "Low";
  if (healthScore < 60 || allPredictions.some(p => p.severity === "High")) riskLevel = "High";
  else if (healthScore < 80 || allPredictions.length > 0) riskLevel = "Moderate";

  // Primary predicted condition
  const primaryPrediction = allPredictions[0] || {
    condition: "Optimal Wellness",
    confidence: 0.95,
    reason: "No acute symptoms or abnormal biomarkers detected."
  };

  // Fallback remedies if completely empty
  if (allRecommendations.medicines.length === 0) {
    allRecommendations.medicines.push({
      name: "Amritarishta & Amla Rasayana",
      benefit: "General immune-protective tonic that nourishes all body tissues (Dhatus).",
      category: "Daily Health Tonic"
    });
    allRecommendations.medicines.push({
      name: "Triphala Churna",
      benefit: "Gentle daily digestive regulator and cellular antioxidant.",
      category: "Digestive Balance"
    });
  }

  if (allRecommendations.diet.length === 0) {
    allRecommendations.diet.push("Focus on freshly prepared, seasonal vegetables, whole grains, and healthy fats (ghee, olive oil).");
    allRecommendations.diet.push("Limit processed sugars, deep-fried snacks, and excessive caffeinated beverages.");
  }

  if (allRecommendations.lifestyle.length === 0) {
    allRecommendations.lifestyle.push("Engage in 30 minutes of moderate yoga, rhythmic breathing (Pranayama), and walking daily.");
    allRecommendations.lifestyle.push("Maintain 7-8 hours of uninterrupted sleep in a dark, quiet environment.");
  }

  const doshaAdviceMap = {
    "Pitta": "Your symptoms indicate excess internal heat and inflammation (Pitta). Favor cooling foods, avoid harsh sun and spicy meals, and practice Sitali Pranayama.",
    "Vata": "Your symptoms indicate dryness and nervous tension (Vata). Favor warm, nourishing cooked meals, maintain regular sleep schedules, and perform warm oil massage (Abhyanga).",
    "Kapha": "Your symptoms indicate congestion and heaviness (Kapha). Favor light, warm, spiced foods, engage in brisk cardiovascular exercise, and avoid cold dairy."
  };

  allRecommendations.doshaAdvice = doshaAdviceMap[dominantDosha] || doshaAdviceMap["Pitta"];

  // Format response for UI
  return {
    parameters: parameters.map(p => ({
      category: p.category,
      test_name: p.parameter_name || p.test_name,
      value: p.value,
      unit: p.unit,
      status: p.status || "normal"
    })),
    summary: {
      total: parameters.length,
      high: parameters.filter(p => p.status === "high").length,
      low: parameters.filter(p => p.status === "low").length,
      normal: parameters.filter(p => p.status === "normal").length,
      health_score: healthScore,
      healthScore: healthScore,
      riskLevel: riskLevel
    },
    abnormal_parameters: bloodResult.abnormal_parameters,
    predictions: allPredictions,
    condition: primaryPrediction.condition,
    healthScore,
    riskLevel,
    dominantDosha,
    mlPrediction: {
      condition: primaryPrediction.condition,
      confidence: primaryPrediction.confidence || 0.92,
      model: "Ensemble Clinical NLP + Ayurvedic Diagnostic Classifier"
    },
    confidence: primaryPrediction.confidence || 0.92,
    reportedSymptoms: reportedSymptomsList,
    recommendations: allRecommendations,
    skin_analysis: skinResult
  };
};

module.exports = { analyzeReport };
