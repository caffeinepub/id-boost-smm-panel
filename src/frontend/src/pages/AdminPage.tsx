import { useEffect, useState } from "react";
import {
  useAdjustBalance,
  useAllOrders,
  useAllPaymentRequests,
  useAllUsers,
  useApprovePayment,
} from "../hooks/useQueries";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminAuth {
  authenticated: boolean;
  expiry: number;
}

interface LocalDeposit {
  id: string;
  amount: number;
  bonus?: number;
  time: string;
  status: "pending" | "approved" | "rejected";
  screenshot?: string;
}

interface LocalOrder {
  id: string;
  userId?: string;
  service: string;
  quantity: number;
  price: number;
  status: string;
  date?: string;
}

type AdminTab = "dashboard" | "users" | "payments" | "orders";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAdminAuth(): AdminAuth | null {
  try {
    const raw = localStorage.getItem("adminAuth");
    if (!raw) return null;
    const parsed: AdminAuth = JSON.parse(raw);
    if (!parsed.authenticated || Date.now() > parsed.expiry) {
      localStorage.removeItem("adminAuth");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setAdminAuth() {
  const auth: AdminAuth = {
    authenticated: true,
    expiry: Date.now() + 86400000,
  };
  localStorage.setItem("adminAuth", JSON.stringify(auth));
}

function getLocalDeposits(): LocalDeposit[] {
  try {
    return JSON.parse(localStorage.getItem("pendingDeposits") || "[]");
  } catch {
    return [];
  }
}

function saveLocalDeposits(deposits: LocalDeposit[]) {
  localStorage.setItem("pendingDeposits", JSON.stringify(deposits));
}

function getLocalOrders(): LocalOrder[] {
  try {
    return JSON.parse(localStorage.getItem("localOrders") || "[]");
  } catch {
    return [];
  }
}

function addToLocalBalance(amount: number) {
  const cur = Number.parseFloat(localStorage.getItem("localBalance") || "0");
  localStorage.setItem("localBalance", String(cur + amount));
}

// ── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "idboost@2024") {
      setAdminAuth();
      onSuccess();
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
        data-ocid="admin.modal"
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h1
          style={{
            color: "#f1f5f9",
            fontSize: "24px",
            fontWeight: 700,
            margin: "0 0 6px",
          }}
        >
          Admin Login
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
          Authorized Access Only
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            data-ocid="admin.input"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-ocid="admin.input"
            style={inputStyle}
          />

          {error && (
            <p
              style={{ color: "#f87171", fontSize: "13px", margin: 0 }}
              data-ocid="admin.error_state"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            data-ocid="admin.submit_button"
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "white",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            Access Panel
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #1e293b",
  background: "#0f172a",
  color: "#f1f5f9",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.8)",
        border: `1px solid ${color}33`,
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        flex: "1",
        minWidth: "120px",
      }}
      data-ocid="admin.card"
    >
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ color: color, fontSize: "26px", fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
        {label}
      </div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getAdminAuth(),
  );
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [localDeposits, setLocalDeposits] = useState<LocalDeposit[]>([]);
  const [localOrders] = useState<LocalOrder[]>(() => getLocalOrders());
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, string>>(
    {},
  );

  const allUsers = useAllUsers();
  const allOrders = useAllOrders();
  const allPayments = useAllPaymentRequests();
  const approvePayment = useApprovePayment();
  const adjustBalance = useAdjustBalance();

  useEffect(() => {
    if (isAuthenticated) {
      setLocalDeposits(getLocalDeposits());
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  const pendingDepositsCount = localDeposits.filter(
    (d) => d.status === "pending",
  ).length;
  const pendingPaymentsCount =
    (allPayments.data?.filter((p) => !p.approved).length ?? 0) +
    pendingDepositsCount;

  function handleLogout() {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  }

  function approveLocalDeposit(id: string) {
    const updated = localDeposits.map((d) => {
      if (d.id === id) {
        addToLocalBalance(d.amount + (d.bonus ?? 0));
        return { ...d, status: "approved" as const };
      }
      return d;
    });
    saveLocalDeposits(updated);
    setLocalDeposits(updated);
  }

  function rejectLocalDeposit(id: string) {
    const updated = localDeposits.map((d) =>
      d.id === id ? { ...d, status: "rejected" as const } : d,
    );
    saveLocalDeposits(updated);
    setLocalDeposits(updated);
  }

  const TABS: { id: AdminTab; icon: string; label: string }[] = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "payments", icon: "💳", label: "Payments" },
    { id: "orders", icon: "📦", label: "Orders" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#0f172a",
          borderRight: "1px solid rgba(56,189,248,0.12)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
        }}
        className="hidden md:flex"
        data-ocid="admin.panel"
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🚀</span>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "15px", color: "#38bdf8" }}
              >
                ID BOOST
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-ocid={`admin.${tab.id}.tab`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === tab.id
                    ? "rgba(56,189,248,0.12)"
                    : "transparent",
                color: activeTab === tab.id ? "#38bdf8" : "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? 600 : 400,
                borderLeft:
                  activeTab === tab.id
                    ? "3px solid #38bdf8"
                    : "3px solid transparent",
                transition: "all 0.15s",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="admin.delete_button"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(248,113,113,0.3)",
              background: "transparent",
              color: "#f87171",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#0f172a",
          borderBottom: "1px solid rgba(56,189,248,0.12)",
          display: "flex",
          gap: "4px",
          padding: "8px",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            data-ocid={`admin.${tab.id}.tab`}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background:
                activeTab === tab.id ? "rgba(56,189,248,0.15)" : "transparent",
              color: activeTab === tab.id ? "#38bdf8" : "#64748b",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="admin.delete_button"
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "#f87171",
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "0",
          padding: "20px",
          overflowY: "auto",
        }}
        className="md:ml-[220px] mt-[60px] md:mt-0"
      >
        {/* ── Dashboard ── */}
        {activeTab === "dashboard" && (
          <div data-ocid="admin.dashboard.section">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#f1f5f9",
              }}
            >
              📊 Dashboard
            </h2>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <StatCard
                icon="👥"
                label="Total Users"
                value={
                  allUsers.isLoading ? "..." : (allUsers.data?.length ?? 0)
                }
                color="#38bdf8"
              />
              <StatCard
                icon="📦"
                label="Total Orders"
                value={
                  allOrders.isLoading
                    ? "..."
                    : (allOrders.data?.length ?? 0) + localOrders.length
                }
                color="#a78bfa"
              />
              <StatCard
                icon="⏳"
                label="Pending Payments"
                value={pendingPaymentsCount}
                color="#fb923c"
              />
            </div>
          </div>
        )}

        {/* ── Payments ── */}
        {activeTab === "payments" && (
          <div data-ocid="admin.payments.section">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#f1f5f9",
              }}
            >
              💳 Payment Requests
            </h2>

            {/* Backend payments */}
            {allPayments.isLoading && (
              <p
                style={{ color: "#64748b" }}
                data-ocid="admin.payments.loading_state"
              >
                Loading payments...
              </p>
            )}
            {allPayments.data && allPayments.data.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Backend Payments
                </h3>
                {allPayments.data.map((payment, idx) => (
                  <div
                    key={String(payment.id)}
                    style={cardStyle}
                    data-ocid={`admin.payments.item.${idx + 1}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                          ₹{Number(payment.amount)}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          UTR: {payment.transactionId}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          Method: {String(payment.paymentMethod)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        {payment.approved ? (
                          <span style={badgeStyle("#22c55e")}>✅ Approved</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => approvePayment.mutate(payment.id)}
                              data-ocid="admin.payments.confirm_button"
                              style={actionBtn("#22c55e")}
                            >
                              ✅ Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Local screenshot deposits */}
            <h3
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Screenshot Deposits
            </h3>
            {localDeposits.length === 0 && (
              <div
                style={{ ...cardStyle, color: "#475569", textAlign: "center" }}
                data-ocid="admin.payments.empty_state"
              >
                No deposit requests yet.
              </div>
            )}
            {localDeposits.map((dep, idx) => (
              <div
                key={dep.id}
                style={cardStyle}
                data-ocid={`admin.payments.item.${idx + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  {dep.screenshot && (
                    <img
                      src={dep.screenshot}
                      alt="Payment screenshot"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #1e293b",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      ₹{dep.amount}
                      {dep.bonus ? ` + ₹${dep.bonus} bonus` : ""}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "12px" }}>
                      Time: {dep.time}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <span
                        style={badgeStyle(
                          dep.status === "approved"
                            ? "#22c55e"
                            : dep.status === "rejected"
                              ? "#f87171"
                              : "#fb923c",
                        )}
                      >
                        {dep.status === "approved"
                          ? "✅ Approved"
                          : dep.status === "rejected"
                            ? "❌ Rejected"
                            : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                  {dep.status === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexDirection: "column",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => approveLocalDeposit(dep.id)}
                        data-ocid="admin.payments.confirm_button"
                        style={actionBtn("#22c55e")}
                      >
                        ✅ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectLocalDeposit(dep.id)}
                        data-ocid="admin.payments.delete_button"
                        style={actionBtn("#f87171")}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === "orders" && (
          <div data-ocid="admin.orders.section">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#f1f5f9",
              }}
            >
              📦 Orders
            </h2>

            {allOrders.isLoading && (
              <p
                style={{ color: "#64748b" }}
                data-ocid="admin.orders.loading_state"
              >
                Loading orders...
              </p>
            )}

            {/* Backend orders */}
            {allOrders.data && allOrders.data.length > 0 && (
              <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                  data-ocid="admin.orders.table"
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e293b" }}>
                      {["User ID", "Service", "Quantity", "Status"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.data.map((order, idx) => (
                      <tr
                        key={String(order.id)}
                        style={{ borderBottom: "1px solid #0f172a" }}
                        data-ocid={`admin.orders.row.${idx + 1}`}
                      >
                        <td style={tdStyle}>
                          {String(order.userId).slice(0, 12)}...
                        </td>
                        <td style={tdStyle}>{String(order.serviceId)}</td>
                        <td style={tdStyle}>{String(order.quantity)}</td>
                        <td style={tdStyle}>
                          <span
                            style={badgeStyle(
                              order.status === "pending"
                                ? "#fb923c"
                                : "#22c55e",
                            )}
                          >
                            {String(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Local orders */}
            {localOrders.length > 0 && (
              <div>
                <h3
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Local Orders
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                    data-ocid="admin.orders.table"
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1e293b" }}>
                        {["ID", "Service", "Qty", "Price", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 12px",
                                textAlign: "left",
                                color: "#64748b",
                                fontWeight: 600,
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {localOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          style={{ borderBottom: "1px solid #0f172a" }}
                          data-ocid={`admin.orders.row.${idx + 1}`}
                        >
                          <td style={tdStyle}>{order.id}</td>
                          <td style={tdStyle}>{order.service}</td>
                          <td style={tdStyle}>
                            {order.quantity.toLocaleString()}
                          </td>
                          <td style={tdStyle}>₹{order.price.toFixed(2)}</td>
                          <td style={tdStyle}>
                            <span
                              style={badgeStyle(
                                order.status === "Pending"
                                  ? "#fb923c"
                                  : order.status === "Completed"
                                    ? "#22c55e"
                                    : "#94a3b8",
                              )}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!allOrders.data || allOrders.data.length === 0) &&
              localOrders.length === 0 &&
              !allOrders.isLoading && (
                <div
                  style={{
                    ...cardStyle,
                    color: "#475569",
                    textAlign: "center",
                  }}
                  data-ocid="admin.orders.empty_state"
                >
                  No orders found.
                </div>
              )}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && (
          <div data-ocid="admin.users.section">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "20px",
                color: "#f1f5f9",
              }}
            >
              👥 Users
            </h2>

            {allUsers.isLoading && (
              <p
                style={{ color: "#64748b" }}
                data-ocid="admin.users.loading_state"
              >
                Loading users...
              </p>
            )}

            {allUsers.data &&
              allUsers.data.length === 0 &&
              !allUsers.isLoading && (
                <div
                  style={{
                    ...cardStyle,
                    color: "#475569",
                    textAlign: "center",
                  }}
                  data-ocid="admin.users.empty_state"
                >
                  No users found.
                </div>
              )}

            {allUsers.data?.map((user, idx) => {
              const uid = String(user.userId);
              const amount = adjustAmounts[uid] ?? "";
              return (
                <div
                  key={uid}
                  style={cardStyle}
                  data-ocid={`admin.users.item.${idx + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#94a3b8",
                          wordBreak: "break-all",
                        }}
                      >
                        {uid.length > 20 ? `${uid.slice(0, 20)}...` : uid}
                      </div>
                      <div
                        style={{
                          color: "#22c55e",
                          fontWeight: 700,
                          fontSize: "16px",
                          marginTop: "4px",
                        }}
                      >
                        ₹{Number(user.balance).toFixed(2)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) =>
                          setAdjustAmounts((prev) => ({
                            ...prev,
                            [uid]: e.target.value,
                          }))
                        }
                        data-ocid="admin.users.input"
                        style={{
                          ...inputStyle,
                          width: "100px",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = Number.parseFloat(amount);
                          if (!Number.isNaN(val) && val > 0) {
                            adjustBalance.mutate({
                              userId: user.userId,
                              amount: val,
                            });
                            setAdjustAmounts((prev) => ({
                              ...prev,
                              [uid]: "",
                            }));
                          }
                        }}
                        data-ocid="admin.users.confirm_button"
                        style={actionBtn("#22c55e")}
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = Number.parseFloat(amount);
                          if (!Number.isNaN(val) && val > 0) {
                            adjustBalance.mutate({
                              userId: user.userId,
                              amount: -val,
                            });
                            setAdjustAmounts((prev) => ({
                              ...prev,
                              [uid]: "",
                            }));
                          }
                        }}
                        data-ocid="admin.users.delete_button"
                        style={actionBtn("#f87171")}
                      >
                        − Deduct
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Shared mini-styles ────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "rgba(15,23,42,0.8)",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "10px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#cbd5e1",
  borderBottom: "1px solid #0f172a",
};

function badgeStyle(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
  };
}

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: "8px",
    border: `1px solid ${color}44`,
    background: `${color}18`,
    color: color,
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  };
}
