import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { RefundHistory } from "../components/RefundHistory";
import { RefundModal } from "../components/RefundModal";
import { useAppContext } from "../context/AppContext";
import { useRefunds } from "../hooks/useRefunds";

const UPI_ID = "mohd4143@ptyes";
const UPI_NAME = "IDBOOST";

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

  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[3]);
  const [showUTR, setShowUTR] = useState(false);
  const [utr, setUtr] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const rechargeRef = useRef<HTMLDivElement>(null);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setShowUTR(false);
    setUtr("");
    setUtrSubmitted(false);
  }

  function scrollToRecharge() {
    rechargeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${selectedPlan.amount}&cu=INR`)}`;

  function handlePayNow() {
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${selectedPlan.amount}&cu=INR`;
    setShowUTR(true);
  }

  function handleUpiAppPay(app: "gpay" | "phonepe" | "paytm") {
    const links: Record<string, string> = {
      gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${selectedPlan.amount}&cu=INR`,
      phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${selectedPlan.amount}&cu=INR`,
      paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${selectedPlan.amount}&cu=INR`,
    };
    window.location.href = links[app];
    setShowUTR(true);
    toast("App se payment karo phir UTR darj karo");
  }

  function handleVerifyUTR() {
    if (utr.length < 10) {
      alert(
        "\u274C Invalid UPI Ref No. \u0915\u092E \u0938\u0947 \u0915\u092E 10 \u0905\u0915\u094D\u0937\u0930 \u0939\u094B\u0928\u0947 \u091A\u093E\u0939\u093F\u090F",
      );
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
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        data-ocid="wallet.link"
        className="flex items-center gap-2 text-sm font-semibold mb-4 px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-white/5"
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          color: "#93c5fd",
        }}
      >
        <span style={{ fontSize: "16px" }}>←</span>
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <h1
        className="text-2xl font-black text-center text-white mb-4"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="wallet.section"
      >
        💰 My Wallet
      </h1>

      {/* VIP Balance Card */}
      <div
        data-ocid="wallet.card"
        className="relative overflow-hidden mb-5"
        style={{
          background:
            "linear-gradient(135deg, #0f1f3d 0%, #1a1040 50%, #0f1f3d 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: "18px",
          padding: "24px 20px 20px",
        }}
      >
        {/* Shimmer overlay */}
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

        {/* VIP Badge row */}
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

        {/* Balance Amount */}
        <div className="text-center mb-4">
          <p
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#ffffff",
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

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
            marginBottom: "16px",
          }}
        />

        {/* Quick Actions */}
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
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(59,130,246,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
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
            onMouseEnter={(e) => {
              if (!hasPending)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(148,163,184,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            ↩ {hasPending ? "Pending" : "Request Refund"}
          </button>
        </div>
      </div>

      {/* Refund History */}
      <div style={{ marginBottom: "16px" }}>
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
      </div>

      {/* Quick Recharge Section */}
      <div
        ref={rechargeRef}
        className="p-5 mb-4"
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "12px",
        }}
        data-ocid="wallet.panel"
      >
        <h2 className="text-lg font-black mb-1" style={{ color: "#22c55e" }}>
          ⚡ Quick Recharge
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Plan select karo aur pay karo
        </p>

        {/* Small Plans Row (₹75 + ₹100) */}
        <div className="flex gap-3 mb-3">
          {PLANS.filter(
            (p) => p.tag === "starter" || p.tag === "popular_small",
          ).map((plan) => {
            const isSelected = selectedPlan.amount === plan.amount;
            const isPopularSmall = plan.tag === "popular_small";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                data-ocid="wallet.toggle"
                className="relative flex-1 text-white text-sm font-bold transition-colors duration-200 active:scale-90"
                style={{
                  background: "#020617",
                  padding: "12px 10px",
                  borderRadius: "12px",
                  border: isSelected
                    ? "2px solid #2563eb"
                    : isPopularSmall
                      ? "2px solid #2563eb"
                      : "1.5px solid #1e293b",
                  textAlign: "center" as const,
                }}
              >
                <span
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-white"
                  style={{
                    background: isPopularSmall ? "#2563eb" : "#64748b",
                    fontSize: "9px",
                    whiteSpace: "nowrap" as const,
                    fontWeight: 700,
                  }}
                >
                  {isPopularSmall ? "Popular" : "Starter"}
                </span>
                <span className="block text-base font-black">
                  ₹{plan.amount}
                </span>
                <span
                  className="block text-green-400"
                  style={{ fontSize: "11px" }}
                >
                  +₹{plan.bonus} Bonus
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Plan Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PLANS.filter(
            (p) => p.tag !== "starter" && p.tag !== "popular_small",
          ).map((plan) => {
            const isSelected = selectedPlan.amount === plan.amount;
            const isPopular = plan.tag === "popular";
            const isBest = plan.tag === "best";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                data-ocid="wallet.toggle"
                className="relative text-white text-sm font-bold transition-colors duration-200 active:scale-90"
                style={{
                  background: isSelected ? "#1e3a5f" : "#111827",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: isPopular
                    ? "1px solid #3b82f6"
                    : isBest
                      ? "1px solid #22c55e"
                      : isSelected
                        ? "1px solid #2563eb"
                        : "1px solid #1e293b",
                  minWidth: "80px",
                  textAlign: "center",
                }}
              >
                {isPopular && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 rounded"
                    style={{
                      background: "#3b82f6",
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                      color: "#fff",
                    }}
                  >
                    ⭐ Popular
                  </span>
                )}
                {isBest && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 rounded"
                    style={{
                      background: "#16a34a",
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                      color: "#fff",
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
        <div
          className="text-center text-sm font-bold mb-4 py-2 px-3 rounded-xl"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86efac",
          }}
        >
          You Pay ₹{selectedPlan.amount} → You Get ₹
          {selectedPlan.amount + selectedPlan.bonus}
        </div>

        {/* QR Code */}
        <div className="text-center mb-4">
          <img
            src={qrError ? "/assets/uploads/Image-1-1.jpg" : qrUrl}
            alt="UPI QR Code"
            width={180}
            height={180}
            className="mx-auto rounded-xl"
            style={{ border: "1px solid #1e293b" }}
            onError={() => setQrError(true)}
          />
          <p className="text-xs text-gray-400 mt-2">
            Scan & Pay ₹{selectedPlan.amount} • UPI: {UPI_ID}
          </p>
        </div>

        {/* UPI App Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleUpiAppPay("gpay")}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors duration-150 active:scale-95"
            style={{ background: "#0f9d58", border: "none" }}
            data-ocid="wallet.primary_button"
          >
            🟢 GPay
          </button>
          <button
            type="button"
            onClick={() => handleUpiAppPay("phonepe")}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors duration-150 active:scale-95"
            style={{ background: "#5f259f", border: "none" }}
            data-ocid="wallet.primary_button"
          >
            🟣 PhonePe
          </button>
          <button
            type="button"
            onClick={() => handleUpiAppPay("paytm")}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors duration-150 active:scale-95"
            style={{
              background: "#002970",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
            data-ocid="wallet.primary_button"
          >
            🟡 Paytm
          </button>
        </div>

        {/* Pay Now Button */}
        <button
          type="button"
          onClick={handlePayNow}
          data-ocid="wallet.primary_button"
          className="w-full font-black text-white text-base py-3 rounded-xl transition-colors duration-150 active:scale-95 mb-3"
          style={{ background: "#2563eb", border: "none" }}
        >
          ⚡ Pay Now (GPay / PhonePe / Paytm)
        </button>

        {/* UTR Input */}
        {showUTR && !utrSubmitted && (
          <div className="mt-2">
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
              className="w-full py-2 rounded-xl font-bold text-sm transition-colors active:scale-95"
              style={{ background: "#16a34a", border: "none", color: "white" }}
            >
              ✅ Verify Payment
            </button>
          </div>
        )}

        {/* UTR Submitted */}
        {utrSubmitted && (
          <div
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
          </div>
        )}
      </div>

      {/* Analytics quick links */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="p-4 text-center rounded-xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          data-ocid="wallet.card"
        >
          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
          <p className="text-lg font-bold text-pink-400">₹0.00</p>
        </div>
        <div
          className="p-4 text-center rounded-xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          data-ocid="wallet.card"
        >
          <p className="text-xs text-gray-500 mb-1">Total Orders</p>
          <p className="text-lg font-bold text-blue-400">0</p>
        </div>
      </div>

      {/* Transaction History */}
      <div
        className="p-5 mb-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
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
      </div>

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
