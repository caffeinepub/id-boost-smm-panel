import { useEffect, useState } from "react";

export const KEY = "idboost_balance";
export const EVENT = "localBalanceUpdated";

const APPDATA_KEY = "appData";

export interface AppData {
  balance: number;
  selectedAmount: number;
  lastRecharge: number;
}

export function getLocalBalance(): number {
  return Number.parseFloat(localStorage.getItem(KEY) || "0");
}

export function addLocalBalance(amount: number) {
  const current = getLocalBalance();
  const next = current + amount;
  localStorage.setItem(KEY, String(next));
  window.dispatchEvent(new Event(EVENT));
  return next;
}

export function getAppData(): AppData {
  const raw = localStorage.getItem(APPDATA_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return { balance: getLocalBalance(), selectedAmount: 0, lastRecharge: 0 };
}

export function saveAppData(data: AppData) {
  localStorage.setItem(APPDATA_KEY, JSON.stringify(data));
  // Keep idboost_balance in sync
  localStorage.setItem(KEY, String(data.balance));
  window.dispatchEvent(new Event(EVENT));
}

export function setSelectedAmount(amount: number) {
  const data = getAppData();
  data.selectedAmount = amount;
  saveAppData(data);
  window.dispatchEvent(
    new CustomEvent("selectedAmountChanged", { detail: amount }),
  );
}

export function useLocalBalance() {
  const [balance, setBalance] = useState<number>(getLocalBalance);

  useEffect(() => {
    const handler = () => setBalance(getLocalBalance());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return balance;
}

export function useSelectedAmount() {
  const [selectedAmount, setSelected] = useState<number>(
    () => getAppData().selectedAmount,
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<number>;
      setSelected(ce.detail);
    };
    window.addEventListener("selectedAmountChanged", handler);
    return () => window.removeEventListener("selectedAmountChanged", handler);
  }, []);

  return selectedAmount;
}
