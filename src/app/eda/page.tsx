// src/app/eda/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import EDAChartBubble, { BubbleDatum } from "@/src/components/EDAChartBubble";
import EDAChartPainPoints, { PainPointDatum } from "@/src/components/EDAChartPainPoints";

type RawRow =
  | { aspect: string; mentions: number; avg_sentiment: number }
  | { aspect: string; count: number; total_sentiment: number };

export default function EDAPage() {
  const [rows, setRows] = useState<RawRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/eda/aspects", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "EDA fetch failed");
        setRows(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e: any) {
        setErr(e.message ?? "EDA error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalized: BubbleDatum[] = rows.map((r: any) => {
    if ("mentions" in r && "avg_sentiment" in r) {
      return { aspect: r.aspect, mentions: r.mentions, avg_sentiment: r.avg_sentiment };
    }
    // adapter for { count, total_sentiment }
    const mentions = r.count ?? 0;
    const avg_sentiment =
      mentions > 0 ? (r.total_sentiment ?? 0) / mentions : 0;
    return { aspect: r.aspect, mentions, avg_sentiment };
  });

  const pain: PainPointDatum[] = normalized.map((d) => ({
    aspect: d.aspect,
    avg_sentiment: d.avg_sentiment,
    mentions: d.mentions,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Aspect Intelligence</h1>

      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && !err && normalized.length === 0 && (
        <div className="text-neutral-500">No data yet. Ingest some reviews to light this up.</div>
      )}

      {!loading && !err && normalized.length > 0 && (
        <>
          <section className="rounded-xl border p-4">
            <h2 className="text-lg font-semibold mb-3">Pain vs. Delight (bubble)</h2>
            <EDAChartBubble data={normalized} />
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="text-lg font-semibold mb-3">Top Pain / Delight (bars)</h2>
            <EDAChartPainPoints data={pain} />
          </section>
        </>
      )}
    </div>
  );
}
