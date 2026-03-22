import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
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
  { icon: "👑", label: "Admin", path: "/admin" },
];

export function SideDrawer({ isOpen, onClose, onOpenRefund }: SideDrawerProps) {
  const navigate = useNavigate();
  const localBalance = useLocalBalance();

  function handleNav(path: string) {
    navigate({ to: path });
    onClose();
  }

  function handleRefund() {
    onOpenRefund();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(2px)",
            }}
            data-ocid="side_drawer.modal"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 h-full z-[70] flex flex-col"
            style={{
              width: "260px",
              background: "rgba(2, 6, 23, 0.97)",
              backdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(56,189,248,0.18)",
              boxShadow: "4px 0 40px rgba(56,189,248,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span
                  className="font-black text-xl glow-text"
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
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  border: "1.5px solid rgba(34,197,94,0.4)",
                  boxShadow: "0 0 18px rgba(34,197,94,0.15)",
                }}
                data-ocid="side_drawer.card"
              >
                <span className="text-sm text-green-300 font-semibold">
                  💰 Balance
                </span>
                <span
                  className="text-lg font-black"
                  style={{
                    color: "#22c55e",
                    textShadow: "0 0 12px rgba(34,197,94,0.6)",
                  }}
                >
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all duration-150"
                style={{ color: "#e2e8f0" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(37,99,235,0.12)";
                  (e.currentTarget as HTMLElement).style.borderLeft =
                    "3px solid #2563eb";
                  (e.currentTarget as HTMLElement).style.paddingLeft = "10px";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.borderLeft = "";
                  (e.currentTarget as HTMLElement).style.paddingLeft = "12px";
                }}
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all duration-150"
                  style={{ color: "#e2e8f0" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(56,189,248,0.08)";
                    (e.currentTarget as HTMLElement).style.borderLeft =
                      "3px solid #38bdf8";
                    (e.currentTarget as HTMLElement).style.paddingLeft = "10px";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.borderLeft = "";
                    (e.currentTarget as HTMLElement).style.paddingLeft = "12px";
                  }}
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
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[10px] text-gray-600">
                © 2019. Built with ❤️ using caffeine.ai
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
