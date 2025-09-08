"use client";
import { useState } from "react";
import { FaGavel, FaFilePdf, FaChevronDown, FaChevronUp, FaEnvelope } from "react-icons/fa";


const legalSections = [
  {
    key: "terms",
    label: "Terms of Use",
    pdf: "/legal/terms.pdf",
    content: [
      {
        title: "Welcome to Staqk!",
        body: "By using our platform, you agree to these terms. Please read carefully. (This is a summary; see full PDF for details.)",
      },
      {
        title: "1. Account Eligibility",
        body: "You must be at least 18 years old and provide accurate information to open an account.",
      },
      {
        title: "2. User Responsibilities",
        body: "You’re responsible for keeping your credentials safe. Do not share your password or let others use your account.",
      },
      {
        title: "3. Prohibited Conduct",
        body: "No illegal activity, spamming, or abusing other users. See full list in the PDF.",
      },
      // ...add more sections
    ],
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    pdf: "/legal/privacy.pdf",
    content: [
      {
        title: "Your Privacy Matters",
        body: "We protect your data with state-of-the-art security. See below for what we collect, how we use it, and your rights.",
      },
      {
        title: "1. Information We Collect",
        body: "Personal info (name, email), device data, and usage activity. See the full PDF for a complete list.",
      },
      {
        title: "2. How We Use Information",
        body: "For account security, regulatory compliance, and service improvement.",
      },
      {
        title: "3. Sharing Your Information",
        body: "We don’t sell your data. We only share with trusted vendors and regulators as required.",
      },
    ],
  },
  {
    key: "cookies",
    label: "Cookies",
    pdf: "/legal/cookies.pdf",
    content: [
      {
        title: "Cookies Policy",
        body: "We use cookies for site security, personalization, and analytics. You can manage cookies in your browser settings.",
      },
      {
        title: "1. Types of Cookies",
        body: "Essential, performance, and marketing cookies. See full details in our policy.",
      },
      {
        title: "2. Disabling Cookies",
        body: "Most browsers let you refuse some or all cookies, but site functionality may be affected.",
      },
    ],
  },
  {
    key: "disclosures",
    label: "Disclosures",
    pdf: "/legal/disclosures.pdf",
    content: [
      {
        title: "Disclosures & Notices",
        body: "Our service is not a bank. Investments are subject to market risk. Not FDIC/NDIC insured.",
      },
      {
        title: "1. Risk Notice",
        body: "Past performance is not a guarantee of future results. Invest responsibly.",
      },
      {
        title: "2. Regulatory Info",
        body: "We comply with all relevant financial regulations. For more, see our full legal disclosures.",
      },
    ],
  },
];

export default function LegalPage() {
  const [selectedTab, setSelectedTab] = useState(legalSections[0].key);
  const [openSection, setOpenSection] = useState({});

  const activeSection = legalSections.find(sec => sec.key === selectedTab);

  function toggleAccordion(idx) {
    setOpenSection((prev) => ({
      ...prev,
      [selectedTab]: prev[selectedTab] === idx ? null : idx,
    }));
  }

  return (
    <main className="bg-[#10141c] min-h-screen px-0 py-0">
      {/* Hero */}
      <section className="w-full px-4 pt-7 pb-3 bg-gradient-to-tr from-blue-800/80 to-blue-500/60 shadow-lg">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <FaGavel className="text-4xl text-white mb-2" />
          <h1 className="text-3xl font-bold text-white">Legal & Compliance Center</h1>
          <p className="text-white/80 max-w-xl text-center">
            Our policies are designed to keep you and your data safe, and to comply with all regulations. Browse the sections, download PDFs, or contact us for legal help.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <nav className="w-full max-w-2xl mx-auto px-4 flex gap-2 mt-8 mb-4 sticky top-0 z-10 bg-[#10141c]">
        {legalSections.map((section) => (
          <button
            key={section.key}
            className={`px-4 py-2 rounded-t-lg text-base font-semibold
              ${selectedTab === section.key ? "bg-blue-700 text-white shadow" : "bg-[#222842] text-gray-300"}
              transition`}
            onClick={() => setSelectedTab(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Main Section Content */}
      <section className="max-w-2xl mx-auto px-4 py-5 mb-16">
        {/* PDF download */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-xl text-white">{activeSection.label}</span>
          <a
            href={activeSection.pdf}
            download
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-800 text-white text-sm hover:bg-blue-900 transition"
          >
            <FaFilePdf /> Download PDF
          </a>
        </div>

        {/* Accordion for each section */}
        <div className="flex flex-col gap-3">
          {activeSection.content.map((item, idx) => (
            <div key={idx} className="bg-[#181d29] rounded-lg">
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-left text-white font-semibold"
                onClick={() => toggleAccordion(idx)}
              >
                {item.title}
                {openSection[selectedTab] === idx
                  ? <FaChevronUp className="ml-3" />
                  : <FaChevronDown className="ml-3" />}
              </button>
              {openSection[selectedTab] === idx && (
                <div className="px-5 pb-4 text-white/80 text-sm">{item.body}</div>
              )}
            </div>
          ))}
        </div>

        {/* Legal Contact */}
        <div className="mt-12 bg-[#222842] rounded-xl p-6 flex flex-col items-center gap-2 shadow">
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <FaEnvelope className="text-blue-400" /> Legal Questions?
          </span>
          <p className="text-white/80 text-sm text-center">
            Email our compliance team: <a href="mailto:legal@staqk.com" className="underline text-blue-400">legal@staqk.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
