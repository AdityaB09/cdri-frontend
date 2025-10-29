// e.g., src/app/explain/page.tsx (client component)
"use client";
import { useState } from "react";
import { postJSON } from "@/lib/api";

export default function ExplainPage() {
  const [text, setText] = useState("");
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runExplain(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResp(null);
    try {
      const data = await postJSON("/api/explain-review", { text });
      setResp(data);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <form onSubmit={runExplain} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a review…"
          className="border px-3 py-2 rounded w-full h-32"
        />
        <button className="px-4 py-2 rounded bg-black text-white w-fit">Explain</button>
      </form>

      {err && <pre className="mt-4 text-red-600 text-sm whitespace-pre-wrap">{err}</pre>}
      {resp && <pre className="mt-4 text-xs bg-gray-50 border p-3 rounded">{JSON.stringify(resp, null, 2)}</pre>}
    </main>
  );
}
