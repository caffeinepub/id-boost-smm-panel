import { Rocket } from "lucide-react";
import { motion } from "motion/react";

export function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center"
        style={{
          boxShadow:
            "0 0 40px rgba(0,212,255,0.4), 0 0 80px rgba(139,92,246,0.2)",
        }}
      >
        <Rocket className="w-10 h-10 text-white" />
      </motion.div>
      <div className="text-center">
        <div className="font-display font-black text-3xl gradient-text">
          ID BOOST
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          Loading your dashboard...
        </p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
