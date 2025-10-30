"use client";
import { useState } from "react";
import { apiExplain, type ExplainRes } from "@/api";
import ABSAHeatmap from "@/components/ABSAHeatmap";

export default function ExplainPage() {
  const [text, setText] = useState("The camera is amazing but the speaker crackles and it overheats");
  const [res, setRes] = useState<ExplainRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onExplain() {
    setLoading(true); setErr(null);
    try { setRes(await apiExplain({ text })); }
    catch (e:any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Explain</h1>
      <textarea className="w-full rounded border px-3 py-2 h-32" value={text} onChange={e=>setText(e.target.value)}/>
      <button onClick={onExplain} className="rounded bg-black text-white px-4 py-2">Explain</button>
      {loading && <div className="text-sm text-neutral-500">Running…</div>}
      {err && <pre className="text-red-600 text-sm">{err}</pre>}
      {res && (
        <div className="grid gap-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">Aspect Intelligence</h2>
            <ABSAHeatmap aspects={res.aspects}/>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Token Attributions</h3>
            <pre className="bg-neutral-50 border rounded p-3 text-sm">{JSON.stringify(res.tokens, null, 2)}</pre>
          </section>
        </div>
      )}
    </div>
  );
}
