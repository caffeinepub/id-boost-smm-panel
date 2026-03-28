import { useEffect, useRef, useState } from "react";
import { useLocalBalance } from "../hooks/useLocalBalance";

export function CornerPopup() {
  const balance = useLocalBalance();
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showPopup = () => {
      setVisible(true);
      hideTimerRef.current = setTimeout(() => setVisible(false), 2500);
    };
    const t = setTimeout(showPopup, 3000);
    return () => {
      clearTimeout(t);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const msg =
    balance === 0
      ? "🤖 Low Balance — Recharge Now 🚀"
      : `💰 Balance: ₹${balance.toFixed(2)}`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        right: 15,
        background: "rgba(20,20,30,0.9)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 12,
        fontSize: 13,
        backdropFilter: "blur(10px)",
        boxShadow: "0 0 10px rgba(0,255,150,0.2)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      data-ocid="corner.toast"
    >
      {msg}
    </div>
  );
}
