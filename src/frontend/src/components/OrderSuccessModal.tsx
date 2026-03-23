import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface OrderSuccessModalProps {
  visible: boolean;
  service: string;
  quantity: string;
  amount: string;
  onClose: () => void;
}

export function OrderSuccessModal({
  visible,
  service,
  quantity,
  amount,
  onClose,
}: OrderSuccessModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="order-success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            perspective: "1000px",
          }}
          data-ocid="order.success_state"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateX: -30, y: 40 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: [0, 3, -3, 2, -2, 0],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{
              duration: 0.6,
              rotateX: {
                delay: 0.7,
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
              },
            }}
            style={{
              width: "clamp(300px, 90vw, 400px)",
              background:
                "linear-gradient(135deg, #052e16 0%, #0f172a 60%, #0a1628 100%)",
              border: "2px solid rgba(34,197,94,0.7)",
              borderRadius: "24px",
              padding: "36px 28px 28px",
              boxShadow:
                "0 0 60px rgba(34,197,94,0.35), 0 0 120px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              textAlign: "center",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 14,
                delay: 0.15,
              }}
              style={{
                fontSize: "72px",
                lineHeight: 1,
                marginBottom: "18px",
                display: "block",
                filter: "drop-shadow(0 0 24px rgba(34,197,94,0.9))",
              }}
            >
              ✅
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 900,
                margin: "0 0 8px",
                fontFamily: "Bricolage Grotesque, sans-serif",
                textShadow: "0 0 20px rgba(34,197,94,0.5)",
              }}
            >
              Order Placed Successfully!
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{
                color: "#facc15",
                fontSize: "13px",
                margin: "0 0 20px",
                fontWeight: 600,
              }}
            >
              ⏳ आपकी service pending है (1-2 घंटे)
            </motion.p>

            {/* Details card */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              style={{
                background: "rgba(34,197,94,0.07)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "24px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Service
                </span>
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {service}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Quantity
                </span>
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {Number(quantity).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(34,197,94,0.2)",
                  paddingTop: "8px",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Amount Deducted
                </span>
                <span
                  style={{
                    color: "#22c55e",
                    fontSize: "15px",
                    fontWeight: 900,
                  }}
                >
                  ₹{amount}
                </span>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              style={{ display: "flex", gap: "10px" }}
            >
              <button
                type="button"
                data-ocid="order.success_state"
                onClick={() => {
                  onClose();
                  navigate({ to: "/history" });
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.5)",
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                📋 View History
              </button>
              <button
                type="button"
                data-ocid="order.close_button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #166534, #22c55e)",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(34,197,94,0.4)",
                }}
              >
                ✓ Continue
              </button>
            </motion.div>

            {/* Auto-dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: "#4b5563", fontSize: "11px", marginTop: "14px" }}
            >
              Auto-closes in 5 seconds
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
