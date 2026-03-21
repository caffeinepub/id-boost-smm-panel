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

export function InsufficientBalancePopup() {
  const balance = useLocalBalance();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPopup = useCallback(() => {
    if (getLocalBalanceNow() === 0) {
      setOpen(true);
      setShowBot(true);
      godWarnInsufficientBalance();
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      botTimerRef.current = setTimeout(() => setShowBot(false), 4000);
    }
  }, []);

  // Listen for manual trigger from Buy button
  useEffect(() => {
    window.addEventListener("show-balance-popup", showPopup);
    return () => window.removeEventListener("show-balance-popup", showPopup);
  }, [showPopup]);

  useEffect(() => {
    // Clear all previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (balance > 0) return;

    // 5 sec baad pehla popup
    timersRef.current.push(setTimeout(showPopup, 5000));

    // 15 sec baad doosra
    timersRef.current.push(setTimeout(showPopup, 15000));

    // 25 sec baad teesra, phir har 15 sec repeat
    timersRef.current.push(
      setTimeout(() => {
        showPopup();
        intervalRef.current = setInterval(showPopup, 15000);
      }, 25000),
    );

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [balance, showPopup]);

  function handleAddFunds() {
    setOpen(false);
    navigate({ to: "/" });
    setTimeout(() => {
      const el = document.getElementById("quick-recharge");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }

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

      {/* Main popup */}
      <AnimatePresence>
        {open && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "90%",
                maxWidth: 400,
                background: "#1c1c1c",
                border: "3px solid #ff5a2c",
                borderRadius: 20,
                padding: 25,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 28, color: "#ff5a2c" }}>⚠</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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

              <h2
                style={{
                  color: "#ff5a2c",
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Insufficient Balance
              </h2>

              <p style={{ color: "white", marginBottom: 6 }}>
                Your balance is currently{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>₹0</span>.
              </p>

              <p
                style={{
                  fontSize: 14,
                  opacity: 0.8,
                  color: "white",
                  marginBottom: 20,
                }}
              >
                आपके पास पर्याप्त शेष नहीं है। कृपया पहले फंड जोड़ें।
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleAddFunds}
                  data-ocid="balance_popup.primary_button"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#ff5a2c",
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

                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                  🔙 Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
