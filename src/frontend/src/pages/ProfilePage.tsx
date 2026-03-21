import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
import { useMyOrders, useServices } from "../hooks/useQueries";

function statusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.completed:
      return "#22c55e";
    case OrderStatus.processing:
      return "#3b82f6";
    case OrderStatus.failed:
      return "#ef4444";
    default:
      return "#eab308";
  }
}

export function ProfilePage() {
  const { userProfile, isLoading } = useAppContext();
  const { data: orders } = useMyOrders();
  const { data: services } = useServices();
  const navigate = useNavigate();

  const balance = userProfile?.balance?.toFixed(2) ?? "0.00";

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-center mb-4 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="profile.section"
      >
        👤 My Profile
      </motion.h1>

      {/* Wallet Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 mb-4 text-center"
        data-ocid="profile.card"
      >
        <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
        {isLoading ? (
          <p
            className="text-4xl font-black text-green-400"
            data-ocid="profile.loading_state"
          >
            ...
          </p>
        ) : (
          <p
            className="text-4xl font-black text-green-400"
            style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}
          >
            ₹{balance}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/wallet" })}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          data-ocid="profile.secondary_button"
        >
          View Full Wallet →
        </button>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/orders-history" })}
          className="glass-card p-4 flex items-center gap-2 hover:scale-105 transition-transform"
          data-ocid="profile.button"
        >
          <span className="text-xl">📦</span>
          <span className="text-sm font-semibold text-blue-400">Orders</span>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/analytics" })}
          className="glass-card p-4 flex items-center gap-2 hover:scale-105 transition-transform"
          data-ocid="profile.button"
        >
          <span className="text-xl">📊</span>
          <span className="text-sm font-semibold text-purple-400">
            Analytics
          </span>
        </button>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 mb-4"
        data-ocid="profile.panel"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-blue-400">Recent Orders</h2>
          <button
            type="button"
            onClick={() => navigate({ to: "/orders-history" })}
            className="text-xs text-gray-400 hover:text-white transition-colors"
            data-ocid="profile.link"
          >
            View All →
          </button>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-6" data-ocid="orders.empty_state">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-400 text-sm">
              No orders yet. Place your first order!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order, idx) => {
              const svc = services?.find((s) => s.id === order.serviceId);
              const date = new Date(
                Number(order.createdAt) / 1_000_000,
              ).toLocaleDateString();
              return (
                <div
                  key={order.id.toString()}
                  className="p-3 rounded-xl flex justify-between items-start"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  data-ocid={`orders.item.${idx + 1}`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {svc?.name ?? `Service #${order.serviceId}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {order.link}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {order.quantity.toString()}
                    </p>
                    <p
                      className="text-xs font-bold capitalize"
                      style={{ color: statusColor(order.status) }}
                    >
                      {order.status}
                    </p>
                    <p className="text-[10px] text-gray-600">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Terms of Service Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 flex items-center justify-between"
        data-ocid="profile.card"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div>
            <p className="text-sm font-semibold text-white">Terms of Service</p>
            <p className="text-xs text-gray-500">
              Usage policy &amp; guidelines
            </p>
          </div>
        </div>
        <Link
          to="/terms"
          className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            boxShadow: "0 0 10px rgba(59,130,246,0.3)",
          }}
          data-ocid="profile.link"
        >
          View →
        </Link>
      </motion.div>
    </main>
  );
}
