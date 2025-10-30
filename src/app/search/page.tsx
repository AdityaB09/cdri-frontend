"use client";
import { useState } from "react";
import { apiSearch, type SearchHit } from "@/api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSearch() {
    setLoading(true); setErr(null);
    try {
      const res = await apiSearch({ query: q, top_k: 10 });
      setHits(res.hits);
    } catch (e:any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)}
          className="flex-1 rounded border px-3 py-2" placeholder="Search reviews…" />
        <button onClick={onSearch} className="rounded bg-black text-white px-4 py-2">Search</button>
      </div>
      {loading && <div className="text-sm text-neutral-500">Searching…</div>}
      {err && <pre className="text-red-600 text-sm">{err}</pre>}
      <div className="space-y-3">
        {hits.map(h => (
          <div key={h.id} className="rounded border bg-white p-3">
            <div className="text-sm text-neutral-500">score: {h.score.toFixed(3)}</div>
            <div className="font-medium">{h.product}</div>
            <div className="text-neutral-700">{h.review}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
