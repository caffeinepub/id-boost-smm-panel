import { useEffect, useState } from "react";

const KEY = "idboost_balance";
const EVENT = "localBalanceUpdated";

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

export function useLocalBalance() {
  const [balance, setBalance] = useState<number>(getLocalBalance);

  useEffect(() => {
    const handler = () => setBalance(getLocalBalance());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return balance;
}
