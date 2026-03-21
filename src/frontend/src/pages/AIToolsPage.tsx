import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// --- Utility ---

function cleanText(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
}

// --- Caption Generator Data ---

const captionCategories: Record<string, string[]> = {
  gym: [
    "💪 Mehnat itni karo ki body khud bole 🔥 #fitness #viral #gym",
    "🏋️ Jab dard ho tab yaad karo kyun shuru kiya tha 💯 #workout #grind",
    "🔥 No shortcut, only hardwork — that's the gym code 💪 #fitlife #gains",
    "⚡ Sweat today, shine tomorrow 🌟 #gymlife #bodybuilding #motivation",
    "🦁 Beast mode ON — baaki sab baad mein 🏆 #beastmode #fitness #gym",
    "💥 Pain is temporary, gains are forever 🙌 #nopainnogain #workout",
    "🎯 Har rep mein ek sapna hai — mat chodna 🔥 #fitnessgoals #hustle",
    "🌅 Subah 5 baje uthna hi success ki pehli seedhi hai 💪 #earlybird #gym",
  ],
  travel: [
    "✈️ Duniya ghoomo, yaadein banao — life ek baar milti hai 🌍 #travel #explore",
    "🌴 Pahaad ho ya samandar, mera dil hamesha wahan hai 🏔️ #wanderlust #trips",
    "🗺️ Collect memories, not things — aur phir stories sunao 📸 #traveler",
    "🌅 Har naya destination ek naya version of you 🚀 #travelgram #adventure",
    "🏕️ Zindagi road trip hai — enjoy every stop 🛣️ #roadtrip #travel #reels",
    "🌊 Samundar ke kinare baith ke realize hua — life is beautiful 💙 #beach",
    "✨ Not all those who wander are lost — main definitely nahi hoon 😄 #explore",
    "🎒 Bag pack karo, kal ka kuch pata nahi 🌈 #backpacker #travellife",
  ],
  love: [
    "❤️ Sachha pyaar kabhi explain nahi hota — bas feel hota hai 💖 #love #viral",
    "💔 Kuch log milte hain sirf yaadein chhod jaane ke liye 🥀 #sad #heartbreak",
    "💕 Tere bina yeh dil adhoora sa lagta hai 🌙 #pyaar #lovequotes #trending",
    "🌹 Mohabbat mein haar ke bhi jeeta hoon main 💘 #love #feelings #reels",
    "💫 Wo mera tha ya nahi — par mera dil to tha uska 🕊️ #sad #emotional",
    "🥹 Sirf ek baar aur bol do — I love you 💓 #romantic #lovestory",
    "💙 Dard bhi tune diya, dawa bhi tu hai — yahi love hai 🌊 #poetry #viral",
    "🌸 Har cheez lose karke sirf tujhe nahi khona chahta 🤍 #lovequotes",
  ],
  business: [
    "💼 Risk lo tabhi success milegi — comfort zone se bahar aao 🚀 #hustle",
    "💰 Paise se sab nahi milta par paise ke bina kuch nahi milta 😤 #money",
    "🎯 Sapne bade rakho — execution aur bhi bada rakhna 🔥 #success #goals",
    "📈 Har No ek Yes ke qareeb le jaata hai — mat ruko 💯 #entrepreneur",
    "⚡ Build in silence, flex when done 🏆 #business #grind #motivation",
    "🌟 Log haste the, ab main hasata hoon — business ne badla sab 💸 #boss",
    "🦁 Mentality matters more than money — mindset hi sab kuch hai 🧠 #mindset",
    "🚀 9 to 5 nahi, 24/7 — yahi hai entrepreneur ka lifestyle 💼 #startup",
  ],
  fashion: [
    "👗 Style statement nahi, style attitude hota hai 💅 #fashion #ootd #drip",
    "🔥 Jab kapde bole toh words nahi chahiye 💋 #fashionista #outfit #reels",
    "✨ Drip so hard people think it is raining 🌧️ #swag #style #viral",
    "💎 Luxury is a state of mind — dress accordingly 👑 #luxuryfashion",
    "🖤 Black outfit, golden attitude — that is the vibe ⚡ #aesthetics #fashion",
    "🌈 Colors bold, confidence bolder 💪 #colorful #fashionreels #trending",
    "👠 Heels high, standards higher — yahi meri life 💃 #girlboss #style",
    "🪄 Outfit itna fire ki mirror bhi blush kar le 🔥 #ootd #fashionblogger",
  ],
  food: [
    "🍜 Khana sirf pet nahi, soul bhi bharta hai 😍 #foodie #food #reels",
    "🔥 Ghar ka khana > sab kuch 🙌 #homefood #lifestyle #viral",
    "🌮 Life is short — eat the good stuff 🍕 #foodlover #foodgram #trending",
    "☕ Coffee, vibes, aur ek achha din — yahi chahiye 🌅 #morningvibes",
    "🍣 Jo dil mein aaye woh plate mein aana chahiye 😋 #foodphotography",
    "🌿 Healthy khao, happy raho — simple life formula 💚 #healthyfood #vibe",
    "🥘 Dadi ke haath ka khana > 5-star restaurant 🏠 #homemade #nostalgia",
    "🍰 Dessert is the answer — what was the question? 🤤 #sweet #foodie",
  ],
  viral: [
    "🔥 Yeh reel viral hone wali hai — like karo agar agree karo ✅ #viral",
    "⚡ Trending because we don't follow trends, we set them 🚀 #reels",
    "💥 Algorithm ko mat daro — content king hai 👑 #instagram #viral #trending",
    "🎯 Explore page par aana hai? Yeh try karo 💯 #instagramreels #tips",
    "🌟 Views aaye na aaye — meri energy nahi rukegi 🔥 #creator #reels",
    "📱 Jo dikhta hai woh bikta hai — isliye hum dikhte hain 😎 #socialmedia",
    "🏆 100k ka sapna hai — ek-ek like se milega 💪 #instagramgrowth #viral",
    "✨ Aaj ka content, kal ki legacy — create karo 🎬 #contentcreator",
  ],
  general: [
    "🚀 Zindagi ek baar milti hai — fully ji lo 💯 #life #viral #trending",
    "⚡ Chhoti cheezein bhi badi hoti hain jab dil laga ke karo 🌟 #mindset",
    "🌅 Har din ek naya mauqa hai — use karo 🔥 #motivation #daily #reels",
    "💫 Log kya kahenge? — yeh soch ke apna sapna mat todna 🦋 #inspiration",
    "🎯 Focus mat todna — manzil door nahi 🏆 #goals #success #viral",
    "🤍 Authenticity is the new trend — bas apne aap raho 💙 #real #genuine",
    "🌈 Mushkilein temporary hain, attitude permanent rakhna 💪 #positive",
    "✨ Shine itna karo ki log sunglasses lagayein 😎 #vibes #trending",
  ],
};

function detectCategory(topic: string): string {
  const t = topic.toLowerCase();
  if (/gym|fitness|workout|body|muscle|exercise|bodybuilding/.test(t))
    return "gym";
  if (/travel|trip|explore|vacation|tour|wanderlust|adventure/.test(t))
    return "travel";
  if (/love|pyaar|sad|dil|heart|feeling|breakup|mohabbat/.test(t))
    return "love";
  if (
    /business|money|success|motivation|hustle|grind|startup|entrepreneur/.test(
      t,
    )
  )
    return "business";
  if (/fashion|style|outfit|look|drip|swag|ootd/.test(t)) return "fashion";
  if (/food|khana|eat|lifestyle|vibe|life|coffee/.test(t)) return "food";
  if (/viral|trending|reels|insta|instagram|creator/.test(t)) return "viral";
  return "general";
}

function getRandomCaptions(category: string, count = 5): string[] {
  const pool = captionCategories[category] ?? captionCategories.general;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// --- AI Chat Logic ---

function detectLang(msg: string): "hi" | "en" | "ur" {
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(msg)) return "ur";
  if (/[\u0900-\u097F]/.test(msg)) return "hi";
  return "en";
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

// --- Types ---

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  displayText: string;
  isTyping: boolean;
}

// --- Sub-components ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs font-bold transition-all"
      style={{ color: copied ? "#22c55e" : "rgba(255,255,255,0.6)" }}
      data-ocid="ai_tools.button"
    >
      {copied ? "\u2705" : "\uD83D\uDCCB"}
    </button>
  );
}

function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  function speakText() {
    window.speechSynthesis.cancel();
    const clean = cleanText(text);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "hi-IN";
    utt.pitch = 1;
    utt.rate = 0.95;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  return (
    <button
      type="button"
      onClick={speakText}
      className="text-xs font-bold ml-1 transition-all"
      style={{ color: speaking ? "#a3e635" : "rgba(255,255,255,0.6)" }}
      data-ocid="ai_tools.button"
    >
      {speaking ? "\uD83D\uDD0A" : "\uD83D\uDD09"}
    </button>
  );
}

// --- Tab 1: Caption Generator ---

function CaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setCaptions([]);
    setTimeout(() => {
      const cat = detectCategory(topic);
      setCaptions(getRandomCaptions(cat, 5));
      setLoading(false);
      setGenerated(true);
    }, 1200);
  }

  function regenerate() {
    const cat = detectCategory(topic);
    setCaptions(getRandomCaptions(cat, 5));
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h2
          className="glow-text text-lg font-black mb-3"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          {"\uD83D\uDCA1 Caption Generator"}
        </h2>
        <p className="text-gray-400 text-xs mb-3">
          Topic likho &mdash; gym, love, travel, business kuch bhi
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="e.g. gym, travel, love, business..."
          className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(56,189,248,0.3)",
          }}
          data-ocid="ai_tools.input"
        />

        <div className="flex gap-2 flex-wrap mt-3">
          {[
            {
              label: "\uD83D\uDCAA Gym",
              value: "Gym",
              bg: "rgba(59,130,246,0.3)",
              border: "#3b82f6",
              color: "#93c5fd",
            },
            {
              label: "\u2764\uFE0F Love",
              value: "Love",
              bg: "rgba(236,72,153,0.3)",
              border: "#ec4899",
              color: "#f9a8d4",
            },
            {
              label: "\u2708\uFE0F Travel",
              value: "Travel",
              bg: "rgba(34,197,94,0.3)",
              border: "#22c55e",
              color: "#86efac",
            },
            {
              label: "\uD83D\uDCBC Business",
              value: "Business",
              bg: "rgba(245,158,11,0.3)",
              border: "#f59e0b",
              color: "#fcd34d",
            },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setTopic(s.value)}
              className="text-xs px-3 py-1 rounded-full font-bold transition-all hover:scale-105"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
              }}
              data-ocid="ai_tools.button"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="flex-1 py-2 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #ec4899)" }}
            data-ocid="ai_tools.primary_button"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                AI is thinking...
              </span>
            ) : (
              "\u2728 Generate Captions"
            )}
          </button>
          {generated && (
            <button
              type="button"
              onClick={regenerate}
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              data-ocid="ai_tools.secondary_button"
            >
              {"\uD83D\uDD04"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {captions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
            data-ocid="ai_tools.list"
          >
            {captions.map((cap, i) => (
              <motion.div
                key={cap}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4"
                data-ocid={`ai_tools.item.${i + 1}`}
              >
                <p className="text-white text-sm leading-relaxed mb-2">{cap}</p>
                <CopyButton text={cap} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab 2: AI Chat Assistant (WhatsApp-style) ---

function AIChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSpeakRef = useRef(autoSpeak);
  const initialized = useRef(false);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const welcomeMsg =
      "👋 सर Welcome!\n\n👉 Step 1: पहले ₹250 रिचार्ज करें\n👉 Step 2: अपनी सर्विस चुनें\n👉 Step 3: ऑर्डर करें 🚀\n\n💰 आपको बोनस भी मिलेगा";
    const safetyMsg =
      "💯 सर आप बिल्कुल safe हैं\n\n👉 अगर आपको सर्विस पसंद नहीं आती तो आपका पूरा पैसा (बोनस सहित) वापस मिल जाएगा 72 घंटे में\n\n👉 बिना risk के खरीद सकते हैं 🔥";
    const promoMsg =
      "🔥 सर अभी भी मौका है!\n\n👉 ₹250 डालो + ₹60 बोनस\n👉 ₹500 डालो + ₹120 बोनस\n\n👉 जितना ज्यादा डालोगे उतना फायदा 💰";

    const t1 = setTimeout(() => addAIMessage(welcomeMsg), 300);
    const t2 = setTimeout(() => addAIMessage(safetyMsg), 10000);
    const interval = setInterval(() => addAIMessage(promoMsg), 20000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToBottom() {
    setTimeout(() => {
      if (chatRef.current)
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  }

  function addAIMessage(text: string) {
    const id = `msg-${Date.now()}-${Math.random()}`;
    const msg: ChatMessage = {
      id,
      role: "ai",
      text,
      displayText: "",
      isTyping: true,
    };
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();

    let i = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                displayText: text.substring(0, i),
                isTyping: i < text.length,
              }
            : m,
        ),
      );
      scrollToBottom();
      if (i >= text.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        if (autoSpeakRef.current) {
          const clean = cleanText(text);
          const utt = new SpeechSynthesisUtterance(clean);
          utt.lang = "hi-IN";
          utt.pitch = 1;
          utt.rate = 0.95;
          window.speechSynthesis.speak(utt);
        }
      }
    }, 20);
  }

  function sendMsg() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const id = `msg-${Date.now()}-u`;
    const userMsg: ChatMessage = {
      id,
      role: "user",
      text: trimmed,
      displayText: trimmed,
      isTyping: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    scrollToBottom();
    setTimeout(() => addAIMessage(getReply(trimmed)), 500);
  }

  function quickSend(topic: string) {
    const id = `msg-${Date.now()}-u`;
    const userMsg: ChatMessage = {
      id,
      role: "user",
      text: topic,
      displayText: topic,
      isTyping: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setTimeout(() => addAIMessage(getReply(topic)), 500);
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      setInput(text);
      setTimeout(() => {
        const id = `msg-${Date.now()}-u`;
        const userMsg: ChatMessage = {
          id,
          role: "user",
          text,
          displayText: text,
          isTyping: false,
        };
        setMessages((prev) => [...prev, userMsg]);
        setTimeout(() => addAIMessage(getReply(text)), 500);
        setInput("");
      }, 100);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(14,165,233,0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              boxShadow: "0 0 15px rgba(14,165,233,0.5)",
            }}
          >
            🤖
          </div>
          <div>
            <h2
              className="text-white font-black text-sm leading-tight"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Smart AI Assistant
            </h2>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#22c55e" }}
              />
              <span className="text-xs" style={{ color: "#22c55e" }}>
                Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-speak" className="text-xs text-gray-400">
            🔊
          </Label>
          <Switch
            id="auto-speak"
            checked={autoSpeak}
            onCheckedChange={setAutoSpeak}
            data-ocid="ai_tools.switch"
          />
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        className="overflow-y-auto flex flex-col gap-2 px-3 py-3"
        style={{
          height: "52vh",
          minHeight: 260,
          background: "rgba(15,23,42,0.9)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
        }}
        data-ocid="ai_tools.panel"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mr-2 self-end mb-1"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                }}
              >
                🤖
              </div>
            )}
            <div
              className="max-w-[78%] px-3 py-2 text-sm leading-relaxed text-white"
              style={{
                background: msg.role === "user" ? "#1e293b" : "#0ea5e9",
                borderRadius:
                  msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                boxShadow:
                  msg.role === "user"
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 12px rgba(14,165,233,0.35)",
              }}
            >
              <p className="whitespace-pre-wrap">
                {cleanText(msg.displayText)}
                {msg.isTyping && <span className="animate-pulse">▌</span>}
              </p>
              {msg.role === "ai" && !msg.isTyping && (
                <div className="flex flex-col">
                  <div className="flex items-center mt-1 gap-0.5">
                    <CopyButton text={msg.text} />
                    <SpeakButton text={msg.text} />
                  </div>
                  {/रिचार्ज|recharge/i.test(msg.text) && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/";
                      }}
                      style={{
                        marginTop: "6px",
                        width: "100%",
                        padding: "6px 10px",
                        background: "linear-gradient(45deg, #3b82f6, #ec4899)",
                        border: "none",
                        borderRadius: "10px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      👉 ₹250 रिचार्ज करें
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick suggestion pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "पेंडिंग", topic: "पेंडिंग", color: "#f59e0b" },
          { label: "रिफंड", topic: "रिफंड", color: "#ef4444" },
          { label: "💪 Gym", topic: "gym", color: "#3b82f6" },
          { label: "❤️ Love", topic: "love", color: "#ec4899" },
          { label: "✈️ Travel", topic: "travel", color: "#22c55e" },
        ].map((s) => (
          <button
            key={s.topic}
            type="button"
            onClick={() => quickSend(s.topic)}
            className="text-xs px-3 py-1.5 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: `${s.color}25`,
              border: `1px solid ${s.color}60`,
              color: s.color,
            }}
            data-ocid="ai_tools.button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div
        className="flex gap-2 items-center px-2 py-2 rounded-2xl"
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(14,165,233,0.25)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Hindi, English, Urdu mein type karo..."
          className="flex-1 bg-transparent px-2 py-1 text-white text-sm outline-none placeholder-gray-500"
          data-ocid="ai_tools.input"
        />
        {/* Voice button */}
        <button
          type="button"
          onClick={startVoice}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all hover:scale-110"
          style={{
            background: isListening
              ? "linear-gradient(135deg, #ef4444, #f97316)"
              : "rgba(255,255,255,0.08)",
            border: isListening ? "none" : "1px solid rgba(255,255,255,0.15)",
            boxShadow: isListening ? "0 0 16px rgba(239,68,68,0.6)" : "none",
          }}
          data-ocid="ai_tools.button"
          title="Voice input"
        >
          🎤
        </button>
        {/* Send button */}
        <button
          type="button"
          onClick={sendMsg}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            boxShadow: "0 0 12px rgba(14,165,233,0.4)",
          }}
          data-ocid="ai_tools.primary_button"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

export function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<"caption" | "chat">("caption");

  return (
    <main
      className="max-w-[430px] mx-auto px-3 py-4 pb-24"
      data-ocid="ai_tools.section"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <h1
          className="text-2xl font-black glow-text mb-1"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          {"\u26A1 AI Tools"}
        </h1>
        <p className="text-gray-400 text-xs">
          Multi-language AI &mdash; Hindi &middot; English &middot; Urdu
        </p>
      </motion.div>

      <div
        className="flex gap-2 mb-5 p-1 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        data-ocid="ai_tools.tab"
      >
        <button
          type="button"
          onClick={() => setActiveTab("caption")}
          className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
          style={{
            background:
              activeTab === "caption"
                ? "linear-gradient(135deg, #3b82f6, #ec4899)"
                : "transparent",
            color: activeTab === "caption" ? "#fff" : "#9ca3af",
          }}
          data-ocid="ai_tools.tab"
        >
          {"\uD83D\uDCA1 Caption Generator"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
          style={{
            background:
              activeTab === "chat"
                ? "linear-gradient(135deg, #3b82f6, #ec4899)"
                : "transparent",
            color: activeTab === "chat" ? "#fff" : "#9ca3af",
          }}
          data-ocid="ai_tools.tab"
        >
          {"\uD83E\uDD16 AI Chat"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "caption" ? (
          <motion.div
            key="caption"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <CaptionGenerator />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <AIChatAssistant />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
