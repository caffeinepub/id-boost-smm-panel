import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Service } from "../backend";
import { LiveStatsPopup } from "../components/LiveStatsPopup";
import { OrderLoader } from "../components/OrderLoader";
import { useAppContext } from "../context/AppContext";
import { usePlaceOrder, useServices } from "../hooks/useQueries";

const FALLBACK_SERVICES = [
  {
    id: BigInt(1),
    name: "Instagram Followers",
    pricePerThousand: 0.39,
    minQty: BigInt(100),
    maxQty: BigInt(100000),
    active: true,
    externalServiceId: "1",
  },
  {
    id: BigInt(2),
    name: "Instagram Likes",
    pricePerThousand: 0.29,
    minQty: BigInt(100),
    maxQty: BigInt(50000),
    active: true,
    externalServiceId: "2",
  },
  {
    id: BigInt(3),
    name: "Instagram Views",
    pricePerThousand: 0.19,
    minQty: BigInt(500),
    maxQty: BigInt(500000),
    active: true,
    externalServiceId: "3",
  },
];

type TabType = "followers" | "likes" | "views";

function filterServices(services: Service[], tab: TabType): Service[] {
  const filtered = services.filter(
    (s) =>
      s.active &&
      s.name
        .toLowerCase()
        .includes(
          tab === "followers" ? "follower" : tab === "likes" ? "like" : "view",
        ),
  );
  return filtered.length > 0
    ? filtered
    : (FALLBACK_SERVICES.filter((s) =>
        s.name
          .toLowerCase()
          .includes(
            tab === "followers"
              ? "follower"
              : tab === "likes"
                ? "like"
                : "view",
          ),
      ) as Service[]);
}

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: "followers", label: "Followers", emoji: "\u{1F465}" },
  { key: "likes", label: "Likes", emoji: "\u2764\uFE0F" },
  { key: "views", label: "Views", emoji: "\u{1F441}\uFE0F" },
];

const STATS = [
  { label: "12M+", sub: "Followers Delivered", color: "#38bdf8" },
  { label: "87M", sub: "Likes Delivered", color: "#f472b6" },
  { label: "210M", sub: "Views Delivered", color: "#a78bfa" },
  { label: "1.5Cr", sub: "Happy Users", color: "#4ade80" },
];

const UPI_ID = "mohd4143@ptyes";
const UPI_NAME = "IDBOOST";

const PLANS = [
  { amount: 150, bonus: 30 },
  { amount: 250, bonus: 60, tag: "popular" as const },
  { amount: 300, bonus: 70 },
  { amount: 400, bonus: 90 },
  { amount: 500, bonus: 120, tag: "best" as const },
];

const QUICK_BOX = [
  {
    icon: "\u{1F4E6}",
    label: "Orders",
    path: "/orders-history",
    color: "#38bdf8",
  },
  { icon: "\u{1F4B0}", label: "Wallet", path: "/wallet", color: "#4ade80" },
  { icon: "\u{1F680}", label: "Boost", path: "/order", color: "#f472b6" },
  {
    icon: "\u{1F4CA}",
    label: "Analytics",
    path: "/analytics",
    color: "#a78bfa",
  },
  {
    icon: "\u{1F48E}",
    label: "Blue Tick",
    path: "/blue-tick",
    color: "#38bdf8",
  },
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

export function HomePage() {
  const { userProfile, refetchProfile } = useAppContext();
  const { data: services } = useServices();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("followers");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("1000");
  const [agreed, setAgreed] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<{
    amount: number;
    bonus: number;
  } | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [utrValue, setUtrValue] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  const [statsPopupOpen, setStatsPopupOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState("");

  const tabServices = filterServices(services ?? [], activeTab);
  const effectiveService = selectedService ?? tabServices[0] ?? null;

  const cost =
    effectiveService && quantity && Number(quantity) > 0
      ? ((Number(quantity) / 1000) * effectiveService.pricePerThousand).toFixed(
          2,
        )
      : "0.00";

  const balance = userProfile?.balance ?? 0;
  const isInsufficient = balance < Number(cost) && Number(cost) > 0;

  const parsedRecharge = selectedPlan ? selectedPlan.amount : 0;
  const showQR = parsedRecharge > 0;
  const qrSrc = showQR
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`)}`
    : "";

  // Minimum recharge toast
  useEffect(() => {
    const t = setTimeout(() => {
      toast("\u26A0\uFE0F Minimum recharge \u20B9150 \u0939\u0948", {
        style: {
          background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
          border: "1px solid rgba(245,158,11,0.5)",
          color: "#fff",
          borderRadius: "16px",
        },
      });
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // Blue Tick promo voice
  useEffect(() => {
    const t = setTimeout(() => {
      speakHindi("sir Blue Tick sirf 499 mein mil raha hai, abhi apply karein");
    }, 60000);
    return () => clearTimeout(t);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedService(null);
  };

  const handleAiSuggest = () => {
    const options = [1000, 5000, 10000];
    const picked = options[Math.floor(Math.random() * options.length)];
    setQuantity(String(picked));
  };

  const handleStatClick = (stat: (typeof STATS)[number]) => {
    setSelectedStat(`${stat.label} ${stat.sub}`);
    setStatsPopupOpen(true);
  };

  const handleOrder = async () => {
    if (!agreed) {
      toast.error("Please accept the terms first");
      return;
    }
    if (!effectiveService) {
      toast.error("Please select a service");
      return;
    }
    if (!link.trim()) {
      toast.error("Please enter your Instagram link");
      return;
    }
    const qty = Number.parseInt(quantity);
    if (
      !qty ||
      qty < Number(effectiveService.minQty) ||
      qty > Number(effectiveService.maxQty)
    ) {
      toast.error(
        `Quantity must be between ${effectiveService.minQty} and ${effectiveService.maxQty}`,
      );
      return;
    }
    if (isInsufficient) {
      toast.error("Insufficient balance! Please add funds below.");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        serviceId: effectiveService.id,
        link: link.trim(),
        quantity: BigInt(qty),
      });
      toast.success("\u2705 Order placed successfully!");
      setLink("");
      setQuantity("1000");
      refetchProfile();
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handlePayNow = () => {
    if (!selectedPlan) {
      toast.error(
        "\u274C \u092A\u0939\u0932\u0947 \u092A\u094D\u0932\u093E\u0928 \u091A\u0941\u0928\u0947\u0902",
      );
      return;
    }
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`;
    setPaymentDone(true);
    setUtrValue("");
    setUtrSubmitted(false);
    toast("Payment kar lein phir UPI Ref No darj karein", {
      style: {
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid rgba(59,130,246,0.5)",
        color: "#fff",
        borderRadius: "16px",
      },
    });
  };

  function handleUpiAppPay(app: "gpay" | "phonepe" | "paytm") {
    if (!selectedPlan) {
      toast.error("Pehle plan chunein");
      return;
    }
    const links: Record<string, string> = {
      gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`,
      phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`,
      paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`,
    };
    window.location.href = links[app];
    setPaymentDone(true);
    setUtrValue("");
    setUtrSubmitted(false);
    toast("App se payment karo phir UTR darj karo", {
      style: {
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid rgba(59,130,246,0.5)",
        color: "#fff",
        borderRadius: "16px",
      },
    });
  }

  const handleVerifyUTR = () => {
    if (!utrValue.trim()) {
      toast.error("UPI Ref No darj karein");
      return;
    }
    if (utrValue.trim().length < 10) {
      toast.error("Invalid Ref No \u274C");
      return;
    }
    // Save pending UTR to localStorage for admin
    const pending = JSON.parse(localStorage.getItem("pendingUTR") || "[]");
    pending.unshift({
      id: Date.now(),
      utr: utrValue.trim(),
      amount: parsedRecharge,
      bonus: selectedPlan?.bonus ?? 0,
      time: new Date().toLocaleString(),
      status: "pending",
    });
    localStorage.setItem("pendingUTR", JSON.stringify(pending));
    setUtrSubmitted(true);
    toast("Verification Pending \u23F3\nAdmin check karega", {
      style: {
        background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
        border: "1px solid rgba(245,158,11,0.5)",
        color: "#fff",
        borderRadius: "16px",
      },
    });
    speakHindi("sir aapka payment verify ho raha hai, admin check karega");
  };

  const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "Followers";

  return (
    <main className="max-w-[430px] mx-auto px-3">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-6"
        data-ocid="home.section"
      >
        <h1
          className="text-3xl font-bold text-blue-400 glow-text"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          INSTAGRAM 100% SERVICE
        </h1>
        <p className="text-pink-400 mt-2 text-sm font-medium">
          ID BOOST Website &bull; 100% Real Service
        </p>
      </motion.div>

      {/* SERVICE TABS */}
      <div className="flex justify-center gap-2 mb-4" data-ocid="home.tab">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
            style={
              activeTab === tab.key
                ? { boxShadow: "0 0 12px rgba(59,130,246,0.6)" }
                : {}
            }
            data-ocid="home.toggle"
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* ORDER FORM CARD */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-4 mb-4"
        data-ocid="home.card"
      >
        <h2
          className="text-center text-xl font-bold text-blue-400 glow-text mb-3"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          {tabLabel.toUpperCase()}
        </h2>

        <label
          htmlFor="service-select"
          className="text-xs text-gray-400 mb-1 block"
        >
          Service
        </label>
        <select
          id="service-select"
          className="dark-select mb-3"
          value={effectiveService?.id.toString() ?? ""}
          onChange={(e) => {
            const svc = tabServices.find(
              (s) => s.id.toString() === e.target.value,
            );
            setSelectedService(svc ?? null);
          }}
          data-ocid="home.select"
        >
          {tabServices.map((svc) => (
            <option key={svc.id.toString()} value={svc.id.toString()}>
              {svc.name}
            </option>
          ))}
        </select>

        <span className="text-xs text-gray-400 mb-1 block">Instagram Link</span>
        <input
          className="dark-input mb-3"
          placeholder="https://instagram.com/username"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          data-ocid="home.input"
        />

        <span className="text-xs text-gray-400 mb-1 block">Quantity</span>
        <input
          type="number"
          className="dark-input mb-1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          data-ocid="home.input"
        />
        <div className="text-right mb-3">
          <button
            type="button"
            onClick={handleAiSuggest}
            className="text-blue-400 text-xs cursor-pointer hover:text-blue-300 transition-colors"
            data-ocid="home.secondary_button"
          >
            &#x1F916; Get AI Suggestion
          </button>
        </div>

        <div
          className="rounded-lg p-3 mb-3 flex justify-between items-center"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <span className="text-gray-400 text-sm">Total Charge</span>
          <span className="text-blue-400 font-bold text-lg">&#8377;{cost}</span>
        </div>

        {isInsufficient && (
          <div
            className="mb-3 p-2 rounded-lg text-red-400 text-sm text-center"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
            data-ocid="home.error_state"
          >
            Insufficient Balance &mdash; Recharge below
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
            data-ocid="home.checkbox"
          />
          <label htmlFor="agree" className="text-gray-300 text-xs">
            I agree to Terms &amp; Conditions
          </label>
        </div>

        <button
          type="button"
          onClick={handleOrder}
          disabled={placeOrder.isPending}
          className="neon-btn w-full py-3 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
          data-ocid="home.submit_button"
        >
          {placeOrder.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          Buy Instagram {tabLabel}
        </button>
      </motion.div>

      {/* BLUE TICK PROMO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        onClick={() => navigate({ to: "/blue-tick" })}
        className="mb-4 cursor-pointer"
        style={{
          margin: "0 0 16px 0",
          padding: "20px",
          borderRadius: "20px",
          background: "linear-gradient(45deg, #3b82f6, #9333ea)",
          textAlign: "center",
          boxShadow: "0 0 40px #3b82f6",
        }}
        whileHover={{ scale: 1.02, boxShadow: "0 0 60px #3b82f6" }}
        whileTap={{ scale: 0.98 }}
        data-ocid="home.card"
      >
        <img
          src="/assets/uploads/20260321_003208-1.png"
          alt="Blue Tick Badge"
          style={{
            width: 70,
            display: "block",
            margin: "0 auto 10px",
            filter: "drop-shadow(0 0 10px #3b82f6)",
          }}
        />
        <h2 className="text-white font-bold text-xl mb-2">
          &#x1F48E; Instagram Blue Tick
        </h2>
        <p className="text-white text-sm mb-1">
          &#x2714; 24 &#x918;&#x902;&#x91F;&#x947; &#x92E;&#x947;&#x902;
          Verification
        </p>
        <p className="text-white text-sm mb-3">&#x2714; No Password Required</p>
        <div
          className="font-bold mb-4"
          style={{ fontSize: 22, color: "#00ff88" }}
        >
          &#8377;499 Only
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: "/blue-tick" });
          }}
          className="font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "black",
            color: "white",
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
          data-ocid="home.primary_button"
        >
          Apply Now
        </button>
      </motion.div>

      {/* QUICK RECHARGE */}
      <motion.div
        id="quick-recharge"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-4"
        data-ocid="home.panel"
      >
        <h2
          className="text-lg font-bold mb-4 flex items-center gap-2"
          style={{
            color: "#4ade80",
            textShadow: "0 0 10px rgba(74,222,128,0.4)",
          }}
        >
          &#x1F4B0; Quick Recharge
        </h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan?.amount === plan.amount;
            const isPopular = plan.tag === "popular";
            const isBest = plan.tag === "best";

            let borderStyle = "1px solid rgba(255,255,255,0.08)";
            if (isSelected) borderStyle = "2px solid rgba(99,102,241,0.9)";
            else if (isPopular) borderStyle = "2px solid #3b82f6";
            else if (isBest) borderStyle = "2px solid #22c55e";

            let boxShadow = "5px 5px 15px #000, -5px -5px 15px #1f2937";
            if (isSelected)
              boxShadow =
                "0 0 20px #6366f1, 0 0 40px rgba(99,102,241,0.4), 5px 5px 15px #000";

            return (
              <motion.button
                key={plan.amount}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                whileHover={{
                  boxShadow:
                    "0 0 20px #3b82f6, 0 0 40px #9333ea, 5px 5px 15px #000",
                }}
                whileTap={{ scale: 0.95, y: 4 }}
                className="relative flex flex-col items-center justify-center text-white font-bold transition-colors duration-200"
                style={{
                  background: isSelected
                    ? "linear-gradient(145deg, #1e3a6e, #0f1f4a)"
                    : "linear-gradient(145deg, #1e293b, #0f172a)",
                  borderRadius: 15,
                  border: borderStyle,
                  boxShadow,
                  padding: "12px 16px",
                  minWidth: 80,
                  flex: "1 1 calc(33% - 8px)",
                }}
                data-ocid="home.button"
              >
                {isPopular && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      boxShadow: "0 0 8px rgba(59,130,246,0.8)",
                    }}
                  >
                    &#x2B50; Popular
                  </span>
                )}
                {isBest && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      boxShadow: "0 0 8px rgba(34,197,94,0.8)",
                    }}
                  >
                    Best
                  </span>
                )}
                <span className="text-base font-black">
                  &#8377;{plan.amount}
                </span>
                <span
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: "#4ade80" }}
                >
                  +&#8377;{plan.bonus} Bonus
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedPlan && (
            <motion.p
              key={selectedPlan.amount}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-bold text-center mb-3 py-2 rounded-xl"
              style={{
                color: "#4ade80",
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.25)",
                textShadow: "0 0 8px rgba(74,222,128,0.5)",
              }}
            >
              You Pay &#8377;{selectedPlan.amount} &rarr; You Get &#8377;
              {selectedPlan.amount + selectedPlan.bonus}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div
                className="rounded-2xl p-3 mb-3"
                style={{
                  background: "white",
                  boxShadow: "0 0 28px rgba(56,189,248,0.3)",
                }}
              >
                <motion.img
                  key={qrSrc}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={qrSrc}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/assets/uploads/Image-1-1.jpg";
                  }}
                  alt="UPI QR Code"
                  style={{ width: 180, height: 180, display: "block" }}
                />
              </div>
              <p className="text-blue-300 text-sm font-semibold mb-0.5">
                UPI ID:{" "}
                <span
                  className="text-white font-black"
                  style={{ textShadow: "0 0 8px rgba(147,197,253,0.5)" }}
                >
                  {UPI_ID}
                </span>
              </p>
              <p
                className="text-pink-400 font-black text-xl mb-4"
                style={{ textShadow: "0 0 10px rgba(244,114,182,0.6)" }}
              >
                Scan &amp; Pay &#8377;{parsedRecharge.toFixed(2)}
              </p>

              {/* UPI App Buttons */}
              <div className="flex gap-2 w-full mb-3">
                <button
                  type="button"
                  onClick={() => handleUpiAppPay("gpay")}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-150 active:scale-95"
                  style={{
                    background: "#0f9d58",
                    boxShadow: "0 0 14px rgba(15,157,88,0.45)",
                    border: "none",
                  }}
                  data-ocid="home.primary_button"
                >
                  🟢 GPay
                </button>
                <button
                  type="button"
                  onClick={() => handleUpiAppPay("phonepe")}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-150 active:scale-95"
                  style={{
                    background: "#5f259f",
                    boxShadow: "0 0 14px rgba(95,37,159,0.45)",
                    border: "none",
                  }}
                  data-ocid="home.primary_button"
                >
                  🟣 PhonePe
                </button>
                <button
                  type="button"
                  onClick={() => handleUpiAppPay("paytm")}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-150 active:scale-95"
                  style={{
                    background: "#002970",
                    boxShadow: "0 0 14px rgba(0,41,112,0.45)",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }}
                  data-ocid="home.primary_button"
                >
                  🟡 Paytm
                </button>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  boxShadow: "0 0 22px rgba(34,197,94,0.5)",
                }}
                data-ocid="home.primary_button"
              >
                &#x26A1; Pay Now (GPay / PhonePe / Paytm)
              </button>

              {/* UTR VERIFICATION */}
              {paymentDone && !utrSubmitted && (
                <div className="mt-4 w-full">
                  <p className="text-yellow-400 text-sm font-semibold text-center mb-2">
                    Payment karne ke baad UPI Ref No darj karein
                  </p>
                  <input
                    type="text"
                    className="dark-input w-full mb-2"
                    placeholder="UPI Ref No / UTR Number"
                    value={utrValue}
                    onChange={(e) => setUtrValue(e.target.value)}
                    data-ocid="home.input"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyUTR}
                    className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #b45309, #d97706)",
                      boxShadow: "0 0 18px rgba(217,119,6,0.5)",
                    }}
                    data-ocid="home.primary_button"
                  >
                    &#x2705; Verify Payment
                  </button>
                </div>
              )}
              {utrSubmitted && (
                <div
                  className="mt-4 w-full py-3 rounded-xl text-center font-semibold text-sm"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.4)",
                    color: "#fbbf24",
                  }}
                >
                  &#x23F3; Verification Pending &mdash; Admin check karega
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* QUICK BOX */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {QUICK_BOX.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate({ to: item.path })}
            className="glass-card p-4 flex items-center gap-3 hover:scale-105 transition-transform duration-200 text-left"
            data-ocid="home.button"
          >
            <span className="text-2xl">{item.icon}</span>
            <span
              className="font-semibold text-sm"
              style={{ color: item.color }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 mb-4"
        data-ocid="home.section"
      >
        {STATS.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => handleStatClick(stat)}
            className="glass-card p-4 text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            data-ocid="home.button"
          >
            <p className="text-xl font-black" style={{ color: stat.color }}>
              {stat.label}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            <p className="text-[10px] text-blue-400 mt-1 opacity-70">
              Tap to see live
            </p>
          </button>
        ))}
      </motion.div>

      {/* SERVICE GRID */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mb-4"
        data-ocid="home.section"
      >
        <h2 className="font-bold mb-3 text-white">🔥 Popular Services</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Instagram Followers */}
          <button
            type="button"
            onClick={() => navigate({ to: "/order" })}
            className="text-white text-sm font-semibold text-center rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 10px #e1306c",
              border: "1px solid rgba(225,48,108,0.3)",
            }}
            data-ocid="home.button"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="Instagram"
              className="w-7 h-7 object-contain"
            />
            <span>Followers</span>
            <span className="text-green-400">₹150</span>
          </button>

          {/* Instagram Likes */}
          <button
            type="button"
            onClick={() => navigate({ to: "/order" })}
            className="text-white text-sm font-semibold text-center rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 10px #e1306c",
              border: "1px solid rgba(225,48,108,0.3)",
            }}
            data-ocid="home.button"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="Instagram"
              className="w-7 h-7 object-contain"
            />
            <span>Likes</span>
            <span className="text-green-400">₹120</span>
          </button>

          {/* YouTube Subscribers */}
          <button
            type="button"
            onClick={() => navigate({ to: "/order" })}
            className="text-white text-sm font-semibold text-center rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 10px #ff0000",
              border: "1px solid rgba(255,0,0,0.3)",
            }}
            data-ocid="home.button"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
              alt="YouTube"
              className="w-7 h-7 object-contain"
            />
            <span>Subscribers</span>
            <span className="text-green-400">₹300</span>
          </button>

          {/* Facebook Page Likes */}
          <button
            type="button"
            onClick={() => navigate({ to: "/order" })}
            className="text-white text-sm font-semibold text-center rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 10px #1877f2",
              border: "1px solid rgba(24,119,242,0.3)",
            }}
            data-ocid="home.button"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
              alt="Facebook"
              className="w-7 h-7 object-contain"
            />
            <span>Page Likes</span>
            <span className="text-green-400">₹130</span>
          </button>
        </div>
      </motion.div>

      {/* FEATURES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 mb-6"
        data-ocid="home.section"
      >
        <h2 className="font-bold mb-3 text-white">Why Choose ID BOOST?</h2>
        <ul className="space-y-2">
          {[
            "Fast Delivery - Orders start within minutes",
            "100% Safe - No password required",
            "Real Users - High quality engagement",
            "24/7 Support - Always here to help",
          ].map((feat) => (
            <li
              key={feat}
              className="text-gray-300 text-sm flex items-start gap-2"
            >
              <span style={{ color: "#4ade80" }}>&#x2714;</span>
              {feat}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="pb-4 text-center text-gray-600 text-xs">
        &copy; 2019.{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          Built with love using caffeine.ai
        </a>
      </div>

      <LiveStatsPopup
        isOpen={statsPopupOpen}
        onClose={() => setStatsPopupOpen(false)}
        statLabel={selectedStat}
      />
      <OrderLoader visible={placeOrder.isPending} />
    </main>
  );
}
