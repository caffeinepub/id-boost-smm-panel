import { Loader2 } from "lucide-react";
import { useState } from "react";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { OrderSuccessModal } from "../components/OrderSuccessModal";
import { getLocalBalance } from "../hooks/useLocalBalance";

// Pricing per 1000 units (INR)
const PRICE_MAP: Record<string, number> = {
  youtube_subscribers: 100,
  youtube_views: 45,
  youtube_likes: 0.15,
  youtube_watchtime: 0.5,
  instagram_followers: 60,
  instagram_views: 20,
  instagram_likes: 0.15,
  instagram_comments: 0.3,
  instagram_shares: 0.15,
  instagram_story_views: 0.15,
  facebook_followers: 50,
  facebook_views: 30,
  facebook_likes: 0.15,
  facebook_page_likes: 0.15,
};

const SERVICES = [
  {
    group: "YouTube",
    items: [
      { label: "YouTube Subscribers", key: "youtube_subscribers" },
      { label: "YouTube Views", key: "youtube_views" },
      { label: "YouTube Likes", key: "youtube_likes" },
      { label: "YouTube Watch Time", key: "youtube_watchtime" },
    ],
  },
  {
    group: "Instagram",
    items: [
      { label: "Instagram Followers", key: "instagram_followers" },
      { label: "Instagram Views", key: "instagram_views" },
      { label: "Instagram Likes", key: "instagram_likes" },
      { label: "Instagram Comments", key: "instagram_comments" },
      { label: "Instagram Shares", key: "instagram_shares" },
      { label: "Instagram Story Views", key: "instagram_story_views" },
    ],
  },
  {
    group: "Facebook",
    items: [
      { label: "Facebook Followers", key: "facebook_followers" },
      { label: "Facebook Views", key: "facebook_views" },
      { label: "Facebook Likes", key: "facebook_likes" },
      { label: "Facebook Page Likes", key: "facebook_page_likes" },
    ],
  },
];

interface OrderHistoryItem {
  id: string;
  service: string;
  link: string;
  quantity: number;
  price: number;
  status: "Pending" | "Processing" | "Completed";
  date: string;
}

const ORDERS_KEY = "idboost_orders";
const BALANCE_KEY = "idboost_balance";

function loadOrders(): OrderHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrder(item: OrderHistoryItem) {
  const orders = loadOrders();
  orders.unshift(item);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function deductBalance(amount: number): boolean {
  const current = Number.parseFloat(localStorage.getItem(BALANCE_KEY) || "0");
  if (current < amount) return false;
  localStorage.setItem(BALANCE_KEY, String(current - amount));
  window.dispatchEvent(new Event("localBalanceUpdated"));
  return true;
}

export function OrderPage() {
  const [service, setService] = useState("youtube_subscribers");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successService, setSuccessService] = useState("");
  const [successQty, setSuccessQty] = useState("");
  const [successAmount, setSuccessAmount] = useState("");
  const [activePlatform, setActivePlatform] = useState("YouTube");

  const rate = PRICE_MAP[service] ?? 0.15;
  const totalPrice = (quantity / 1000) * rate;

  const handleOrder = async () => {
    setError("");

    if (!link.trim()) {
      setError("Please enter a valid link.");
      return;
    }
    if (quantity < 100) {
      setError("Quantity must be at least 100.");
      return;
    }

    const balance = getLocalBalance();
    if (balance < totalPrice) {
      setError(
        `Insufficient balance. You need ₹${totalPrice.toFixed(2)} but have ₹${balance.toFixed(2)}.`,
      );
      return;
    }

    setLoading(true);

    // Simulate order processing
    await new Promise((r) => setTimeout(r, 1500));

    const deducted = deductBalance(totalPrice);
    if (!deducted) {
      setError("Insufficient balance.");
      setLoading(false);
      return;
    }

    const orderId = `ORD${Date.now()}`;
    const serviceLabel =
      SERVICES.flatMap((g) => g.items).find((i) => i.key === service)?.label ||
      service;

    saveOrder({
      id: orderId,
      service: serviceLabel,
      link: link.trim(),
      quantity,
      price: totalPrice,
      status: "Pending",
      date: new Date().toLocaleString(),
    });

    setSuccessService(serviceLabel);
    setSuccessQty(String(quantity));
    setSuccessAmount(totalPrice.toFixed(2));
    setLoading(false);
    setShowSuccess(true);
    setLink("");
    setQuantity(1000);
  };

  const currentPlatformServices =
    SERVICES.find((g) => g.group === activePlatform)?.items ?? [];

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <h1
        className="text-2xl font-black text-center mb-6 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="order.section"
      >
        🚀 Place Order
      </h1>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-4">
        {SERVICES.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => {
              setActivePlatform(g.group);
              setService(g.items[0].key);
              setError("");
            }}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background:
                activePlatform === g.group
                  ? "linear-gradient(135deg, #2563eb, #9333ea)"
                  : "rgba(255,255,255,0.06)",
              border:
                activePlatform === g.group
                  ? "1px solid rgba(99,102,241,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                activePlatform === g.group
                  ? "0 0 14px rgba(99,102,241,0.35)"
                  : "none",
              color: activePlatform === g.group ? "#fff" : "#94a3b8",
            }}
            data-ocid="order.tab"
          >
            {g.group === "YouTube"
              ? "▶️"
              : g.group === "Instagram"
                ? "📸"
                : "📘"}{" "}
            {g.group}
          </button>
        ))}
      </div>

      <div className="glass-card p-5" data-ocid="order.card">
        {/* Service dropdown */}
        <div className="mb-4">
          <label
            htmlFor="order-service"
            className="text-xs text-gray-400 mb-1 block"
          >
            Select Service
          </label>
          <select
            id="order-service"
            className="dark-input"
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setError("");
            }}
            data-ocid="order.select"
          >
            {currentPlatformServices.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label} — ₹{PRICE_MAP[item.key]}/1K
              </option>
            ))}
          </select>
        </div>

        {/* Link input */}
        <div className="mb-4">
          <label
            htmlFor="order-link"
            className="text-xs text-gray-400 mb-1 block"
          >
            Link (URL)
          </label>
          <input
            id="order-link"
            className="dark-input"
            placeholder="https://..."
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError("");
            }}
            data-ocid="order.input"
          />
        </div>

        {/* Quantity input */}
        <div className="mb-4">
          <label
            htmlFor="order-qty"
            className="text-xs text-gray-400 mb-1 block"
          >
            Quantity <span className="text-gray-600">(min 100)</span>
          </label>
          <input
            id="order-qty"
            type="number"
            className="dark-input"
            min={100}
            step={100}
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setError("");
            }}
            data-ocid="order.input"
          />
        </div>

        {/* Price display */}
        <div
          className="mb-4 p-3 rounded-xl flex items-center justify-between"
          style={{
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
          data-ocid="order.price_display"
        >
          <span className="text-sm text-gray-400">
            ₹{rate}/1K × {quantity.toLocaleString()}
          </span>
          <span
            className="text-lg font-black"
            style={{
              color: "#38bdf8",
              textShadow: "0 0 10px rgba(56,189,248,0.5)",
            }}
          >
            ₹{totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold text-center"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#f87171",
            }}
            data-ocid="order.error_state"
          >
            ❌ {error}
          </div>
        )}

        {/* Order button */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #2563eb, #9333ea)",
            boxShadow: "0 0 18px rgba(99,102,241,0.45)",
          }}
          data-ocid="order.submit_button"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Processing..." : "🚀 Place Order"}
        </button>
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed
        platform={
          activePlatform.toLowerCase() as "youtube" | "instagram" | "facebook"
        }
      />

      {/* Success Modal */}
      <OrderSuccessModal
        visible={showSuccess}
        service={successService}
        quantity={successQty}
        amount={successAmount}
        onClose={() => setShowSuccess(false)}
      />
    </main>
  );
}
