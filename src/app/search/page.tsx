"use client";

import React, { useState } from "react";
import ReviewCard from "@/components/ReviewCard";
import SimilarPanel from "@/components/SimilarPanel";

type Hit = { text: string; score: number };

export default function SearchPage() {
  const [q, setQ] = useState("camera");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, k: 10 }),
      });
      const j = await r.json();
      setHits(j.hits ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reviews…"
        />
        <button onClick={doSearch} className="rounded bg-black px-4 py-2 text-white">
          {loading ? "…" : "Search"}
        </button>
      </div>

      {!loading && hits.length === 0 && (
        <div className="text-sm text-neutral-500">No results yet.</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {hits.map((h, i) => (
            <ReviewCard key={i} text={h.text} score={h.score} />
          ))}
        </div>
        {/* <SimilarPanel items={hits} /> */}
      </div>
    </div>
  );
}
