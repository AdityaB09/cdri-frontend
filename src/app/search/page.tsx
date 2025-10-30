"use client";

import React, { useState } from "react";
import ReviewCard from "@/components/ReviewCard";
// import SimilarPanel from "@/components/SimilarPanel";

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
    <div className="min-h-screen flex items-center justify-center">
      {/* centered container */}
      <div className="w-full max-w-3xl px-4 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Search</h1>

        {/* centered controls */}
        <div className="flex w-full max-w-2xl mx-auto gap-2">
          <input
            className="flex-1 rounded border px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reviews…"
          />
          <button
            onClick={doSearch}
            className="rounded bg-black px-4 py-2 text-white"
          >
            {loading ? "…" : "Search"}
          </button>
        </div>

        {!loading && hits.length === 0 && (
          <div className="text-sm text-neutral-500 text-center">
            No results yet.
          </div>
        )}

        {/* results centered */}
        <div className="grid grid-cols-1 place-items-center gap-4">
          <div className="w-full max-w-2xl space-y-3">
            {hits.map((h, i) => (
              <ReviewCard key={i} text={h.text} score={h.score} />
            ))}
          </div>
          {/* If you ever re-enable the similar panel, it will still stay centered due to single column */}
          {/* <SimilarPanel items={hits} /> */}
        </div>
      </div>
    </div>
  );
}
