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
  "Ranchi",
  "Raipur",
];

const PLATFORM_SERVICES: Record<string, { service: string; qty: string }[]> = {
  instagram: [
    { service: "Followers", qty: "1,000" },
    { service: "Followers", qty: "2,500" },
    { service: "Followers", qty: "5,000" },
    { service: "Likes", qty: "1,000" },
    { service: "Likes", qty: "3,000" },
    { service: "Reels Views", qty: "10,000" },
    { service: "Story Views", qty: "5,000" },
    { service: "Story Views", qty: "2,500" },
  ],
  youtube: [
    { service: "Subscribers", qty: "1,000" },
    { service: "Subscribers", qty: "2,000" },
    { service: "Views", qty: "5,000" },
    { service: "Views", qty: "10,000" },
    { service: "Likes", qty: "1,500" },
    { service: "Watch Time", qty: "1,000" },
    { service: "Watch Time", qty: "5,000" },
  ],
  facebook: [
    { service: "Page Likes", qty: "1,000" },
    { service: "Page Likes", qty: "2,500" },
    { service: "Followers", qty: "1,000" },
    { service: "Post Likes", qty: "3,000" },
    { service: "Views", qty: "5,000" },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const usedNames: string[] = [];

function uniqueName(): string {
  const available = FIRST_NAMES.filter((n) => !usedNames.includes(n));
  const pool = available.length > 0 ? available : FIRST_NAMES;
  const name = pickRandom(pool);
  usedNames.push(name);
  if (usedNames.length > 8) usedNames.shift();
  return name + Math.floor(1000 + Math.random() * 9000);
}

type ActivityItem = {
  id: string;
  user: string;
  city: string;
  service: string;
  qty: string;
  status: "success" | "refunded";
};

function generateEntry(platform: string): ActivityItem {
  const services = PLATFORM_SERVICES[platform] ?? PLATFORM_SERVICES.instagram;
  const svc = pickRandom(services);
  const isRefund = Math.random() < 0.05;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user: uniqueName(),
    city: pickRandom(CITIES),
    service: svc.service,
    qty: svc.qty,
    status: isRefund ? "refunded" : "success",
  };
}

function buildInitial(platform: string): ActivityItem[] {
  return Array.from({ length: 5 }, () => generateEntry(platform));
}

function randomDelay(): number {
  return 4000 + Math.floor(Math.random() * 5000);
}

interface LiveActivityFeedProps {
  platform?: string;
}

export function LiveActivityFeed({
  platform = "instagram",
}: LiveActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>(() =>
    buildInitial(platform),
  );
  const platformRef = useRef(platform);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (platformRef.current !== platform) {
      platformRef.current = platform;
      setItems(buildInitial(platform));
    }
  }, [platform]);

  useEffect(() => {
    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        setItems((prev) => {
          const newEntry = generateEntry(platformRef.current);
          return [newEntry, ...prev.slice(0, 5)];
        });
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
      className="mt-5 rounded-xl overflow-hidden"
      style={{ background: "#0f172a", border: "1px solid #1e293b" }}
      data-ocid="order.feed"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "#1e293b" }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
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

      {/* Feed items */}
      <div style={{ height: "210px", overflowY: "hidden" }}>
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="px-3 py-2.5 flex items-center justify-between gap-2 border-b"
            style={{ borderColor: "#1e293b" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: item.status === "success" ? "#22c55e" : "#ef4444",
                }}
              />
              <span className="text-xs text-gray-300 truncate">
                <span className="font-semibold text-white">{item.user}</span>
                <span className="text-gray-500"> ({item.city})</span>
                {" bought "}
                <span style={{ color: "#93c5fd" }}>{item.qty}</span>{" "}
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
              {item.status === "success" ? "✔ Success" : "Refunded"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
