import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { triggerInsufficientBalancePopup } from "../components/InsufficientBalancePopup";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { OrderLoader } from "../components/OrderLoader";
import { OrderSuccessModal } from "../components/OrderSuccessModal";
import { useAppContext } from "../context/AppContext";
import { usePlaceOrder } from "../hooks/useQueries";

type Platform = "instagram" | "youtube" | "facebook";

type ServiceKey =
  | "followers"
  | "likes"
  | "views"
  | "shares"
  | "comments"
  | "story"
  | "live"
  | "yt_subscribers"
  | "yt_views"
  | "yt_likes"
  | "yt_watchtime"
  | "fb_likes"
  | "fb_followers"
  | "fb_pagelikes"
  | "fb_views";

// ratePerThousand = ₹ per 1000 units
// pricePerUnit = ratePerThousand / 1000  (used for cost calculation)
const INSTAGRAM_SERVICES: {
  key: ServiceKey;
  label: string;
  emoji: string;
  serviceId: bigint;
  ratePerThousand: number; // display rate
  pricePerUnit: number; // = ratePerThousand / 1000
  isPremium: boolean;
  minQty: number;
  maxQty: number;
}[] = [
  {
    key: "followers",
    label: "Followers",
    emoji: "👤",
    serviceId: BigInt(1),
    ratePerThousand: 0.5,
    pricePerUnit: 0.0005,
    isPremium: true,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "likes",
    label: "Likes",
    emoji: "❤️",
    serviceId: BigInt(2),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "views",
    label: "Views",
    emoji: "👁️",
    serviceId: BigInt(3),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "shares",
    label: "Shares",
    emoji: "🔄",
    serviceId: BigInt(4),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "comments",
    label: "Comments",
    emoji: "💬",
    serviceId: BigInt(5),
    ratePerThousand: 0.3,
    pricePerUnit: 0.0003,
    isPremium: false,
    minQty: 1000,
    maxQty: 50000,
  },
  {
    key: "story",
    label: "Story Views",
    emoji: "📲",
    serviceId: BigInt(6),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "live",
    label: "Live Views",
    emoji: "🔴",
    serviceId: BigInt(7),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 50000,
  },
];

const YOUTUBE_SERVICES: {
  key: ServiceKey;
  label: string;
  emoji: string;
  serviceId: bigint;
  ratePerThousand: number;
  pricePerUnit: number;
  isPremium: boolean;
  minQty: number;
  maxQty: number;
}[] = [
  {
    key: "yt_subscribers",
    label: "Subscribers",
    emoji: "🔔",
    serviceId: BigInt(10),
    ratePerThousand: 1.0,
    pricePerUnit: 0.001,
    isPremium: true,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "yt_views",
    label: "Views",
    emoji: "▶️",
    serviceId: BigInt(11),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "yt_likes",
    label: "Likes",
    emoji: "👍",
    serviceId: BigInt(12),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "yt_watchtime",
    label: "Watch Time",
    emoji: "⏱️",
    serviceId: BigInt(13),
    ratePerThousand: 0.5,
    pricePerUnit: 0.0005,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
];

const FACEBOOK_SERVICES: {
  key: ServiceKey;
  label: string;
  emoji: string;
  serviceId: bigint;
  ratePerThousand: number;
  pricePerUnit: number;
  isPremium: boolean;
  minQty: number;
  maxQty: number;
}[] = [
  {
    key: "fb_likes",
    label: "Likes",
    emoji: "👍",
    serviceId: BigInt(20),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "fb_followers",
    label: "Followers",
    emoji: "👥",
    serviceId: BigInt(21),
    ratePerThousand: 0.5,
    pricePerUnit: 0.0005,
    isPremium: true,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "fb_pagelikes",
    label: "Page Likes",
    emoji: "📄",
    serviceId: BigInt(22),
    ratePerThousand: 0.2,
    pricePerUnit: 0.0002,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
  {
    key: "fb_views",
    label: "Views",
    emoji: "👁️",
    serviceId: BigInt(23),
    ratePerThousand: 0.15,
    pricePerUnit: 0.00015,
    isPremium: false,
    minQty: 1000,
    maxQty: 100000,
  },
];

const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    emoji: string;
    color: string;
    glowColor: string;
    borderColor: string;
    textColor: string;
    gradient: string;
    linkPlaceholder: string;
    services: typeof INSTAGRAM_SERVICES;
  }
> = {
  instagram: {
    label: "Instagram",
    emoji: "📸",
    color: "rgba(236,72,153,0.25)",
    glowColor: "rgba(236,72,153,0.45)",
    borderColor: "rgba(236,72,153,0.7)",
    textColor: "#f9a8d4",
    gradient: "linear-gradient(135deg, #3b82f6, #ec4899)",
    linkPlaceholder: "https://instagram.com/username",
    services: INSTAGRAM_SERVICES,
  },
  youtube: {
    label: "YouTube",
    emoji: "▶️",
    color: "rgba(239,68,68,0.25)",
    glowColor: "rgba(239,68,68,0.5)",
    borderColor: "rgba(239,68,68,0.7)",
    textColor: "#fca5a5",
    gradient: "linear-gradient(135deg, #b91c1c, #ef4444)",
    linkPlaceholder: "https://youtube.com/watch?v=...",
    services: YOUTUBE_SERVICES,
  },
  facebook: {
    label: "Facebook",
    emoji: "👍",
    color: "rgba(59,130,246,0.25)",
    glowColor: "rgba(59,130,246,0.5)",
    borderColor: "rgba(59,130,246,0.7)",
    textColor: "#93c5fd",
    gradient: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    linkPlaceholder: "https://facebook.com/page",
    services: FACEBOOK_SERVICES,
  },
};

function getLocalBalance(): number {
  return Number.parseFloat(localStorage.getItem("idboost_balance") || "0");
}

function deductBalance(cost: number) {
  const current = getLocalBalance();
  const newBal = Math.max(0, current - cost);
  localStorage.setItem("idboost_balance", newBal.toFixed(2));
}

function saveOrderToHistory(entry: {
  id: string;
  service: string;
  platform: string;
  link: string;
  quantity: number;
  amount: string;
  status: "Pending";
  date: string;
}) {
  const raw = localStorage.getItem("idboost_order_history");
  const history = raw ? (JSON.parse(raw) as (typeof entry)[]) : [];
  history.unshift(entry);
  localStorage.setItem("idboost_order_history", JSON.stringify(history));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Auto-calculate price: (qty / 1000) * ratePerThousand
function calcCost(qty: number, pricePerUnit: number): string {
  if (!qty || qty <= 0) return "0.00";
  return (qty * pricePerUnit).toFixed(2);
}

export function OrderPage() {
  const { userProfile, refetchProfile } = useAppContext();
  const placeOrder = usePlaceOrder();

  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");
  const [activeService, setActiveService] = useState<ServiceKey>("followers");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("1000");
  const [commentsText, setCommentsText] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    service: string;
    quantity: string;
    amount: string;
  }>({
    visible: false,
    service: "",
    quantity: "",
    amount: "",
  });

  // Auto-select service from localStorage (set by HomePage card click)
  useEffect(() => {
    const raw = localStorage.getItem("selectedService");
    if (!raw) return;
    try {
      const sel = JSON.parse(raw) as { platform: string; key: string };
      localStorage.removeItem("selectedService");
      const platforms = ["instagram", "youtube", "facebook"];
      if (platforms.includes(sel.platform)) {
        setActivePlatform(sel.platform as Platform);
        const firstSvc = PLATFORM_CONFIG[sel.platform as Platform].services[0];
        const matchedKey =
          PLATFORM_CONFIG[sel.platform as Platform].services.find(
            (s) => s.key === sel.key,
          )?.key ?? firstSvc.key;
        setActiveService(matchedKey as ServiceKey);
      }
    } catch {}
  }, []);

  const platformCfg = PLATFORM_CONFIG[activePlatform];
  const services = platformCfg.services;

  const svc = useMemo(
    () => services.find((s) => s.key === activeService) ?? services[0],
    [activeService, services],
  );

  // Auto-calculate on every quantity change
  const cost = useMemo(() => {
    const qty = Number(quantity);
    return calcCost(qty, svc.pricePerUnit);
  }, [quantity, svc]);

  const balance = userProfile?.balance ?? getLocalBalance();
  const isInsufficient = balance < Number(cost) && Number(cost) > 0;

  const handleAiSuggest = () => {
    const options = [1000, 5000, 10000, 25000, 50000];
    setQuantity(String(options[Math.floor(Math.random() * options.length)]));
  };

  const handlePlatformChange = (platform: Platform) => {
    setActivePlatform(platform);
    const firstSvc = PLATFORM_CONFIG[platform].services[0];
    setActiveService(firstSvc.key);
    setQuantity("1000");
    setCommentsText("");
    setLink("");
  };

  const handleServiceChange = (key: ServiceKey) => {
    setActiveService(key);
    setQuantity("1000");
    setCommentsText("");
  };

  const handleQuantityChange = (val: string) => {
    // Allow typing freely; validation on submit
    setQuantity(val);
  };

  const isLive = activeService === "live";
  const accentColor = isLive ? "rgba(239,68,68,0.7)" : platformCfg.borderColor;
  const accentGlow = isLive ? "rgba(239,68,68,0.45)" : platformCfg.glowColor;
  const accentText = isLive ? "#f87171" : platformCfg.textColor;
  const btnGradient = isLive
    ? "linear-gradient(135deg, #dc2626, #ef4444)"
    : platformCfg.gradient;
  const btnGlow = isLive
    ? "0 0 20px rgba(239,68,68,0.5)"
    : `0 0 15px ${platformCfg.glowColor}`;

  const handleOrder = async () => {
    const localBal = getLocalBalance();
    const backendBal = userProfile?.balance ?? 0;
    const effectiveBal = Math.max(localBal, backendBal);

    if (effectiveBal <= 0) {
      triggerInsufficientBalancePopup();
      return;
    }

    if (!agreed) {
      toast.error("Please accept the terms first");
      return;
    }
    if (!link.trim()) {
      toast.error(`Please enter your ${platformCfg.label} link`);
      return;
    }
    const qty = Number.parseInt(quantity);
    if (!qty || qty < svc.minQty || qty > svc.maxQty) {
      toast.error(
        `Quantity must be between ${svc.minQty.toLocaleString()} and ${svc.maxQty.toLocaleString()}`,
      );
      return;
    }
    if (isInsufficient) {
      triggerInsufficientBalancePopup();
      return;
    }
    try {
      await placeOrder.mutateAsync({
        serviceId: svc.serviceId,
        link: link.trim(),
        quantity: BigInt(qty),
      });

      deductBalance(Number(cost));

      saveOrderToHistory({
        id: `#${Date.now()}`,
        service: `${platformCfg.label} ${svc.label}`,
        platform: activePlatform,
        link: link.trim(),
        quantity: qty,
        amount: cost,
        status: "Pending",
        date: formatDate(new Date()),
      });

      setSuccessModal({
        visible: true,
        service: `${platformCfg.label} ${svc.label}`,
        quantity: String(qty),
        amount: cost,
      });

      setLink("");
      setQuantity("1000");
      setCommentsText("");
      refetchProfile();
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-center mb-5 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="order.section"
      >
        🚀 Place Order
      </motion.h1>

      {/* PLATFORM SWITCHER */}
      <div
        className="flex gap-2 mb-5 p-1 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        data-ocid="order.tab"
      >
        {(["instagram", "youtube", "facebook"] as Platform[]).map(
          (platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const isActive = activePlatform === platform;
            return (
              <button
                key={platform}
                type="button"
                onClick={() => handlePlatformChange(platform)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-250"
                style={{
                  background: isActive ? cfg.color : "transparent",
                  border: isActive
                    ? `1px solid ${cfg.borderColor}`
                    : "1px solid transparent",
                  boxShadow: isActive ? `0 0 16px ${cfg.glowColor}` : "none",
                  color: isActive ? cfg.textColor : "#6b7280",
                }}
                data-ocid="order.toggle"
              >
                <span className="text-base leading-none">{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </button>
            );
          },
        )}
      </div>

      {/* SERVICE BUTTONS ROW */}
      <motion.div
        key={activePlatform}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex gap-2 mb-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {services.map((s) => {
          const isActive = activeService === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => handleServiceChange(s.key)}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? platformCfg.color
                  : "rgba(255,255,255,0.05)",
                border: isActive
                  ? `1px solid ${platformCfg.borderColor}`
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive
                  ? `0 0 14px ${platformCfg.glowColor}`
                  : "none",
                color: isActive ? platformCfg.textColor : "#9ca3af",
              }}
              data-ocid="order.toggle"
            >
              <span className="text-xl leading-none">{s.emoji}</span>
              <span>{s.label}</span>
              {/* Show rate badge */}
              <span
                className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full"
                style={{
                  background: s.isPremium
                    ? "rgba(251,191,36,0.15)"
                    : "rgba(34,197,94,0.12)",
                  color: s.isPremium ? "#fbbf24" : "#4ade80",
                }}
              >
                ₹{s.ratePerThousand}/1K
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ORDER FORM */}
      <motion.div
        key={`${activePlatform}-${activeService}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="glass-card p-5"
        data-ocid="order.card"
      >
        {/* Platform badge */}
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: platformCfg.color,
              color: platformCfg.textColor,
              border: `1px solid ${platformCfg.borderColor}`,
            }}
          >
            {platformCfg.emoji} {platformCfg.label}
          </span>
          {svc.isPremium && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              ⭐ Premium
            </span>
          )}
        </div>

        <h2
          className="text-center text-xl font-bold mb-1"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: accentText,
            textShadow: `0 0 12px ${accentGlow}`,
          }}
        >
          {isLive ? "🔴 LIVE VIEWS" : `${svc.emoji} ${svc.label.toUpperCase()}`}
        </h2>

        {/* Rate line */}
        <p className="text-center text-xs text-gray-500 mb-4">
          ₹{svc.ratePerThousand.toFixed(2)} per 1,000 units
          {svc.isPremium && (
            <span className="ml-1 text-yellow-500/70">(Premium Rate)</span>
          )}
        </p>

        {/* Live Views notice */}
        <AnimatePresence>
          {isLive && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-lg text-red-300 text-xs text-center"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              🔴 Make sure your Instagram Live is ACTIVE before placing order
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link input */}
        <span className="text-xs text-gray-400 mb-1 block">
          {platformCfg.label} Link
        </span>
        <input
          className="dark-input mb-3"
          placeholder={platformCfg.linkPlaceholder}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          data-ocid="order.input"
        />

        {/* Comments textarea */}
        <AnimatePresence>
          {activeService === "comments" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <span className="text-xs text-gray-400 mb-1 block">
                Comments (one per line)
              </span>
              <textarea
                className="dark-input mb-3 min-h-[80px] resize-none"
                placeholder="Enter each comment on a new line..."
                value={commentsText}
                onChange={(e) => setCommentsText(e.target.value)}
                rows={4}
                data-ocid="order.textarea"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantity input — auto-calculates price */}
        <span className="text-xs text-gray-400 mb-1 block">Quantity</span>
        <input
          type="number"
          className="dark-input mb-1"
          value={quantity}
          min={svc.minQty}
          max={svc.maxQty}
          step={1000}
          onChange={(e) => handleQuantityChange(e.target.value)}
          data-ocid="order.input"
        />
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-500">
            Min: {svc.minQty.toLocaleString()} · Max:{" "}
            {svc.maxQty.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={handleAiSuggest}
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: platformCfg.textColor }}
            data-ocid="order.secondary_button"
          >
            🤖 AI Suggestion
          </button>
        </div>

        {/* Dynamic price calculator */}
        <motion.div
          key={cost}
          initial={{ scale: 0.97, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl p-4 mb-4"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${accentColor.replace("0.7", "0.25")}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Formula</span>
            <span className="text-xs text-gray-400 font-mono">
              ({Number(quantity).toLocaleString() || "0"} ÷ 1000) × ₹
              {svc.ratePerThousand.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-semibold"
              style={{ color: accentText }}
            >
              Total Charge
            </span>
            <motion.div
              key={cost}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-black text-3xl"
              style={{
                color: accentText,
                textShadow: `0 0 16px ${accentGlow}`,
              }}
            >
              ₹{cost}
            </motion.div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span className="text-[10px] text-gray-600">Rate</span>
            <span className="text-[10px] text-gray-500">
              ₹{svc.ratePerThousand.toFixed(2)} / 1,000 units
            </span>
          </div>
        </motion.div>

        {/* Insufficient balance */}
        <AnimatePresence>
          {isInsufficient && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-2.5 rounded-lg text-red-400 text-sm text-center"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
              data-ocid="order.error_state"
            >
              ❌ Insufficient Balance — Please add funds to your wallet
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="agree-order"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
            data-ocid="order.checkbox"
          />
          <label htmlFor="agree-order" className="text-gray-300 text-xs">
            I agree to Terms &amp; Conditions
          </label>
        </div>

        <button
          type="button"
          onClick={handleOrder}
          disabled={placeOrder.isPending}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200"
          style={{
            background: btnGradient,
            boxShadow: btnGlow,
          }}
          data-ocid="order.submit_button"
        >
          {placeOrder.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          {isLive ? "🔴" : platformCfg.emoji} Buy {svc.label} — ₹{cost}
        </button>
      </motion.div>

      <OrderLoader visible={placeOrder.isPending} />

      {/* 3D Success Modal */}
      <OrderSuccessModal
        visible={successModal.visible}
        service={successModal.service}
        quantity={successModal.quantity}
        amount={successModal.amount}
        onClose={() => setSuccessModal((prev) => ({ ...prev, visible: false }))}
      />
      <LiveActivityFeed />
    </main>
  );
}
