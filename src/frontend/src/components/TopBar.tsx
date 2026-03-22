import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLocalBalance } from "../hooks/useLocalBalance";
import { RefundModal } from "./RefundModal";
import { SideDrawer } from "./SideDrawer";

export function TopBar() {
  const navigate = useNavigate();
  const localBalance = useLocalBalance();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  function handleBalanceClick() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    navigate({ to: "/wallet" });
  }

  return (
    <>
      <div
        className="flex justify-between items-center px-4 py-3 fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(2, 6, 23, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
        data-ocid="topbar.panel"
      >
        {/* Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-90"
            aria-label="Open menu"
            data-ocid="topbar.button"
          >
            <span
              className="block"
              style={{
                width: "20px",
                height: "2px",
                background: "#38bdf8",
                borderRadius: "2px",
                boxShadow: "0 0 6px rgba(56,189,248,0.7)",
              }}
            />
            <span
              className="block"
              style={{
                width: "14px",
                height: "2px",
                background: "#38bdf8",
                borderRadius: "2px",
                alignSelf: "flex-start",
                boxShadow: "0 0 6px rgba(56,189,248,0.5)",
              }}
            />
            <span
              className="block"
              style={{
                width: "20px",
                height: "2px",
                background: "#38bdf8",
                borderRadius: "2px",
                boxShadow: "0 0 6px rgba(56,189,248,0.7)",
              }}
            />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h1
              className="font-bold text-xl glow-text"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              ID BOOST
            </h1>
          </div>
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

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenRefund={() => setRefundOpen(true)}
      />
      <RefundModal isOpen={refundOpen} onClose={() => setRefundOpen(false)} />
    </>
  );
}
