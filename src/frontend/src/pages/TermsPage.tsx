import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

const termsSections = [
  {
    title: "1. Service Usage",
    icon: "🛡️",
    points: [
      "ID BOOST provides social media growth services for entertainment and marketing purposes only.",
      "You must be at least 18 years old or have parental consent to use our services.",
      "You agree not to use our platform for any illegal or unauthorized purpose.",
    ],
  },
  {
    title: "2. Delivery Policy",
    icon: "🚀",
    points: [
      "Orders begin processing within 0\u201324 hours of placement and payment confirmation.",
      "Delivery time varies by service type, quantity, and platform algorithm conditions.",
      "We are not responsible for delays caused by platform changes or external API disruptions.",
    ],
  },
  {
    title: "3. Refund Policy",
    icon: "💰",
    points: [
      "Refunds are only issued if the service was not delivered within the stated timeframe.",
      "Partial refunds may be offered if partial delivery occurred and cannot be completed.",
      "Refund requests must be submitted within 7 days of the original order date via Help Center.",
    ],
  },
  {
    title: "4. Account Safety",
    icon: "🔒",
    points: [
      "We never ask for your social media passwords \u2014 only public profile links are required.",
      "You are solely responsible for keeping your ID BOOST account credentials secure.",
    ],
  },
  {
    title: "5. Order Responsibility",
    icon: "📦",
    points: [
      "Ensure all order details (profile link, quantity, service type) are correct before submitting.",
      "ID BOOST is not liable for orders placed on incorrect or private accounts.",
    ],
  },
  {
    title: "6. Payment Terms",
    icon: "💳",
    points: [
      "All payments are final once a service order has been initiated and processing has begun.",
      "Wallet top-ups via UPI require admin approval before the balance is credited to your account.",
    ],
  },
  {
    title: "7. Prohibited Usage",
    icon: "🚫",
    points: [
      "You may not attempt to reverse-engineer, scrape, or abuse any part of the ID BOOST platform.",
      "Any fraudulent activity, chargebacks, or abuse of the refund policy will result in account suspension.",
    ],
  },
  {
    title: "8. Changes to Terms",
    icon: "📋",
    points: [
      "ID BOOST reserves the right to update these Terms of Service at any time without prior notice. Continued use of the platform constitutes acceptance of the updated terms.",
    ],
  },
];

export function TermsPage() {
  return (
    <main className="max-w-[480px] mx-auto px-3 py-4 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
        data-ocid="terms.section"
      >
        <h1
          className="text-2xl font-black glow-text mb-2"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
        >
          💎 ID BOOST \u2013 Terms of Service
        </h1>
        <p className="text-gray-400 text-sm">
          Please read these terms carefully before using our platform.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-3">
        {termsSections.map((section, sIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sIdx * 0.07, duration: 0.4 }}
            className="glass-card p-5"
            data-ocid="terms.panel"
          >
            <h2
              className="text-base font-bold mb-3 flex items-center gap-2"
              style={{
                color: "#38bdf8",
                textShadow: "0 0 10px rgba(56,189,248,0.4)",
                fontFamily: "Bricolage Grotesque, sans-serif",
              }}
            >
              <span>{section.icon}</span>
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed"
                >
                  <span
                    className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#38bdf8",
                      boxShadow: "0 0 6px #38bdf8",
                    }}
                  />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.4 }}
        className="glass-card p-5 mt-4 text-center"
        data-ocid="terms.card"
      >
        <p className="text-sm text-gray-300">
          💬 For any issues, contact us via{" "}
          <span
            className="text-blue-400 font-semibold"
            style={{ textShadow: "0 0 8px rgba(56,189,248,0.4)" }}
          >
            Help Center
          </span>{" "}
          or{" "}
          <span
            className="text-pink-400 font-semibold"
            style={{ textShadow: "0 0 8px rgba(244,114,182,0.4)" }}
          >
            Tickets
          </span>
          .
        </p>
      </motion.div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-5 text-center"
      >
        <Link
          to="/profile"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
          data-ocid="terms.link"
        >
          \u2190 Back to Profile
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-gray-600 mt-6"
      >
        \u00a9 ID BOOST \u2013 All Rights Reserved
      </motion.p>
    </main>
  );
}
