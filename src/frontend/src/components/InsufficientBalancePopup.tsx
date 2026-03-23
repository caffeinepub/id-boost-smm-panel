import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalBalance } from "../hooks/useLocalBalance";
import { godWarnInsufficientBalance } from "./GodSpeakAI";

export function triggerInsufficientBalancePopup() {
  window.dispatchEvent(new CustomEvent("show-balance-popup"));
}

function getLocalBalanceNow(): number {
  return Number.parseFloat(localStorage.getItem("idboost_balance") || "0");
}

type PopupMessage = {
  id: string;
  border: string;
  icon: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  body: string;
};

const POPUP_MESSAGES: PopupMessage[] = [
  {
    id: "offer",
    border: "#f59e0b",
    icon: "🔥",
    title: "Special Offer",
    subtitle: "₹250 + ₹60 Bonus",
    subtitleColor: "#f59e0b",
    body: "Pay ₹250 → Get ₹310",
  },
  {
    id: "bluetick",
    border: "#3b82f6",
    icon: "💎",
    title: "Blue Tick Offer",
    subtitle: "₹499 Only",
    subtitleColor: "#3b82f6",
    body: "Extra ₹141 Bonus 🔥",
  },
  {
    id: "lowbal",
    border: "#ff5a2c",
    icon: "⚠️",
    title: "Low Balance",
    subtitle: "आपका बैलेंस ₹0 है",
    subtitleColor: "#ff5a2c",
    body: "पहले फंड ऐड करें",
  },
  {
    id: "recharge",
    border: "#22c55e",
    icon: "💰",
    title: "Recharge Now",
    subtitle: "₹150 से शुरू करें",
    subtitleColor: "#22c55e",
    body: "+ Bonus पाएँ",
  },
  {
    id: "popular",
    border: "#a855f7",
    icon: "🎯",
    title: "Most Popular Plan",
    subtitle: "₹250 सबसे ज्यादा खरीदा जाता है",
    subtitleColor: "#a855f7",
    body: "⭐ Best Seller",
  },
];

function isOnBlueTickPage(): boolean {
  const path = window.location.pathname + window.location.hash;
  return path.includes("blue-tick") || path.includes("bluetick");
}

export function InsufficientBalancePopup() {
  const balance = useLocalBalance();
  const [open, setOpen] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  const lastClosedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef<number>(0);

  const showPopup = useCallback((bypassGap = false) => {
    if (isOnBlueTickPage()) return;
    if (getLocalBalanceNow() !== 0) return;
    const now = Date.now();
    if (!bypassGap && now - lastClosedRef.current < 10000) return;

    const next = (indexRef.current + 1) % POPUP_MESSAGES.length;
    indexRef.current = next;
    setPopupIndex(next);
    setOpen(true);
    setShowBot(true);
    godWarnInsufficientBalance();

    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => setShowBot(false), 4000);
  }, []);

  // Listen for external trigger (e.g. Buy button click)
  useEffect(() => {
    const handler = () => {
      if (isOnBlueTickPage()) return;
      showPopup(true);
    };
    window.addEventListener("show-balance-popup", handler);
    return () => window.removeEventListener("show-balance-popup", handler);
  }, [showPopup]);

  // Auto timer: 5s first, 15s second, 25s third, then every 15s
  useEffect(() => {
    if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (balance > 0) return;

    // 5s
    const t1 = setTimeout(() => showPopup(true), 5000);
    // 15s
    const t2 = setTimeout(() => showPopup(true), 15000);
    // 25s
    const t3 = setTimeout(() => showPopup(true), 25000);
    // every 15s after 25s
    const loop = setTimeout(() => {
      intervalRef.current = setInterval(() => showPopup(true), 15000);
    }, 25000);

    firstTimerRef.current = t1;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(loop);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [balance, showPopup]);

  function handleClose() {
    lastClosedRef.current = Date.now();
    setOpen(false);
  }

  function handleAddFunds() {
    handleClose();
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
    setTimeout(() => {
      const el = document.getElementById("quick-recharge");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(
        new CustomEvent("set-selected-amount", { detail: { amount: 250 } }),
      );
    }, 300);
  }

  const current = POPUP_MESSAGES[popupIndex];

  return (
    <>
      {/* AI Bot notification */}
      {showBot && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: 16,
            zIndex: 100000,
            background: "#222",
            padding: "10px 15px",
            borderRadius: 10,
            color: "white",
            fontSize: 13,
            maxWidth: 260,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            animation: "slideInLeft 0.3s ease",
          }}
        >
          🤖 Sir, your balance is ₹0. Add funds to continue.
        </div>
      )}

      {/* Main overlay */}
      {open && (
        <div
          onClick={handleClose}
          onKeyDown={(e) => e.key === "Escape" && handleClose()}
          role="presentation"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <style>{`
            @keyframes popupZoom {
              from { transform: scale(0.7); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
            @keyframes slideInLeft {
              from { opacity: 0; transform: translateX(-20px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {/* Popup box */}
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-modal="true"
            style={{
              width: "90%",
              maxWidth: 400,
              background: "#1c1c1c",
              border: `3px solid ${current.border}`,
              borderRadius: 20,
              padding: 25,
              textAlign: "center",
              animation: "popupZoom 0.3s ease",
              boxShadow: `0 0 40px ${current.border}55`,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 26 }}>{current.icon}</span>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  fontSize: 22,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: "white",
                  lineHeight: 1,
                  opacity: 0.7,
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 20,
                  marginBottom: 8,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {current.title}
              </div>
              {current.id === "bluetick" && (
                <img
                  src="/assets/uploads/20260321_003208-1.png"
                  width={50}
                  alt="Blue Tick"
                  style={{
                    filter: "drop-shadow(0 0 10px #3b82f6)",
                    margin: "6px auto",
                    display: "block",
                  }}
                />
              )}
              <div
                style={{
                  color: current.subtitleColor,
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {current.subtitle}
              </div>
              <div
                style={{
                  marginTop: 6,
                  opacity: 0.9,
                  color: "white",
                  fontSize: 14,
                }}
              >
                {current.body}
              </div>
            </div>

            {/* Add Funds button */}
            <button
              type="button"
              onClick={handleAddFunds}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                border: "none",
                color: "white",
                borderRadius: 10,
                marginBottom: 10,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              💳 Add Funds
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "12px",
                background: "#333",
                border: "none",
                color: "white",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              ❌ Close
            </button>

            {/* Dots indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 14,
              }}
            >
              {POPUP_MESSAGES.map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i === popupIndex ? current.border : "#444",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
