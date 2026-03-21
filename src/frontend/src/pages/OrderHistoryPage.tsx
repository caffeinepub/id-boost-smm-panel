import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { useMyOrders, useServices } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { label: string; bg: string; color: string }
  > = {
    [OrderStatus.pending]: {
      label: "Pending",
      bg: "rgba(234,179,8,0.15)",
      color: "#eab308",
    },
    [OrderStatus.processing]: {
      label: "Processing",
      bg: "rgba(59,130,246,0.15)",
      color: "#3b82f6",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      bg: "rgba(34,197,94,0.15)",
      color: "#22c55e",
    },
    [OrderStatus.failed]: {
      label: "Failed",
      bg: "rgba(239,68,68,0.15)",
      color: "#ef4444",
    },
  };
  const { label, bg, color } = config[status] ?? config[OrderStatus.pending];
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
      style={{ background: bg, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

export function OrderHistoryPage() {
  const { data: orders, isLoading } = useMyOrders();
  const { data: services } = useServices();

  const orderCount = orders?.length ?? 0;

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
        data-ocid="orders_history.section"
      >
        <h1
          className="text-2xl font-black text-center glow-text"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          📦 Order History
        </h1>
        {orderCount > 0 && (
          <p className="text-center text-gray-400 text-sm mt-1">
            {orderCount} total orders
          </p>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="orders_history.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
          data-ocid="orders_history.empty_state"
        >
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-300 font-semibold">No orders yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Place your first order to see it here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const svc = services?.find((s) => s.id === order.serviceId);
            const date = new Date(
              Number(order.createdAt) / 1_000_000,
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <motion.div
                key={order.id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-4"
                data-ocid={`orders_history.item.${idx + 1}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm text-white">
                    {svc?.name ?? `Service #${order.serviceId}`}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-400 truncate mb-1">
                  🔗 {order.link}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Qty:{" "}
                    <span className="text-gray-300">
                      {order.quantity.toString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{date}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
