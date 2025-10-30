// src/app/eda/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { API_BASE } from "../api";
import EDAChartBubble, { BubbleDatum } from "@/components/EDAChartBubble";
import EDAChartPainPoints, { PainPointDatum } from "@/components/EDAChartPainPoints";
import AspectTable from "@/components/AspectTable";

type EdaResp = { aspects: { aspect: string; mentions: number; avg_sentiment: number }[] };

export default function EdaPage() {
  const [rows, setRows] = useState<BubbleDatum[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/eda/aspects`);
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const j = (await r.json()) as EdaResp;
        setRows(j.aspects || []);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pain: PainPointDatum[] = rows.map(r => ({
    aspect: r.aspect,
    avg_sentiment: r.avg_sentiment,
    mentions: r.mentions,
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">EDA / Aspects</h1>
      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && !err && rows.length === 0 && (
        <p className="text-sm text-neutral-500">No aspect data yet. Ingest a few hundred reviews below.</p>
      )}

      {rows.length > 0 && (
        <>
          <AspectTable rows={rows} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-3">
              <h2 className="font-semibold mb-2">Frequency vs Sentiment</h2>
              <EDAChartBubble data={rows} />
            </div>
            <div className="border rounded-lg p-3">
              <h2 className="font-semibold mb-2">Top Pain / Wins</h2>
              <EDAChartPainPoints data={pain} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
