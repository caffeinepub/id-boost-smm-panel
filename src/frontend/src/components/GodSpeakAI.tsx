import { useEffect, useRef } from "react";

// Tracks one-time and resettable voice states
const aiState = {
  welcomed: false,
  warned: false,
  idleSpoken: false,
  scrollSpoken: false,
  exitSpoken: false,
};

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
    // ── Visit tracker ──
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

    // ── Click tracker (3rd click) ──
    const handleClick = () => {
      clickCount.current += 1;
      if (clickCount.current === 3) {
        godSpeak(
          "Sir, lagta hai aap service lena chahte hain. Recharge karke shuru karein.",
        );
      }
    };
    document.addEventListener("click", handleClick);

    // ── Idle detection (every 1s) ──
    idleRef.current = setInterval(() => {
      idleTime.current += 1;
      if (idleTime.current === 10 && !aiState.idleSpoken) {
        godSpeak(
          "Sir, aap services explore kar sakte hain ya recharge karke shuru karein.",
        );
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

    // ── Scroll trigger (> 200px, once per session) ──
    const handleScroll = () => {
      if (window.scrollY > 200 && !aiState.scrollSpoken) {
        godSpeak("Sir, neeche special offers available hain, zaroor dekhein.");
        aiState.scrollSpoken = true;
      }
    };
    window.addEventListener("scroll", handleScroll);

    // ── Exit intent (cursor leaves top of page) ──
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY < 0 && !aiState.exitSpoken) {
        godSpeak("Sir, jaane se pehle offer zaroor dekh lein.");
        aiState.exitSpoken = true;
        setTimeout(() => {
          aiState.exitSpoken = false;
        }, 30000);
      }
    };
    document.addEventListener("mouseout", handleMouseOut);

    // ── 30s periodic reset of warned + idleSpoken ──
    const resetTimer = setInterval(() => {
      aiState.warned = false;
      aiState.idleSpoken = false;
      aiState.scrollSpoken = false;
      idleTime.current = 0;
    }, 30000);

    return () => {
      clearTimeout(visitTimer);
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

/** Call this when user tries to order with zero balance */
export function godWarnInsufficientBalance() {
  if (!aiState.warned) {
    godSpeak(
      "Sir, aapke account mein balance nahin hai. Kripya pehle fund add karein.",
    );
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
