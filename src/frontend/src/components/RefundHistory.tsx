import { useRefunds } from "../hooks/useRefunds";
import type { RefundStatus } from "../hooks/useRefunds";

function StatusBadge({ status }: { status: RefundStatus }) {
  const styles: Record<RefundStatus, React.CSSProperties> = {
    pending: {
      background: "rgba(251,146,60,0.15)",
      color: "#fb923c",
      border: "1px solid rgba(251,146,60,0.3)",
    },
    approved: {
      background: "rgba(34,197,94,0.15)",
      color: "#22c55e",
      border: "1px solid rgba(34,197,94,0.3)",
    },
    rejected: {
      background: "rgba(239,68,68,0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.3)",
    },
  };

  const labels: Record<RefundStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span
      style={{
        ...styles[status],
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {labels[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function RefundHistory() {
  const { refunds } = useRefunds();

  if (refunds.length === 0) {
    return (
      <div
        style={{ textAlign: "center", padding: "24px 0" }}
        data-ocid="refund.empty_state"
      >
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          No refund requests yet.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="refund.list">
      {refunds.map((r, idx) => (
        <div
          key={r.id}
          data-ocid={`refund.item.${idx + 1}`}
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          {/* Row 1: ID + Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#9ca3af",
                letterSpacing: "0.03em",
              }}
            >
              {r.id.slice(0, 16)}…
            </span>
            <StatusBadge status={r.status} />
          </div>

          {/* Row 2: Amount + Method */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ color: "#f9fafb", fontWeight: 700, fontSize: "15px" }}
            >
              ₹{r.amount.toFixed(2)}
            </span>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>
              ({r.method === "upi" ? "UPI" : "Bank Transfer"})
            </span>
          </div>

          {/* Row 3: Date */}
          <div style={{ color: "#6b7280", fontSize: "11px" }}>
            {formatDate(r.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
