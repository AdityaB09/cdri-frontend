"use client";
import { useEffect, useState } from "react";
import { apiEdaAspects, type EdaAspect } from "@/api";
import EDAChartBubble from "@/components/EDACartBubble";     // your bubble component
import EDAChartPainPoints from "@/components/EDACartPainPoints"; // your bar component

export default function EdaPage() {
  const [items, setItems] = useState<EdaAspect[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiEdaAspects().then(r => setItems(r.items)).catch(e => setErr(String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>
      {err && <pre className="text-red-600 text-sm">{err}</pre>}
      {!err && (
        <>
          <section>
            <h2 className="font-semibold mb-2">Top Pain Points (impact)</h2>
            <EDAChartPainPoints data={items.map(i=>({ aspect: i.aspect, avg_sentiment: i.avg_sentiment, mentions: i.mentions }))}/>
          </section>
          <section>
            <h2 className="font-semibold mb-2">Aspect Bubble Map</h2>
            <EDAChartBubble data={items}/>
          </section>
        </>
      )}
    </div>
  );
}
