import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useRefunds } from "../hooks/useRefunds";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RefundModal({ isOpen, onClose }: RefundModalProps) {
  const { addRefund, hasPending } = useRefunds();
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setPaymentNumber("");
    setAmount("");
    setError("");
    setSuccess(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !paymentNumber.trim() || !amount) {
      setError("Sab fields bharna zaroori hai.");
      return;
    }
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt < 1) {
      setError("Valid amount darj karein (min ₹1).");
      return;
    }
    setError("");
    addRefund({
      fullName: name.trim(),
      mobile: "",
      method: "upi",
      upiId: paymentNumber.trim(),
      amount: amt,
    });
    setSuccess(true);
  }

  const inputStyle: React.CSSProperties = {
    background: "#0b1220",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#f9fafb",
    padding: "11px 13px",
    width: "100%",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="refund-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="refund.modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "380px",
              position: "relative",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px 14px",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <h2
                style={{
                  color: "#f9fafb",
                  fontWeight: 700,
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                💸 Refund Request
              </h2>
              <button
                type="button"
                onClick={handleClose}
                data-ocid="refund.close_button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "0 4px",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "18px" }}>
              {/* Pending state */}
              {hasPending ? (
                <div data-ocid="refund.error_state">
                  <div
                    style={{
                      background: "rgba(251,146,60,0.1)",
                      border: "1px solid rgba(251,146,60,0.3)",
                      borderRadius: "8px",
                      padding: "14px",
                      marginBottom: "14px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#fb923c",
                        fontSize: "13px",
                        fontWeight: 600,
                        margin: "0 0 4px",
                      }}
                    >
                      Ek pending request already hai
                    </p>
                    <p
                      style={{ color: "#d1d5db", fontSize: "12px", margin: 0 }}
                    >
                      Pehli request process hone tak ruko.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    data-ocid="refund.close_button"
                    style={{
                      background: "#374151",
                      color: "#d1d5db",
                      border: "none",
                      borderRadius: "8px",
                      padding: "11px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : success ? (
                /* Success state */
                <div
                  style={{ textAlign: "center", padding: "8px 0" }}
                  data-ocid="refund.success_state"
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "rgba(34,197,94,0.15)",
                      border: "2px solid rgba(34,197,94,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      fontSize: "24px",
                      color: "#22c55e",
                    }}
                  >
                    ✓
                  </div>
                  <p
                    style={{
                      color: "#f9fafb",
                      fontWeight: 700,
                      fontSize: "16px",
                      margin: "0 0 8px",
                    }}
                  >
                    Request Submit Ho Gayi!
                  </p>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      margin: "0 0 18px",
                    }}
                  >
                    72 ghante mein refund ho jayega aapke selected number par.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    data-ocid="refund.close_button"
                    style={{
                      background: "#374151",
                      color: "#d1d5db",
                      border: "none",
                      borderRadius: "8px",
                      padding: "11px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* Simple 3-field form */
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ marginBottom: "13px" }}>
                    <label
                      htmlFor="refund-name"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#9ca3af",
                        marginBottom: "5px",
                      }}
                    >
                      Naam
                    </label>
                    <input
                      id="refund-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aapka naam"
                      style={inputStyle}
                      data-ocid="refund.input"
                    />
                  </div>

                  <div style={{ marginBottom: "13px" }}>
                    <label
                      htmlFor="refund-payment"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#9ca3af",
                        marginBottom: "5px",
                      }}
                    >
                      UPI ID / Bank No / Paytm No
                    </label>
                    <input
                      id="refund-payment"
                      type="text"
                      value={paymentNumber}
                      onChange={(e) => setPaymentNumber(e.target.value)}
                      placeholder="UPI ID, Bank No, ya Paytm No"
                      style={inputStyle}
                      data-ocid="refund.input"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="refund-amount"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#9ca3af",
                        marginBottom: "5px",
                      }}
                    >
                      Refund Amount (₹)
                    </label>
                    <input
                      id="refund-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Kitna refund chahiye"
                      min={1}
                      style={inputStyle}
                      data-ocid="refund.input"
                    />
                  </div>

                  {error && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: "12px",
                        marginBottom: "12px",
                      }}
                      data-ocid="refund.error_state"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    data-ocid="refund.submit_button"
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    Submit Refund
                  </button>

                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "11px",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    Refund processed within 72 hours • 100% Secure
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
