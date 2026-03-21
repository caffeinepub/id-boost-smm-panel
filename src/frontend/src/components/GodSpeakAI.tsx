import { useEffect, useRef } from "react";

// Tracks one-time and resettable voice states
const aiState = {
  welcomed: false,
  warned: false,
  idleSpoken: false,
  scrollSpoken: false,
  exitSpoken: false,
};

// ── smartSpeak: rate-limited voice with per-call custom delay ──
let lastSpokenTime = 0;

export function smartSpeak(text: string, customDelay = 30000) {
  if (!("speechSynthesis" in window)) return;
  const currentTime = Date.now();
  if (currentTime - lastSpokenTime < customDelay) return;

  const clean = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
  const speech = new SpeechSynthesisUtterance(clean);
  speech.lang = "hi-IN";
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);

  lastSpokenTime = currentTime;
}

// ── godSpeak: always fires, no rate-limiting (for one-time events) ──
export function godSpeak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
  const speech = new SpeechSynthesisUtterance(clean);
  speech.lang = "hi-IN";
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

export function GodSpeakAI() {
  const idleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTime = useRef(0);
  const clickCount = useRef(0);

  useEffect(() => {
    // ── Visit tracker (one-time → godSpeak) ──
    const raw = localStorage.getItem("idboost_visits");
    const visits = (Number(raw) || 0) + 1;
    localStorage.setItem("idboost_visits", String(visits));
    const visitTimer = setTimeout(() => {
      if (!aiState.welcomed) {
        if (visits === 1) {
          godSpeak("Sir, aapka swagat hai hamari website par.");
        } else {
          godSpeak("Welcome back Sir, aaj special offers available hain.");
        }
        aiState.welcomed = true;
      }
    }, 2000);

    // ── Click tracker (3rd click → godSpeak, one-time event) ──
    const handleClick = () => {
      clickCount.current += 1;
      if (clickCount.current === 3) {
        godSpeak(
          "Sir, lagta hai aap service lena chahte hain. Recharge karke shuru karein.",
        );
      }
    };
    document.addEventListener("click", handleClick);

    // ── Idle detection (every 1s) → smartSpeak with 60s delay ──
    idleRef.current = setInterval(() => {
      idleTime.current += 1;
      if (idleTime.current === 10 && !aiState.idleSpoken) {
        smartSpeak("Explore services", 60000);
        aiState.idleSpoken = true;
      }
    }, 1000);

    // ── Reset idle counter on activity ──
    const resetIdle = () => {
      idleTime.current = 0;
    };
    document.addEventListener("mousemove", resetIdle);
    document.addEventListener("keypress", resetIdle);
    document.addEventListener("touchstart", resetIdle);

    // ── Scroll trigger (> 200px, once per session) → smartSpeak with 90s delay ──
    const handleScroll = () => {
      if (window.scrollY > 200 && !aiState.scrollSpoken) {
        smartSpeak("Special offer live hai", 90000);
        aiState.scrollSpoken = true;
      }
    };
    window.addEventListener("scroll", handleScroll);

    // ── Exit intent (cursor leaves top of page) → smartSpeak with 30s delay ──
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY < 0 && !aiState.exitSpoken) {
        smartSpeak("Sir jaane se pehle offer dekh lein", 30000);
        aiState.exitSpoken = true;
        setTimeout(() => {
          aiState.exitSpoken = false;
        }, 30000);
      }
    };
    document.addEventListener("mouseout", handleMouseOut);

    // ── Auto voice: 8s and 15s after load ──
    const timer8 = setTimeout(() => {
      smartSpeak("Sir aapka balance kam hai, pehle fund add karein", 60000);
    }, 8000);
    const timer15 = setTimeout(() => {
      smartSpeak("250 rupaye plan sabse zyada kharida jaata hai", 60000);
    }, 15000);

    // ── 30s periodic reset of warned + idleSpoken ──
    const resetTimer = setInterval(() => {
      aiState.warned = false;
      aiState.idleSpoken = false;
      aiState.scrollSpoken = false;
      idleTime.current = 0;
    }, 30000);

    return () => {
      clearTimeout(visitTimer);
      clearTimeout(timer8);
      clearTimeout(timer15);
      if (idleRef.current) clearInterval(idleRef.current);
      clearInterval(resetTimer);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", resetIdle);
      document.removeEventListener("keypress", resetIdle);
      document.removeEventListener("touchstart", resetIdle);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return null;
}

/** Call this when user tries to order with zero balance → smartSpeak with 30s delay */
export function godWarnInsufficientBalance() {
  if (!aiState.warned) {
    smartSpeak("Balance low hai, recharge karein", 30000);
    aiState.warned = true;
  }
}

/** Call on deposit action */
export function godSpeakDeposit() {
  godSpeak("Sir, minimum recharge 150 rupaye hai aur aapko bonus bhi milega.");
}

/** Call on order action */
export function godSpeakOrder() {
  godSpeak("Sir, fast delivery available hai.");
}
