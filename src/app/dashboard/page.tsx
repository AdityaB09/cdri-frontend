// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type PingSample = { t: string; ms: number; ok: boolean };

const ENDPOINTS = [
  { key: "metrics", label: "metrics-overview", method: "GET", url: "/api/metrics-overview", body: null },
  { key: "aspects", label: "eda/aspects",      method: "GET", url: "/api/eda/aspects",       body: null },
  { key: "search",  label: "search",            method: "POST", url: "/api/search",            body: JSON.stringify({ query: "camera", k: 1 }) },
];

export default function DashboardPage() {
  const [series, setSeries] = useState<PingSample[]>([]);
  const good = useRef(0);
  const bad = useRef(0);
  const [bench, setBench] = useState<{ key: string; label: string; ms: number; ok: boolean }[]>([]);

  const timedFetch = async (input: RequestInfo, init?: RequestInit) => {
    const start = performance.now();
    try {
      const r = await fetch(input, { cache: "no-store", ...init });
      const ok = r.ok;
      try {
        // small read to close the body quickly
        await r.clone().json().catch(() => r.text().catch(() => ""));
      } catch {}
      return { ok, ms: Math.round(performance.now() - start) };
    } catch {
      return { ok: false, ms: Math.round(performance.now() - start) };
    }
  };

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      // status ping
      const ping = await timedFetch("/api/metrics-overview");
      if (!mounted) return;

      const label = new Date().toLocaleTimeString(undefined, { hour12: false });
      setSeries((prev) => [...prev, { t: label, ms: ping.ms, ok: ping.ok }].slice(-30));
      if (ping.ok) good.current += 1; else bad.current += 1;

      // endpoint benchmarks
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

    tick();
    const id = setInterval(tick, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const latest = series.at(-1);
  const alive = latest?.ok ?? false;

  const avgLatency = useMemo(() => {
    if (!series.length) return 0;
    return Math.round(series.reduce((a, b) => a + b.ms, 0) / series.length);
  }, [series]);

  const uptimePct = useMemo(() => {
    const g = good.current, b = bad.current, total = g + b;
    if (!total) return 0;
    return Math.round((g / total) * 1000) / 10;
  }, [latest]);

  const donut = [
    { name: "OK", value: good.current },
    { name: "FAIL", value: bad.current },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            alive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {alive ? "Backend: UP" : "Backend: DOWN"}
        </span>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-lg border p-4 lg:col-span-2">
          <div className="font-semibold mb-2">API Latency (last {series.length} pings)</div>
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

        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-2">Success vs Failure</div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} isAnimationActive={false}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-neutral-600">OK: {donut[0].value} • FAIL: {donut[1].value}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="font-semibold mb-2">Endpoint Latency (latest)</div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bench}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#525252" }} />
              <YAxis tick={{ fontSize: 10, fill: "#525252" }} />
              <Tooltip />
              <Bar dataKey="ms" isAnimationActive={false}>
                {bench.map((b) => (
                  <Cell key={b.key} fill={b.ok ? "#111827" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-neutral-600">Red bars = non-200 responses.</div>
      </div>
    </div>
  );
}
