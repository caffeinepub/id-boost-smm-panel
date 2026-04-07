import { useNavigate } from "@tanstack/react-router";
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

const PLATFORM_TABS: { key: Platform; label: string; emoji: string }[] = [
  { key: "instagram", label: "Instagram", emoji: "📸" },
  { key: "youtube", label: "YouTube", emoji: "▶️" },
  { key: "facebook", label: "Facebook", emoji: "👍" },
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
  { icon: "🚀", label: "Boost", path: "/order", color: "#93c5fd" },
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
      <div className="text-center py-6" data-ocid="home.section">
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          ID BOOST
        </h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">
          Premium SMM Panel &bull; Ultra Cheap Rates
        </p>
      </div>

      {/* PLATFORM TABS */}
      <div className="flex justify-center gap-2 mb-5" data-ocid="home.tab">
        {PLATFORM_TABS.map((tab) => {
          const isActive = activePlatform === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePlatform(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-1.5"
              style={{
                background: isActive ? "#1e3a5f" : "#0f172a",
                border: isActive ? "1px solid #2563eb" : "1px solid #1e293b",
                color: isActive ? "#93c5fd" : "#6b7280",
              }}
              data-ocid="home.tab"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SERVICE CARDS GRID */}
      <div className="grid grid-cols-2 gap-3 mb-5" data-ocid="home.list">
        {services.map((svc, idx) => (
          <button
            key={svc.key}
            type="button"
            onClick={() => handleServiceClick(svc)}
            className="relative flex flex-col items-center justify-center gap-1 p-4 rounded-xl text-left w-full transition-colors duration-150 hover:bg-[#1e293b] active:scale-95"
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
            }}
            data-ocid={`home.item.${idx + 1}`}
          >
            {svc.isPremium && (
              <span
                className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: "#1c1c1c",
                  color: "#d97706",
                  border: "1px solid #d97706",
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
              className="text-xs font-semibold mt-0.5"
              style={{ color: "#4ade80" }}
            >
              ₹{svc.ratePerThousand} / 1K
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">
              Tap to Order →
            </span>
          </button>
        ))}
      </div>

      {/* BLUE TICK PROMO CARD */}
      <button
        type="button"
        onClick={() => navigate({ to: "/blue-tick" })}
        className="w-full mb-4 hover:opacity-90 transition-opacity"
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "#0f172a",
          border: "1px solid #2563eb",
          textAlign: "center",
          cursor: "pointer",
        }}
        data-ocid="home.card"
      >
        <img
          src="/assets/uploads/20260321_003208-1.png"
          alt="Blue Tick Badge"
          style={{ width: 70, display: "block", margin: "0 auto 10px" }}
        />
        <h2 className="text-white font-bold text-xl mb-2">
          💎 Instagram Blue Tick
        </h2>
        <p className="text-gray-400 text-sm mb-1">✔ 24 घंटे में Verification</p>
        <p className="text-gray-400 text-sm mb-3">✔ No Password Required</p>
        <div
          className="font-bold mb-4"
          style={{ fontSize: 22, color: "#22c55e" }}
        >
          ₹499 Only
        </div>
        <span
          className="inline-block font-semibold transition-colors duration-200"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
          }}
        >
          Apply Now
        </span>
      </button>

      {/* QUICK RECHARGE */}
      <div
        id="quick-recharge"
        className="p-5 mb-4"
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "12px",
        }}
        data-ocid="home.panel"
      >
        <h2
          className="text-lg font-bold mb-4 flex items-center gap-2"
          style={{ color: "#4ade80" }}
        >
          💰 Quick Recharge
        </h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan?.amount === plan.amount;
            const isPopular = plan.tag === "popular";
            const isBest = plan.tag === "best";
            let borderStyle = "1px solid #1e293b";
            if (isSelected) borderStyle = "2px solid #2563eb";
            else if (isPopular) borderStyle = "1px solid #3b82f6";
            else if (isBest) borderStyle = "1px solid #22c55e";
            return (
              <button
                key={plan.amount}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className="relative flex flex-col items-center justify-center text-white font-bold transition-colors duration-200 active:scale-95"
                style={{
                  background: isSelected ? "#1e3a5f" : "#111827",
                  borderRadius: 10,
                  border: borderStyle,
                  padding: "12px 16px",
                  minWidth: 80,
                  flex: "1 1 calc(33% - 8px)",
                }}
                data-ocid="home.button"
              >
                {isPopular && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: "#3b82f6", color: "#fff" }}
                  >
                    ⭐ Popular
                  </span>
                )}
                {isBest && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: "#16a34a", color: "#fff" }}
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
              </button>
            );
          })}
        </div>

        {selectedPlan && (
          <p
            className="text-sm font-bold text-center mb-3 py-2 rounded-xl"
            style={{
              color: "#4ade80",
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}
          >
            You Pay ₹{selectedPlan.amount} → You Get ₹
            {selectedPlan.amount + selectedPlan.bonus}
          </p>
        )}

        {showQR && (
          <div className="flex flex-col items-center">
            <div
              className="rounded-xl p-3 mb-3"
              style={{ background: "white" }}
            >
              <img
                key={qrSrc}
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
              UPI ID: <span className="text-white font-black">{UPI_ID}</span>
            </p>
            <p className="text-white font-black text-xl mb-4">
              Scan &amp; Pay ₹{parsedRecharge.toFixed(2)}
            </p>

            <div className="flex gap-2 w-full mb-3">
              <button
                type="button"
                onClick={() => handleUpiAppPay("gpay")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors duration-150 active:scale-95"
                style={{ background: "#0f9d58", border: "none" }}
                data-ocid="home.primary_button"
              >
                🟢 GPay
              </button>
              <button
                type="button"
                onClick={() => handleUpiAppPay("phonepe")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors duration-150 active:scale-95"
                style={{ background: "#5f259f", border: "none" }}
                data-ocid="home.primary_button"
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
                data-ocid="home.primary_button"
              >
                🟡 Paytm
              </button>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors duration-200 active:scale-95"
              style={{ background: "#16a34a" }}
              data-ocid="home.primary_button"
            >
              ⚡ Pay Now (GPay / PhonePe / Paytm)
            </button>
          </div>
        )}
      </div>

      {/* QUICK BOX */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {QUICK_BOX.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate({ to: item.path })}
            className="p-4 flex items-center gap-3 hover:bg-[#1e293b] transition-colors duration-200 text-left rounded-xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
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
      </div>

      {/* LIVE ACTIVITY */}
      <HomeLiveActivity />

      {/* FOOTER */}
      <div className="pb-6 text-center text-gray-600 text-xs">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
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
