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
          background: "#020617",
          borderBottom: "1px solid #1e293b",
        }}
        data-ocid="topbar.panel"
      >
        {/* Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg transition-colors duration-200 hover:bg-white/10 active:scale-90"
            aria-label="Open menu"
            data-ocid="topbar.button"
          >
            <span
              className="block"
              style={{
                width: "20px",
                height: "2px",
                background: "#94a3b8",
                borderRadius: "2px",
              }}
            />
            <span
              className="block"
              style={{
                width: "14px",
                height: "2px",
                background: "#94a3b8",
                borderRadius: "2px",
                alignSelf: "flex-start",
              }}
            />
            <span
              className="block"
              style={{
                width: "20px",
                height: "2px",
                background: "#94a3b8",
                borderRadius: "2px",
              }}
            />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h1
              className="font-bold text-xl text-white"
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
            background: "#16a34a",
            padding: "8px 18px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
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
