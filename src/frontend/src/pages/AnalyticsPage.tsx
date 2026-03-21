import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { useMyOrders } from "../hooks/useQueries";

export function AnalyticsPage() {
  const { data: orders, isLoading } = useMyOrders();

  const total = orders?.length ?? 0;
  const completed =
    orders?.filter((o) => o.status === OrderStatus.completed).length ?? 0;
  const pending =
    orders?.filter((o) => o.status === OrderStatus.pending).length ?? 0;
  const processing =
    orders?.filter((o) => o.status === OrderStatus.processing).length ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total Orders", value: total, color: "#3b82f6", icon: "📦" },
    { label: "Completed", value: completed, color: "#22c55e", icon: "✅" },
    { label: "Pending", value: pending, color: "#eab308", icon: "⏳" },
    { label: "Processing", value: processing, color: "#8b5cf6", icon: "⚙️" },
  ];

  return (
    <main className="max-w-[430px] mx-auto px-3 py-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-center mb-4 glow-text"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        data-ocid="analytics.section"
      >
        📊 Analytics
      </motion.h1>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 text-center"
            data-ocid="analytics.card"
          >
            {isLoading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse mb-2" />
            ) : (
              <>
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p
                  className="text-2xl font-black"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 mb-4"
        data-ocid="analytics.panel"
      >
        <h2 className="text-sm font-bold text-gray-300 mb-3">
          Completion Rate
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-black text-green-400">
            {completionRate}%
          </span>
          <span className="text-xs text-gray-500">
            {completed} of {total} orders
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #3b82f6, #22c55e)" }}
          />
        </div>
      </motion.div>

      {/* Order Status Breakdown */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 mb-4"
          data-ocid="analytics.panel"
        >
          <h2 className="text-sm font-bold text-gray-300 mb-3">
            Status Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "Completed", count: completed, color: "#22c55e" },
              { label: "Processing", count: processing, color: "#8b5cf6" },
              { label: "Pending", count: pending, color: "#eab308" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        total > 0 ? `${(item.count / total) * 100}%` : "0%",
                    }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 text-center"
        data-ocid="analytics.panel"
      >
        <p className="text-gray-500 text-sm">📈 More analytics coming soon</p>
        <p className="text-gray-600 text-xs mt-1">
          Revenue tracking, charts &amp; insights
        </p>
      </motion.div>
    </main>
  );
}
