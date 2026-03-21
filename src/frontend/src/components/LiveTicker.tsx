import { useEffect, useRef, useState } from "react";

const NAMES = [
  "Rahul",
  "Ali",
  "Sara",
  "Aman",
  "Zoya",
  "David",
  "Ravi",
  "Arjun",
  "Priya",
  "Omar",
];
const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Dubai",
  "Brazil",
  "Japan",
  "Canada",
  "Germany",
  "Singapore",
];
const ACTIONS = [
  "added ₹500",
  "bought followers",
  "ordered likes",
  "added ₹1000",
  "boosted profile",
  "bought views",
  "added ₹2000",
  "ordered engagement",
];

function generateMessage(): string {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return `🌍 ${name} (${country}) ${action}`;
}

const INITIAL_MESSAGES = Array.from({ length: 12 }, generateMessage);

export function LiveTicker() {
  const [messages, setMessages] = useState<string[]>(INITIAL_MESSAGES);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const next = [generateMessage(), ...prev];
        return next.slice(0, 20);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tickerText = messages.join("   •   ");

  return (
    <div
      className="bg-black text-green-400 text-xs py-1.5 overflow-hidden whitespace-nowrap border-b border-green-900/40"
      data-ocid="ticker.panel"
    >
      <div ref={containerRef} className="flex whitespace-nowrap">
        <span className="ticker-animate inline-block">
          {tickerText} &nbsp;&nbsp;&nbsp;{tickerText}
        </span>
      </div>
    </div>
  );
}
