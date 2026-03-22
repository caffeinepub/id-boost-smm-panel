import { useCallback, useState } from "react";

export type RefundMethod = "upi" | "bank";
export type RefundStatus = "pending" | "approved" | "rejected";

export interface RefundRequest {
  id: string;
  fullName: string;
  mobile: string;
  method: RefundMethod;
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  amount: number;
  status: RefundStatus;
  createdAt: string;
}

const STORAGE_KEY = "refundRequests";

function loadRefunds(): RefundRequest[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRefunds(refunds: RefundRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds));
}

export function useRefunds() {
  const [refunds, setRefunds] = useState<RefundRequest[]>(() =>
    loadRefunds().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  const addRefund = useCallback(
    (data: Omit<RefundRequest, "id" | "status" | "createdAt">) => {
      const newRefund: RefundRequest = {
        ...data,
        id: `REF-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [newRefund, ...loadRefunds()];
      saveRefunds(updated);
      setRefunds(updated);
    },
    [],
  );

  const updateStatus = useCallback((id: string, status: RefundStatus) => {
    const all = loadRefunds();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    saveRefunds(updated);
    setRefunds(
      updated.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, []);

  const hasPending = refunds.some((r) => r.status === "pending");

  return { refunds, addRefund, updateStatus, hasPending };
}
