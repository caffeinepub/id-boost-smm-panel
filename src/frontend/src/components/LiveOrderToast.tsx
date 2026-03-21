import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const ACTIVITIES = [
  "🔥 Rahul just recharged ₹500",
  "🚀 Ayaan purchased Instagram Followers",
  "💰 Imran added ₹1000 balance",
  "⚡ Priya just bought 5000 Likes",
  "🎯 Ravi ordered Story Views",
  "💎 Ali applied for Blue Tick",
  "🚀 Sneha bought 10K Views",
  "🔥 Mohit recharged ₹250",
];

export function LiveOrderToast() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    let counter = 0;
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      const msg = ACTIVITIES[counter % ACTIVITIES.length];
      counter += 1;
      setCurrent(msg);
      hideTimer = setTimeout(() => setCurrent(null), 3000);
    };

    const startTimer = setTimeout(() => {
      show();
      const interval = setInterval(show, 7000);
      return () => clearInterval(interval);
    }, 4000);

    // We need to keep interval reference for cleanup
    let interval: ReturnType<typeof setInterval>;
    const outerTimer = setTimeout(() => {
      show();
      interval = setInterval(show, 7000);
    }, 4000);

    clearTimeout(startTimer);

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
              border: "1px solid rgba(59,130,246,0.35)",
              boxShadow:
                "0 0 18px rgba(59,130,246,0.25), 0 4px 24px rgba(0,0,0,0.5)",
              borderRadius: 14,
              padding: "10px 14px",
              maxWidth: 240,
            }}
          >
            <p className="text-white text-xs font-semibold leading-snug">
              {current}
            </p>
            <p className="text-blue-400 text-[10px] mt-0.5 opacity-70">
              just now
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
