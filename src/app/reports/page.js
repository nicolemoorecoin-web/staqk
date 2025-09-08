"use client";
import { useState } from "react";
import { FaDownload, FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiSearch, FiFilter } from "react-icons/fi";

// === DEMO DATA ===
const ALL_DATA = [
  { date: "2025-08-03", type: "Deposit", asset: "USDT", amount: "+$1,000", status: "Successful" },
  { date: "2025-08-02", type: "Withdrawal", asset: "BTC", amount: "-0.05", status: "Pending" },
  { date: "2025-08-01", type: "Trade", asset: "ETH", amount: "+1.25", status: "Completed" },
  { date: "2025-07-30", type: "Deposit", asset: "AAPL", amount: "+$7,000", status: "Successful" },
  { date: "2025-07-28", type: "Trade", asset: "TSLA", amount: "+0.5", status: "Completed" },
  // ...more demo data
];

export default function ReportPage() {
  // === State for Filters ===
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [asset, setAsset] = useState("All");
  const [status, setStatus] = useState("All");

  // === Filter Logic ===
  const filteredData = ALL_DATA.filter((row) => {
    const dateOk =
      (!from || row.date >= from) && (!to || row.date <= to);
    const assetOk = asset === "All" || row.asset === asset;
    const statusOk = status === "All" || row.status === status;
    return dateOk && assetOk && statusOk;
  });

  // === Unique Asset List (for filter dropdown) ===
  const assetOptions = ["All", ...Array.from(new Set(ALL_DATA.map(row => row.asset)))];
  const statusOptions = ["All", "Successful", "Pending", "Completed"];

  // === Export Functions (CSV/PDF placeholders) ===
  function handleExportCSV() {
    alert("Export to CSV clicked! (Integrate with a real CSV export lib for production)");
  }
  function handleExportPDF() {
    alert("Export to PDF clicked! (Integrate with a real PDF export lib for production)");
  }

  return (
    <main className="bg-[#10141c] min-h-screen px-2 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">📈</span> Reports
        </h1>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-900 transition">
            <FaFileCsv /> Export CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-900 transition">
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-8 bg-[#181d29] p-4 rounded-xl">
        <div>
          <label className="text-xs text-gray-400 block mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded px-2 py-1 bg-[#23263a] text-white border-none outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded px-2 py-1 bg-[#23263a] text-white border-none outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Asset</label>
          <select value={asset} onChange={e => setAsset(e.target.value)} className="rounded px-2 py-1 bg-[#23263a] text-white">
            {assetOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="rounded px-2 py-1 bg-[#23263a] text-white">
            {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <ReportStat label="Total Balance" value="$32,400" />
        <ReportStat label="This Month's Earnings" value="+$2,150" accent="text-green-400" />
        <ReportStat label="Top Asset" value="BTC" accent="text-yellow-400" />
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#181d29] rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-2">Earnings Over Time</div>
          <div className="h-40 bg-[#20293d] rounded-lg flex items-center justify-center text-gray-400">[Earnings Chart]</div>
        </div>
        <div className="bg-[#181d29] rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-2">Asset Allocation</div>
          <div className="h-40 bg-[#20293d] rounded-lg flex items-center justify-center text-gray-400">[Pie Chart]</div>
        </div>
      </div>

      {/* Professional Recent Activity Table */}
      <div className="bg-[#181d29] rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-white">Recent Activity</div>
          <button className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white text-sm transition">
            <FiFilter /> Advanced Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-[#23263a]">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Asset</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">No results match your filter.</td>
                </tr>
              )}
              {filteredData.map((row, idx) => (
                <ReportRow key={idx} {...row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// === Card component for stats ===
function ReportStat({ label, value, accent = "text-blue-400" }) {
  return (
    <div className="bg-[#181d29] rounded-xl p-6 flex flex-col items-start shadow">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

// === Table row for activity ===
function ReportRow({ date, type, asset, amount, status }) {
  return (
    <tr className="border-b border-[#23263a] last:border-none">
      <td className="py-2 whitespace-nowrap">{date}</td>
      <td className="py-2 whitespace-nowrap">{type}</td>
      <td className="py-2 whitespace-nowrap">{asset}</td>
      <td className="py-2 whitespace-nowrap">{amount}</td>
      <td className="py-2 whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs ${status === "Successful"
          ? "bg-green-700 text-green-300"
          : status === "Pending"
            ? "bg-yellow-700 text-yellow-300"
            : "bg-blue-700 text-blue-300"
          }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
