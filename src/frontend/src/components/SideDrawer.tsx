import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLocalBalance } from "../hooks/useLocalBalance";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRefund: () => void;
}

const NAV_ITEMS = [
  { icon: "🛒", label: "New Order", path: "/order" },
  { icon: "📦", label: "Orders", path: "/orders-history" },
  { icon: "💰", label: "Add Funds", path: "/wallet" },
  { icon: "👤", label: "Profile", path: "/profile" },
];

export function SideDrawer({ isOpen, onClose, onOpenRefund }: SideDrawerProps) {
  const navigate = useNavigate();
  const localBalance = useLocalBalance();

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleNav(path: string) {
    navigate({ to: path });
    onClose();
  }

  function handleRefund() {
    onOpenRefund();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="fixed inset-0 z-[60] w-full h-full cursor-default"
        style={{ background: "rgba(0,0,0,0.6)", border: "none" }}
        data-ocid="side_drawer.modal"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 h-full z-[70] flex flex-col"
        style={{
          width: "260px",
          background: "#0b1220",
          borderRight: "1px solid #1e293b",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid #1e293b" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <span
              className="font-black text-xl text-white"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              ID BOOST
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            data-ocid="side_drawer.close_button"
          >
            ×
          </button>
        </div>

        {/* Balance Pill */}
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={() => handleNav("/wallet")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200 hover:bg-white/5"
            style={{
              background: "#0f172a",
              border: "1px solid #22c55e",
            }}
            data-ocid="side_drawer.card"
          >
            <span className="text-sm text-green-300 font-semibold">
              💰 Balance
            </span>
            <span className="text-lg font-black" style={{ color: "#22c55e" }}>
              ₹{localBalance.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {/* Refund — first item */}
          <button
            type="button"
            onClick={handleRefund}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors duration-150 hover:bg-white/5"
            style={{ color: "#e2e8f0" }}
            data-ocid="side_drawer.link"
          >
            <span className="text-xl w-7 flex-shrink-0">💸</span>
            <span className="text-sm font-semibold">Refund</span>
          </button>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNav(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors duration-150 hover:bg-white/5"
              style={{ color: "#e2e8f0" }}
              data-ocid="side_drawer.link"
            >
              <span className="text-xl w-7 flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 text-center"
          style={{ borderTop: "1px solid #1e293b" }}
        >
          <p className="text-[10px] text-gray-600">
            © {new Date().getFullYear()}. Built with ❤️ using caffeine.ai
          </p>
        </div>
      </div>
    </>
  );
}
