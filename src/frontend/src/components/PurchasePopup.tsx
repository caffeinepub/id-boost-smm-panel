import { useEffect, useState } from "react";

const names = ["Rahul", "Ayaan", "Imran", "Sahil", "Faizan"];
const cities = ["Delhi", "Mumbai", "Lucknow", "Hyderabad"];
const services = [
  "Instagram Followers",
  "YouTube Views",
  "Facebook Likes",
  "Reels Views",
  "YouTube Subscribers",
];
const prices = ["\u20b949", "\u20b999", "\u20b9199", "\u20b9299"];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Module-level duplicate prevention tracker
let lastMessage = "";

export function PurchasePopup() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({
    name: "",
    city: "",
    service: "",
    price: "",
  });

  useEffect(() => {
    function show() {
      const newService = getRandom(services);
      const newName = getRandom(names);
      const newCity = getRandom(cities);
      const newPrice = getRandom(prices);
      const newMessage = `${newName}|${newCity}|${newService}|${newPrice}`;

      // Skip if same as last shown message
      if (newMessage === lastMessage) {
        return;
      }

      lastMessage = newMessage;

      setData({
        name: newName,
        city: newCity,
        service: newService,
        price: newPrice,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    }

    const first = setTimeout(show, 3000);
    const loop = setInterval(show, 5000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg,#0f172a,#020617)",
        color: "#00ffcc",
        padding: "12px 16px",
        borderRadius: "12px",
        fontSize: "13px",
        boxShadow: "0 0 25px rgba(0,255,150,0.6)",
        zIndex: 999999,
        textAlign: "center",
        whiteSpace: "nowrap",
        animation: "popup3d 0.4s ease",
        border: "1px solid rgba(0,255,150,0.3)",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes popup3d {
          from { transform: translateX(-50%) scale(0.7); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }
      `}</style>
      🔥 {data.name} ({data.city})<br />
      {data.service} &nbsp;<strong>{data.price}</strong>
    </div>
  );
}
