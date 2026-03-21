// ─── AI Prediction System ─────────────────────────────────────────────────

interface AIData {
  visits: number;
  lastPlan: number;
  clicks: number[];
  timeSpent: number;
}

let aiData: AIData = {
  visits: 0,
  lastPlan: 0,
  clicks: [],
  timeSpent: 0,
};

export function loadAI(): void {
  try {
    const raw = localStorage.getItem("aiData");
    if (raw) aiData = JSON.parse(raw);
  } catch {
    // ignore
  }
}

export function saveAI(): void {
  localStorage.setItem("aiData", JSON.stringify(aiData));
}

export function incrementVisit(): void {
  loadAI();
  aiData.visits++;
  saveAI();
}

export function trackClick(plan: number): void {
  loadAI();
  aiData.clicks.push(plan);
  aiData.lastPlan = plan;
  saveAI();
}

export function predictPlan(): number {
  loadAI();
  const count250 = aiData.clicks.filter((x) => x === 250).length;
  if (count250 >= 2) return 250;
  if (aiData.visits > 3) return 500;
  return 250;
}

export function getPredictionMessage(): string {
  const plan = predictPlan();
  if (plan === 500) return "Premium User! ₹500 plan aapke liye best hai";
  if (plan === 250) return "₹250 plan sabse zyada kharida jaata hai";
  return "₹150 se shuru karein";
}

export function speakPrediction(): void {
  if (!("speechSynthesis" in window)) return;
  const msg = getPredictionMessage();
  const clean = msg.replace(/[^\w\s]/gi, "");
  const speech = new SpeechSynthesisUtterance(clean);
  speech.lang = "hi-IN";
  speech.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}
