import { Loader2 } from "lucide-react";
import { useState } from "react";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { useActor } from "../hooks/useActor";

const SERVICES = [
  {
    group: "YouTube",
    items: [
      { label: "YouTube Subscribers", key: "youtube_subscribers" },
      { label: "YouTube Views", key: "youtube_views" },
    ],
  },
  {
    group: "Instagram",
    items: [
      { label: "Instagram Followers", key: "instagram_followers" },
      { label: "Instagram Views", key: "instagram_views" },
    ],
  },
  {
    group: "Facebook",
    items: [
      { label: "Facebook Followers", key: "facebook_followers" },
      { label: "Facebook Views", key: "facebook_views" },
    ],
  },
];

type OrderStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; orderId: string }
  | { type: "error"; message: string };

export function OrderPage() {
  const { actor } = useActor();

  const [service, setService] = useState("youtube_subscribers");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });

  const handleOrder = async () => {
    // Validate
    if (!link.trim()) {
      setStatus({ type: "error", message: "Please enter a valid link." });
      return;
    }
    if (quantity < 100) {
      setStatus({
        type: "error",
        message: "Quantity must be at least 100.",
      });
      return;
    }
    if (!actor) {
      setStatus({
        type: "error",
        message: "Not connected. Please wait and try again.",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      const raw = await actor.placeOrderExternal(
        service,
        link.trim(),
        BigInt(quantity),
      );
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        setStatus({ type: "error", message: `Unexpected response: ${raw}` });
        return;
      }

      if ("order" in parsed) {
        setStatus({
          type: "success",
          orderId: String(parsed.order),
        });
        // Reset form
        setLink("");
        setQuantity(100);
      } else if ("error" in parsed) {
        setStatus({
          type: "error",
          message: String(parsed.error),
        });
      } else {
        setStatus({
          type: "error",
          message: `Unknown response: ${raw}`,
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Order failed. Please try again.";
      setStatus({ type: "error", message: msg });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <h1
        className="text-2xl font-black text-center mb-6 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="order.section"
      >
        🚀 Place Order
      </h1>

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
              setStatus({ type: "idle" });
            }}
            data-ocid="order.select"
          >
            {SERVICES.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
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
              setStatus({ type: "idle" });
            }}
            data-ocid="order.input"
          />
        </div>

        {/* Quantity input */}
        <div className="mb-5">
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
              setStatus({ type: "idle" });
            }}
            data-ocid="order.input"
          />
        </div>

        {/* Status messages */}
        {status.type === "success" && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold text-center"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#4ade80",
            }}
            data-ocid="order.success_state"
          >
            ✅ Order placed successfully! Order ID: #{status.orderId}
          </div>
        )}

        {status.type === "error" && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold text-center"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#f87171",
            }}
            data-ocid="order.error_state"
          >
            ❌ {status.message}
          </div>
        )}

        {/* Order button */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #2563eb, #9333ea)",
            boxShadow: "0 0 18px rgba(99,102,241,0.45)",
          }}
          data-ocid="order.submit_button"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isLoading ? "Placing Order..." : "🚀 Place Order"}
        </button>
      </div>

      <LiveActivityFeed platform="instagram" />
    </main>
  );
}
