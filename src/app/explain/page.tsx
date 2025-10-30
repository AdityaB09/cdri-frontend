"use client";

import React, { useState } from "react";
import TokenAttributions from "@/components/TokenAttributions";

type ExplainResp = {
  aspects: { aspect: string; sentiment: number; confidence?: number; polarity?: string }[];
  tokens: { token: string; score: number }[];
};

function AspectPill({ a }: { a: ExplainResp["aspects"][number] }) {
  const color = a.sentiment > 0.2 ? "bg-green-100 text-green-800 border-green-200"
              : a.sentiment < -0.2 ? "bg-red-100 text-red-800 border-red-200"
              : "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <div className={`rounded-lg border ${color} px-3 py-2 text-sm`}>
      <div className="font-semibold">{a.aspect}</div>
      <div className="text-xs">Sentiment {a.sentiment.toFixed(2)}{a.polarity ? ` • ${a.polarity}` : ""}</div>
      {typeof a.confidence === "number" && <div className="text-xs">Conf {a.confidence.toFixed(2)}</div>}
    </div>
  );
}

export default function ExplainPage() {
  const [text, setText] = useState("The camera is amazing but the speaker crackles and it overheats");
  const [resp, setResp] = useState<ExplainResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onExplain() {
    setErr(null); setLoading(true);
    try {
      const r = await fetch("/api/explain-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "explain failed");
      setResp(data);
    } catch (e: any) {
      setErr(e.message ?? "explain error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Explain</h1>

      <textarea
        className="w-full rounded border px-3 py-2 h-28"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="rounded bg-black px-4 py-2 text-white"
        onClick={onExplain} disabled={loading}
      >
        {loading ? "Explaining…" : "Explain"}
      </button>

      {err && <div className="text-red-600">{err}</div>}

      {resp && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-2">Aspect Intelligence</h2>
            <div className="flex flex-wrap gap-2">
              {resp.aspects.map((a, i) => <AspectPill key={i} a={a} />)}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Token Attributions</h2>
            {/* If your component expects a different prop, adapt here */}
            <TokenAttributions items={resp.tokens} />
          </div>
        </>
      )}
    </div>
  );
}
