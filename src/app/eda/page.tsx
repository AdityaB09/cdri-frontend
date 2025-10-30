"use client";

import React, { useEffect, useState } from "react";
import AspectTable, { AspectRow } from "@/components/AspectTable";
import EDAChartBubble, { BubbleDatum } from "@/components/EDAChartBubble";
import EDAChartPainPoints, { PainPointDatum } from "@/components/EDAChartPainPoints";

type ApiAspectsResponse = {
  aspects: { aspect: string; mentions: number; avg_sentiment: number }[];
};

export default function EdaPage() {
  const [rows, setRows] = useState<AspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/eda/aspects", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data: ApiAspectsResponse = await res.json();
        const norm = (data.aspects ?? []).map((a) => ({
          aspect: a.aspect,
          mentions: a.mentions,
          avg_sentiment: a.avg_sentiment,
        }));
        setRows(norm);
      } catch (e: any) {
        setErr(e?.message ?? "failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const bubbles: BubbleDatum[] = rows.map((r) => ({
    aspect: r.aspect,
    mentions: r.mentions,
    avg_sentiment: r.avg_sentiment,
  }));
  const bars: PainPointDatum[] = rows.map((r) => ({
    aspect: r.aspect,
    mentions: r.mentions,
    avg_sentiment: r.avg_sentiment,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Aspect Intelligence</h1>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <>
          <AspectTable rows={rows} />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border p-3">
              <h2 className="font-semibold mb-2">Frequency vs Sentiment</h2>
              <EDAChartBubble data={bubbles} />
            </div>

            <div className="rounded-lg border p-3">
              <h2 className="font-semibold mb-2">Top Pain / Gain</h2>
              <EDAChartPainPoints data={bars} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
