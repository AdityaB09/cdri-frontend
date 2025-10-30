// src/app/search/page.tsx
"use client";

import React, { useState } from "react";

type SearchHit = {
  id?: number | string;
  product?: string;
  domain?: string;
  text?: string;      // fallback name used by your older minimal endpoint
  reviewText?: string; // alternate field name
  score: number;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    setErr(null); setLoading(true);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, k: 10 }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "search failed");
      // adapt array or {results:[...]}
      const results: SearchHit[] = Array.isArray(data) ? data : data.results ?? data.hits ?? [];
      setHits(results);
    } catch (e: any) {
      setErr(e.message ?? "search error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>

      <div className="flex gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="camera, battery life, speaker…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={onSearch}
          className="rounded bg-black px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <div className="space-y-3">
        {hits.map((h, i) => (
          <div key={i} className="rounded border p-4">
            <div className="text-sm text-neutral-500">
              {(h.domain || "domain") + " • " + (h.product || "product")}
            </div>
            <div className="mt-1 text-[15px]">
              {h.reviewText || h.text || "(no text)"}
            </div>
            <div className="mt-2 text-xs text-neutral-600">score: {h.score.toFixed(3)}</div>
          </div>
        ))}
        {!loading && hits.length === 0 && <div className="text-neutral-500">No results yet.</div>}
      </div>
    </div>
  );
}
