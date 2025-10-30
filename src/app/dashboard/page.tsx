// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Recharts (dynamic to avoid SSR issues)
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });

type PingSample = { t: string; ms: number; ok: boolean };

const ENDPOINTS = [
  { key: "metrics", label: "metrics-overview", method: "GET", url: "/api/metrics-overview", body: null },
  { key: "aspects", label: "eda/aspects", method: "GET", url: "/api/eda/aspects", body: null },
  { key: "search",  label: "search", method: "POST", url: "/api/search", body: JSON.stringify({ query: "camera", k: 1 }) },
];

export default function DashboardPage() {
  // live ping series
  const [series, setSeries] = useState<PingSample[]>([]);
  // totals for donut & uptime
  const good = useRef(0);
  const bad = useRef(0);
  // last endpoint benchmark
  const [bench, setBench] = useState<{ key: string; label: string; ms: number; ok: boolean }[]>([]);

  // Ping one endpoint and measure latency
  const timedFetch = async (input: RequestInfo, init?: RequestInit) => {
    const start = performance.now();
    try {
      const r = await fetch(input, { cache: "no-store", ...init });
      const ok = r.ok;
      // Try to read body quickly (avoid large payload cost)
      try { await r.clone().json().catch(() => r.text().catch(() => "")); } catch {}
      const ms = Math.max(0, Math.round(performance.now() - start));
      return { ok, ms };
    } catch {
      const ms = Math.max(0, Math.round(performance.now() - start));
      return { ok: false, ms };
    }
  };

  // Every 5s: ping /api/metrics-overview for status + latency, and benchmark all three endpoints
  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      // Status ping
      const ping = await timedFetch("/api/metrics-overview");
      if (!mounted) return;

      const stamp = new Date();
      const label =
        stamp.toLocaleTimeString(undefined, { hour12: false })
        .split(" ")[0];

      setSeries((prev) => {
        const next = [...prev, { t: label, ms: ping.ms, ok: ping.ok }];
        // keep last 30 points
        return next.slice(-30);
      });

      if (ping.ok) good.current += 1; else bad.current += 1;

      // Endpoint benchmark (run sequentially to avoid overloading)
      const results: { key: string; label: string; ms: number; ok: boolean }[] = [];
      for (const ep of ENDPOINTS) {
        const r = await timedFetch(ep.url, {
          method: ep.method as "GET" | "POST",
          headers: ep.method === "POST" ? { "content-type": "application/json" } : undefined,
          body: ep.body ?? undefined,
        });
        results.push({ key: ep.key, label: ep.label, ms: r.ms, ok: r.ok });
      }
      if (!mounted) return;
      setBench(results);
    };

    // initial + interval
    tick();
    const id = setInterval(tick, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Derived metrics
  const latest = series.at(-1);
  const alive = latest?.ok ?? false;
  const avgLatency = useMemo(() => {
    if (series.length === 0) return 0;
    const sum = series.reduce((a, b) => a + b.ms, 0);
    return Math.round(sum / series.length);
  }, [series]);

  const uptimePct = useMemo(() => {
    const g = good.current;
    const b = bad.current;
    const total = g + b;
    if (!total) return 0;
    return Math.round((g / total) * 1000) / 10; // one decimal
  }, [latest]); // recompute when a new ping arrives

  const donut = useMemo(() => {
    const g = good.current;
    const b = bad.current;
    return [
      { name: "OK", value: g },
      { name: "FAIL", value: b },
    ];
  }, [latest]);

  const donutColors = ["#22c55e", "#ef4444"]; // green / red

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          alive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {alive ? "Backend: UP" : "Backend: DOWN"}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-600">Latest Latency</div>
          <div className="text-3xl font-semibold">{latest ? `${latest.ms} ms` : "—"}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-600">Average Latency (session)</div>
          <div className="text-3xl font-semibold">{avgLatency} ms</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-600">Uptime (this session)</div>
          <div className="text-3xl font-semibold">{uptimePct}%</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-600">Samples Collected</div>
          <div className="text-3xl font-semibold">{series.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Trend */}
        <div className="rounded-lg border p-4 lg:col-span-2">
          <div className="font-semibold mb-2">API Latency (last {series.length || 0} pings)</div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#525252" }} />
                <YAxis tick={{ fontSize: 10, fill: "#525252" }} />
                <Tooltip />
                <Line type="monotone" dataKey="ms" stroke="#111827" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success vs Failure */}
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-2">Success vs Failure</div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  isAnimationActive={false}
                >
                  {donut.map((entry, i) => (
                    <Cell key={entry.name} fill={donutColors[i % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-neutral-600">
            OK: {donut[0].value} • FAIL: {donut[1].value}
          </div>
        </div>
      </div>

      {/* Endpoint Benchmarks */}
      <div className="rounded-lg border p-4">
        <div className="font-semibold mb-2">Endpoint Latency (latest sample)</div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bench}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#525252" }} />
              <YAxis tick={{ fontSize: 10, fill: "#525252" }} />
              <Tooltip />
              <Bar dataKey="ms" isAnimationActive={false}>
                {bench.map((b, idx) => (
                  <Cell key={b.key} fill={b.ok ? "#111827" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-neutral-600">
          Bars in red indicate non-200 responses.
        </div>
      </div>
    </div>
  );
}
