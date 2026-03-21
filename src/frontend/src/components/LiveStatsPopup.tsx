import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const NAMES = [
  "Rahul",
  "Ali",
  "John",
  "Aman",
  "Sara",
  "Zoya",
  "David",
  "Ravi",
  "Arjun",
  "Fatima",
  "Priya",
  "Omar",
  "Emma",
  "Vikram",
  "Nadia",
];
const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Dubai",
  "Brazil",
  "Japan",
  "Germany",
  "Canada",
  "Australia",
  "Singapore",
];
const ACTIONS = [
  "bought followers",
  "bought likes",
  "bought views",
  "added funds",
  "boosted profile",
  "ordered engagement",
];

let entryCounter = 0;

interface Entry {
  id: number;
  text: string;
}

function generateEntry(): Entry {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const amount = Math.floor(Math.random() * 5000) + 100;
  entryCounter += 1;
  return {
    id: entryCounter,
    text: `🌍 ${name} (${country}) ${action} — ₹${amount}`,
  };
}

interface LiveStatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  statLabel: string;
}

export function LiveStatsPopup({
  isOpen,
  onClose,
  statLabel,
}: LiveStatsPopupProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial = Array.from({ length: 8 }, generateEntry);
      setEntries(initial);

      intervalRef.current = setInterval(() => {
        setEntries((prev) => {
          const next = [generateEntry(), ...prev];
          return next.slice(0, 20);
        });
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setEntries([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          data-ocid="stats_popup.modal"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.25,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="relative w-80 rounded-2xl p-5"
            style={{
              background: "#1e293b",
              border: "1px solid rgba(56,189,248,0.3)",
              boxShadow:
                "0 0 40px rgba(56,189,248,0.2), 0 0 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
              style={{ background: "rgba(255,255,255,0.07)" }}
              data-ocid="stats_popup.close_button"
            >
              ✖
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block"
                  style={{ animationDuration: "1.2s" }}
                />
                <h2
                  className="text-blue-400 font-bold text-lg"
                  style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
                >
                  🔴 Live Users
                </h2>
              </div>
              <p className="text-gray-400 text-xs">
                Stat: {statLabel} — updating every 2s
              </p>
            </div>

            {/* Live Feed */}
            <div
              className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-hide"
              data-ocid="stats_popup.list"
            >
              <AnimatePresence initial={false}>
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm py-2 px-3 rounded-lg"
                    style={{
                      background:
                        i === 0
                          ? "rgba(56,189,248,0.1)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        i === 0
                          ? "1px solid rgba(56,189,248,0.2)"
                          : "1px solid rgba(255,255,255,0.05)",
                      color: i === 0 ? "#38bdf8" : "#94a3b8",
                    }}
                  >
                    {entry.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
