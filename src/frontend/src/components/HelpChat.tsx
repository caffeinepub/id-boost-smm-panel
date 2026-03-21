import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  from: "user" | "bot";
}

function cleanText(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
}

function detectLang(msg: string): "hi" | "en" | "ur" {
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(msg)) return "ur";
  if (/[\u0900-\u097F]/.test(msg)) return "hi";
  return "en";
}

function getLangCode(lang: "hi" | "en" | "ur"): string {
  if (lang === "hi") return "hi-IN";
  if (lang === "en") return "en-US";
  if (lang === "ur") return "ur-PK";
  return "hi-IN";
}

function getReply(t: string): string {
  const lang = detectLang(t);
  const lower = t.toLowerCase();

  if (lang === "hi") {
    if (lower.includes("पेंडिंग") || lower.includes("pending")) {
      return "⏳ सर आपकी सर्विस पेंडिंग है\n\n👉 आप दूसरी सर्विस खरीद सकते हैं\n👉 या ₹250 रिचार्ज करें + ₹60 बोनस पाएं 🔥\n\nइससे आपकी ग्रोथ तेज होगी 🚀";
    }
    if (lower.includes("रिफंड") || lower.includes("refund")) {
      return "💯 सर अगर आपको सर्विस पसंद नहीं आती तो आपका पूरा पैसा (बोनस सहित) 72 घंटे में वापस मिल जाएगा\n\n👉 आप बिना किसी डर के सर्विस खरीद सकते हैं 🔥";
    }
    if (
      lower.includes("amount") ||
      lower.includes("पेमेंट") ||
      lower.includes("payment")
    ) {
      return "💰 सर हमारे बेस्ट प्लान:\n\n₹150 → +₹30\n₹250 → +₹60 ⭐ (Popular)\n₹500 → +₹120 🔥 (Best)\n\n👉 ₹250 या ₹500 सबसे ज्यादा फायदा देगा 💯";
    }
    if (lower.includes("सर्विस") || lower.includes("service")) {
      return "🚀 सर हमारी सर्विस:\n\n👤 Followers\n❤️ Likes\n👁️ Views\n💬 Comments\n💎 Blue Tick ₹499\n\n👉 पहले रिचार्ज करें → फिर सर्विस खरीदें";
    }
    if (lower.includes("ब्लू") || lower.includes("blue")) {
      return "सर Blue Tick ₹499 में available है, 24 घंटे में मिलेगा ✅";
    }
    if (lower.includes("फॉलोअर्स") || lower.includes("followers")) {
      return "सर Followers service available है, अभी order करें 🚀";
    }
    return "🔥 सर अभी बेस्ट ऑफर चल रहा है:\n\n👉 ₹250 + ₹60 बोनस ⭐\n👉 ₹500 + ₹120 बोनस 🔥\n\n👉 अभी रिचार्ज करें और अपनी ग्रोथ शुरू करें 🚀";
  }

  if (lang === "en") {
    if (lower.includes("pending"))
      return "⏳ Sir your service is pending, will be completed in 1-2 hours";
    if (lower.includes("refund"))
      return "💯 Full refund (including bonus) within 72 hours if service not delivered";
    if (lower.includes("blue"))
      return "Sir Blue Tick available for ₹499, delivered in 24 hours ✅";
    if (lower.includes("followers"))
      return "Sir Followers service available, order now 🚀";
    if (lower.includes("service"))
      return "🚀 Our services:\n\n👤 Followers\n❤️ Likes\n👁️ Views\n💬 Comments\n💎 Blue Tick ₹499";
    return "🔥 Best offer:\n₹250 + ₹60 bonus ⭐\n₹500 + ₹120 bonus 🔥\n\n👉 Recharge now and start your growth 🚀";
  }

  // Urdu
  return "🔥 بہترین آفر:\n250 روپے ڈالیں + 60 بونس حاصل کریں\n\n👉 ابھی ریچارج کریں 🚀";
}

function speak(text: string, lang: "hi" | "en" | "ur" = "hi") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = cleanText(text);
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = getLangCode(lang);
  utt.rate = 0.9;
  utt.pitch = 1;

  utt.onend = () => {};
  window.speechSynthesis.speak(utt);
}

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);

  // Page load welcome voice (1500ms after mount)
  useEffect(() => {
    const t = setTimeout(() => {
      speak("आपका स्वागत है, आप हमारी सर्विस या रिचार्ज के बारे में पूछ सकते हैं", "hi");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // Timed auto-messages in chat
  useEffect(() => {
    const welcomeMsg =
      "👋 सर Welcome!\n\n👉 Step 1: पहले ₹250 रिचार्ज करें\n👉 Step 2: अपनी सर्विस चुनें\n👉 Step 3: ऑर्डर करें 🚀\n\n💰 आपको बोनस भी मिलेगा";
    const safetyMsg =
      "💯 सर आप बिल्कुल safe हैं\n\n👉 अगर आपको सर्विस पसंद नहीं आती तो आपका पूरा पैसा (बोनस सहित) वापस मिल जाएगा 72 घंटे में\n\n👉 बिना risk के खरीद सकते हैं 🔥";
    const promoMsg =
      "🔥 सर अभी भी मौका है!\n\n👉 ₹250 डालो + ₹60 बोनस\n👉 ₹500 डालो + ₹120 बोनस\n\n👉 जितना ज्यादा डालोगे उतना फायदा 💰";

    const addBot = (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text, from: "bot" },
      ]);
    };

    const t1 = setTimeout(() => addBot(welcomeMsg), 2000);
    const t2 = setTimeout(() => addBot(safetyMsg), 10000);

    // Every 20s: if chat is open, speak promo; always add to messages
    const interval = setInterval(() => {
      addBot(promoMsg);
      if (openRef.current) {
        speak("सर अभी ऑफर चल रहा है, 250 डालो और 60 बोनस पाओ", "hi");
      }
    }, 20000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, []);

  const messagesLen = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on message count
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messagesLen]);

  function toggleChat() {
    const next = !open;
    setOpen(next);
    openRef.current = next;
    if (!next) {
      // Closing: stop voice
      window.speechSynthesis?.cancel();
    } else {
      // Opening: welcome voice after 500ms
      setTimeout(() => {
        speak(
          "सर नमस्ते, आपको क्या चाहिए? आप रिचार्ज या सर्विस के बारे में पूछ सकते हैं",
          "hi",
        );
      }, 500);
    }
  }

  function closeChat() {
    setOpen(false);
    openRef.current = false;
    window.speechSynthesis?.cancel();
  }

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const lang = detectLang(text);
    const userMsg: Message = { id: nextId, text: text.trim(), from: "user" };
    const reply = getReply(text);
    const botMsg: Message = { id: nextId + 1, text: reply, from: "bot" };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setNextId((n) => n + 2);
    setInput("");
    speak(reply, lang);
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  function startVoice() {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    const recognition = new SpeechRec();
    recognition.lang = "hi-IN";
    recognition.start();
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        type="button"
        data-ocid="helpchat.open_modal_button"
        onClick={toggleChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          background: "linear-gradient(45deg, #3b82f6, #ec4899)",
          border: "none",
          borderRadius: "50px",
          padding: "12px 18px",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 0 25px rgba(59,130,246,0.7)",
          zIndex: 999,
          whiteSpace: "nowrap",
        }}
      >
        🆘 Help
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="helpchat.modal"
            initial={{ scale: 0, opacity: 0, originX: 1, originY: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "160px",
              right: "20px",
              width: "320px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
              borderRadius: "20px",
              boxShadow: "0 0 40px rgba(59,130,246,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 998,
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontWeight: "bold", color: "#fff", fontSize: "14px" }}
              >
                🤖 हेल्प सेंटर
              </span>
              <button
                type="button"
                data-ocid="helpchat.close_button"
                onClick={closeChat}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                  padding: "2px 4px",
                }}
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatBoxRef}
              style={{
                height: "260px",
                overflowY: "auto",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                    textAlign: "center",
                    marginTop: "80px",
                  }}
                >
                  अपना सवाल लिखें...
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    cursor: "default",
                    transition: "transform 0.2s",
                    ...(msg.from === "user"
                      ? {
                          background: "#1e293b",
                          color: "#e2e8f0",
                          alignSelf: "flex-end",
                        }
                      : {
                          background: "#0ea5e9",
                          color: "#fff",
                          alignSelf: "flex-start",
                          boxShadow: "0 0 10px rgba(14,165,233,0.6)",
                        }),
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "scale(1)";
                  }}
                >
                  {cleanText(msg.text)}
                  {msg.from === "bot" &&
                  (msg.text.toLowerCase().includes("रिचार्ज") ||
                    msg.text.toLowerCase().includes("recharge")) ? (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/";
                      }}
                      style={{
                        marginTop: "6px",
                        width: "100%",
                        padding: "5px",
                        background: "linear-gradient(45deg, #3b82f6, #ec4899)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      👉 ₹250 रिचार्ज करें
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "10px",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <input
                data-ocid="helpchat.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="अपना सवाल लिखें..."
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(59,130,246,0.3)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                data-ocid="helpchat.submit_button"
                onClick={handleSend}
                style={{
                  background: "linear-gradient(45deg,#3b82f6,#8b5cf6)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ➤
              </button>
              <button
                type="button"
                data-ocid="helpchat.toggle"
                onClick={startVoice}
                style={{
                  background: "rgba(236,72,153,0.2)",
                  border: "1px solid rgba(236,72,153,0.4)",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  color: "#ec4899",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                🎤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
