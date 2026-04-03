import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const FIRST_NAMES = [
  "Aman",
  "Rohit",
  "Imran",
  "Sahil",
  "Ankit",
  "Faizan",
  "Rahul",
  "Arjun",
  "Sameer",
  "Adil",
  "Kabir",
  "Zaid",
  "Vikas",
  "Nikhil",
  "Aslam",
  "Rehan",
  "Yusuf",
  "Shubham",
  "Karan",
  "Tahir",
  "Ravi",
  "Mohit",
  "Suresh",
  "Deepak",
  "Priya",
  "Neha",
  "Anjali",
  "Pooja",
  "Sneha",
  "Divya",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Patna",
  "Lucknow",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Bangalore",
  "Pune",
  "Jaipur",
  "Surat",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Ahmedabad",
  "Varanasi",
];

const PLATFORM_ACTIONS: {
  platform: string;
  emoji: string;
  color: string;
  services: { service: string; qty: string }[];
}[] = [
  {
    platform: "YouTube",
    emoji: "▶️",
    color: "#f87171",
    services: [
      { service: "Subscribers", qty: "1,000" },
      { service: "Subscribers", qty: "2,500" },
      { service: "Views", qty: "5,000" },
      { service: "Views", qty: "10,000" },
      { service: "Likes", qty: "2,000" },
      { service: "Watch Time", qty: "1,000" },
    ],
  },
  {
    platform: "Instagram",
    emoji: "📸",
    color: "#f9a8d4",
    services: [
      { service: "Followers", qty: "1,000" },
      { service: "Followers", qty: "3,000" },
      { service: "Likes", qty: "2,000" },
      { service: "Reels Views", qty: "5,000" },
      { service: "Story Views", qty: "2,500" },
    ],
  },
  {
    platform: "Facebook",
    emoji: "👍",
    color: "#93c5fd",
    services: [
      { service: "Page Likes", qty: "1,000" },
      { service: "Followers", qty: "2,000" },
      { service: "Post Likes", qty: "1,500" },
    ],
  },
  {
    platform: "Twitter",
    emoji: "🐦",
    color: "#67e8f9",
    services: [
      { service: "Followers", qty: "1,000" },
      { service: "Retweets", qty: "500" },
      { service: "Likes", qty: "2,000" },
    ],
  },
];

type HomeActivityItem = {
  id: string;
  type: "purchase" | "join";
  user: string;
  city?: string;
  platform?: string;
  platformEmoji?: string;
  platformColor?: string;
  service?: string;
  qty?: string;
  status: "success" | "refunded";
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Prevent name repeats
const usedNames: string[] = [];

function uniqueName(): string {
  const available = FIRST_NAMES.filter((n) => !usedNames.includes(n));
  const pool = available.length > 0 ? available : FIRST_NAMES;
  const name = pickRandom(pool);
  usedNames.push(name);
  if (usedNames.length > 10) usedNames.shift();
  return name + Math.floor(1000 + Math.random() * 9000);
}

function generatePurchase(): HomeActivityItem {
  const p = pickRandom(PLATFORM_ACTIONS);
  const svc = pickRandom(p.services);
  // 4% chance of refund — very rare
  const isRefund = Math.random() < 0.04;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: "purchase",
    user: uniqueName(),
    city: pickRandom(CITIES),
    platform: p.platform,
    platformEmoji: p.emoji,
    platformColor: p.color,
    service: svc.service,
    qty: svc.qty,
    status: isRefund ? "refunded" : "success",
  };
}

function generateJoin(): HomeActivityItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: "join",
    user: uniqueName(),
    city: pickRandom(CITIES),
    status: "success",
  };
}

function buildInitial(): HomeActivityItem[] {
  // Mix: 4 purchases + 1 join
  const items: HomeActivityItem[] = [
    generateJoin(),
    generatePurchase(),
    generatePurchase(),
    generatePurchase(),
    generatePurchase(),
  ];
  return items;
}

// Random delay: 5s - 12s for slow, natural feel
function randomDelay(): number {
  return 5000 + Math.floor(Math.random() * 7000);
}

export function HomeLiveActivity() {
  const [items, setItems] = useState<HomeActivityItem[]>(() => buildInitial());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track how many additions happened to occasionally add a "join" instead of purchase
  const countRef = useRef(0);

  useEffect(() => {
    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        countRef.current += 1;
        // Every 4th-5th item is a "new user joined"
        const isJoin = countRef.current % 5 === 0;
        const newItem = isJoin ? generateJoin() : generatePurchase();
        setItems((prev) => [newItem, ...prev.slice(0, 5)]);
        scheduleNext();
      }, randomDelay());
    }
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      data-ocid="home.feed"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span
          className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse"
          style={{ boxShadow: "0 0 6px #22c55e, 0 0 12px rgba(34,197,94,0.4)" }}
        />
        <span className="text-xs font-semibold text-gray-400">
          Live Activity
        </span>
        <span
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          style={{
            background: "rgba(34,197,94,0.12)",
            color: "#4ade80",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          LIVE
        </span>
      </div>

      {/* Feed */}
      <div style={{ overflowY: "hidden" }}>
        <AnimatePresence initial={false}>
          {items.slice(0, 6).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1 - idx * 0.12, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="px-3 py-2.5 flex items-center justify-between gap-2 border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              {item.type === "join" ? (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">🆕</span>
                    <span className="text-xs text-gray-300 truncate">
                      <span className="font-semibold text-white">
                        {item.user}
                      </span>
                      <span className="text-gray-500"> ({item.city}) </span>
                      <span className="text-green-400">just joined</span>
                    </span>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      color: "#4ade80",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1"
                      style={{ verticalAlign: "middle" }}
                    />
                    Active
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          item.status === "success" ? "#22c55e" : "#ef4444",
                        boxShadow:
                          item.status === "success"
                            ? "0 0 5px #22c55e"
                            : "0 0 5px #ef4444",
                      }}
                    />
                    <span className="text-xs text-gray-300 truncate">
                      <span className="font-semibold text-white">
                        {item.user}
                      </span>
                      <span className="text-gray-500"> ({item.city}) </span>
                      {"bought "}
                      <span style={{ color: "#93c5fd" }}>{item.qty}</span>{" "}
                      <span style={{ color: item.platformColor }}>
                        {item.platformEmoji} {item.platform}
                      </span>{" "}
                      <span className="text-gray-300">{item.service}</span>
                    </span>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        item.status === "success"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                      color: item.status === "success" ? "#4ade80" : "#f87171",
                      border:
                        item.status === "success"
                          ? "1px solid rgba(34,197,94,0.25)"
                          : "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    {item.status === "success" ? "✔ Done" : "Refunded"}
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
