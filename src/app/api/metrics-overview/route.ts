// src/app/api/metrics-overview/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

async function getJSON(path: string) {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) return { ok: false as const, status: r.status, data: null as any };
  return { ok: true as const, status: 200, data: await r.json() };
}

export async function GET() {
  if (!BASE) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_BACKEND_URL not set" },
      { status: 500 }
    );
  }

  // 1) Try a modern stats route if present
  const tryStats = await getJSON("/admin/stats"); // many of your images had this
  if (tryStats.ok) {
    const d = tryStats.data || {};
    return NextResponse.json({
      backend: d.backend ?? "up",
      total_reviews: d.total_reviews ?? 0,
      products: d.products ?? 0,
      ok: true,
      synthesized: false,
    });
  }

  // 2) Synthesize from health and lightweight probes (no /metrics/overview calls)
  const health = await getJSON("/health");
  // cheap probes to endpoints you *do* have, purely to confirm they return 200
  const eda = await getJSON("/eda/aspects");
  const searchProbe = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "test", k: 1 }),
    cache: "no-store",
  }).then(async r => ({ ok: r.ok, status: r.status }));

  const anyUp = health.ok || eda.ok || searchProbe.ok;
  return NextResponse.json({
    backend: anyUp ? "up" : "down",
    total_reviews: 0,        // unknown without /admin/stats
    products: 0,             // unknown without /admin/stats
    ok: anyUp,
    synthesized: true,
    checks: {
      health: health.ok ? 200 : health.status,
      eda: eda.ok ? 200 : eda.status,
      search: searchProbe.ok ? 200 : searchProbe.status,
    },
  });
}
