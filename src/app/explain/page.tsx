"use client";

import React, { useState } from "react";
import ABSAHeatmap from "@/components/ABSAHeatmap";
import TokenAttributions from "@/components/TokenAttributions";

type ExplainResp = {
  aspects: { aspect: string; sentiment: number; confidence: number; polarity: string }[];
  tokens: { token: string; score: number }[];
};

export default function ExplainPage() {
  const [text, setText] = useState(
    "The camera is amazing but the speaker crackles and it overheats"
  );
  const [resp, setResp] = useState<ExplainResp | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/explain-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setResp(await r.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Explain</h1>
      <textarea
        className="w-full rounded border p-3"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={run} className="rounded bg-black px-4 py-2 text-white">
        {loading ? "…" : "Explain"}
      </button>

      {resp && (
        <>
          <ABSAHeatmap aspects={resp.aspects} />
          <TokenAttributions tokens={resp.tokens} />
        </>
      )}
    </div>
  );
}
