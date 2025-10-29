// e.g., src/app/search/page.tsx (client component)
"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setHits([]);
    try {
      const data = await postJSON<{ hits: any[] }>("/api/search", { query: q });
      setHits(data.hits || []);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="border px-3 py-2 rounded w-full"
        />
        <button className="px-4 py-2 rounded bg-black text-white">Go</button>
      </form>

      {err && <pre className="mt-4 text-red-600 text-sm whitespace-pre-wrap">{err}</pre>}

      <ul className="mt-6 space-y-2">
        {hits.map((h, i) => (
          <li key={i} className="border rounded p-3">
            <div className="font-medium">{h.text}</div>
            {"score" in h && <div className="text-xs text-gray-500">score: {h.score}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
