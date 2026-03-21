import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const ACTIVITIES = [
  // Instagram
  "🔥 Rahul just recharged ₹500",
  "📸 Ayaan purchased Instagram Followers",
  "💰 Imran added ₹1000 balance",
  "📸 Priya just bought 5000 Instagram Likes",
  "📸 Ravi ordered Instagram Story Views",
  "💎 Ali applied for Blue Tick",
  "📸 Sneha bought 10K Instagram Views",
  "🔥 Mohit recharged ₹250",
  // YouTube
  "▶️ Vikram bought 2000 YouTube Subscribers",
  "▶️ Sana ordered 10K YouTube Views",
  "▶️ Arjun purchased YouTube Watch Time",
  "▶️ Deepa got 5000 YouTube Likes",
  "🔥 Karan recharged ₹500 for YouTube",
  "▶️ Neha ordered 50K YouTube Views",
  // Facebook
  "👍 Rajesh bought 3000 Facebook Likes",
  "👍 Meera ordered Facebook Page Likes",
  "👍 Suresh purchased Facebook Followers",
  "👍 Anita got 10K Facebook Views",
  "🔥 Prakash recharged ₹300 for Facebook",
  "👍 Sunita bought 5000 Facebook Followers",
];

export function LiveOrderToast() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    let counter = 0;
    let hideTimer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const show = () => {
      const msg = ACTIVITIES[counter % ACTIVITIES.length];
      counter += 1;
      setCurrent(msg);
      hideTimer = setTimeout(() => setCurrent(null), 3000);
    };

    const outerTimer = setTimeout(() => {
      show();
      interval = setInterval(show, 3000);
    }, 4000);

    return () => {
      clearTimeout(outerTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed bottom-24 left-4 z-[999] pointer-events-none"
      data-ocid="home.toast"
    >
      <AnimatePresence>
        {current && (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.92 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              background: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: current.startsWith("▶️")
                ? "1px solid rgba(239,68,68,0.4)"
                : current.startsWith("👍")
                  ? "1px solid rgba(59,130,246,0.4)"
                  : "1px solid rgba(236,72,153,0.35)",
              boxShadow: current.startsWith("▶️")
                ? "0 0 18px rgba(239,68,68,0.25), 0 4px 24px rgba(0,0,0,0.5)"
                : current.startsWith("👍")
                  ? "0 0 18px rgba(59,130,246,0.25), 0 4px 24px rgba(0,0,0,0.5)"
                  : "0 0 18px rgba(236,72,153,0.2), 0 4px 24px rgba(0,0,0,0.5)",
              borderRadius: 14,
              padding: "10px 14px",
              maxWidth: 240,
            }}
          >
            <p className="text-white text-xs font-semibold leading-snug">
              {current}
            </p>
            <p
              className="text-[10px] mt-0.5 opacity-70"
              style={{
                color: current.startsWith("▶️")
                  ? "#fca5a5"
                  : current.startsWith("👍")
                    ? "#93c5fd"
                    : "#f9a8d4",
              }}
            >
              just now
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
