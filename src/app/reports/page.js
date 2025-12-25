// src/app/reports/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

/* ---------------- utils ---------------- */
function money(n) {
  const v = Number(n || 0);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

/* ---------------- charts (pure SVG) ---------------- */
function LineChart({
  data = [], // [{date, value}]
  height = 160,
  padding = 18,
}) {
  // data points: use value, x is index
  const values = data.map((d) => Number(d.value) || 0);
  const labels = data.map((d) => d.date);

  const w = 1000; // viewbox width for crispness
  const h = height;

  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const span = max - min || 1;

  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const xFor = (i) => padding + (values.length <= 1 ? 0 : (i / (values.length - 1)) * innerW);
  const yFor = (v) => padding + (1 - (v - min) / span) * innerH;

  const pts = values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");

  const last = values.length ? values[values.length - 1] : 0;
  const first = values.length ? values[0] : 0;
  const change = last - first;

  // gradient area under the line
  const area =
    values.length >= 2
      ? `${pts} ${xFor(values.length - 1)},${h - padding} ${xFor(0)},${h - padding}`
      : "";

  // 4 y ticks
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }).map((_, i) => {
    const t = min + (span * i) / ticks;
    return t;
  });

  // show a couple x labels (first/mid/last)
  const xLabelIdxs =
    labels.length <= 1
      ? [0]
      : labels.length === 2
      ? [0, 1]
      : [0, Math.floor(labels.length / 2), labels.length - 1];

  return (
    <div className="rounded-xl bg-[#20293d] border border-white/5 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-sm text-gray-300">
          Net (SUCCESS) flow •{" "}
          <span className={change >= 0 ? "text-emerald-300" : "text-red-300"}>
            {change >= 0 ? "+" : "-"}
            {money(Math.abs(change))}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {values.length ? `${labels[0]} → ${labels[labels.length - 1]}` : "No data"}
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
        <defs>
          <linearGradient id="staqk_line_fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.00)" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {tickVals.map((tv, i) => {
          const y = yFor(tv);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={w - padding} y2={y} stroke="rgba(255,255,255,0.06)" />
              <text
                x={padding}
                y={y - 6}
                fill="rgba(255,255,255,0.45)"
                fontSize="22"
              >
                {money(tv)}
              </text>
            </g>
          );
        })}

        {/* area */}
        {values.length >= 2 && (
          <polygon points={area} fill="url(#staqk_line_fill)" />
        )}

        {/* line */}
        {values.length >= 2 && (
          <polyline
            points={pts}
            fill="none"
            stroke="rgba(59,130,246,0.95)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* last dot */}
        {values.length >= 1 && (
          <circle
            cx={xFor(values.length - 1)}
            cy={yFor(values[values.length - 1])}
            r="10"
            fill="rgba(59,130,246,1)"
          />
        )}

        {/* x labels */}
        {xLabelIdxs
          .filter((i) => labels[i])
          .map((i) => (
            <text
              key={i}
              x={xFor(i)}
              y={h - 6}
              fill="rgba(255,255,255,0.45)"
              fontSize="22"
              textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            >
              {labels[i]}
            </text>
          ))}

        {/* empty state */}
        {!values.length && (
          <text
            x={w / 2}
            y={h / 2}
            fill="rgba(255,255,255,0.35)"
            fontSize="26"
            textAnchor="middle"
          >
            No chart data for this filter
          </text>
        )}
      </svg>
    </div>
  );
}

function DonutChart({
  segments = [], // [{ label, value }]
  size = 170,
  stroke = 18,
}) {
  const total = segments.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  const colors = [
    "rgba(59,130,246,0.95)",  // blue
    "rgba(16,185,129,0.95)",  // green
    "rgba(244,114,182,0.95)", // pink
    "rgba(251,191,36,0.95)",  // yellow
    "rgba(167,139,250,0.95)", // purple
  ];

  let acc = 0;

  return (
    <div className="rounded-xl bg-[#20293d] border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-300">Allocation</div>
        <div className="text-xs text-gray-400">Total: {money(total)}</div>
      </div>

      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />

          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {segments.map((s, i) => {
              const v = Number(s.value) || 0;
              const pct = v / total;
              const dash = C * pct;
              const gap = C - dash;

              const dashOffset = C * (1 - acc / total);
              acc += v;

              return (
                <circle
                  key={s.label}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* center label */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="700"
          >
            {money(total)}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.55)"
            fontSize="14"
          >
            portfolio
          </text>
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((s, i) => {
            const v = Number(s.value) || 0;
            const pct = Math.round((v / total) * 100);
            return (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ background: colors[i % colors.length] }}
                  />
                  <span className="text-gray-200">{s.label}</span>
                </div>
                <div className="text-gray-300">
                  {money(v)} <span className="text-gray-500">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function ReportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [asset, setAsset] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);
  const [assets, setAssets] = useState(["All"]);
  const [statuses, setStatuses] = useState(["All", "PENDING", "SUCCESS", "FAILED"]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    investmentsPnl: 0,
    topAsset: "—",
  });

  const [series, setSeries] = useState([]); // earnings over time
  const [allocation, setAllocation] = useState({ cash: 0, crypto: 0, staking: 0, investments: 0 });

  // fetch reports
  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const qs = new URLSearchParams();
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        if (asset) qs.set("asset", asset);
        if (status) qs.set("status", status);

        const r = await fetch(`/api/reports?${qs.toString()}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));

        if (!alive) return;
        if (!r.ok || !j.ok) throw new Error(j.error || "Failed to load reports");

        setRows(Array.isArray(j.rows) ? j.rows : []);
        setAssets(Array.isArray(j.assets) ? j.assets : ["All"]);
        setStatuses(Array.isArray(j.statuses) ? j.statuses : ["All", "PENDING", "SUCCESS", "FAILED"]);
        setStats(j.stats || { totalBalance: 0, investmentsPnl: 0, topAsset: "—" });

        setSeries(Array.isArray(j.series) ? j.series : []);
        setAllocation(j.allocation || { cash: 0, crypto: 0, staking: 0, investments: 0 });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Could not load reports");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [from, to, asset, status]);

  const filteredLabel = useMemo(() => {
    const parts = [];
    if (from) parts.push(`from ${from}`);
    if (to) parts.push(`to ${to}`);
    if (asset && asset !== "All") parts.push(`asset ${asset}`);
    if (status && status !== "All") parts.push(`status ${status}`);
    return parts.length ? parts.join(" · ") : "All activity";
  }, [from, to, asset, status]);

  function handleExportCSV() {
    const header = ["Date", "Type", "Asset", "Amount", "Status", "Title", "Network", "Notes"];
    const lines = [header.join(",")];

    for (const r of rows) {
      lines.push(
        [
          csvEscape(r.dateLabel),
          csvEscape(r.type),
          csvEscape(r.asset),
          csvEscape(r.amount),
          csvEscape(r.status),
          csvEscape(r.title),
          csvEscape(r.network),
          csvEscape(r.notes),
        ].join(",")
      );
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `staqk-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // baseline PDF export
  function handleExportPDF() {
    window.print();
  }

  const prettyStatus = (s) => {
    if (s === "SUCCESS") return "Successful";
    if (s === "PENDING") return "Pending";
    if (s === "FAILED") return "Failed";
    return String(s || "—");
  };

  const donutSegments = useMemo(() => {
    // Option A mirror: Earn is a UI mirror of Investments. For allocation we show the real buckets.
    return [
      { label: "Crypto", value: Number(allocation.crypto || 0) },
      { label: "Cash", value: Number(allocation.cash || 0) },
      { label: "Staking", value: Number(allocation.staking || 0) },
      { label: "Investments", value: Number(allocation.investments || 0) },
    ];
  }, [allocation]);

  return (
    <main className="bg-[#10141c] min-h-screen px-2 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">📈</span> Reports
        </h1>

        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-900 transition disabled:opacity-60"
            disabled={loading}
          >
            <FaFileCsv /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-900 transition disabled:opacity-60"
            disabled={loading}
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-3 bg-[#181d29] p-4 rounded-xl">
        <div>
          <label className="text-xs text-gray-400 block mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded px-2 py-1 bg-[#23263a] text-white border-none outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded px-2 py-1 bg-[#23263a] text-white border-none outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="rounded px-2 py-1 bg-[#23263a] text-white"
          >
            {assets.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded px-2 py-1 bg-[#23263a] text-white"
          >
            {statuses.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "SUCCESS"
                  ? "Successful"
                  : opt === "PENDING"
                  ? "Pending"
                  : opt === "FAILED"
                  ? "Failed"
                  : opt}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <FiFilter />
          {loading ? "Loading…" : filteredLabel}
        </div>
      </div>

      {err ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {err}
        </div>
      ) : null}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <ReportStat label="Total Balance" value={money(stats.totalBalance)} />
        <ReportStat
          label="Investments P&L (current)"
          value={money(stats.investmentsPnl)}
          accent={Number(stats.investmentsPnl) >= 0 ? "text-green-400" : "text-red-300"}
        />
        <ReportStat label="Top Asset" value={stats.topAsset || "—"} accent="text-yellow-400" />
      </div>

      {/* ✅ REAL Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#181d29] rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-3">Earnings Over Time</div>
          <LineChart data={series} />
        </div>

        <div className="bg-[#181d29] rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-3">Asset Allocation</div>
          <DonutChart segments={donutSegments} />
        </div>
      </div>

      {/* Recent Activity Table */}
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
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No results match your filter.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <ReportRow
                  key={row.id}
                  date={row.dateLabel}
                  type={row.type}
                  asset={row.asset}
                  amount={row.amount}
                  status={prettyStatus(row.status)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

/* ---------------- small components ---------------- */
function ReportStat({ label, value, accent = "text-blue-400" }) {
  return (
    <div className="bg-[#181d29] rounded-xl p-6 flex flex-col items-start shadow">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function ReportRow({ date, type, asset, amount, status }) {
  const amt = Number(amount || 0);
  const amtLabel =
    typeof amount === "number"
      ? (amt < 0 ? "-" : "+") +
        (asset === "USD" ? money(Math.abs(amt)) : Math.abs(amt).toLocaleString())
      : String(amount);

  return (
    <tr className="border-b border-[#23263a] last:border-none">
      <td className="py-2 whitespace-nowrap">{date}</td>
      <td className="py-2 whitespace-nowrap">{type}</td>
      <td className="py-2 whitespace-nowrap">{asset}</td>
      <td className="py-2 whitespace-nowrap">{amtLabel}</td>
      <td className="py-2 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === "Successful"
              ? "bg-green-700 text-green-300"
              : status === "Pending"
              ? "bg-yellow-700 text-yellow-300"
              : "bg-red-700 text-red-200"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
