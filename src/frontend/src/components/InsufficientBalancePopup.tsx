import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
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
  content: React.ReactNode;
};

function PopupContent1() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.6, color: "white" }}>
      <div style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
        Special Offer
      </div>
      <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 18 }}>
        ₹250 + ₹60 Bonus
      </div>
      <div style={{ marginTop: 6, opacity: 0.9 }}>Pay ₹250 → Get ₹310</div>
    </div>
  );
}

function PopupContent2() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.6, color: "white" }}>
      <div style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
        Blue Tick Offer
      </div>
      <img
        src="/assets/uploads/20260321_003208-1.png"
        width={50}
        style={{
          filter: "drop-shadow(0 0 10px #3b82f6)",
          margin: "6px auto",
          display: "block",
        }}
        alt="Blue Tick Badge"
      />
      <div style={{ color: "#3b82f6", fontWeight: "bold", fontSize: 18 }}>
        ₹499 Only
      </div>
      <div style={{ marginTop: 6, opacity: 0.9 }}>Extra ₹141 Bonus 🔥</div>
    </div>
  );
}

function PopupContent3() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.6, color: "white" }}>
      <div style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
        Low Balance
      </div>
      <div style={{ color: "#ff5a2c", fontWeight: "bold", fontSize: 18 }}>
        आपका बैलेंस ₹0 है
      </div>
      <div style={{ marginTop: 6, opacity: 0.9 }}>पहले फंड ऐड करें</div>
    </div>
  );
}

function PopupContent4() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.6, color: "white" }}>
      <div style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
        Recharge Now
      </div>
      <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: 18 }}>
        ₹150 से शुरू करें
      </div>
      <div style={{ marginTop: 6, opacity: 0.9 }}>+ Bonus पाएँ</div>
    </div>
  );
}

function PopupContent5() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.6, color: "white" }}>
      <div style={{ fontSize: 20, marginBottom: 8, fontWeight: "bold" }}>
        Most Popular Plan
      </div>
      <div style={{ color: "#a855f7", fontWeight: "bold", fontSize: 18 }}>
        ₹250 सबसे ज्यादा खरीदा जाता है
      </div>
      <div style={{ marginTop: 6, opacity: 0.9 }}>⭐ Best Seller</div>
    </div>
  );
}

const POPUP_MESSAGES: PopupMessage[] = [
  { id: "offer", border: "#f59e0b", icon: "🔥", content: <PopupContent1 /> },
  { id: "bluetick", border: "#3b82f6", icon: "💎", content: <PopupContent2 /> },
  { id: "lowbal", border: "#ff5a2c", icon: "⚠️", content: <PopupContent3 /> },
  { id: "recharge", border: "#22c55e", icon: "💰", content: <PopupContent4 /> },
  { id: "popular", border: "#a855f7", icon: "🎯", content: <PopupContent5 /> },
];

export function InsufficientBalancePopup() {
  const balance = useLocalBalance();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  const lastClosedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef<number>(0);

  const showPopup = useCallback((bypassGap = false) => {
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

  // Manual trigger from Buy button — bypass close gap
  useEffect(() => {
    const handler = () => showPopup(true);
    window.addEventListener("show-balance-popup", handler);
    return () => window.removeEventListener("show-balance-popup", handler);
  }, [showPopup]);

  // Auto timing: 3s first trigger, then every 10s
  useEffect(() => {
    if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (balance > 0) return;

    firstTimerRef.current = setTimeout(() => {
      showPopup();
      intervalRef.current = setInterval(() => showPopup(), 10000);
    }, 3000);

    return () => {
      if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
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
    navigate({ to: "/" });
    setTimeout(() => {
      const el = document.getElementById("quick-recharge");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(
        new CustomEvent("set-selected-amount", { detail: { amount: 250 } }),
      );
    }, 200);
  }

  const current = POPUP_MESSAGES[popupIndex];

  return (
    <>
      {/* AI Bot notification */}
      <AnimatePresence>
        {showBot && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{
              position: "fixed",
              bottom: 80,
              left: 16,
              zIndex: 9998,
              background: "#222",
              padding: "10px 15px",
              borderRadius: 10,
              color: "white",
              fontSize: 13,
              maxWidth: 260,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            🤖 Sir, your balance is ₹0. Add funds to continue.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main sequence popup */}
      <AnimatePresence>
        {open && (
          <div
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
              zIndex: 9999,
            }}
            onClick={handleClose}
            onKeyDown={(e) => e.key === "Escape" && handleClose()}
            tabIndex={-1}
          >
            <motion.div
              key={current.id}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "90%",
                maxWidth: 400,
                background: "#1c1c1c",
                border: `3px solid ${current.border}`,
                borderRadius: 20,
                padding: 25,
                textAlign: "center",
              }}
            >
              {/* Header row */}
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
                  data-ocid="balance_popup.close_button"
                  style={{
                    fontSize: 22,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Message content */}
              <div style={{ marginBottom: 20 }}>{current.content}</div>

              {/* Add Funds button */}
              <button
                type="button"
                onClick={handleAddFunds}
                data-ocid="balance_popup.primary_button"
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
                data-ocid="balance_popup.cancel_button"
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

              {/* Sequence indicator dots */}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
