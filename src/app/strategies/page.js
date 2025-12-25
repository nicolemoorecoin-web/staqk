"use client";
import { useMemo, useState } from "react";
import { useAppPrefs } from "../components/AppPrefsProvider";
import { FaCrown, FaChartLine, FaQuestionCircle } from "react-icons/fa";

const strategiesData = [
  {
    id: 1,
    name: "Dynamic Hedged Arbitrage",
    tag: "Crypto",
    description: "Capture price gaps with minimized risk. Designed for medium-high capital investors.",
    stats: "+17.5% YTD",
    highlight: true,
    chart: "/charts/strat1.png",
  },
  {
    id: 2,
    name: "Cross-Asset Diversification",
    tag: "Mixed",
    description: "Balance crypto, stocks, and metals for smoother, more consistent returns.",
    stats: "+9.8% YTD",
    highlight: false,
    chart: "/charts/strat2.png",
  },
  {
    id: 3,
    name: "Algorithmic Swing Portfolio",
    tag: "Stocks",
    description: "Quant-driven, high-probability trades based on deep technicals and macro signals.",
    stats: "+12.2% YTD",
    highlight: false,
    chart: "/charts/strat3.png",
  },
  {
    id: 4,
    name: "Stable Yield Strategy",
    tag: "Crypto",
    description: "Generate passive income from stablecoins, staking, and lending. Lower volatility.",
    stats: "+7.3% YTD",
    highlight: false,
    chart: "/charts/strat4.png",
  },
];

const tags = ["All", "Crypto", "Stocks", "Mixed"];

const TXT = {
  en: {
    title: "Advanced Strategies",
    desc: "Tap into expert-managed, battle-tested strategies to grow, preserve, or protect your wealth. Choose your risk level, diversify easily, and monitor your progress—all in one app.",
    getStarted: "Get Started",
    featured: "Featured",
    viewDetails: "View Details",
    simulate: "Simulate",
    faqQ: "What is a managed strategy?",
    faqA: "A managed strategy is an investment approach where an expert (or algorithm) handles all the trades, balancing risk and opportunity, so you don’t have to.",
  },
  fr: {
    title: "Stratégies avancées",
    desc: "Accédez à des stratégies gérées par des experts pour faire croître, préserver ou protéger votre patrimoine. Choisissez votre niveau de risque et suivez tout dans une seule app.",
    getStarted: "Commencer",
    featured: "En vedette",
    viewDetails: "Voir détails",
    simulate: "Simuler",
    faqQ: "Qu’est-ce qu’une stratégie gérée ?",
    faqA: "Une stratégie gérée est une approche où un expert (ou un algorithme) effectue les opérations et gère le risque pour vous.",
  },
  es: {
    title: "Estrategias avanzadas",
    desc: "Estrategias gestionadas por expertos para crecer, preservar o proteger tu capital. Elige tu nivel de riesgo, diversifica y monitorea todo en una sola app.",
    getStarted: "Empezar",
    featured: "Destacada",
    viewDetails: "Ver detalles",
    simulate: "Simular",
    faqQ: "¿Qué es una estrategia gestionada?",
    faqA: "Es un enfoque donde un experto (o algoritmo) gestiona operaciones y riesgo para que tú no tengas que hacerlo.",
  },
  de: {
    title: "Erweiterte Strategien",
    desc: "Nutze expertengesteuerte Strategien, um Vermögen aufzubauen, zu bewahren oder zu schützen. Wähle dein Risiko, diversifiziere und behalte alles in einer App im Blick.",
    getStarted: "Loslegen",
    featured: "Empfohlen",
    viewDetails: "Details ansehen",
    simulate: "Simulieren",
    faqQ: "Was ist eine verwaltete Strategie?",
    faqA: "Eine verwaltete Strategie bedeutet, dass ein Experte (oder Algorithmus) Trades und Risiko für dich steuert.",
  },
  ar: {
    title: "استراتيجيات متقدمة",
    desc: "استفد من استراتيجيات مُدارة من خبراء لتنمية أو حماية ثروتك. اختر مستوى المخاطرة وراقب الأداء داخل تطبيق واحد.",
    getStarted: "ابدأ الآن",
    featured: "مميزة",
    viewDetails: "عرض التفاصيل",
    simulate: "محاكاة",
    faqQ: "ما هي الاستراتيجية المُدارة؟",
    faqA: "هي أسلوب استثماري يديره خبير (أو خوارزمية) لتنفيذ الصفقات وإدارة المخاطر بدلًا منك.",
  },
  zh: {
    title: "高级策略",
    desc: "使用专家管理的策略来增长、保值或保护资产。选择风险等级、轻松分散，并在一个应用里跟踪进度。",
    getStarted: "开始",
    featured: "精选",
    viewDetails: "查看详情",
    simulate: "模拟",
    faqQ: "什么是托管策略？",
    faqA: "托管策略是由专家（或算法）负责交易与风险管理，你无需亲自操作。",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

export default function StrategiesPage() {
  const { language } = useAppPrefs();
  const L = useMemo(() => TXT[pickLang(language)], [language]);

  const [activeTag, setActiveTag] = useState("All");
  const strategies = activeTag === "All"
    ? strategiesData
    : strategiesData.filter((s) => s.tag === activeTag);

  return (
    <main className="bg-[#12141c] min-h-screen py-0 px-0">
      {/* Hero */}
      <section className="px-4 pt-7 pb-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-2xl p-6 mb-7 shadow-lg flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-white">
            <FaCrown className="text-yellow-300 text-2xl" />
            <h1 className="text-2xl sm:text-3xl font-bold">{L.title}</h1>
          </div>
          <p className="text-white/80 max-w-md text-lg">{L.desc}</p>
          <button className="mt-2 px-6 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">
            {L.getStarted}
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex gap-3 pb-2">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                activeTag === tag
                  ? "bg-blue-700 text-white shadow"
                  : "bg-white/10 text-white/70 hover:bg-blue-800/60"
              } transition`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-2xl mx-auto px-4 grid gap-6 mb-14">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className={`relative rounded-2xl p-5 bg-[#181f2e] shadow-xl border border-[#262b3a]/40 flex flex-col gap-3 overflow-hidden ${
              strat.highlight ? "ring-2 ring-blue-500/60" : ""
            }`}
          >
            {strat.highlight && (
              <span className="absolute top-3 right-3 flex items-center bg-yellow-300 text-blue-800 font-bold text-xs px-2 py-0.5 rounded">
                <FaCrown className="mr-1 text-yellow-400" />
                {L.featured}
              </span>
            )}

            <div className="flex items-center gap-3 mb-1">
              <div className="text-blue-500/80 bg-blue-900/60 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider">
                {strat.tag}
              </div>
              <span className="text-green-400 text-xs font-mono bg-green-900/10 px-2 py-1 rounded">
                {strat.stats}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
              <FaChartLine className="inline text-blue-400" /> {strat.name}
            </h2>

            <p className="text-white/80 mb-2">{strat.description}</p>

            <img
              src={strat.chart}
              alt="Strategy Chart"
              className="w-full h-[72px] object-contain rounded bg-[#151b29] mb-1"
            />

            <div className="flex gap-2 mt-2">
              <button className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-1.5 rounded font-semibold transition">
                {L.viewDetails}
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-1.5 rounded font-semibold">
                {L.simulate}
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 mb-24">
        <details className="bg-[#181f2e] p-4 rounded-lg mb-2">
          <summary className="text-white font-semibold flex items-center gap-2 cursor-pointer">
            <FaQuestionCircle /> {L.faqQ}
          </summary>
          <p className="text-white/70 mt-2 text-sm">{L.faqA}</p>
        </details>
      </section>
    </main>
  );
}
