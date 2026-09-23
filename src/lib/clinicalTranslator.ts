/**
 * HealthPulse AI - Complete Multilingual Clinical Translation Engine
 * Translates symptoms, conditions, Ayurvedic formulations, categories,
 * medicine benefits, home remedies, precautions, dietary, and lifestyle advice.
 */

interface TranslationMap {
  [key: string]: {
    en: string;
    kn: string;
    hi: string;
    te: string;
    ta: string;
  };
}

// ── 1. Symptoms Dictionary ─────────────────────────────────────────
export const SYMPTOM_TRANSLATIONS: TranslationMap = {
  "eye: redness": {
    en: "Eye: Redness / Congestion",
    kn: "ಕಣ್ಣು: ಕೆಂಪಾಗುವಿಕೆ",
    hi: "नेत्र: लालिमा",
    te: "కన్ను: ఎరుపు / రద్దీ",
    ta: "கண்: சிவத்தல்",
  },
  "eye: pain": {
    en: "Eye: Pain / Strain",
    kn: "ಕಣ್ಣು: ನೋವು / ಆಯಾಸ",
    hi: "नेत्र: दर्द व तनाव",
    te: "కన్ను: నొప్పి",
    ta: "கண்: வலி",
  },
  "eye: distant_vision": {
    en: "Eye: Distance Vision Blur",
    kn: "ಕಣ್ಣು: ದೂರದೃಷ್ಟಿ ಮಸುಕು",
    hi: "नेत्र: दूर दृष्टि धुंधलापन",
    te: "కన్ను: దూరదృష్టి సమస్య",
    ta: "கண்: தூரப்பார்வை மங்கல்",
  },
  "eye: near_vision": {
    en: "Eye: Near Vision Strain",
    kn: "ಕಣ್ಣು: ಸಮೀಪದೃಷ್ಟಿ ಆಯಾಸ",
    hi: "नेत्र: निकट दृष्टि तनाव",
    te: "కన్ను: సమీప దృష్టి శ్రమ",
    ta: "கண்: அண்மைப் பார்வை சோர்வு",
  },
  "ent: throat_pain": {
    en: "ENT: Throat Soreness / Pain",
    kn: "ಇಎನ್‌ಟಿ: ಗಂಟಲು ನೋವು",
    hi: "ईएनटी: गले में दर्द",
    te: "ఇఎన్‌టి: గొంతు నొప్పి",
    ta: "இஎன்டி: தொண்டை வலி",
  },
  "ent: nasal_obstruction": {
    en: "ENT: Nasal Congestion",
    kn: "ಇಎನ್‌ಟಿ: ಮೂಗು ಕಟ್ಟುವಿಕೆ",
    hi: "ईएनटी: बंद नाक",
    te: "ఇఎన్‌టి: ముక్కు దిబ్బడ",
    ta: "இஎன்டி: மூக்கடைப்பு",
  },
  "cold": {
    en: "Common Cold / Rhinitis",
    kn: "ಶೀತ / ನೆಗಡಿ",
    hi: "सर्दी / जुकाम",
    te: "జలుబు",
    ta: "சளி / தும்மல்",
  },
  "cough_sputum": {
    en: "Productive Cough / Sputum",
    kn: "ಕೆಮ್ಮು & ಕಫ",
    hi: "खांसी और बलगम",
    te: "దగ్గు & కఫం",
    ta: "இருமல் மற்றும் சளி",
  },
  "body_ache": {
    en: "Body Ache / Myalgia",
    kn: "ಮೈ-ಕೈ ನೋವು",
    hi: "बदन दर्द",
    te: "ఒళ్ళు నొప్పులు",
    ta: "உடல் வலி",
  },
  "fever": {
    en: "Fever / Hyperthermia",
    kn: "ಜ್ವರ",
    hi: "बुखार",
    te: "జ్వరం",
    ta: "காய்ச்சல்",
  },
  "headache": {
    en: "Headache / Cephalea",
    kn: "ತಲೆನೋವು",
    hi: "सिरदर्द",
    te: "తలనొప్పి",
    ta: "தலைவலி",
  },
  "chest_pressure": {
    en: "Chest Tightness",
    kn: "ಎದೆ ಒತ್ತಡ",
    hi: "सीने में भारीपन",
    te: "ఛాతీ బిగుతు",
    ta: "நெஞ்சு அழுத்தம்",
  },
  "low_energy": {
    en: "Fatigue / Lethargy",
    kn: "ಆಯಾಸ / ಕಡಿಮೆ ಶಕ್ತಿ",
    hi: "थकान / सुस्ती",
    te: "అలసట",
    ta: "சோர்வு / ஆற்றலின்மை",
  },
  "acidity": {
    en: "Acidity / Heartburn",
    kn: "ಅಸಿಡಿಟಿ / ಎದೆಯುರಿ",
    hi: "अम्लता / एसिडिटी",
    te: "ఎసిడిటీ",
    ta: "அமிலத்தன்மை / நெஞ்செரிச்சல்",
  }
};

// ── 2. Diagnoses & Clinical Conditions ──────────────────────────────
export const CONDITION_TRANSLATIONS: TranslationMap = {
  "acute ocular strain / netra roga (pitta-kapha aggravation)": {
    en: "Acute Ocular Strain / Netra Roga (Pitta-Kapha Aggravation)",
    kn: "ತೀವ್ರ ಕಣ್ಣಿನ ಒತ್ತಡ / ನೇತ್ರ ರೋಗ (ಪಿತ್ತ-ಕಫ ಉಲ್ಬಣ)",
    hi: "तीव्र नेत्र तनाव / नेत्र रोग (पित्त-कफ प्रकोप)",
    te: "తీవ్రమైన కంటి ఒత్తిడి / నేత్ర రోగం (పిత్త-కఫ ప్రకోపం)",
    ta: "கடுமையான கண் சோர்வு / நேத்ர ரோகம் (பித்த-கப சீர்குலைவு)",
  },
  "pharyngeal irritation / oral mucositis (kanthagata roga)": {
    en: "Pharyngeal Irritation / Oral Mucositis (Kanthagata Roga)",
    kn: "ಗಂಟಲು ಕಿರಿಕಿರಿ / ಬಾಯಿ ಹುಣ್ಣು (ಕಂಠಗತ ರೋಗ)",
    hi: "गले में जलन / मुख पाक (कंठगत रोग)",
    te: "గొంతు మంట / నోటి పూత (కంఠగత రోగం)",
    ta: "தொண்டை எரிச்சல் / வாய் புண் (கண்டகத ரோகம்)",
  },
  "musculoskeletal pain / arthralgia (vataja sandhivata)": {
    en: "Musculoskeletal Pain / Arthralgia (Vataja Sandhivata)",
    kn: "ಸ್ನಾಯು-ಮೂಳೆ ನೋವು / ಕೀಲು ನೋವು (ವಾತಜ ಸಂಧಿವಾತ)",
    hi: "मांसपेशियों और जोड़ों का दर्द (वातज संधिवात)",
    te: "కీళ్ళు & కండరాల నొప్పి (వాతజ సంధివాతం)",
    ta: "தசை மற்றும் மூட்டு வலி (வாதஜ சந்திவாதம்)",
  },
  "upper respiratory tract infection / pratishyaya": {
    en: "Upper Respiratory Infection / Pratishyaya",
    kn: "ಮೇಲ್ಭಾಗದ ಶ್ವಾಸನಾಳದ ಸೋಂಕು / ಪ್ರತೀಶ್ಯಾಯ (ನೆಗಡಿ & ಕೆಮ್ಮು)",
    hi: "श्वसन तंत्र संक्रमण / प्रतिश्याय",
    te: "శ్వాసకోశ ఇన్ఫెక్షన్ / ప్రతిశ్యాయ",
    ta: "சுவாசக்குழாய் தொற்று / பிரதிஷ்யாயம்",
  },
  "gastric hyperacidity / amlapitta": {
    en: "Gastric Hyperacidity / Amlapitta",
    kn: "ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಆಮ್ಲೀಯತೆ / ಆಮ್ಲಪಿತ್ತ",
    hi: "अम्लपित्त / एसिडिटी",
    te: "ఎసిడిటీ / ఆమ్లపిత్తం",
    ta: "அமிலத்தன்மை / ஆம்லபித்தம்",
  },
  "optimal health profile": {
    en: "Optimal Health Profile",
    kn: "ಉತ್ತಮ ಆರೋಗ್ಯ ಸ್ಥಿತಿ",
    hi: "इष्टतम स्वास्थ्य प्रोफ़ाइल",
    te: "ఆదర్శవంతమైన ఆరోగ్య స్థితి",
    ta: "சிறந்த ஆரோக்கிய நிலை",
  }
};

// ── 3. Medicine Categories & Tags ──────────────────────────────────
export const CATEGORY_TRANSLATIONS: TranslationMap = {
  "throat & oral care": {
    en: "Throat & Oral Care",
    kn: "ಗಂಟಲು ಮತ್ತು ಬಾಯಿಯ ರಕ್ಷಣೆ",
    hi: "गले और मुख की देखभाल",
    te: "గొంతు మరియు నోటి సంరక్షణ",
    ta: "தொண்டை மற்றும் வாய் பராமரிப்பு",
  },
  "mucosal tonic": {
    en: "Mucosal Tonic",
    kn: "ಲೋಳೆಪೊರೆಯ ಟಾನಿಕ್",
    hi: "श्लेष्म टॉनिक",
    te: "శ్లేష్మ పొర టానిక్",
    ta: "சளிச்சவ்வு டானிக்",
  },
  "sinus & nasal drops": {
    en: "Sinus & Nasal Drops",
    kn: "ಸೈನಸ್ ಮತ್ತು ನಾಸಿಕ ಹನಿಗಳು",
    hi: "साइनस और नासिका ड्रॉप्स",
    te: "సైనస్ మరియు ముక్కు చుక్కలు",
    ta: "சைனஸ் மற்றும் மூக்கு சொட்டு மருந்து",
  },
  "joint & cartilage support": {
    en: "Joint & Cartilage Support",
    kn: "ಕೀಲು ಮತ್ತು ಕಾರ್ಟಿಲೇಜ್ ಬೆಂಬಲ",
    hi: "जोड़ों और उपास्थि का पोषण",
    te: "కీళ్ళు & మృదులాస్థి మద్దతు",
    ta: "மூட்டு மற்றும் குருத்தெலும்பு ஆதரவு",
  },
  "energy & vitality": {
    en: "Energy & Vitality",
    kn: "ಶಕ್ತಿ ಮತ್ತು ಚೈತನ್ಯ",
    hi: "ऊर्जा और जीवन शक्ति",
    te: "శక్తి మరియు చైతన్యం",
    ta: "ஆற்றல் மற்றும் புத்துணர்ச்சி",
  },
  "ophthalmic rejuvenator": {
    en: "Ophthalmic Rejuvenator",
    kn: "ನೇತ್ರ ಪುನರುಜ್ಜೀವನಕ",
    hi: "नेत्र रसायन",
    te: "నేత్ర పునరుజ్జీవనకారి",
    ta: "கண் புத்துணர்ச்சியூட்டி",
  },
  "soothing eye wash": {
    en: "Soothing Eye Wash",
    kn: "ಶಾಂತಗೊಳಿಸುವ ಕಣ್ಣಿನ ದ್ರವ",
    hi: "शीतल नेत्र धावन",
    te: "కంటి వాష్",
    ta: "கண் கழுவும் திரவம்",
  },
  "ocular health compound": {
    en: "Ocular Health Compound",
    kn: "ದೃಷ್ಟಿ ಆರೋಗ್ಯ ಸೂತ್ರ",
    hi: "दृष्टि स्वास्थ्य योग",
    te: "దృష్టి ఆరోగ్య ఔషధం",
    ta: "பார்வை நல மருந்து",
  },
  "natural remedy": {
    en: "Natural Remedy",
    kn: "ನೈಸರ್ಗಿಕ ಪರಿಹಾರ",
    hi: "प्राकृतिक उपचार",
    te: "సహజ నివారణ",
    ta: "இயற்கை தீர்வு",
  },
  "respiratory tonic": {
    en: "Respiratory Tonic",
    kn: "ಶ್ವಾಸಕೋಶದ ಟಾನಿಕ್",
    hi: "श्वसन टॉनिक",
    te: "శ్వాసకోశ టానిక్",
    ta: "சுவாச டானிக்",
  },
  "digestive tonic": {
    en: "Digestive Tonic",
    kn: "ಜೀರ್ಣಕಾರಿ ಟಾನಿಕ್",
    hi: "पाचक टॉनिक",
    te: "జీర్ణ టానిక్",
    ta: "செரிமான மருந்து",
  },
  "analgesic formulation": {
    en: "Analgesic Formulation",
    kn: "ನೋವು ನಿವಾರಕ ಸೂತ್ರ",
    hi: "दर्द निवारक योग",
    te: "నొప్పి నివారిణి",
    ta: "வலி நிவாரணி",
  }
};

// ── 4. Medicine Names ──────────────────────────────────────────────
export const MEDICINE_NAME_TRANSLATIONS: TranslationMap = {
  "khadiradi vati & yashtimadhu (licorice lozenges)": {
    en: "Khadiradi Vati & Yashtimadhu (Licorice Lozenges)",
    kn: "ಖದಿರಾದಿ ವಟಿ & ಯಷ್ಟಿಮಧು (ಜ್ಯೇಷ್ಠಮಧು ಮಾತ್ರೆಗಳು)",
    hi: "खदिरादि वटी और यष्टिमधु (मुलेठी)",
    te: "ఖదిరాది వటి & యష్టిమధు",
    ta: "கதிராதி வட்டி & அதிமதுரம்",
  },
  "sitopaladi churna with honey": {
    en: "Sitopaladi Churna with Honey",
    kn: "ಸಿತೋಪಲಾದಿ ಚೂರ್ಣ (ಜೇನುತುಪ್ಪದೊಂದಿಗೆ)",
    hi: "सितोपलादि चूर्ण (शहद के साथ)",
    te: "సితోపలాది చూర్ణం (తేనెతో)",
    ta: "சிதோபலாதி சூரணம் (தேனுடன்)",
  },
  "anu taila / shadbindu taila (nasya therapy)": {
    en: "Anu Taila / Shadbindu Taila (Nasya Therapy)",
    kn: "ಅಣು ತೈಲ / ಷಡ್ಬಿಂದೂ ತೈಲ (ನಸ್ಯ ಚಿಕಿತ್ಸೆ)",
    hi: "अणु तैल / षड्बिन्दु तैल (नस्य चिकित्सा)",
    te: "అణు తైలం / షడ్బిందు తైలం (నస్య చికిత్స)",
    ta: "அணு தைலம் / ஷட்பிந்து தைலம் (நஸ்ய சிகிச்சை)",
  },
  "yograj guggulu & shallaki (boswellia)": {
    en: "Yograj Guggulu & Shallaki (Boswellia)",
    kn: "ಯೋಗರಾಜ ಗುಗ್ಗುಳು & ಶಲ್ಲಕಿ",
    hi: "योगराज गुग्गुलु और शल्लकी",
    te: "యోగరాజ గుగ్గులు & శల్లకి",
    ta: "யோகராஜ குக்குலு & சல்லகி",
  },
  "ashwagandha lehyam & chyawanprash": {
    en: "Ashwagandha Lehyam & Chyawanprash",
    kn: "ಅಶ್ವಗಂಧ ಲೇಹ್ಯ & ಚ್ಯವನಪ್ರಾಶ",
    hi: "अश्वगंधा लेह्य और च्यवनप्राश",
    te: "అశ్వగంధ లేహ్యం & చ్యవనప్రాశ్",
    ta: "அஸ்வகந்தா லேகியம் & சியவன்பிராஷ்",
  },
  "triphala ghrita / netra tarpana drops": {
    en: "Triphala Ghrita / Netra Tarpana Drops",
    kn: "ತ್ರಿಫಲ ಘೃತ / ನೇತ್ರ ತರ್ಪಣ ಹನಿಗಳು",
    hi: "त्रिफला घृत / नेत्र तर्पण ड्रॉप्स",
    te: "త్రిఫల ఘృతం / నేత్ర తర్పణ చుక్కలు",
    ta: "திரிபலா நெய் / நேத்ர தர்பண சொட்டு மருந்து",
  },
  "pure rose water & punarnava eye wash": {
    en: "Pure Rose Water & Punarnava Eye Wash",
    kn: "ಶುದ್ಧ ಗುಲಾಬಿ ಜಲ & ಪುನರ್ನವ ಕಣ್ಣಿನ ದ್ರವ",
    hi: "शुद्ध गुलाब जल और पुनर्नवा नेत्र धावन",
    te: "స్వచ్ఛమైన రోజ్ వాటర్ & పునర్నవ ఐ వాష్",
    ta: "தூய பன்னீர் & புனர்னவா கண் கழுவும் திரவம்",
  },
  "saptamrit lauha": {
    en: "Saptamrit Lauha",
    kn: "ಸಪ್ತಾಮೃತ ಲೌಹ",
    hi: "सप्तामृत लौह",
    te: "సప్తామృత లౌహం",
    ta: "சப்தாமிருத லௌஹம்",
  }
};

// ── 5. Medicine Benefits ───────────────────────────────────────────
export const MEDICINE_BENEFIT_TRANSLATIONS: TranslationMap = {
  "soothes inflamed pharyngeal tissues, suppresses bacterial proliferation, and accelerates ulcer epithelialization.": {
    en: "Soothes inflamed pharyngeal tissues, suppresses bacterial proliferation, and accelerates ulcer epithelialization.",
    kn: "ಗಂಟಲಿನ ಉರಿಯೂತವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ, ಬ್ಯಾಕ್ಟೀರಿಯಾ ಬೆಳವಣಿಗೆ ತಡೆಯುತ್ತದೆ ಮತ್ತು ಬಾಯಿ ಹುಣ್ಣುಗಳನ್ನು ಬೇಗ ವಾಸಿ ಮಾಡುತ್ತದೆ.",
    hi: "गले की सूजन को शांत करता है, बैक्टीरिया को रोकता है और छालों को जल्दी ठीक करता है।",
    te: "గొంతు మంటను తగ్గిస్తుంది, బ్యాక్టీరియాను నిరోధిస్తుంది మరియు పుండ్లను త్వరగా నయం చేస్తుంది.",
    ta: "தொண்டை அழற்சியைத் தணித்து, பாக்டீரியா பரவலைக் கட்டுப்படுத்தி புண்களை விரைவாகக் குணப்படுத்துகிறது.",
  },
  "relieves upper respiratory tickle, clears mucosal congestion, and enhances local immunity.": {
    en: "Relieves upper respiratory tickle, clears mucosal congestion, and enhances local immunity.",
    kn: "ಮೇಲ್ಭಾಗದ ಶ್ವಾಸನಾಳದ ಕೆರೆತವನ್ನು ನಿವಾರಿಸುತ್ತದೆ, ಕಫ ನಿವಾರಿಸುತ್ತದೆ ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    hi: "गले की खराश दूर करता है, बलगम साफ करता है और रोग प्रतिरोधक क्षमता बढ़ाता है।",
    te: "శ్వాసకోశ చికాకును తొలగిస్తుంది, శ్లేష్మాన్ని క్లియర్ చేస్తుంది మరియు రోగనిరోధక శక్తిని పెంచుతుంది.",
    ta: "சுவாசக்குழாய் உறுத்தலை நீக்கி, சளியை வெளியேற்றி நோய் எதிர்ப்பு சக்தியை அதிகரிக்கிறது.",
  },
  "classical micro-nasal oil that clears sinus passages, lubricates mucous membranes, and relieves nasal resistance.": {
    en: "Classical micro-nasal oil that clears sinus passages, lubricates mucous membranes, and relieves nasal resistance.",
    kn: "ಸೈನಸ್ ದಾರಿಗಳನ್ನು ಮುಕ್ತಗೊಳಿಸುವ, ಲೋಳೆಪೊರೆಗೆ ಜಿಡ್ಡಿನಂಶ ನೀಡುವ ಮತ್ತು ಮೂಗಿನ ಉಸಿರಾಟವನ್ನು ಸರಾಗಗೊಳಿಸುವ ಸಾಂಪ್ರದಾಯಿಕ ನಸ್ಯ ತೈಲ.",
    hi: "साइनस मार्ग को साफ करने, नासिका झिल्ली को नमी देने और श्वास बाधा दूर करने वाला आयुर्वेदिक तेल।",
    te: "సైనస్ మార్గాలను క్లియర్ చేసి, శ్వాసను సులభతరం చేసే సాంప్రదాయ ఆయుర్వేద నస్య తైలం.",
    ta: "சைனஸ் பாதைகளைச் சுத்தம் செய்து, மூச்சுத் திணறலைப் போக்கும் பாரம்பரிய மூலிகை எண்ணெய்.",
  },
  "reduces inflammatory joint cytokines, eases morning stiffness, and lubricates cartilage tissue.": {
    en: "Reduces inflammatory joint cytokines, eases morning stiffness, and lubricates cartilage tissue.",
    kn: "ಕೀಲುಗಳ ಉರಿಯೂತವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ, ಬೆಳಗಿನ ಬಿಗಿತವನ್ನು ಸಡಿಲಗೊಳಿಸುತ್ತದೆ ಮತ್ತು ಕಾರ್ಟಿಲೇಜ್ ಅಂಗಾಂಶವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.",
    hi: "जोड़ों की सूजन कम करता है, सुबह की जकड़न दूर करता है और उपास्थि को पोषण देता है।",
    te: "కీళ్ల మంటను తగ్గించి, ఉదయపు దృఢత్వాన్ని పోగొట్టి కీళ్లకు బలాన్ని ఇస్తుంది.",
    ta: "மூட்டு அழற்சியைக் குறைத்து, காலை நேர விறைப்பைப் போக்கி குருத்தெலும்புகளைப் பலப்படுத்துகிறது.",
  },
  "potent adaptogenic rasayana that reduces cortisol, enhances cellular atp, and builds physical stamina (ojas).": {
    en: "Potent adaptogenic rasayana that reduces cortisol, enhances cellular ATP, and builds physical stamina (Ojas).",
    kn: "ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುವ, ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುವ ಮತ್ತು ದೈಹಿಕ ತ್ರಾಣವನ್ನು (ಓಜಸ್ಸು) ನಿರ್ಮಿಸುವ ಪ್ರಬಲ ರಸಾಯನ.",
    hi: "तनाव कम करने, कोशिकीय ऊर्जा बढ़ाने और शारीरिक सहनशक्ति (ओजस) बढ़ाने वाला शक्तिशाली रसायन।",
    te: "ఒత్తిడిని తగ్గించి, శక్తిని అందించి శరీర బలాన్ని (ఓజస్సు) పెంచే అద్భుతమైన రసాయనం.",
    ta: "மன அழுத்தத்தைக் குறைத்து, உடல் ஆற்றல் மற்றும் சகிப்புத்தன்மையை (ஓஜஸ்) அதிகரிக்கும் சிறந்த ரசாயனம்.",
  },
  "classical medicated ghee formulation that cools burning sensations, relieves conjunctival redness, and strengthens optic nerves.": {
    en: "Classical medicated ghee formulation that cools burning sensations, relieves conjunctival redness, and strengthens optic nerves.",
    kn: "ಉರಿಯುವ ಸಂವೇದನೆಯನ್ನು ತಂಪಾಗಿಸುವ, ಕಣ್ಣಿನ ಕೆಂಪನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಮತ್ತು ಆಪ್ಟಿಕ್ ನರಗಳನ್ನು ಬಲಪಡಿಸುವ ಸಾಂಪ್ರದಾಯಿಕ ಆಯುರ್ವೇದ ತುಪ್ಪದ ಸೂತ್ರ.",
    hi: "आंखों की जलन को शांत करने, लालिमा दूर करने और दृष्टि तंत्रिकाओं को मजबूत करने वाला पारंपरिक आयुर्वेदिक घृत।",
    te: "కళ్ల మంటను తగ్గించి, ఎరుపును పోగొట్టి నరాలను బలోపేతం చేసే ఆయుర్వేద నేతి ఔషధం.",
    ta: "கண் எரிச்சலைத் தணித்து, சிவப்பைப் போக்கி, பார்வை நரம்புகளை பலப்படுத்தும் பாரம்பரிய நெய் மருந்து.",
  },
  "distilled floral hydrosol that provides instant cooling, flushes environmental irritants, and stops excessive reflex tearing.": {
    en: "Distilled floral hydrosol that provides instant cooling, flushes environmental irritants, and stops excessive reflex tearing.",
    kn: "ತಕ್ಷಣದ ತಂಪನ್ನು ನೀಡುವ, ಧೂಳು ಕಣಗಳನ್ನು ಹೊರಹಾಕುವ ಮತ್ತು ಅನಗತ್ಯ ಕಣ್ಣೀರು ಬರುವುದನ್ನು ತಡೆಯುವ ಶುದ್ಧ ಹೈಡ್ರೋಸೋಲ್.",
    hi: "तुरंत ठंडक प्रदान करने वाला और आंखों से धूल-मिट्टी को साफ करने वाला शुद्ध गुलाब जल फॉर्मूला।",
    te: "వెంటనే చల్లదనాన్ని అందించి, కంటి నుండి ధూళిని తొలగించే స్వచ్ఛమైన రోజ్ వాటర్ మిశ్రమం.",
    ta: "உடனடி குளிர்ச்சியளித்து, கண்களைத் தூய்மைப்படுத்தும் தூய பன்னீர் கரைசல்.",
  },
  "traditional ayurvedic compound containing licorice, triphala, and purified iron to reduce digital eye strain and improve visual acuity.": {
    en: "Traditional Ayurvedic compound containing Licorice, Triphala, and purified iron to reduce digital eye strain and improve visual acuity.",
    kn: "ಡಿಜಿಟಲ್ ಪರದೆಯ ಕಣ್ಣಿನ ಆಯಾಸವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ದೃಷ್ಟಿ ತೀಕ್ಷ್ಣತೆಯನ್ನು ಸುಧಾರಿಸಲು ಜ್ಯೇಷ್ಠಮಧು, ತ್ರಿಫಲ ಒಳಗೊಂಡ ಸೂತ್ರ.",
    hi: "डिजिटल स्क्रीन से होने वाली आंखों की थकान को कम करने और दृष्टि सुधारने हेतु त्रिफला और यष्टिमधु युक्त पारंपरिक योग।",
    te: "డిజిటల్ కంటి అలసటను తగ్గించి దృష్టిని మెరుగుపరిచే త్రిఫల మరియు యష్టిమధు మిశ్రమం.",
    ta: "டிஜிட்டல் கண் சோர்வைக் குறைத்து பார்வையை மேம்படுத்தும் திரிபலா மற்றும் அதிமதுரம் கலந்த மூலிகை.",
  }
};

// ── 6. Home Remedies, Precautions & Lifestyle Advice ──────────────
export const REMEDY_AND_ADVICE_TRANSLATIONS: TranslationMap = {
  "place chilled rose-water soaked organic cotton pads over closed eyelids for 12-15 minutes twice daily.": {
    en: "Place chilled rose-water soaked organic cotton pads over closed eyelids for 12-15 minutes twice daily.",
    kn: "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ 12-15 ನಿಮಿಷಗಳ ಕಾಲ ತಣ್ಣನೆಯ ರೋಸ್ ವಾಟರ್‌ನಲ್ಲಿ ಅದ್ದಿದ ಹತ್ತಿಯನ್ನು ಕಣ್ಣುಗಳ ಮೇಲೆ ಇರಿಸಿ.",
    hi: "दिन में दो बार 12-15 मिनट के लिए ठंडे गुलाब जल में भीगे रुई के फाहे बंद आंखों पर रखें।",
    te: "రోజుకు రెండుసార్లు 12-15 నిమిషాలు చల్లని రోజ్ వాటర్‌లో నానబెట్టిన దూదిని కళ్లపై ఉంచండి.",
    ta: "தினமும் இருமுறை 12-15 நிமிடங்கள் குளிர்ந்த பன்னீரில் நனைத்த பஞ்சை மூடிய கண்களின் மேல் வைக்கவும்.",
  },
  "follow the 20-20-20 rule: every 20 minutes of screen use, look at an object 20 feet away for 20 seconds.": {
    en: "Follow the 20-20-20 Rule: Every 20 minutes of screen use, look at an object 20 feet away for 20 seconds.",
    kn: "20-20-20 ನಿಯಮ ಪಾಲಿಸಿ: ಪ್ರತಿ 20 ನಿಮಿಷಗಳ ಸ್ಕ್ರೀನ್ ಬಳಕೆಯ ನಂತರ, 20 ಅಡಿ ದೂರದಲ್ಲಿರುವ ವಸ್ತುವನ್ನು 20 ಸೆಕೆಂಡುಗಳ ಕಾಲ ನೋಡಿ.",
    hi: "20-20-20 नियम अपनाएं: हर 20 मिनट की स्क्रीन के बाद, 20 फीट दूर 20 सेकंड के लिए देखें।",
    te: "20-20-20 నియమం పాటించండి: ప్రతి 20 నిమిషాల స్క్రీన్ సమయం తర్వాత, 20 అడుగుల దూరంలోని వస్తువును 20 సెకన్ల పాటు చూడండి.",
    ta: "20-20-20 விதியை பின்பற்றவும்: ஒவ்வொரு 20 நிமிட திரை பயன்பாட்டிற்கும் பிறகு, 20 அடி தூரத்திலுள்ள பொருளை 20 வினாடிகள் பார்க்கவும்.",
  },
  "wash eyes gently with room-temperature filtered water infused with cooled triphala decoction in the morning.": {
    en: "Wash eyes gently with room-temperature filtered water infused with cooled Triphala decoction in the morning.",
    kn: "ಬೆಳಿಗ್ಗೆ ತಂಪಾಗಿಸಿದ ತ್ರಿಫಲ ಕಷಾಯ ಬೆರೆಸಿದ ಶುದ್ಧ ನೀರಿನಿಂದ ಕಣ್ಣುಗಳನ್ನು ಮೃದುವಾಗಿ ತೊಳೆಯಿರಿ.",
    hi: "सुबह ठंडे त्रिफला काढ़े से युक्त पानी से आंखों को धीरे से धोएं।",
    te: "ఉదయం చల్లార్చిన త్రిఫల కషాయం కలిపిన నీటితో కళ్లను సున్నితంగా కడగాలి.",
    ta: "காலையில் ஆறிய திரிபலா கஷாயம் கலந்த நீரினால் கண்களை மெதுவாக கழுவவும்.",
  },
  "avoid rubbing the eyes to prevent secondary bacterial infection and corneal micro-abrasions.": {
    en: "Avoid rubbing the eyes to prevent secondary bacterial infection and corneal micro-abrasions.",
    kn: "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕು ಮತ್ತು ಕಾರ್ನಿಯಾ ಗಾಯವನ್ನು ತಡೆಗಟ್ಟಲು ಕಣ್ಣುಗಳನ್ನು ಉಜ್ಜಬೇಡಿ.",
    hi: "बैक्टीरियल संक्रमण और कॉर्निया की चोट से बचने के लिए आंखों को रगड़ने से बचें।",
    te: "ఇన్ఫెక్షన్ మరియు కంటి గీతలు పడకుండా ఉండటానికి కళ్లను రుద్దకండి.",
    ta: "தொற்று மற்றும் கண் காயம் ஏற்படுவதைத் தடுக்க கண்களை தேய்ப்பதைத் தவிர்க்கவும்.",
  },
  "wear uv400 protective sunglasses when stepping into bright outdoor sunlight.": {
    en: "Wear UV400 protective sunglasses when stepping into bright outdoor sunlight.",
    kn: "ಪ್ರಕಾಶಮಾನವಾದ ಬಿಸಿಲಿಗೆ ಹೋಗುವಾಗ UV400 ರಕ್ಷಣಾತ್ಮಕ ಸನ್‌ಗ್ಲಾಸ್‌ಗಳನ್ನು ಧರಿಸಿ.",
    hi: "तेज धूप में बाहर निकलते समय UV400 सुरक्षात्मक धूप का चश्मा पहनें।",
    te: "తీవ్రమైన ఎండలోకి వెళ్లేటప్పుడు UV400 రక్షిత సన్ గ్లాసెస్ ధరించండి.",
    ta: "வெயிலில் செல்லும்போது UV400 பாதுகாப்பு சன்கிளாஸ்களை அணியுங்கள்.",
  },
  "consult an ophthalmologist if you experience sudden visual field blurring, flashes of light, or severe throbbing pain.": {
    en: "Consult an ophthalmologist if you experience sudden visual field blurring, flashes of light, or severe throbbing pain.",
    kn: "ಹಠಾತ್ ದೃಷ್ಟಿ ಮಸುಕಾಗುವುದು, ಬೆಳಕಿನ ಮಿನುಗು ಅಥವಾ ತೀವ್ರ ನೋವು ಕಂಡುಬಂದರೆ ನೇತ್ರ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    hi: "अचानक दृष्टि धुंधली होने, चमक या तेज दर्द होने पर तुरंत नेत्र विशेषज्ञ से परामर्श लें।",
    te: "దృష్టి మసకబారడం లేదా తీవ్రమైన నొప్పి వస్తే వెంటనే కంటి వైద్యుడిని సంప్రదించండి.",
    ta: "திடீர் பார்வை மங்கலாகுதல் அல்லது கடுமையான வலி ஏற்பட்டால் கண் மருத்துவரை அணுகவும்.",
  },
  "gargle with warm himalayan salt water and a pinch of organic turmeric powder 3 times daily.": {
    en: "Gargle with warm Himalayan salt water and a pinch of organic turmeric powder 3 times daily.",
    kn: "ದಿನಕ್ಕೆ 3 ಬಾರಿ ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರು ಮತ್ತು ಅರಿಶಿನ ಪುಡಿ ಬೆರೆಸಿ ಬಾಯಿ ಮುಕ್ಕಳಿಸಿ.",
    hi: "दिन में 3 बार गुनगुने नमक के पानी और एक चुटकी हल्दी से गरारे करें।",
    te: "రోజుకు 3 సార్లు గోరువెచ్చని ఉప్పు నీరు మరియు పసుపుతో పుక్కిలించండి.",
    ta: "தினமும் 3 முறை வெதுவெதுப்பான உப்பு நீர் மற்றும் மஞ்சள் தூள் சேர்த்து வாய் கொப்பளிக்கவும்.",
  },
  "apply pure cow's ghee or honey directly onto oral cavity ulcers for rapid pain relief.": {
    en: "Apply pure cow's ghee or honey directly onto oral cavity ulcers for rapid pain relief.",
    kn: "ನೋವು ಶಮನಕ್ಕಾಗಿ ಬಾಯಿ ಹುಣ್ಣುಗಳ ಮೇಲೆ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ಅಥವಾ ಜೇನುತುಪ್ಪ ಹಚ್ಚಿ.",
    hi: "दर्द से त्वरित राहत के लिए मुंह के छालों पर शुद्ध गाय का घी या शहद लगाएं।",
    te: "నోటి పూతలపై స్వచ్ఛమైన ఆవు నెయ్యి లేదా తేనెను రాయండి.",
    ta: "வாய் புண்களுக்கு உடனடி நிவாரணம் பெற தூய நெய் அல்லது தேன் தடவவும்.",
  },
  "avoid spicy, deep-fried, and acidic citrus foods until throat and oral tissues heal.": {
    en: "Avoid spicy, deep-fried, and acidic citrus foods until throat and oral tissues heal.",
    kn: "ಗಂಟಲು ಮತ್ತು ಬಾಯಿ ಗುಣವಾಗುವವರೆಗೆ ಖಾರ, ಕರಿದ ಮತ್ತು ಆಮ್ಲೀಯ ಆಹಾರಗಳನ್ನು ತ್ಯಜಿಸಿ.",
    hi: "गले के ठीक होने तक मसालेदार, तला हुआ और खट्टा भोजन न लें।",
    te: "గొంతు తగ్గే వరకు కారంగా ఉండే మరియు వేయించిన ఆహారాలకు దూరంగా ఉండండి.",
    ta: "தொண்டை ஆறும் வரை காரமான மற்றும் வறுத்த உணவுகளைத் தவிர்க்கவும்.",
  },
  "steam inhalation with 2 drops of eucalyptus oil and a pinch of ajwain seeds before sleep.": {
    en: "Steam inhalation with 2 drops of Eucalyptus oil and a pinch of Ajwain seeds before sleep.",
    kn: "ಮಲಗುವ ಮುನ್ನ ನೀಲಗಿರಿ ಎಣ್ಣೆ ಮತ್ತು ಓಮಕಾಳುಗಳೊಂದಿಗೆ ಹಬೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
    hi: "सोने से पहले नीलगिरी तेल और अजवायन के साथ भाप लें।",
    te: "పడుకునే ముందు యూకలిప్టస్ ఆయిల్ మరియు వాముతో ఆవిరి పట్టండి.",
    ta: "தூங்கும் முன் யூகலிப்டஸ் எண்ணெய் மற்றும் ஓமத்துடன் ஆவி பிடிக்கவும்.",
  },
  "warm mahanarayan taila massage followed by hot compress on affected joint areas.": {
    en: "Warm Mahanarayan Taila massage followed by hot compress on affected joint areas.",
    kn: "ಬಾಧಿತ ಕೀಲುಗಳ ಮೇಲೆ ಬೆಚ್ಚಗಿನ ಮಹಾನಾರಾಯಣ ತೈಲದಿಂದ ಮಸಾಜ್ ಮಾಡಿ ಬಿಸಿ ಶಾಖ ಕೊಡಿ.",
    hi: "प्रभावित जोड़ों पर गुनगुने महानारायण तेल की मालिश के बाद गर्म सेक करें।",
    te: "కీళ్లపై మహానారాయణ తైలంతో మసాజ్ చేసి వేడి కాపడం పెట్టండి.",
    ta: "மூட்டுகளில் மகாநாராயண தைலத்தை மசாஜ் செய்து சுடுநீர் ஒத்தடம் கொடுக்கவும்.",
  },
  "gentle temple massage with brahmi-bhringraj oil; stay hydrated with electrolytes.": {
    en: "Gentle temple massage with Brahmi-Bhringraj oil; stay hydrated with electrolytes.",
    kn: "ಬ್ರಾಹ್ಮಿ-ಭೃಂಗರಾಜ ಎಣ್ಣೆಯಿಂದ ಹಣೆಗೆ ನಿಧಾನವಾಗಿ ಮಸಾಜ್ ಮಾಡಿ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.",
    hi: "ब्राह्मी-भृंगराज तेल से कनपटी की हल्की मालिश करें और पर्याप्त पानी पिएं।",
    te: "బ్రాహ్మీ-భృంగరాజ్ నూనెతో నుదిటిపై మసాజ్ చేయండి మరియు తగినంత నీరు త్రాగాలి.",
    ta: "பிராமி-பிருங்கராஜ் எண்ணெயால் நெற்றியில் மெதுவாக மசாஜ் செய்யவும் மற்றும் போதுமான நீர் அருந்தவும்.",
  },
  "drink fresh coconut water and fennel seed (saunf) tea; avoid skipping meals or consuming late-night heavy dinners.": {
    en: "Drink fresh coconut water and fennel seed (saunf) tea; avoid skipping meals or consuming late-night heavy dinners.",
    kn: "ತಾಜಾ ಎಳನೀರು ಮತ್ತು ಸೋಂಪು ಚಹಾ ಕುಡಿಯಿರಿ; ಊಟ ತಪ್ಪಿಸಬೇಡಿ ಅಥವಾ ತಡರಾತ್ರಿ ಭಾರಿ ಊಟ ಮಾಡಬೇಡಿ.",
    hi: "ताजा नारियल पानी और सौंफ की चाय पिएं; भोजन न छोड़ें और देर रात भारी भोजन से बचें।",
    te: "కొబ్బరి నీళ్లు మరియు సోంపు టీ త్రాగాలి; భోజనం మానవద్దు మరియు రాత్రి ఆలస్యంగా తినవద్దు.",
    ta: "இளநீர் மற்றும் பெருஞ்சீரக தேநீர் அருந்துங்கள்; உணவைத் தவிர்க்காதீர்கள் அல்லது நள்ளிரவில் சாப்பிடாதீர்கள்.",
  }
};

// ── 7. Helper Functions ───────────────────────────────────────────
function getLangCode(lang: string): "en" | "kn" | "hi" | "te" | "ta" {
  if (!lang) return "en";
  if (lang.startsWith("kn")) return "kn";
  if (lang.startsWith("hi")) return "hi";
  if (lang.startsWith("te")) return "te";
  if (lang.startsWith("ta")) return "ta";
  return "en";
}

export function translateSymptom(sym: string, lang: string): string {
  if (!sym) return "";
  const code = getLangCode(lang);
  const normalized = sym.trim().toLowerCase();
  if (SYMPTOM_TRANSLATIONS[normalized]) {
    return SYMPTOM_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(SYMPTOM_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return sym;
}

export function translateCondition(cond: string, lang: string): string {
  if (!cond) return "";
  const code = getLangCode(lang);
  const normalized = cond.trim().toLowerCase();
  if (CONDITION_TRANSLATIONS[normalized]) {
    return CONDITION_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(CONDITION_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return cond;
}

export function translateCategory(cat: string, lang: string): string {
  if (!cat) return "";
  const code = getLangCode(lang);
  const normalized = cat.trim().toLowerCase();
  if (CATEGORY_TRANSLATIONS[normalized]) {
    return CATEGORY_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return cat;
}

export function translateMedicineName(name: string, lang: string): string {
  if (!name) return "";
  const code = getLangCode(lang);
  const normalized = name.trim().toLowerCase();
  if (MEDICINE_NAME_TRANSLATIONS[normalized]) {
    return MEDICINE_NAME_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(MEDICINE_NAME_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return name;
}

export function translateBenefit(benefit: string, lang: string): string {
  if (!benefit) return "";
  const code = getLangCode(lang);
  const normalized = benefit.trim().toLowerCase();
  if (MEDICINE_BENEFIT_TRANSLATIONS[normalized]) {
    return MEDICINE_BENEFIT_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(MEDICINE_BENEFIT_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return benefit;
}

export function translateAdvice(text: string, lang: string): string {
  if (!text) return "";
  const code = getLangCode(lang);
  const normalized = text.trim().toLowerCase();
  if (REMEDY_AND_ADVICE_TRANSLATIONS[normalized]) {
    return REMEDY_AND_ADVICE_TRANSLATIONS[normalized][code];
  }
  for (const [k, v] of Object.entries(REMEDY_AND_ADVICE_TRANSLATIONS)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v[code];
    }
  }
  return text;
}

export function translateReason(reason: string, lang: string): string {
  if (!reason) return "";
  const code = getLangCode(lang);
  const normalized = reason.trim().toLowerCase();
  
  if (normalized.includes("ocular") || normalized.includes("redness") || normalized.includes("distant_vision")) {
    const map = {
      en: "Reported symptoms indicate conjunctival vascular congestion and ocular fatigue.",
      kn: "ವರದಿ ಮಾಡಿದ ರೋಗಲಕ್ಷಣಗಳು ನೇತ್ರ ರಕ್ತನಾಳಗಳ ಒತ್ತಡ ಮತ್ತು ದೃಷ್ಟಿ ಆಯಾಸವನ್ನು ಸೂಚಿಸುತ್ತವೆ.",
      hi: "रिपोर्ट किए गए लक्षण आंखों की थकान और जलन का संकेत देते हैं।",
      te: "నివేదించబడిన లక్షణాలు కంటి అలసట మరియు రద్దీని సూచిస్తున్నాయి.",
      ta: "தெரிவிக்கப்பட்ட அறிகுறிகள் கண் சோர்வு மற்றும் நெரிசலைக் குறிக்கின்றன.",
    };
    return map[code];
  }

  if (normalized.includes("throat") || normalized.includes("oral") || normalized.includes("mucosal")) {
    const map = {
      en: "Reported throat pain/oral ulcers indicate inflamed mucosal lining.",
      kn: "ವರದಿ ಮಾಡಿದ ಗಂಟಲು ನೋವು ಗಂಟಲಿನ ಲೋಳೆಪೊರೆಯ ಉರಿಯೂತವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      hi: "रिपोर्ट किया गया गले का दर्द सूजन और संक्रमण का संकेत देता है।",
      te: "గొంతు నొప్పి గొంతు పొరలో మంటను సూచిస్తుంది.",
      ta: "தொண்டை வலி தொண்டை அழற்சியைக் குறிக்கிறது.",
    };
    return map[code];
  }

  if (normalized.includes("musculoskeletal") || normalized.includes("joint") || normalized.includes("arthralgia")) {
    const map = {
      en: "Musculoskeletal and joint stiffness correlated with Vata elevation.",
      kn: "ವರದಿ ಮಾಡಿದ ಭಾಗದಲ್ಲಿ ಸ್ನಾಯು ಮತ್ತು ಕೀಲುಗಳಲ್ಲಿ ವಾತಜ ನೋವು ಕಂಡುಬಂದಿದೆ.",
      hi: "संबंधित भाग में मांसपेशियों और जोड़ों में दर्द देखा गया है।",
      te: "సంబంధిత భాగంలో కండరాల అసౌకర్యం గుర్తించబడింది.",
      ta: "குறிப்பிட்ட பகுதியில் தசை மற்றும் மூட்டு வலி காணப்படுகிறது.",
    };
    return map[code];
  }

  return reason;
}

export function translateDosha(dosha: string, lang: string): string {
  const code = getLangCode(lang);
  const map: { [k: string]: { [l: string]: string } } = {
    Vata: { en: "Vata Imbalance", kn: "ವಾತ ಅಸಮತೋಲನ", hi: "वात असंतुलन", te: "వాత అసమతుల్యత", ta: "வாத சமநிலையின்மை" },
    Pitta: { en: "Pitta Imbalance", kn: "ಪಿತ್ತ ಅಸಮತೋಲನ", hi: "पित्त असंतुलन", te: "పిత్త అసమతుల్యత", ta: "பித்த சமநிலையின்மை" },
    Kapha: { en: "Kapha Imbalance", kn: "ಕಫ ಅಸಮತೋಲನ", hi: "कफ असंतुलन", te: "కఫ అసమతుల్యత", ta: "கப சமநிலையின்மை" },
  };
  return map[dosha]?.[code] || `${dosha} Imbalance`;
}

export function translateRiskBadge(risk: string, lang: string): string {
  const code = getLangCode(lang);
  const map: { [k: string]: { [l: string]: string } } = {
    high: { en: "High Risk", kn: "ಹೆಚ್ಚಿನ ಅಪಾಯ", hi: "उच्च जोखिम", te: "అధిక ప్రమాదం", ta: "அதிக ஆபத்து" },
    moderate: { en: "Moderate", kn: "ಮಧ್ಯಮ", hi: "मध्यम", te: "మధ్యస్థం", ta: "மிதமானது" },
    low: { en: "Low Risk", kn: "ಕಡಿಮೆ ಅಪಾಯ", hi: "कम जोखिम", te: "తక్కువ ప్రమాదం", ta: "குறைந்த ஆபத்து" },
  };
  const key = (risk || "low").toLowerCase();
  return map[key]?.[code] || risk || "Low Risk";
}

export function translateMatch(lang: string): string {
  const code = getLangCode(lang);
  const map = {
    en: "Match",
    kn: "ಹೊಂದಾಣಿಕೆ",
    hi: "सटीकता",
    te: "సరిపోలిక",
    ta: "பொருத்தம்",
  };
  return map[code];
}
