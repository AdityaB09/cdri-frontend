"use client";

import React, { useState } from "react";
import ReviewCard from "@/components/ReviewCard";
import SimilarPanel from "@/components/SimilarPanel";

type Hit = {
  id?: string|number;
  product?: string;
  domain?: string;
  text?: string;
  reviewText?: string;
  score: number;
  // optional: aspects on the hit for SimilarPanel seeding
  aspects?: { aspect: string; sentiment?: number }[];
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch() {
    setErr(null); setLoading(true);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, k: 10 })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "search failed");
      const list: Hit[] = Array.isArray(data) ? data : data.hits ?? data.results ?? [];
      setHits(list);
    } catch (e: any) {
      setErr(e.message ?? "search error");
    } finally {
      setLoading(false);
    }
  }

  // create simple expansions for SimilarPanel
  const expansions = (hits[0]?.aspects || [])
    .slice(0, 5)
    .map(a => a.aspect);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>

      <div className="flex gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="battery life, speakers, camera…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={onSearch} disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      {expansions.length > 0 && (
        <div className="rounded border p-4">
          <SimilarPanel
            title="Explore related aspects"
            items={expansions.map(s => ({ label: s }))}
            onClick={(label: string) => { setQ(label); onSearch(); }}
          />
        </div>
      )}

      <div className="grid gap-3">
        {hits.map((h, i) => (
          <ReviewCard
            key={h.id ?? i}
            product={h.product ?? "—"}
            domain={h.domain ?? "—"}
            text={h.reviewText ?? h.text ?? "(no text)"}
            relevance={Math.max(0, Math.min(1, h.score))} // 0..1 bar
          />
        ))}
      </div>

      {!loading && !err && hits.length === 0 && (
        <div className="text-neutral-500">No results yet. Try a common term (e.g., “camera”, “battery”).</div>
      )}
    </div>
  );
}
