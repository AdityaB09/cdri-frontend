// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from "recharts";

type Overview = {
  backend: string;           // "up"/"down"/"unknown"
  total_reviews: number;
  products: number;
  ok: boolean;
  synthesized: boolean;
  checks?: { health: number; eda: number; search: number };
};

type PingSample = {
  t: string;        // hh:mm:ss
  ms: number;       // latency
  ok: boolean;
};

const OK = "#10b981";     // emerald-500
const BAD = "#ef4444";    // red-500
const NEU = "#111827";    // gray-900

export default function DashboardPage() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [endpoint, setEndpoint] = useState<{ name: string; ms: number; ok: boolean }[]>([]);
  const [samples, setSamples] = useState<PingSample[]>([]);
  const [statusText, setStatusText] = useState<"UP" | "DOWN" | "UNKNOWN">("UNKNOWN");
  const okCount = samples.filter(s => s.ok).length;
  const failCount = samples.length - okCount;
  const lastMs = samples.at(-1)?.ms ?? 0;
  const avgMs = samples.length ? Math.round(samples.reduce((a, b) => a + b.ms, 0) / samples.length) : 0;
  const uptimePct = samples.length ? Math.round((okCount / samples.length) * 100) : 0;
  const ticking = useRef<NodeJS.Timeout | null>(null);

  // Format time label
  const nowLabel = () => new Date().toLocaleTimeString([], { hour12: false });

  // One unified ping that also times the call
  async function timedFetch(path: string, init?: RequestInit) {
    const t0 = performance.now();
    try {
      const r = await fetch(path, { cache: "no-store", ...init });
      const ms = Math.max(1, Math.round(performance.now() - t0));
      return { ok: r.ok, ms, resp: r };
    } catch {
      const ms = Math.max(1, Math.round(performance.now() - t0));
      return { ok: false, ms, resp: null };
    }
  }

  // Poll every 5s
  useEffect(() => {
    const poll = async () => {
      // 1) main overview proxy
      const o = await timedFetch("/api/metrics-overview");
      if (o.resp) {
        try {
          const data = (await o.resp.json()) as Overview;
          setOv(data);
          const st: "UP" | "DOWN" | "UNKNOWN" =
            data.ok ? "UP" : data.backend === "down" ? "DOWN" : "UNKNOWN";
          setStatusText(st);
        } catch {}
      }
      // 2) also time the individual proxies/endpoints you actually use
      const eda = await timedFetch("/api/eda/aspects");
      const search = await timedFetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "camera", k: 1 })
      });

      setEndpoint([
        { name: "eda/aspects", ms: eda.ms, ok: eda.ok },
        { name: "search", ms: search.ms, ok: search.ok },
      ]);

      // push sample
      setSamples(prev => {
        const nxt = [...prev, { t: nowLabel(), ms: o.ms, ok: o.ok }];
        // keep last 16
        return nxt.slice(-16);
      });
    };

    // run immediately, then every 5s
    poll();
    ticking.current = setInterval(poll, 5000);
    return () => { if (ticking.current) clearInterval(ticking.current); };
  }, []);

  const donutData = useMemo(
    () => [{ name: "OK", value: okCount }, { name: "FAIL", value: failCount }],
    [okCount, failCount]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusText === "UP" ? "bg-emerald-100 text-emerald-700"
            : statusText === "DOWN" ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700"
          }`}
        >
          Backend: {statusText}
        </span>
      </div>

      {/* headline cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Latest Latency</div>
          <div className="text-3xl font-semibold">{lastMs} ms</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Average Latency (session)</div>
          <div className="text-3xl font-semibold">{avgMs} ms</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Uptime (this session)</div>
          <div className="text-3xl font-semibold">{uptimePct}%</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Samples Collected</div>
          <div className="text-3xl font-semibold">{samples.length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Latency line */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-semibold">API Latency (last 16 pings)</div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={samples}>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, "dataMax + 100"]} />
                <Tooltip />
                <Line type="monotone" dataKey="ms" stroke={NEU} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success vs Fail donut */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-semibold">Success vs Failure</div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  <Cell fill={OK} />
                  <Cell fill={BAD} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            OK: {okCount} • FAIL: {failCount}
          </div>
        </div>
      </div>

      {/* Endpoint bars (latest) */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 font-semibold">Endpoint Latency (latest)</div>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={endpoint}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="ms"
                radius={[6, 6, 0, 0]}
                // red if non-200
                fill={NEU}
              >
                {endpoint.map((e, i) => (
                  <Cell key={i} fill={e.ok ? NEU : BAD} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-1">Red bars = non-200 responses.</div>
      </div>

      {/* Optional note about synthesized stats */}
      {ov?.synthesized && (
        <div className="text-xs text-amber-600">
          Using synthesized metrics (backend doesn’t expose /admin/stats).
        </div>
      )}
    </div>
  );
}
