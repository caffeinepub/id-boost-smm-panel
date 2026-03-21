import { motion } from "motion/react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const PLANS = [
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

  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // ₹250 auto-selected
  const [showUTR, setShowUTR] = useState(false);
  const [utr, setUtr] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [qrError, setQrError] = useState(false);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setShowUTR(false);
    setUtr("");
    setUtrSubmitted(false);
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=mohd4143@ptyes&pn=IDBOOST&am=${selectedPlan.amount}&cu=INR`)}`;

  function handlePayNow() {
    window.location.href = `upi://pay?pa=mohd4143@ptyes&pn=IDBOOST&am=${selectedPlan.amount}&cu=INR`;
    setShowUTR(true);
  }

  function handleVerifyUTR() {
    if (utr.length < 10) {
      alert("❌ Invalid UPI Ref No. कम से कम 10 अक्षर होने चाहिए");
      return;
    }
    const pending = JSON.parse(localStorage.getItem("pendingUTR") || "[]");
    pending.push({
      utr,
      amount: selectedPlan.amount,
      bonus: selectedPlan.bonus,
      time: Date.now(),
    });
    localStorage.setItem("pendingUTR", JSON.stringify(pending));
    setUtrSubmitted(true);
  }

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4 pb-24">
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

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-4 text-center"
        data-ocid="wallet.card"
      >
        <p className="text-gray-400 text-sm mb-2">Current Balance</p>
        <p
          className="text-5xl font-black text-green-400 mb-1"
          style={{ textShadow: "0 0 20px rgba(34,197,94,0.5)" }}
        >
          ₹{balance}
        </p>
        <p className="text-gray-500 text-xs">Available for orders</p>
      </motion.div>

      {/* Quick Recharge Section */}
      <motion.div
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

        {/* Plan Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan.amount === plan.amount;
            const isPopular = plan.tag === "popular";
            const isBest = plan.tag === "best";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                data-ocid="wallet.toggle"
                className="relative text-white text-sm font-bold transition-all duration-200 active:scale-90"
                style={{
                  background: isSelected
                    ? "linear-gradient(145deg, #1e40af, #1e3a5f)"
                    : "linear-gradient(145deg, #1e293b, #0f172a)",
                  padding: "10px 14px",
                  borderRadius: "15px",
                  border: isPopular
                    ? "2px solid #3b82f6"
                    : isBest
                      ? "2px solid #22c55e"
                      : isSelected
                        ? "2px solid rgba(59,130,246,0.5)"
                        : "2px solid transparent",
                  boxShadow: isSelected
                    ? "5px 5px 15px #000, -5px -5px 15px #1f2937, 0 0 20px rgba(59,130,246,0.4)"
                    : "5px 5px 15px #000, -5px -5px 15px #1f2937",
                  minWidth: "80px",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px #3b82f6, 0 0 40px #9333ea";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    isSelected
                      ? "5px 5px 15px #000, -5px -5px 15px #1f2937, 0 0 20px rgba(59,130,246,0.4)"
                      : "5px 5px 15px #000, -5px -5px 15px #1f2937";
                }}
              >
                {isPopular && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 rounded"
                    style={{
                      background: "#3b82f6",
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⭐ Popular
                  </span>
                )}
                {isBest && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 rounded"
                    style={{
                      background: "#22c55e",
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔥 Best
                  </span>
                )}
                <span className="block">₹{plan.amount}</span>
                <span
                  className="block text-green-400"
                  style={{ fontSize: "11px" }}
                >
                  +₹{plan.bonus}
                </span>
              </button>
            );
          })}
        </div>

        {/* Offer Text */}
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
          You Pay ₹{selectedPlan.amount} → You Get ₹
          {selectedPlan.amount + selectedPlan.bonus}
        </motion.div>

        {/* QR Code */}
        <div className="text-center mb-4">
          <img
            src={qrError ? "/assets/uploads/Image-1-1.jpg" : qrUrl}
            alt="UPI QR Code"
            width={180}
            height={180}
            className="mx-auto rounded-xl"
            style={{ border: "1px solid rgba(59,130,246,0.3)" }}
            onError={() => setQrError(true)}
          />
          <p className="text-xs text-gray-400 mt-2">
            Scan & Pay ₹{selectedPlan.amount} • UPI: mohd4143@ptyes
          </p>
        </div>

        {/* Pay Now Button */}
        <button
          type="button"
          onClick={handlePayNow}
          data-ocid="wallet.primary_button"
          className="w-full font-black text-white text-base py-3 rounded-xl transition-all duration-150 active:scale-95 mb-3"
          style={{
            background: "linear-gradient(45deg, #3b82f6, #ec4899)",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)",
            border: "none",
          }}
        >
          ⚡ Pay Now (GPay / PhonePe / Paytm)
        </button>

        {/* UTR Input */}
        {showUTR && !utrSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            <p className="text-xs text-yellow-400 mb-2 text-center">
              ⏳ Payment ke baad UPI Ref No / UTR Number darj karein
            </p>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="Enter UPI Ref No / UTR Number"
              data-ocid="wallet.input"
              className="w-full px-4 py-2 rounded-xl text-white text-sm mb-2 outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(59,130,246,0.4)",
              }}
            />
            <button
              type="button"
              onClick={handleVerifyUTR}
              data-ocid="wallet.submit_button"
              className="w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: "linear-gradient(45deg, #22c55e, #16a34a)",
                boxShadow: "0 0 15px rgba(34,197,94,0.3)",
                border: "none",
                color: "white",
              }}
            >
              ✅ Verify Payment
            </button>
          </motion.div>
        )}

        {/* UTR Submitted */}
        {utrSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 rounded-xl mt-2"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
            data-ocid="wallet.success_state"
          >
            <p className="text-green-400 font-bold text-sm">
              ✅ Verification Pending
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Admin review karega, phir balance add hoga
            </p>
          </motion.div>
        )}
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
        className="glass-card p-5"
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
    </main>
  );
}
