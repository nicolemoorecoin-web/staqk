"use client";
import Link from "next/link";
import { FaQuestionCircle } from "react-icons/fa";
import { FiHelpCircle, FiMessageCircle, FiInfo } from "react-icons/fi";

export default function SupportPage() {
  return (
    <main className="bg-[#10141c] min-h-screen p-4">
      <h1 className="text-white text-2xl font-bold mb-6">Support & Community</h1>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <QuickLink
          href="/support/help-center"
          icon={<FiHelpCircle />}
          label="Help Center"
          description="Find answers to common questions and troubleshooting steps."
        />
        <QuickLink
          href="/support/live-chat"
          icon={<FiMessageCircle />}
          label="Live Chat"
          description="Chat with our support team in real-time."
        />
        <QuickLink
          href="/support/announcements"
          icon={<FiInfo />}
          label="Announcements"
          description="Stay updated on system changes and new features."
        />
      </section>

      {/* FAQ Section */}
      <section className="max-w-xl mx-auto mb-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaQuestionCircle className="text-blue-400" /> Frequently Asked Questions
        </h2>
        <FAQ
          question="How do I reset my password?"
          answer="Go to Profile → Settings → Reset Password, then follow the prompts. If you’re locked out, use the contact form above."
        />
        <FAQ
          question="Where can I see my transaction history?"
          answer="Navigate to the Reports or Account page to view and download your full transaction log."
        />
        <FAQ
          question="How fast is customer support?"
          answer="Live chat is 24/7. Email and calls are answered within a few hours on business days."
        />
      </section>
    </main>
  );
}

// --- Reusable Components ---
function QuickLink({ href, icon, label, description }) {
  return (
    <Link
      href={href}
      className="bg-[#181d29] rounded-xl p-5 flex flex-col items-center shadow hover:bg-blue-900/40 transition"
    >
      <div className="text-blue-400 text-3xl mb-2">{icon}</div>
      <div className="text-white font-bold mb-1">{label}</div>
      <div className="text-gray-300 text-center text-sm">{description}</div>
    </Link>
  );
}

function FAQ({ question, answer }) {
  return (
    <details className="mb-3 bg-[#181d29] p-4 rounded-lg group">
      <summary className="text-white font-semibold cursor-pointer focus:outline-none group-open:text-blue-400">
        {question}
      </summary>
      <p className="text-white/80 mt-2 text-sm">{answer}</p>
    </details>
  );
}