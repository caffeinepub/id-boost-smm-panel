import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderLoader } from "../components/OrderLoader";
import { useAppContext } from "../context/AppContext";
import { usePlaceOrder } from "../hooks/useQueries";

type ServiceKey =
  | "followers"
  | "likes"
  | "views"
  | "shares"
  | "comments"
  | "story"
  | "live";

const SERVICES: {
  key: ServiceKey;
  label: string;
  emoji: string;
  serviceId: bigint;
  pricePerUnit: number;
  minQty: number;
  maxQty: number;
}[] = [
  {
    key: "followers",
    label: "Followers",
    emoji: "👤",
    serviceId: BigInt(1),
    pricePerUnit: 0.006,
    minQty: 100,
    maxQty: 100000,
  },
  {
    key: "likes",
    label: "Likes",
    emoji: "❤️",
    serviceId: BigInt(2),
    pricePerUnit: 0.004,
    minQty: 100,
    maxQty: 50000,
  },
  {
    key: "views",
    label: "Views",
    emoji: "👁️",
    serviceId: BigInt(3),
    pricePerUnit: 0.002,
    minQty: 500,
    maxQty: 500000,
  },
  {
    key: "shares",
    label: "Shares",
    emoji: "🔄",
    serviceId: BigInt(4),
    pricePerUnit: 0.005,
    minQty: 100,
    maxQty: 50000,
  },
  {
    key: "comments",
    label: "Comments",
    emoji: "💬",
    serviceId: BigInt(5),
    pricePerUnit: 0.01,
    minQty: 10,
    maxQty: 10000,
  },
  {
    key: "story",
    label: "Story Views",
    emoji: "📲",
    serviceId: BigInt(6),
    pricePerUnit: 0.004,
    minQty: 100,
    maxQty: 200000,
  },
  {
    key: "live",
    label: "Live Views",
    emoji: "🔴",
    serviceId: BigInt(7),
    pricePerUnit: 0.003,
    minQty: 100,
    maxQty: 50000,
  },
];

export function OrderPage() {
  const { userProfile, refetchProfile } = useAppContext();
  const placeOrder = usePlaceOrder();

  const [activeService, setActiveService] = useState<ServiceKey>("followers");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("1000");
  const [commentsText, setCommentsText] = useState("");
  const [agreed, setAgreed] = useState(false);

  const svc = useMemo(
    () => SERVICES.find((s) => s.key === activeService)!,
    [activeService],
  );

  const cost = useMemo(() => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return "0.00";
    return (qty * svc.pricePerUnit).toFixed(2);
  }, [quantity, svc]);

  const balance = userProfile?.balance ?? 0;
  const isInsufficient = balance < Number(cost) && Number(cost) > 0;

  const handleAiSuggest = () => {
    const options = [1000, 5000, 10000];
    setQuantity(String(options[Math.floor(Math.random() * options.length)]));
  };

  const handleServiceChange = (key: ServiceKey) => {
    setActiveService(key);
    setQuantity("1000");
    setCommentsText("");
  };

  const handleOrder = async () => {
    if (!agreed) {
      toast.error("Please accept the terms first");
      return;
    }
    if (!link.trim()) {
      toast.error("Please enter your Instagram link");
      return;
    }
    const qty = Number.parseInt(quantity);
    if (!qty || qty < svc.minQty || qty > svc.maxQty) {
      toast.error(`Quantity must be between ${svc.minQty} and ${svc.maxQty}`);
      return;
    }
    if (isInsufficient) {
      toast.error("Insufficient balance! Please add funds first.");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        serviceId: svc.serviceId,
        link: link.trim(),
        quantity: BigInt(qty),
      });
      // Order placed — show immediate success toast
      toast(
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold text-white text-sm">Order Placed!</p>
            <p className="text-green-300 text-xs">
              {svc.label} order confirmed
            </p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #052e16, #0f172a)",
            border: "1px solid rgba(34,197,94,0.5)",
            boxShadow: "0 0 20px rgba(34,197,94,0.25)",
            color: "#fff",
            borderRadius: "14px",
          },
        },
      );
      // 2 seconds later — pending status toast
      setTimeout(() => {
        toast(
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-bold text-white text-sm">Processing...</p>
              <p className="text-yellow-300 text-xs">
                आपकी service pending है (1-2 घंटे)
              </p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: "linear-gradient(135deg, #1c1300, #0f172a)",
              border: "1px solid rgba(234,179,8,0.5)",
              boxShadow: "0 0 20px rgba(234,179,8,0.2)",
              color: "#fff",
              borderRadius: "14px",
            },
          },
        );
      }, 2000);
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

      {/* SERVICE BUTTONS ROW */}
      <div
        className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide"
        data-ocid="order.tab"
        style={{ scrollbarWidth: "none" }}
      >
        {SERVICES.map((s) => {
          const isActive = activeService === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => handleServiceChange(s.key)}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? s.key === "live"
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(59,130,246,0.25)"
                  : "rgba(255,255,255,0.05)",
                border: isActive
                  ? s.key === "live"
                    ? "1px solid rgba(239,68,68,0.7)"
                    : "1px solid rgba(59,130,246,0.7)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive
                  ? s.key === "live"
                    ? "0 0 14px rgba(239,68,68,0.45)"
                    : "0 0 14px rgba(59,130,246,0.45)"
                  : "none",
                color: isActive
                  ? s.key === "live"
                    ? "#fca5a5"
                    : "#93c5fd"
                  : "#9ca3af",
              }}
              data-ocid="order.toggle"
            >
              <span className="text-xl leading-none">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ORDER FORM */}
      <motion.div
        key={activeService}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="glass-card p-5"
        data-ocid="order.card"
      >
        <h2
          className="text-center text-xl font-bold mb-5"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: activeService === "live" ? "#f87171" : "",
          }}
        >
          {activeService === "live" ? (
            <span style={{ textShadow: "0 0 12px rgba(239,68,68,0.7)" }}>
              🔴 LIVE VIEWS
            </span>
          ) : (
            <span className="text-blue-400 glow-text">
              {svc.emoji} {svc.label.toUpperCase()}
            </span>
          )}
        </h2>

        {/* Live Views notice */}
        <AnimatePresence>
          {activeService === "live" && (
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

        {/* Instagram Link */}
        <span className="text-xs text-gray-400 mb-1 block">Instagram Link</span>
        <input
          className="dark-input mb-3"
          placeholder="https://instagram.com/username"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          data-ocid="order.input"
        />

        {/* Comments textarea — visible only for Comments service */}
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

        {/* Quantity */}
        <span className="text-xs text-gray-400 mb-1 block">Quantity</span>
        <input
          type="number"
          className="dark-input mb-1"
          value={quantity}
          min={svc.minQty}
          max={svc.maxQty}
          onChange={(e) => setQuantity(e.target.value)}
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
            className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
            data-ocid="order.secondary_button"
          >
            🤖 AI Suggestion
          </button>
        </div>

        {/* Price per unit info */}
        <div
          className="rounded-lg p-3 mb-3 flex justify-between items-center"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${
              activeService === "live"
                ? "rgba(239,68,68,0.2)"
                : "rgba(59,130,246,0.15)"
            }`,
          }}
        >
          <span className="text-gray-500 text-xs">
            ₹{svc.pricePerUnit}/unit
          </span>
          <div className="text-right">
            <div className="text-gray-400 text-xs">Total Charge</div>
            <div
              className="font-bold text-2xl"
              style={{
                color: activeService === "live" ? "#f87171" : "#60a5fa",
              }}
            >
              ₹{cost}
            </div>
          </div>
        </div>

        {/* Insufficient balance warning */}
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
            background:
              activeService === "live"
                ? "linear-gradient(135deg, #dc2626, #ef4444)"
                : "linear-gradient(135deg, #3b82f6, #ec4899)",
            boxShadow:
              activeService === "live"
                ? "0 0 20px rgba(239,68,68,0.5)"
                : "0 0 15px rgba(59,130,246,0.4)",
          }}
          data-ocid="order.submit_button"
        >
          {placeOrder.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          {activeService === "live" ? "🔴" : "🚀"} Buy {svc.label}
        </button>
      </motion.div>
      <OrderLoader visible={placeOrder.isPending} />
    </main>
  );
}
