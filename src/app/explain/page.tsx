// src/app/explain/page.tsx
"use client";

import React, { useState } from "react";
import { API_BASE } from "@/lib/config";
import TokenAttributions from "@/components/TokenAttributions";
import AspectTable from "@/components/AspectTable";

type ExplainResp = {
  aspects: { aspect: string; sentiment: number; confidence: number; polarity: string }[];
  tokens: { token: string; score: number }[];
};

export default function ExplainPage() {
  const [text, setText] = useState("The camera is amazing but the speaker crackles and it overheats");
  const [resp, setResp] = useState<ExplainResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${API_BASE}/api/explain-review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const j = (await r.json()) as ExplainResp;
      setResp(j);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Explain</h1>

      <textarea
        className="w-full h-32 border rounded p-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-4 py-2 rounded bg-black text-white"
        onClick={run}
        disabled={loading}
      >
        {loading ? "Explaining..." : "Explain"}
      </button>

      {err && <p className="text-red-600">{err}</p>}

      {resp && (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">Aspect Intelligence</h2>
            {/* AspectTable expects aspect/mentions/avg_sentiment; convert quickly */}
            <AspectTable
              rows={resp.aspects.map(a => ({
                aspect: a.aspect,
                mentions: 1,
                avg_sentiment: a.sentiment,
              }))}
            />
          </section>

          <section>
            <h2 className="font-semibold mb-2">Token Attributions</h2>
            <TokenAttributions tokens={resp.tokens} />
          </section>
        </div>
      )}
    </div>
  );
}
