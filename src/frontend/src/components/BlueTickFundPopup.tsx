import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

type PopupType = "blue" | "fund" | null;

export function BlueTickFundPopup() {
  const navigate = useNavigate();
  const [active, setActive] = useState<PopupType>(null);
  const popupActiveRef = useRef(false);
  const popupIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function closePopup() {
    setActive(null);
    popupActiveRef.current = false;
  }

  useEffect(() => {
    function showPopup(type: PopupType) {
      if (popupActiveRef.current) return;
      popupActiveRef.current = true;
      setActive(type);
      timerRef.current = setTimeout(() => {
        setActive(null);
        popupActiveRef.current = false;
      }, 4000);
    }

    function runPopup() {
      const type = popupIndexRef.current % 2 === 0 ? "blue" : "fund";
      showPopup(type);
      popupIndexRef.current += 1;
      timerRef.current = setTimeout(runPopup, 30000);
    }

    function startFlow() {
      if (timerRef.current) clearTimeout(timerRef.current);
      popupIndexRef.current = 0;
      timerRef.current = setTimeout(runPopup, 10000);
    }

    startFlow();

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        startFlow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!active) return null;

  const isBlue = active === "blue";

  return (
    <>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .btfp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99998;
        }
        .btfp-box {
          width: 85%;
          max-width: 320px;
          padding: 22px;
          border-radius: 18px;
          text-align: center;
          background: linear-gradient(145deg, #020617, #0f172a);
          color: #fff;
          box-shadow: 0 25px 60px rgba(0,0,0,0.9);
          animation: popIn 0.4s forwards;
        }
        .btfp-btn {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(45deg, #2563eb, #9333ea);
          color: white;
          font-size: 15px;
          cursor: pointer;
        }
        .btfp-btn.alt {
          background: #111;
          border: 1px solid #333;
        }
      `}</style>
      <div className="btfp-overlay">
        <div
          className="btfp-box"
          style={{
            border: isBlue ? "1.5px solid #3b82f6" : "1.5px solid #22c55e",
          }}
        >
          {isBlue ? (
            <>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                💎 Get Verified
              </h2>
              <p style={{ color: "#93c5fd", fontSize: "14px" }}>
                Only ₹499 + ₹141 Bonus
              </p>
              <button
                className="btfp-btn"
                type="button"
                onClick={() => {
                  closePopup();
                  navigate({ to: "/blue-tick" });
                }}
                data-ocid="btfp.primary_button"
              >
                🔥 Get Blue Tick
              </button>
              <button
                className="btfp-btn alt"
                type="button"
                onClick={closePopup}
                data-ocid="btfp.cancel_button"
              >
                Maybe Later
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                💰 Add Balance
              </h2>
              <p style={{ color: "#86efac", fontSize: "14px" }}>
                Recharge to start services 🚀
              </p>
              <button
                className="btfp-btn"
                type="button"
                onClick={() => {
                  closePopup();
                  navigate({ to: "/wallet" });
                }}
                data-ocid="btfp.primary_button"
              >
                💳 Add Funds Now
              </button>
              <button
                className="btfp-btn alt"
                type="button"
                onClick={closePopup}
                data-ocid="btfp.cancel_button"
              >
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
