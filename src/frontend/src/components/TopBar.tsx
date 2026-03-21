import { useNavigate } from "@tanstack/react-router";
import { useLocalBalance } from "../hooks/useLocalBalance";

export function TopBar() {
  const navigate = useNavigate();
  const localBalance = useLocalBalance();

  function handleBalanceClick() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    navigate({ to: "/wallet" });
  }

  return (
    <div
      className="flex justify-between items-center px-4 py-3 fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(2, 6, 23, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
      data-ocid="topbar.panel"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🚀</span>
        <h1
          className="font-bold text-xl glow-text"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          ID BOOST
        </h1>
      </div>

      {/* Clickable Balance Box */}
      <button
        type="button"
        onClick={handleBalanceClick}
        className="text-white text-sm font-black transition-transform duration-150 active:scale-95"
        style={{
          background: "#22c55e",
          padding: "8px 18px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(34,197,94,0.6)",
        }}
        data-ocid="topbar.card"
      >
        ₹{localBalance.toFixed(2)}
      </button>
    </div>
  );
}
