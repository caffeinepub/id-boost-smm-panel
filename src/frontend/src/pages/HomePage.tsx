import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HomeLiveActivity } from "../components/HomeLiveActivity";

type Platform = "instagram" | "youtube" | "facebook";

interface ServiceDef {
  key: string;
  label: string;
  emoji: string;
  ratePerThousand: number;
  isPremium: boolean;
}

const PLATFORM_SERVICES: Record<Platform, ServiceDef[]> = {
  instagram: [
    {
      key: "followers",
      label: "Followers",
      emoji: "👤",
      ratePerThousand: 0.5,
      isPremium: true,
    },
    {
      key: "likes",
      label: "Likes",
      emoji: "❤️",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "views",
      label: "Views",
      emoji: "👁️",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "shares",
      label: "Shares",
      emoji: "🔄",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "comments",
      label: "Comments",
      emoji: "💬",
      ratePerThousand: 0.3,
      isPremium: false,
    },
    {
      key: "story",
      label: "Story Views",
      emoji: "⭕",
      ratePerThousand: 0.15,
      isPremium: false,
    },
  ],
  youtube: [
    {
      key: "yt_subscribers",
      label: "Subscribers",
      emoji: "🔔",
      ratePerThousand: 1.0,
      isPremium: true,
    },
    {
      key: "yt_views",
      label: "Views",
      emoji: "▶️",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "yt_likes",
      label: "Likes",
      emoji: "👍",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "yt_watchtime",
      label: "Watch Time",
      emoji: "⏱️",
      ratePerThousand: 0.5,
      isPremium: false,
    },
  ],
  facebook: [
    {
      key: "fb_likes",
      label: "Likes",
      emoji: "👍",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "fb_followers",
      label: "Followers",
      emoji: "👥",
      ratePerThousand: 0.5,
      isPremium: false,
    },
    {
      key: "fb_pagelikes",
      label: "Page Likes",
      emoji: "📄",
      ratePerThousand: 0.15,
      isPremium: false,
    },
    {
      key: "fb_views",
      label: "Views",
      emoji: "👁️",
      ratePerThousand: 0.15,
      isPremium: false,
    },
  ],
};

const PLATFORM_TABS: {
  key: Platform;
  label: string;
  emoji: string;
  color: string;
  glow: string;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    emoji: "📸",
    color: "#e1306c",
    glow: "rgba(225,48,108,0.4)",
  },
  {
    key: "youtube",
    label: "YouTube",
    emoji: "▶️",
    color: "#ff0000",
    glow: "rgba(255,0,0,0.4)",
  },
  {
    key: "facebook",
    label: "Facebook",
    emoji: "👍",
    color: "#1877f2",
    glow: "rgba(24,119,242,0.4)",
  },
];

const UPI_ID = "mohd4143@ptyes";
const UPI_NAME = "IDBOOST";

const PLANS = [
  { amount: 75, bonus: 15 },
  { amount: 100, bonus: 25, tag: "popular" as const },
  { amount: 150, bonus: 30 },
  { amount: 250, bonus: 60, tag: "best" as const },
  { amount: 300, bonus: 70 },
  { amount: 500, bonus: 120 },
];

const QUICK_BOX = [
  { icon: "📦", label: "Orders", path: "/orders-history", color: "#38bdf8" },
  { icon: "💰", label: "Wallet", path: "/wallet", color: "#4ade80" },
  { icon: "🚀", label: "Boost", path: "/order", color: "#f472b6" },
  { icon: "📊", label: "Analytics", path: "/analytics", color: "#a78bfa" },
  { icon: "💎", label: "Blue Tick", path: "/blue-tick", color: "#38bdf8" },
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
  const navigate = useNavigate();

  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");
  const [selectedPlan, setSelectedPlan] = useState<{
    amount: number;
    bonus: number;
  } | null>(null);

  const currentPlatform = PLATFORM_TABS.find((p) => p.key === activePlatform)!;
  const services = PLATFORM_SERVICES[activePlatform];

  const parsedRecharge = selectedPlan ? selectedPlan.amount : 0;
  const showQR = parsedRecharge > 0;
  const qrSrc = showQR
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`)}`
    : "";

  // Blue Tick promo voice
  useEffect(() => {
    const t = setTimeout(() => {
      speakHindi("sir Blue Tick sirf 499 mein mil raha hai, abhi apply karein");
    }, 60000);
    return () => clearTimeout(t);
  }, []);

  const handleServiceClick = (svc: ServiceDef) => {
    localStorage.setItem(
      "selectedService",
      JSON.stringify({
        platform: activePlatform,
        key: svc.key,
        label: svc.label,
        ratePerThousand: svc.ratePerThousand,
      }),
    );
    navigate({ to: "/order" });
  };

  const handlePayNow = () => {
    if (!selectedPlan) {
      toast.error("❌ Pehle plan chunein");
      return;
    }
    window.location.href = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${parsedRecharge}&cu=INR`;
  };

  const handleUpiAppPay = (app: "gpay" | "phonepe" | "paytm") => {
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
  };

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
          ID BOOST
        </h1>
        <p className="text-pink-400 mt-1 text-sm font-medium">
          Premium SMM Panel &bull; Ultra Cheap Rates
        </p>
      </motion.div>

      {/* PLATFORM TABS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-2 mb-5"
        data-ocid="home.tab"
      >
        {PLATFORM_TABS.map((tab) => {
          const isActive = activePlatform === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePlatform(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${tab.color}33, ${tab.color}22)`
                  : "rgba(255,255,255,0.05)",
                border: isActive
                  ? `1.5px solid ${tab.color}`
                  : "1.5px solid rgba(255,255,255,0.1)",
                color: isActive ? tab.color : "#9ca3af",
                boxShadow: isActive ? `0 0 14px ${tab.glow}` : "none",
              }}
              data-ocid="home.tab"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* SERVICE CARDS GRID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlatform}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 gap-3 mb-5"
          data-ocid="home.list"
        >
          {services.map((svc, idx) => (
            <motion.button
              key={svc.key}
              type="button"
              onClick={() => handleServiceClick(svc)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex flex-col items-center justify-center gap-1 p-4 rounded-2xl text-left w-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${currentPlatform.color}33`,
                boxShadow: `0 0 15px ${currentPlatform.glow}`,
                transition: "box-shadow 0.2s",
              }}
              data-ocid={`home.item.${idx + 1}`}
            >
              {svc.isPremium && (
                <span
                  className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: "rgba(250,204,21,0.15)",
                    color: "#facc15",
                    border: "1px solid rgba(250,204,21,0.3)",
                  }}
                >
                  ⭐ PRO
                </span>
              )}
              <span className="text-3xl">{svc.emoji}</span>
              <span className="text-white font-bold text-sm mt-1">
                {svc.label}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  background: `${currentPlatform.color}22`,
                  color: currentPlatform.color,
                  border: `1px solid ${currentPlatform.color}44`,
                }}
              >
                ₹{svc.ratePerThousand} / 1K
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                Tap to Order →
              </span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* BLUE TICK PROMO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        onClick={() => navigate({ to: "/blue-tick" })}
        className="mb-4 cursor-pointer"
        style={{
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
          💎 Instagram Blue Tick
        </h2>
        <p className="text-white text-sm mb-1">✔ 24 घंटे में Verification</p>
        <p className="text-white text-sm mb-3">✔ No Password Required</p>
        <div
          className="font-bold mb-4"
          style={{ fontSize: 22, color: "#00ff88" }}
        >
          ₹499 Only
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
          💰 Quick Recharge
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
                    ⭐ Popular
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
                <span className="text-base font-black">₹{plan.amount}</span>
                <span
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: "#4ade80" }}
                >
                  +₹{plan.bonus} Bonus
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
              You Pay ₹{selectedPlan.amount} → You Get ₹
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
                Scan &amp; Pay ₹{parsedRecharge.toFixed(2)}
              </p>

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
                ⚡ Pay Now (GPay / PhonePe / Paytm)
              </button>
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

      {/* LIVE ACTIVITY */}
      <HomeLiveActivity />

      {/* FOOTER */}
      <div className="pb-6 text-center text-gray-600 text-xs">
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
    </main>
  );
}
