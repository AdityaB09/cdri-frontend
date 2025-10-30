// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// re-use your components
import MetricCards from "@/components/MetricCards";
const EDAChartPainPoints = dynamic(() => import("@/components/EDAChartPainPoints"), { ssr: false });
const EDAChartBubble = dynamic(() => import("@/components/EDAChartBubble"), { ssr: false });

type Metrics = {
  backend?: string;              // e.g., "ok" or version string
  total_reviews?: number;        // integer
  products?: number;             // integer
};

type AspectRow = {
  aspect: string;
  mentions: number;
  avg_sentiment: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [aspects, setAspects] = useState<AspectRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, a] = await Promise.all([
          fetch("/api/metrics-overview", { cache: "no-store" }),
          fetch("/api/eda/aspects", { cache: "no-store" }),
        ]);
        const mj = await m.json();
        const aj = await a.json();
        if (!m.ok) throw new Error(mj?.error || `metrics ${m.status}`);
        if (!a.ok) throw new Error(aj?.error || `aspects ${a.status}`);
        setMetrics(mj as Metrics);
        setAspects((aj?.aspects || []) as AspectRow[]);
      } catch (e: any) {
        setErr(e.message ?? "failed to load");
      }
    })();
  }, []);

  // Build cards data for MetricCards component (if you prefer your own cards, keep as-is)
  const cards = useMemo(() => {
    const backend = metrics?.backend ?? "unknown";
    const total = metrics?.total_reviews ?? 0;
    const prods = metrics?.products ?? 0;
    return [
      { title: "Backend", value: backend },
      { title: "Total Reviews", value: total.toLocaleString() },
      { title: "Products", value: prods.toLocaleString() },
    ];
  }, [metrics]);

  // For the visuals
  const painData = useMemo(
    () =>
      aspects.map((a) => ({
        aspect: a.aspect,
        avg_sentiment: a.avg_sentiment,
        mentions: a.mentions,
      })),
    [aspects]
  );

  const bubbleData = useMemo(
    () =>
      aspects.map((a) => ({
        aspect: a.aspect,
        mentions: a.mentions,
        avg_sentiment: a.avg_sentiment,
      })),
    [aspects]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {err && <span className="text-red-600 text-sm">Backend {err}</span>}
      </div>

      {/* High-level stats */}
      <MetricCards items={cards} />

      {/* Explain empty state clearly */}
      {aspects.length === 0 ? (
        <div className="rounded-lg border p-6 text-neutral-600">
          No aspect data yet. Seed a few hundred reviews and refresh.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Top Pain / Love (Sentiment by Aspect)</div>
            <EDAChartPainPoints data={painData} />
          </div>

          <div className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Frequency vs Sentiment</div>
            <EDAChartBubble data={bubbleData} />
          </div>
        </div>
      )}
    </div>
  );
}
