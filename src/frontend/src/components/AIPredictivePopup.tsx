import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPredictionMessage,
  incrementVisit,
  loadAI,
  speakPrediction,
} from "../utils/aiPrediction";

function isOnBlueTick(): boolean {
  return window.location.pathname.includes("blue-tick");
}

export function AIPredictivePopup() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (isOnBlueTick()) return;
    loadAI();
    const msg = getPredictionMessage();
    setMessage(msg);
    setOpen(true);
    speakPrediction();
  }, []);

  // Increment visit once on mount
  useEffect(() => {
    incrementVisit();
  }, []);

  // 4s first show, then every 15s
  useEffect(() => {
    firstRef.current = setTimeout(() => {
      show();
      intervalRef.current = setInterval(show, 15000);
    }, 4000);

    return () => {
      if (firstRef.current) clearTimeout(firstRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [show]);

  function handleClose() {
    setOpen(false);
  }

  function handleAddFunds() {
    handleClose();
    navigate({ to: "/" });
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("set-selected-amount", { detail: { amount: 250 } }),
      );
      const el = document.getElementById("quick-recharge");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ai-predict"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          style={{
            position: "fixed",
            bottom: 86,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9990,
            background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
            border: "2px solid rgba(59,130,246,0.5)",
            borderRadius: 18,
            padding: "14px 18px",
            textAlign: "center",
            color: "white",
            fontSize: 14,
            minWidth: 260,
            maxWidth: 320,
            boxShadow: "0 0 30px rgba(59,130,246,0.5)",
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>

          <div style={{ marginBottom: 6, fontSize: 20 }}>🤖</div>
          <div style={{ fontWeight: "bold", marginBottom: 10, fontSize: 15 }}>
            {message}
          </div>

          <button
            type="button"
            onClick={handleAddFunds}
            style={{
              background: "linear-gradient(45deg, #3b82f6, #ec4899)",
              border: "none",
              color: "white",
              borderRadius: 10,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 13,
              boxShadow: "0 0 12px rgba(59,130,246,0.4)",
            }}
          >
            💳 Add Funds
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
