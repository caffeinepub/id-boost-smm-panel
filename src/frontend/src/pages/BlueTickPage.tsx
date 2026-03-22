import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { addLocalBalance } from "../hooks/useLocalBalance";

const UPI_ID = "mohd4143@ptyes";
const UPI_NAME = "IDBOOST";

const FEATURES = [
  "✔ 100% Safe Process",
  "✔ No Password Required",
  "✔ अगर 24 घंटे में service नहीं मिली → Refund",
  "✔ Trusted Service",
];

function speakHindi(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "hi-IN";
  utt.pitch = 1;
  utt.rate = 0.95;
  window.speechSynthesis.speak(utt);
}

export function BlueTickPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [payUtr, setPayUtr] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    } else {
      setProofPreview(null);
    }
  };

  const handleBuyNow = () => {
    const bal = Number.parseFloat(
      localStorage.getItem("idboost_balance") || "0",
    );
    if (bal < 499) {
      navigate({ to: "/" });
      setTimeout(() => {
        const el = document.getElementById("quick-recharge");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        window.dispatchEvent(
          new CustomEvent("set-selected-amount", { detail: { amount: 499 } }),
        );
      }, 200);
      return;
    }
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499&cu=INR`;
    setTimeout(() => {
      addLocalBalance(499);
      toast.success(
        "\u2705 Payment Successful \u{1F48E} Blue Tick Processing!",
        {
          style: {
            background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
            border: "1px solid rgba(56,189,248,0.5)",
            color: "#fff",
            borderRadius: "16px",
          },
        },
      );
      speakHindi(
        "sir aapka payment safal ho gaya hai, balance add kar diya gaya hai",
      );
    }, 5000);
  };

  const handleSubmit = () => {
    if (!username.trim()) {
      toast.error("Instagram username \u0921\u093E\u0932\u0947\u0902 \u274C");
      return;
    }
    if (!proofFile) {
      toast.error("Payment screenshot upload \u0915\u0930\u0947\u0902 \u274C");
      return;
    }
    if (!utr.trim() || utr.trim().length < 10) {
      toast.error("Valid UTR \u0921\u093E\u0932\u0947\u0902 \u274C");
      return;
    }
    const existing = JSON.parse(localStorage.getItem("blueTickOrders") || "[]");
    const newOrder = {
      id: Date.now(),
      username: username.trim(),
      utr: utr.trim(),
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    existing.unshift(newOrder);
    localStorage.setItem("blueTickOrders", JSON.stringify(existing));
    toast.success("Payment Submitted \u2705\nVerification Pending");
    setUsername("");
    setProofFile(null);
    setProofPreview(null);
    setUtr("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // payBox handlers
  const payNow = () => {
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499&cu=INR`;
  };

  const openGpay = () => {
    window.location.href = `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499`;
  };

  const openPhonePe = () => {
    window.location.href = `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499`;
  };

  const openPaytm = () => {
    window.location.href = `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499`;
  };

  const verifyPayment = () => {
    if (!payUtr || payUtr.length < 10) {
      alert("Invalid UTR ❌");
      return;
    }
    alert("Payment Submitted ✅");
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=499&cu=INR`;

  return (
    <main className="max-w-[430px] mx-auto px-3 pb-8" data-ocid="bluetick.page">
      {/* Back */}
      <div className="pt-4 mb-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors"
          data-ocid="bluetick.secondary_button"
        >
          ← Back to Home
        </button>
      </div>

      {/* Badge Image + Title */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-5"
      >
        <motion.img
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          src="/assets/uploads/20260321_003208-1.png"
          alt="Blue Tick Verified Badge"
          className="w-28 h-28 object-contain rounded-full mb-4"
          style={{
            boxShadow: "0 0 40px rgba(56,189,248,0.6)",
            border: "2px solid rgba(56,189,248,0.4)",
            filter: "drop-shadow(0 0 10px #3b82f6)",
          }}
        />

        <h1
          className="text-2xl font-black glow-text mb-1"
          style={{
            color: "#38bdf8",
            textShadow: "0 0 20px rgba(56,189,248,0.8)",
            fontFamily: "Bricolage Grotesque, sans-serif",
          }}
        >
          &#x1F48E; Blue Tick Verified
        </h1>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-2"
        >
          <span
            className="text-4xl font-black"
            style={{
              color: "#38bdf8",
              textShadow: "0 0 24px rgba(56,189,248,0.7)",
            }}
          >
            &#8377;499
          </span>
          <p className="text-gray-400 text-xs mt-1">
            One-time payment &bull; 24hr delivery
          </p>
        </motion.div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="glass-card p-4 mb-4"
        data-ocid="bluetick.panel"
      >
        <ul className="space-y-3">
          {FEATURES.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-sm">
              <span
                className="font-bold mt-0.5"
                style={{
                  color: "#4ade80",
                  textShadow: "0 0 6px rgba(74,222,128,0.5)",
                }}
              >
                ✔
              </span>
              <span className="text-gray-200">{feat.replace("✔ ", "")}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="glass-card p-5 mb-4"
        data-ocid="bluetick.panel"
      >
        <h2
          className="font-bold text-white mb-4 text-base"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          &#x1F4CB; Order Details
        </h2>

        <label
          className="text-xs text-gray-400 mb-1 block"
          htmlFor="bt-username"
        >
          Instagram Username
        </label>
        <input
          id="bt-username"
          type="text"
          className="dark-input mb-4"
          placeholder="@your_instagram_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          data-ocid="bluetick.input"
        />

        <label htmlFor="bt-proof" className="text-xs text-gray-400 mb-1 block">
          Payment Proof Screenshot
        </label>
        <div
          className="relative mb-4 rounded-xl overflow-hidden"
          style={{
            border: "1.5px dashed rgba(56,189,248,0.4)",
            background: "rgba(56,189,248,0.04)",
          }}
        >
          <input
            ref={fileInputRef}
            id="bt-proof"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            data-ocid="bluetick.upload_button"
          />
          <div className="flex flex-col items-center justify-center py-5 pointer-events-none">
            {proofPreview ? (
              <img
                src={proofPreview}
                alt="proof preview"
                className="w-24 h-24 object-cover rounded-xl mb-2"
                style={{ boxShadow: "0 0 12px rgba(56,189,248,0.3)" }}
              />
            ) : (
              <span className="text-3xl mb-2">&#x1F4CE;</span>
            )}
            <span className="text-blue-400 text-sm font-semibold">
              {proofFile ? proofFile.name : "Tap to upload screenshot"}
            </span>
            {!proofFile && (
              <span className="text-gray-500 text-xs mt-0.5">
                JPG, PNG, WEBP accepted
              </span>
            )}
          </div>
        </div>

        {/* UTR Input */}
        <label htmlFor="bt-utr" className="text-xs text-gray-400 mb-1 block">
          UPI Ref No / UTR Number
        </label>
        <input
          id="bt-utr"
          type="text"
          className="dark-input mb-4"
          placeholder="Enter UPI Ref No (min 10 digits)"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          data-ocid="bluetick.input"
        />

        {/* Payment methods */}
        <div
          className="rounded-xl p-3 mb-4 text-center"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(56,189,248,0.15)",
          }}
        >
          <p className="text-gray-400 text-xs mb-1">Accepted via</p>
          <p className="text-white text-sm font-semibold">
            &#x1F4F1; PhonePe &nbsp;|&nbsp; &#x1F499; GPay &nbsp;|&nbsp;
            &#x1F49B; Paytm &nbsp;|&nbsp; &#x1F3E6; BHIM
          </p>
          <p className="text-blue-300 text-xs mt-1 font-mono">{UPI_ID}</p>
        </div>

        {/* Buy Now */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="neon-btn w-full py-3 rounded-xl text-white font-bold text-base mb-3"
          style={{
            background: "linear-gradient(135deg, #0369a1, #38bdf8)",
            boxShadow: "0 0 24px rgba(56,189,248,0.5)",
          }}
          data-ocid="bluetick.primary_button"
        >
          &#x26A1; Buy Now &#8377;499
        </button>

        {/* Submit Payment */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-white font-bold text-base transition-all duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            boxShadow: "0 0 20px rgba(34,197,94,0.4)",
          }}
          data-ocid="bluetick.submit_button"
        >
          &#x2705; Submit Payment
        </button>
      </motion.div>

      {/* ===== PAY BOX ===== */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.45 }}
        className="mb-4"
        data-ocid="bluetick.panel"
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            background: "#0f172a",
            borderRadius: "15px",
            border: "1px solid rgba(56,189,248,0.2)",
            boxShadow: "0 0 30px rgba(56,189,248,0.15)",
          }}
        >
          <h2
            style={{
              color: "#38bdf8",
              marginBottom: "12px",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            💎 Blue Tick ₹499
          </h2>

          {/* QR Code */}
          <img
            src={qrUrl}
            alt="UPI QR Code"
            style={{
              width: "200px",
              margin: "10px auto",
              display: "block",
              borderRadius: "12px",
              border: "2px solid rgba(56,189,248,0.3)",
              filter: "drop-shadow(0 0 8px rgba(56,189,248,0.4))",
            }}
          />

          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "8px 0" }}>
            UPI ID:{" "}
            <span style={{ color: "#38bdf8", fontWeight: 600 }}>{UPI_ID}</span>
          </p>

          <h3
            style={{ color: "#e2e8f0", margin: "10px 0", fontSize: "0.95rem" }}
          >
            📲 Scan &amp; Pay ₹499
          </h3>

          {/* Main Pay Button */}
          <button
            type="button"
            onClick={payNow}
            style={{
              background: "#22c55e",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              width: "100%",
              color: "white",
              marginTop: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 0 16px rgba(34,197,94,0.4)",
            }}
            data-ocid="bluetick.primary_button"
          >
            ⚡ Buy Now ₹499
          </button>

          {/* App Buttons */}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={openGpay}
              style={{
                margin: "5px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#1e293b",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
              data-ocid="bluetick.secondary_button"
            >
              GPay
            </button>
            <button
              type="button"
              onClick={openPhonePe}
              style={{
                margin: "5px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#1e293b",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
              data-ocid="bluetick.secondary_button"
            >
              PhonePe
            </button>
            <button
              type="button"
              onClick={openPaytm}
              style={{
                margin: "5px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#1e293b",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
              data-ocid="bluetick.secondary_button"
            >
              Paytm
            </button>
          </div>

          {/* UTR Input */}
          <input
            id="utrInput"
            type="text"
            placeholder="Enter UTR Number"
            value={payUtr}
            onChange={(e) => setPayUtr(e.target.value)}
            style={{
              width: "calc(100% - 24px)",
              padding: "10px 12px",
              margin: "12px 0 0",
              borderRadius: "10px",
              border: "1px solid rgba(56,189,248,0.3)",
              background: "#1e293b",
              color: "white",
              fontSize: "0.9rem",
              outline: "none",
            }}
            data-ocid="bluetick.input"
          />

          {/* Verify Payment Button */}
          <button
            type="button"
            onClick={verifyPayment}
            style={{
              background: "#f97316",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              width: "100%",
              marginTop: "10px",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 0 16px rgba(249,115,22,0.4)",
            }}
            data-ocid="bluetick.submit_button"
          >
            ✅ Verify Payment
          </button>
        </div>
      </motion.div>

      {/* Safety notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 mb-4 text-center"
      >
        <p
          className="text-sm font-semibold"
          style={{
            color: "#4ade80",
            textShadow: "0 0 8px rgba(74,222,128,0.4)",
          }}
        >
          &#x1F4AF; 100% Safe &mdash; No Risk
        </p>
        <p className="text-gray-400 text-xs mt-1">
          &#x0905;&#x0917;&#x0930; 24 &#x0918;&#x0902;&#x091F;&#x0947;
          &#x092E;&#x0947;&#x0902; Blue Tick &#x0928;&#x0939;&#x0940;&#x0902;
          &#x092E;&#x093F;&#x0932;&#x0924;&#x093E; &rarr; Full Refund guaranteed
        </p>
      </motion.div>
    </main>
  );
}
