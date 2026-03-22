import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRefunds } from "../hooks/useRefunds";

interface Order {
  id: string;
  service: string;
  amount: number;
  status: string;
  date: string;
}

interface PendingUTR {
  utr: string;
  amount: number;
  bonus: number;
  time: number;
}

function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem("orders") || "[]");
  } catch {
    return [];
  }
}

function getPendingUTR(): PendingUTR[] {
  try {
    return JSON.parse(localStorage.getItem("pendingUTR") || "[]");
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isSuccess = s === "approved" || s === "completed";
  const isRejected = s === "rejected";
  const style: React.CSSProperties = {
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    background: isSuccess
      ? "rgba(34,197,94,0.15)"
      : isRejected
        ? "rgba(239,68,68,0.15)"
        : "rgba(251,146,60,0.15)",
    color: isSuccess ? "#4ade80" : isRejected ? "#f87171" : "#fb923c",
    border: `1px solid ${isSuccess ? "rgba(34,197,94,0.35)" : isRejected ? "rgba(239,68,68,0.35)" : "rgba(251,146,60,0.35)"}`,
    display: "inline-block",
  };
  const label = isSuccess ? "Completed" : isRejected ? "Rejected" : "Pending";
  return <span style={style}>{label}</span>;
}

const CARD_STYLE: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "10px",
};

export function ReportPage() {
  const navigate = useNavigate();
  const { refunds } = useRefunds();
  const orders = getOrders();
  const payments = getPendingUTR();

  const totalRecharge = payments.reduce((s, p) => s + p.amount, 0);
  const totalSpent = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalOrders = orders.length;
  const totalRefunds = refunds.reduce((s, r) => s + r.amount, 0);

  const statCards = [
    {
      label: "Total Recharge",
      value: `\u20b9${totalRecharge.toFixed(0)}`,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.25)",
      icon: "\ud83d\udcb0",
    },
    {
      label: "Total Spent",
      value: `\u20b9${totalSpent.toFixed(0)}`,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.10)",
      border: "rgba(236,72,153,0.25)",
      icon: "\ud83d\uded2",
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      color: "#a855f7",
      bg: "rgba(168,85,247,0.10)",
      border: "rgba(168,85,247,0.25)",
      icon: "\ud83d\udce6",
    },
    {
      label: "Total Refunds",
      value: `\u20b9${totalRefunds.toFixed(0)}`,
      color: "#f97316",
      bg: "rgba(249,115,22,0.10)",
      border: "rgba(249,115,22,0.25)",
      icon: "\u21a9\ufe0f",
    },
  ];

  return (
    <main
      style={{ background: "#0b1220", minHeight: "100vh" }}
      className="max-w-[430px] mx-auto px-3 py-4 pb-24"
      data-ocid="report.page"
    >
      {/* Back Button */}
      <motion.button
        type="button"
        onClick={() => navigate({ to: "/" })}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.95 }}
        data-ocid="report.link"
        className="flex items-center gap-2 text-sm font-semibold mb-5 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(59,130,246,0.25)",
          color: "#93c5fd",
        }}
      >
        <span>&#8592;</span>
        <span>Back to Home</span>
      </motion.button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-5"
        style={{
          color: "#f1f5f9",
          fontFamily: "Bricolage Grotesque, sans-serif",
        }}
        data-ocid="report.section"
      >
        &#x1F4CA; My Reports
      </motion.h1>

      {/* Stat Cards 2x2 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.07 + i * 0.04 }}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: "12px",
              padding: "16px 14px",
            }}
            data-ocid="report.card"
          >
            <p style={{ fontSize: "20px", marginBottom: "4px" }}>{card.icon}</p>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: card.color,
                lineHeight: 1.1,
                marginBottom: "4px",
              }}
            >
              {card.value}
            </p>
            <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>
              {card.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Tabs defaultValue="orders">
          <TabsList
            className="w-full mb-4"
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              padding: "4px",
            }}
          >
            <TabsTrigger
              value="orders"
              className="flex-1 text-xs font-bold"
              data-ocid="report.tab"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex-1 text-xs font-bold"
              data-ocid="report.tab"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="refunds"
              className="flex-1 text-xs font-bold"
              data-ocid="report.tab"
            >
              Refunds
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" data-ocid="report.panel">
            {orders.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="report.empty_state"
                style={CARD_STYLE}
              >
                <p style={{ fontSize: "36px", marginBottom: "8px" }}>
                  &#x1F4ED;
                </p>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  No orders yet
                </p>
                <p style={{ color: "#374151", fontSize: "12px", marginTop: 4 }}>
                  Place your first order to see it here
                </p>
              </div>
            ) : (
              orders.map((order, idx) => (
                <div
                  key={order.id || `order-${idx}`}
                  style={CARD_STYLE}
                  data-ocid={`report.item.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          color: "#e5e7eb",
                          fontWeight: 700,
                          fontSize: "14px",
                          marginBottom: "2px",
                        }}
                      >
                        {order.service}
                      </p>
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "11px",
                          marginBottom: "6px",
                        }}
                      >
                        ID: {order.id} &bull; {order.date}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p
                    style={{
                      color: "#3b82f6",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    &#x20b9;{order.amount}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" data-ocid="report.panel">
            {payments.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="report.empty_state"
                style={CARD_STYLE}
              >
                <p style={{ fontSize: "36px", marginBottom: "8px" }}>
                  &#x1F4B8;
                </p>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  No payments yet
                </p>
              </div>
            ) : (
              payments.map((p, idx) => (
                <div
                  key={`${p.utr}-${p.time}`}
                  style={CARD_STYLE}
                  data-ocid={`report.item.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <p
                      style={{
                        color: "#e5e7eb",
                        fontWeight: 800,
                        fontSize: "16px",
                      }}
                    >
                      &#x20b9;{p.amount}
                      <span
                        style={{
                          color: "#4ade80",
                          fontSize: "12px",
                          fontWeight: 600,
                          marginLeft: 6,
                        }}
                      >
                        +&#x20b9;{p.bonus} bonus
                      </span>
                    </p>
                    <span
                      style={{
                        background: "rgba(251,146,60,0.15)",
                        color: "#fb923c",
                        border: "1px solid rgba(251,146,60,0.35)",
                        borderRadius: "20px",
                        padding: "2px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      Pending Admin Review
                    </span>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>
                    UTR:{" "}
                    {p.utr.length > 14 ? `${p.utr.slice(0, 14)}\u2026` : p.utr}{" "}
                    &bull;{" "}
                    {new Date(p.time).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" data-ocid="report.panel">
            {refunds.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="report.empty_state"
                style={CARD_STYLE}
              >
                <p style={{ fontSize: "36px", marginBottom: "8px" }}>
                  &#x1F504;
                </p>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  No refund requests
                </p>
              </div>
            ) : (
              refunds.map((r, idx) => (
                <div
                  key={r.id}
                  style={CARD_STYLE}
                  data-ocid={`report.item.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <p
                      style={{
                        color: "#e5e7eb",
                        fontWeight: 800,
                        fontSize: "16px",
                      }}
                    >
                      &#x20b9;{r.amount}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>
                    Method: {r.method.toUpperCase()} &bull;{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer */}
      <p
        style={{
          color: "#374151",
          fontSize: "11px",
          textAlign: "center",
          paddingTop: "24px",
        }}
      >
        &copy; {new Date().getFullYear()}. Built with &#x2764;&#xfe0f; using
        caffeine.ai
      </p>
    </main>
  );
}
