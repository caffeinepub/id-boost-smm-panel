import { useEffect, useRef, useState } from "react";

const DISTRICTS = [
  "Mumbai",
  "Delhi",
  "Patna",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Bhopal",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Bangalore",
  "Pune",
  "Nagpur",
  "Kanpur",
  "Varanasi",
  "Ahmedabad",
  "Ranchi",
  "Raipur",
  "Guwahati",
];

const ACTIONS = [
  "bought 1000 followers",
  "bought 500 likes",
  "ordered 10K views",
  "purchased Blue Tick",
  "got refund \u20b975",
  "got refund \u20b9100",
  "got refund \u20b9150",
  "got refund \u20b9200",
  "got refund \u20b9300",
  "ordered 5K views",
  "bought 2000 likes",
  "ordered Watch Time",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createActivity(): { id: string; text: string } {
  const userId = `User${Math.floor(1000 + Math.random() * 9000)}`;
  const text = `${userId} (${randomItem(DISTRICTS)}) ${randomItem(ACTIONS)}`;
  const id = `${Date.now()}-${Math.random()}`;
  return { id, text };
}

const INITIAL_ITEMS = Array.from({ length: 15 }, createActivity);

export function LiveActivityFeed() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [createActivity(), ...prev.slice(0, 19)]);
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mt-5 rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      data-ocid="order.feed"
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span
          className="w-2 h-2 rounded-full bg-green-500"
          style={{ boxShadow: "0 0 6px #22c55e" }}
        />
        <span className="text-xs font-semibold text-gray-400">
          Live Activity
        </span>
      </div>

      <div
        ref={listRef}
        style={{ height: "110px", overflowY: "auto", scrollbarWidth: "none" }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="px-3 py-2 text-xs text-gray-400 border-b"
            style={{
              borderColor: "rgba(255,255,255,0.04)",
              opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.04),
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
