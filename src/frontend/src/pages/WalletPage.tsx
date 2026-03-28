import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { RefundHistory } from "../components/RefundHistory";
import { RefundModal } from "../components/RefundModal";
import { useAppContext } from "../context/AppContext";
import { useRefunds } from "../hooks/useRefunds";

const PLANS = [
  { amount: 75, bonus: 15, tag: "starter" as const },
  { amount: 100, bonus: 25, tag: "popular_small" as const },
  { amount: 150, bonus: 30 },
  { amount: 250, bonus: 60, tag: "popular" as const },
  { amount: 300, bonus: 70 },
  { amount: 400, bonus: 90 },
  { amount: 500, bonus: 120, tag: "best" as const },
];

type Plan = (typeof PLANS)[number];

export function WalletPage() {
  const { userProfile } = useAppContext();
  const balance = userProfile?.balance?.toFixed(2) ?? "0.00";
  const navigate = useNavigate();
  const { hasPending } = useRefunds();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error_plan" | "error_screenshot"
  >("idle");
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const rechargeRef = useRef<HTMLDivElement>(null);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setSubmitStatus("idle");
  }

  function scrollToRecharge() {
    rechargeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setScreenshotFile(file);
    setSubmitStatus("idle");
  }

  function handleSubmitPayment() {
    if (!selectedPlan) {
      setSubmitStatus("error_plan");
      return;
    }
    if (!screenshotFile) {
      setSubmitStatus("error_screenshot");
      return;
    }
    const pending = JSON.parse(localStorage.getItem("pendingDeposits") || "[]");
    pending.push({
      amount: selectedPlan.amount,
      bonus: selectedPlan.bonus,
      timestamp: Date.now(),
      status: "pending",
    });
    localStorage.setItem("pendingDeposits", JSON.stringify(pending));
    setSubmitStatus("success");
    setScreenshotFile(null);
  }

  const smallPlans = PLANS.filter(
    (p) => p.tag === "starter" || p.tag === "popular_small",
  );
  const mainPlans = PLANS.filter(
    (p) => p.tag !== "starter" && p.tag !== "popular_small",
  );

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4 pb-24">
      {/* Back Button */}
      <motion.button
        type="button"
        onClick={() => navigate({ to: "/" })}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.95 }}
        data-ocid="wallet.link"
        className="flex items-center gap-2 text-sm font-semibold mb-4 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(59,130,246,0.25)",
          color: "#93c5fd",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 12px rgba(59,130,246,0.15)",
        }}
      >
        <span style={{ fontSize: "16px" }}>←</span>
        <span>Back to Home</span>
      </motion.button>

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-center mb-4 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="wallet.section"
      >
        💰 My Wallet
      </motion.h1>

      {/* VIP Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        data-ocid="wallet.card"
        className="relative overflow-hidden mb-5"
        style={{
          background:
            "linear-gradient(135deg, #0f1f3d 0%, #1a1040 50%, #0f1f3d 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: "18px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.15)",
          padding: "24px 20px 20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 40%, rgba(212,175,55,0.08) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s infinite linear",
            pointerEvents: "none",
            borderRadius: "18px",
          }}
        />
        <div className="flex items-center justify-between mb-4">
          <span
            style={{
              background: "linear-gradient(90deg, #b8860b, #ffd700)",
              color: "#000",
              fontWeight: 700,
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "20px",
              letterSpacing: "0.06em",
            }}
          >
            👑 VIP MEMBER
          </span>
          <span style={{ color: "rgba(212,175,55,0.5)", fontSize: "20px" }}>
            ◈
          </span>
        </div>
        <div className="text-center mb-4">
          <p
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#ffffff",
              textShadow: "0 0 30px rgba(212,175,55,0.4)",
              lineHeight: 1,
              fontFamily: "Bricolage Grotesque, sans-serif",
              letterSpacing: "-1px",
            }}
          >
            ₹{balance}
          </p>
          <p
            style={{
              color: "rgba(212,175,55,0.6)",
              fontSize: "12px",
              fontWeight: 500,
              marginTop: "6px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Available Balance
          </p>
        </div>
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
            marginBottom: "16px",
          }}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={scrollToRecharge}
            data-ocid="wallet.primary_button"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "10px",
              background: "transparent",
              border: "1.5px solid rgba(59,130,246,0.55)",
              color: "#93c5fd",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            + Add Funds
          </button>
          <button
            type="button"
            onClick={() => setRefundModalOpen(true)}
            disabled={hasPending}
            data-ocid="wallet.open_modal_button"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "10px",
              background: "transparent",
              border: "1.5px solid rgba(148,163,184,0.35)",
              color: hasPending ? "#4b5563" : "#94a3b8",
              fontSize: "13px",
              fontWeight: 700,
              cursor: hasPending ? "not-allowed" : "pointer",
              opacity: hasPending ? 0.6 : 1,
              transition: "all 0.18s",
            }}
          >
            ↩ {hasPending ? "Pending" : "Request Refund"}
          </button>
        </div>
      </motion.div>

      {/* Refund History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        style={{ marginBottom: "16px" }}
      >
        <h2
          style={{
            color: "#e5e7eb",
            fontWeight: 700,
            fontSize: "15px",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          Refund History
        </h2>
        <RefundHistory />
      </motion.div>

      {/* Quick Recharge Section */}
      <motion.div
        ref={rechargeRef}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 mb-4"
        data-ocid="wallet.panel"
      >
        <h2
          className="text-lg font-black mb-1"
          style={{
            color: "#22c55e",
            textShadow: "0 0 12px rgba(34,197,94,0.5)",
          }}
        >
          ⚡ Quick Recharge
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Plan select karo aur pay karo
        </p>

        {/* Recharge Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {/* Full-width small plans */}
          {smallPlans.map((plan) => {
            const isSelected = selectedPlan?.amount === plan.amount;
            const isPopSmall = plan.tag === "popular_small";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                data-ocid="wallet.toggle"
                style={{
                  gridColumn: "span 2",
                  padding: "16px 18px",
                  borderRadius: "15px",
                  background: "#0f172a",
                  border: isPopSmall
                    ? `2px solid ${isSelected ? "#3b82f6" : "#3b82f6"}`
                    : `1.5px solid ${isSelected ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.2)"}`,
                  boxShadow: isSelected
                    ? "0 0 16px rgba(59,130,246,0.35)"
                    : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s",
                  color: "white",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  {isPopSmall && (
                    <span
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "20px",
                        display: "inline-block",
                        marginBottom: "4px",
                      }}
                    >
                      Popular
                    </span>
                  )}
                  {!isPopSmall && (
                    <span
                      style={{
                        background: "#64748b",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "20px",
                        display: "inline-block",
                        marginBottom: "4px",
                      }}
                    >
                      Starter
                    </span>
                  )}
                  <p style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
                    ₹{plan.amount}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      color: "#22c55e",
                      fontWeight: 700,
                      fontSize: "15px",
                      margin: 0,
                    }}
                  >
                    +₹{plan.bonus} Bonus
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                    Total ₹{plan.amount + plan.bonus}
                  </p>
                </div>
              </button>
            );
          })}

          {/* 2-column main plans */}
          {mainPlans.map((plan) => {
            const isSelected = selectedPlan?.amount === plan.amount;
            const isPopular = plan.tag === "popular";
            const isBest = plan.tag === "best";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                data-ocid="wallet.toggle"
                style={{
                  padding: "16px 10px",
                  borderRadius: "15px",
                  background: isSelected
                    ? "linear-gradient(145deg, #1e40af20, #0f172a)"
                    : "#0f172a",
                  border: isPopular
                    ? `2px solid ${isSelected ? "#6366f1" : "#6366f1"}`
                    : isBest
                      ? `2px solid ${isSelected ? "#22c55e" : "#22c55e"}`
                      : `1.5px solid ${isSelected ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.15)"}`,
                  boxShadow: isSelected
                    ? "0 0 16px rgba(59,130,246,0.25)"
                    : "none",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  color: "white",
                  position: "relative",
                }}
              >
                {isPopular && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#6366f1",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⭐ Popular
                  </span>
                )}
                {isBest && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#22c55e",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔥 Best
                  </span>
                )}
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    margin: "0 0 2px",
                  }}
                >
                  ₹{plan.amount}
                </p>
                <p
                  style={{
                    color: "#22c55e",
                    fontSize: "12px",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  +₹{plan.bonus}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Plan + Offer text */}
        {selectedPlan && (
          <motion.div
            key={selectedPlan.amount}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-bold mb-4 py-2 px-3 rounded-xl"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#86efac",
            }}
          >
            Selected: ₹{selectedPlan.amount} → You Get ₹
            {selectedPlan.amount + selectedPlan.bonus}
          </motion.div>
        )}

        {/* Screenshot Upload Section */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "4px",
          }}
        >
          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            📸 Upload Payment Screenshot
          </p>

          <label
            htmlFor="screenshot-upload"
            style={{
              display: "block",
              padding: "12px",
              borderRadius: "10px",
              border: "1.5px dashed rgba(59,130,246,0.4)",
              background: "rgba(59,130,246,0.05)",
              color: screenshotFile ? "#22c55e" : "#64748b",
              fontSize: "13px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: "12px",
              transition: "all 0.2s",
            }}
            data-ocid="wallet.upload_button"
          >
            {screenshotFile
              ? `✅ ${screenshotFile.name}`
              : "📁 Tap to select screenshot"}
          </label>
          <input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            style={{ display: "none" }}
            data-ocid="wallet.dropzone"
          />

          {/* Inline error messages */}
          {submitStatus === "error_plan" && (
            <p
              style={{
                color: "#f87171",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              ❌ Please select a plan first
            </p>
          )}
          {submitStatus === "error_screenshot" && (
            <p
              style={{
                color: "#f87171",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              ❌ Please upload screenshot
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmitPayment}
            data-ocid="wallet.submit_button"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ✅ Submit Payment
          </button>

          {/* Success State */}
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                textAlign: "center",
              }}
              data-ocid="wallet.success_state"
            >
              <p
                style={{ color: "#22c55e", fontWeight: 700, fontSize: "13px" }}
              >
                ✅ Payment submitted successfully!
              </p>
              <p
                style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px" }}
              >
                Admin will verify and credit your balance.
              </p>
            </motion.div>
          )}
        </div>

        {/* Balance display */}
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "13px" }}>
            Current Balance
          </span>
          <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "16px" }}>
            ₹{balance}
          </span>
        </div>
      </motion.div>

      {/* Analytics quick links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="glass-card p-4 text-center" data-ocid="wallet.card">
          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
          <p className="text-lg font-bold text-pink-400">₹0.00</p>
        </div>
        <div className="glass-card p-4 text-center" data-ocid="wallet.card">
          <p className="text-xs text-gray-500 mb-1">Total Orders</p>
          <p className="text-lg font-bold text-blue-400">0</p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-5 mb-4"
        data-ocid="wallet.panel"
      >
        <h2 className="text-lg font-bold text-white mb-4">
          📜 Transaction History
        </h2>
        <div className="text-center py-6" data-ocid="wallet.empty_state">
          <p className="text-4xl mb-2">🗒️</p>
          <p className="text-gray-400 text-sm">No transactions yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Recharge karo aur orders place karo
          </p>
        </div>
      </motion.div>

      {/* Trust Footer */}
      <p
        style={{
          color: "#4b5563",
          fontSize: "11px",
          textAlign: "center",
          padding: "12px 0 4px",
        }}
      >
        Refund processed within 72 hours&nbsp;&nbsp;•&nbsp;&nbsp;100% secure
        system&nbsp;&nbsp;•&nbsp;&nbsp;No hidden charges
      </p>

      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
      />
    </main>
  );
}
