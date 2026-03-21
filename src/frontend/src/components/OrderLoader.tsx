import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  "🔄 Connecting...",
  "⚡ Processing...",
  "📦 Transferring...",
  "✅ Done",
];

interface OrderLoaderProps {
  visible: boolean;
}

export function OrderLoader({ visible }: OrderLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setStepIndex(0);
    setProgress(0);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setStepIndex(Math.min(idx, STEPS.length - 1));
      setProgress(Math.min((idx / STEPS.length) * 100, 100));
      if (idx >= STEPS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 700);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000",
            zIndex: 9997,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <p style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            {STEPS[stepIndex]}
          </p>
          <div
            style={{
              width: 220,
              height: 10,
              background: "#333",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "lime",
                borderRadius: 5,
              }}
            />
          </div>
          <p style={{ color: "#888", fontSize: 12 }}>Please wait...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
