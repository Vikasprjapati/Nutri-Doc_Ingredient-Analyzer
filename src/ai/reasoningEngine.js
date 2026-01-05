/**
 * Reasoning Engine for NutriDoc - ADVANCED CONTEXT VERSION
 */

export const DEMO_PRODUCTS = [
  { id: 1, name: "Morning Fuel Cereal", category: "Breakfast", ingredients: "Whole Grain Wheat, Sugar, Corn Syrup, Salt, BHT, Soy Lecithin", icon: "🥣" },
  { id: 2, name: "Pro-Gain Whey", category: "Supplements", ingredients: "Whey Protein Isolate, Sucralose, Vanillin, Lecithin, Potassium Phosphate", icon: "💪" },
  { id: 3, name: "Zero-Coke", category: "Beverages", ingredients: "Carbonated Water, Phosphoric Acid, Aspartame, Caffeine, Sodium Benzoate", icon: "🥤" },
  { id: 4, name: "Neon Gummy Bears", category: "Snacks", ingredients: "Sugar, Glucose, Red 40, Yellow 5, Citric Acid", icon: "🧸" },
  { id: 5, name: "Pure Almond Milk", category: "Dairy Alt", ingredients: "Almonds, Filtered Water, Sea Salt, Gellan Gum", icon: "🥛" },
  { id: 6, name: "Instant Noodles", category: "Meals", ingredients: "Wheat Flour, Palm Oil, MSG, Sodium Carbonate, Potasium Chloride", icon: "🍜" },
  { id: 7, name: "Energy Shot", category: "Energy", ingredients: "Caffeine, Taurine, B-Vitamins, Sucralose, Sodium, Phosphorus", icon: "⚡" }
];

// Comprehensive Medical Conflict Rules
const MEDICAL_CONFLICTS = {
  DIABETES: {
    bad: ['sugar', 'syrup', 'fructose', 'glucose', 'maltodextrin', 'white flour'],
    warning: "PRODUCT HAZARD FOR DIABETICS",
    advice: "Avoid this product. Its glycemic index is too high.",
    impacts: "Spikes blood sugar rapidly, leading to insulin resistance and potential long-term organ damage.",
    consequences: "Fatigue, blurred vision, and increased risk of diabetic ketoacidosis (DKA)."
  },
  'HIGH BP': {
    bad: ['sodium', 'msg', 'salt', 'chloride'],
    warning: "BLOOD PRESSURE ALERT",
    advice: "High sodium content. Not recommended for salty-sensitive profiles.",
    impacts: "Causes water retention and increases pressure on artery walls.",
    consequences: "Headaches, dizziness, and increased strain on the heart muscle."
  },
  'LOW BP': {
    bad: ['potassium', 'diuretics'],
    warning: "BLOOD PRESSURE MONITORING",
    advice: "Ensure balanced salt intake. Avoid excessive potassium-heavy additives alone.",
    impacts: "Can lead to dangerous drops in blood volume or pressure.",
    consequences: "Fainting, nausea, and severe lightheadedness."
  },
  THYROID: {
    bad: ['soy', 'soybean', 'lecithin', 'gluten', 'wheat'],
    warning: "AUTO-IMMUNE RESPONSE RISK",
    advice: "Contains Soy or Gluten. May interfere with thyroid function/medication.",
    impacts: "Goitrogens in soy can block iodine uptake by the thyroid gland.",
    consequences: "Weight gain, hair loss, and hormonal imbalance."
  },
  PCOD: {
    bad: ['sugar', 'soy', 'processed oil', 'palm oil', 'canola'],
    warning: "INFLAMMATORY RISK",
    advice: "Avoid processed sugars and seed oils to manage hormonal inflammation.",
    impacts: "Increases androgen levels and causes systemic inflammation.",
    consequences: "Acne flare-ups, irregular cycles, and insulin resistance."
  },
  KIDNEY: {
    bad: ['phosphorus', 'potassium', 'phosphate', 'sodium', 'chloride'],
    warning: "RENAL COMPLIANCE RISK",
    advice: "Excessive minerals detected. High Phosphorus/Potassium harms kidney function.",
    impacts: "Kidneys cannot filter excess minerals, causing mineral buildup in blood.",
    consequences: "Muscle cramps, heart rhythm issues, and high bone turnover."
  },
  PREGNANCY: {
    bad: ['mercury', 'unpasteurized', 'raw', 'caffeine', 'retinol', 'artificial sweetener', 'saccharin'],
    warning: "MATERNAL SAFETY ALERT",
    advice: "Stick to clean, natural ingredients. Limit stimulants and artificial chemicals.",
    impacts: "Chemicals can cross the placental barrier and affect fetal development.",
    consequences: "Low birth weight, neural developmental risks, or gestational stress."
  }
};

/**
 * Synchronous safety pre-check for UI grid indicators
 */
export function getProductSafetyStatus(productId, userProfile, extraContext = {}) {
  const product = DEMO_PRODUCTS.find(p => p.id === productId);
  if (!product) return "Neutral";

  const lowerText = product.ingredients.toLowerCase();

  // 1. Check Medical Conflicts
  if (userProfile !== 'NONE' && MEDICAL_CONFLICTS[userProfile]) {
    const profile = MEDICAL_CONFLICTS[userProfile];
    if (profile.bad.some(b => lowerText.includes(b))) return "CONTRAINDICATED";
  }

  // 2. Special Pregnancy Context
  if (userProfile === 'PREGNANCY') {
    if (lowerText.includes('caffeine')) return "DANGER";
    if (extraContext.month >= 7 && (lowerText.includes('sugar') || lowerText.includes('sodium'))) return "DANGER";
  }

  // 3. Check General Warnings
  if (lowerText.includes('sugar') || lowerText.includes('syrup') || lowerText.includes('red 40') || lowerText.includes('msg')) {
    return "CAUTION ADVISED";
  }

  return "SAFE SELECTION";
}

export async function analyzeIngredients(text, imageUrl, productId, userProfile = 'NONE', extraContext = {}) {
  await new Promise(resolve => setTimeout(resolve, 1500));

  let content = productId ? DEMO_PRODUCTS.find(p => p.id === productId).ingredients : (text || "");

  // Handle case where user typed name instead of ingredients
  if (!productId && !imageUrl && text) {
    const foundDemo = DEMO_PRODUCTS.find(p => p.name.toLowerCase().includes(text.toLowerCase()));
    if (foundDemo) content = foundDemo.ingredients;
  }

  const ingredientKeywords = [
    'sugar', 'salt', 'acid', 'syrup', 'extract', 'flour', 'oil', 'fat',
    'protein', 'carb', 'vitamin', 'mineral', 'water', 'lecithin', 'gum',
    'starch', 'natural', 'flavor', 'colour', 'color', 'msg', 'sodium'
  ];

  const lowerText = content.toLowerCase();

  const hasIngredients = ingredientKeywords.some(keyword => lowerText.includes(keyword)) || lowerText.includes(',');

  if (lowerText.trim().length < 5 || !hasIngredients) {
    return {
      intent: "Analysis Refused",
      summary: "No ingredient identified. Please scan a food product label.",
      voiceSummary: "I couldn't identify any ingredients in this scan. Please ensure you are scanning a food or product label.",
      breakdown: [{ label: "Status", content: "Non-food item or unclear label detected." }],
      score: "Neutral",
      canIEat: "NO_INGREDIENTS"
    };
  }

  const findings = [];
  let personalWarning = null;
  let consumptionRule = "Safe for general consumption.";
  let gapDays = 0;
  let canIEat = "YES";

  // 1. Medical Analysis
  if (userProfile !== 'NONE' && MEDICAL_CONFLICTS[userProfile]) {
    const profile = MEDICAL_CONFLICTS[userProfile];
    const foundBad = profile.bad.filter(b => lowerText.includes(b));

    // Special Trimester Check
    if (userProfile === 'PREGNANCY') {
      const month = extraContext.month || 1;
      if (lowerText.includes('caffeine')) {
        personalWarning = "HIGH CAFFEINE ALERT: Dangerous for developing fetus.";
        canIEat = "NO";
        consumptionRule = "Strict limit of 0mg recommended during pregnancy.";
      } else if (month >= 7 && (lowerText.includes('sugar') || lowerText.includes('sodium'))) {
        personalWarning = `3rd TRIMESTER RISK: High ${lowerText.includes('sugar') ? 'Sugar' : 'Sodium'} poses Gestational stress risk.`;
        canIEat = "NO";
        consumptionRule = "Switch to low-sodium/low-sugar alternatives for the final months.";
      }
    } else if (foundBad.length > 0) {
      personalWarning = `${profile.warning}: Found ${foundBad.join(', ')}.`;
      canIEat = "NO";
      consumptionRule = profile.advice;
    }
  }

  // 2. Base Content Analysis (if not already CONTRAINDICATED)
  if (canIEat !== "NO") {
    if (lowerText.includes('sugar') || lowerText.includes('syrup')) {
      findings.push("Added Sugars");
      canIEat = "LIMITED";
      consumptionRule = "Limit to occasional consumption.";
      gapDays = 1;
    }
    if (lowerText.includes('red 40') || lowerText.includes('dye')) {
      findings.push("Artificial Dyes");
      canIEat = "LIMITED";
      consumptionRule = "Avoid for better inflammatory health.";
      gapDays = 3;
    }
  }

  const scoreLabel = canIEat === "NO" ? "CONTRAINDICATED" : canIEat === "LIMITED" ? "CAUTION ADVISED" : "SAFE SELECTION";
  const profile = userProfile !== 'NONE' ? MEDICAL_CONFLICTS[userProfile] : null;

  const finalBreakdown = [
    { label: "Safety Verdict", content: personalWarning ? `🛑 Bilkul dur rahein! (Avoid completely): ${personalWarning}` : `✅ Yeh aapke liye safe lag raha hai.` },
    { label: "Usage Guide", content: consumptionRule },
    { label: "Profile Context", content: userProfile === 'PREGNANCY' ? `Maternal Stage: Month ${extraContext.month}` : `Profile: ${userProfile}` }
  ];

  if (profile && canIEat === "NO") {
    finalBreakdown.push({ label: "Kaisay asar karta hai?", content: profile.impacts });
    finalBreakdown.push({ label: "Kya ho sakta hai?", content: `Isse consume karne se ${profile.consequences} ki samasya ho sakti hai.` });
  } else if (canIEat === "LIMITED") {
    finalBreakdown.push({ label: "Dhyan Dein (Warning)", content: "Rozana consume na karein. Frequent intake se chronic metabolic stress ya inflammation ho sakta hai." });
  }

  const hinglishVoice = scoreLabel === 'CONTRAINDICATED'
    ? `Aapke liye yeh product safe nahi hai. ${consumptionRule} Isse aapko ${profile ? profile.consequences : 'health issues'} ho sakti hain.`
    : `Yeh product aap use kar sakte hain, lekin dhyan rahe. ${consumptionRule}`;

  return {
    intent: "Enhanced Health Analysis",
    summary: personalWarning || (findings.length > 0 ? `Detected ingredients: ${findings.join(', ')}.` : "Clean/Natural choice detected."),
    voiceSummary: hinglishVoice,
    breakdown: finalBreakdown,
    score: scoreLabel,
    canIEat: canIEat
  };
}

export async function askChat(question, productData, userProfile, extraContext = {}) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const q = question.toLowerCase();

  if (userProfile === 'PREGNANCY' && (q.includes('baby') || q.includes('fetus') || q.includes('child'))) {
    return `During Month ${extraContext.month}, your baby's ${extraContext.month < 4 ? 'organs' : extraContext.month < 7 ? 'brain' : 'lungs'} are developing rapidly. Avoiding the stimulants detected in this scan is safer for healthy development.`;
  }

  if (q.includes('me') || q.includes('health')) {
    return `My analysis is based on your specified profile: ${userProfile}. For ${userProfile}, this product's chemical profile is rated as ${productData.score}.`;
  }
  return `I suggest following this: ${productData.canIEat === 'NO' ? 'Avoid this product entirely.' : 'You can try a very small amount today.'}`;
}
