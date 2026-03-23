import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type TabId = "orders" | "payments" | "wallet" | "refunds";

const TABS: { id: TabId; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
  { id: "wallet", label: "Wallet" },
  { id: "refunds", label: "Refunds" },
];

interface OrderHistoryEntry {
  id: string;
  service: string;
  platform?: string;
  link?: string;
  quantity?: number;
  amount: string | number;
  status: string;
  date: string;
}

const sampleOrders: OrderHistoryEntry[] = [
  {
    id: "#1001",
    service: "Instagram Followers",
    amount: 99,
    status: "Pending",
    date: "22 Mar",
  },
  {
    id: "#1002",
    service: "YouTube Views",
    amount: 49,
    status: "Completed",
    date: "21 Mar",
  },
  {
    id: "#1003",
    service: "Facebook Likes",
    amount: 149,
    status: "Completed",
    date: "20 Mar",
  },
  {
    id: "#1004",
    service: "Instagram Likes",
    amount: 79,
    status: "Cancelled",
    date: "19 Mar",
  },
];

const samplePayments = [
  {
    id: "PAY001",
    amount: 250,
    bonus: 60,
    ref: "UPI12345",
    status: "Success",
    date: "22 Mar",
  },
  {
    id: "PAY002",
    amount: 150,
    bonus: 30,
    ref: "UPI98765",
    status: "Success",
    date: "20 Mar",
  },
];

const sampleWallet = [{ id: "WAL001", added: 400, used: 228, balance: 172 }];

const sampleRefunds = [
  {
    id: "REF001",
    amount: 99,
    reason: "Service delay",
    status: "Completed",
    date: "22 Mar",
  },
  {
    id: "REF002",
    amount: 79,
    reason: "Order not fulfilled",
    status: "Pending",
    date: "21 Mar",
  },
];

function loadOrderHistory(): OrderHistoryEntry[] {
  try {
    const raw = localStorage.getItem("idboost_order_history");
    if (!raw) return [];
    return JSON.parse(raw) as OrderHistoryEntry[];
  } catch {
    return [];
  }
}

function statusColor(status: string) {
  if (status === "Pending") return "#f97316";
  if (status === "Completed" || status === "Success") return "#22c55e";
  if (status === "Cancelled") return "#ef4444";
  return "#94a3b8";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{ color: statusColor(status) }}
      className="text-xs font-bold uppercase tracking-wide"
    >
      ● {status}
    </span>
  );
}

function HistoryCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [search, setSearch] = useState("");

  // Merge real orders first, then sample fallback
  const realOrders = loadOrderHistory();
  const allOrders: OrderHistoryEntry[] =
    realOrders.length > 0 ? realOrders : sampleOrders;

  const filteredOrders = allOrders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        background: "#0b1220",
        minHeight: "100vh",
        fontFamily: "Poppins, Plus Jakarta Sans, sans-serif",
        color: "#e5e7eb",
      }}
    >
      <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>
        {/* Back Button + Title */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            data-ocid="history.back_button"
            onClick={() => navigate({ to: "/" })}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← Back
          </button>
          <h1 className="glow-text text-xl font-bold">📋 History</h1>
        </div>

        {/* Search */}
        <input
          data-ocid="history.search_input"
          type="text"
          placeholder="🔍 Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            marginBottom: "10px",
            outline: "none",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        {/* Tabs */}
        <div
          data-ocid="history.tab"
          style={{ display: "flex", gap: "8px", marginBottom: "15px" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`history.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "8px",
                background: activeTab === tab.id ? "#2563eb" : "#1e293b",
                color: "white",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? "700" : "400",
                fontSize: "12px",
                transition: "background 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* ORDERS */}
            {activeTab === "orders" && (
              <div data-ocid="history.orders.panel">
                {realOrders.length > 0 && (
                  <div
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginBottom: "10px",
                      fontSize: "12px",
                      color: "#22c55e",
                    }}
                  >
                    ✅ {realOrders.length} real order
                    {realOrders.length > 1 ? "s" : ""} placed
                  </div>
                )}
                {filteredOrders.length === 0 ? (
                  <div
                    data-ocid="history.orders.empty_state"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#4b5563",
                    }}
                  >
                    No orders found
                  </div>
                ) : (
                  filteredOrders.map((order, i) => (
                    <HistoryCard key={order.id}>
                      <div
                        data-ocid={`history.orders.item.${i + 1}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "14px",
                              color: "#60a5fa",
                            }}
                          >
                            {order.id}
                          </span>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {order.date}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          {order.service}
                        </p>
                        {order.quantity && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            Qty: {Number(order.quantity).toLocaleString()}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "#e5e7eb",
                            }}
                          >
                            ₹{order.amount}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </HistoryCard>
                  ))
                )}
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === "payments" && (
              <div data-ocid="history.payments.panel">
                {samplePayments.map((p, i) => (
                  <HistoryCard key={p.id}>
                    <div
                      data-ocid={`history.payments.item.${i + 1}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>
                          ₹{p.amount}{" "}
                          <span style={{ color: "#22c55e", fontSize: "13px" }}>
                            +₹{p.bonus} Bonus
                          </span>
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {p.date}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#94a3b8",
                        }}
                      >
                        Ref: {p.ref}
                      </p>
                      <StatusBadge status={p.status} />
                    </div>
                  </HistoryCard>
                ))}
              </div>
            )}

            {/* WALLET */}
            {activeTab === "wallet" && (
              <div data-ocid="history.wallet.panel">
                {sampleWallet.map((w, i) => (
                  <HistoryCard key={w.id}>
                    <div
                      data-ocid={`history.wallet.item.${i + 1}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                          Total Added
                        </span>
                        <span style={{ color: "#22c55e", fontWeight: "600" }}>
                          +₹{w.added}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                          Total Used
                        </span>
                        <span style={{ color: "#f97316", fontWeight: "600" }}>
                          -₹{w.used}
                        </span>
                      </div>
                      <div
                        style={{
                          borderTop: "1px solid #1f2937",
                          paddingTop: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>
                          Balance
                        </span>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "18px",
                            color: "#60a5fa",
                          }}
                        >
                          ₹{w.balance}
                        </span>
                      </div>
                    </div>
                  </HistoryCard>
                ))}
              </div>
            )}

            {/* REFUNDS */}
            {activeTab === "refunds" && (
              <div data-ocid="history.refunds.panel">
                {sampleRefunds.map((r, i) => (
                  <HistoryCard key={r.id}>
                    <div
                      data-ocid={`history.refunds.item.${i + 1}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>
                          ₹{r.amount}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {r.date}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#94a3b8",
                        }}
                      >
                        {r.reason}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                  </HistoryCard>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
