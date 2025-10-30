// src/app/api/metrics-overview/route.ts
import { NextResponse } from "next/server";

const BASE = "https://cdri-backend.onrender.com"

export async function GET() {
  if (!BASE) {
    return NextResponse.json({ error: "BACKEND env not set" }, { status: 500 });
  }

  const tryFetch = async (path: string) => {
    try {
      const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
      if (!r.ok) return { ok: false as const, status: r.status, data: null as any };
      const data = await r.json();
      return { ok: true as const, status: 200, data };
    } catch (e) {
      return { ok: false as const, status: 500, data: null as any };
    }
  };

  // Primary: /admin/stats (your backend has this)
  let res = await tryFetch("/admin/stats");

  // Fallback: older naming
  if (!res.ok) res = await tryFetch("/metrics/overview");

  if (!res.ok) {
    return NextResponse.json({ error: "metrics not found" }, { status: 404 });
  }

  // Normalize a simple shape used by your UI (tolerates both schemas)
  const d = res.data || {};
  const payload = {
    backend: d.backend ?? d.service ?? "unknown",
    total_reviews: d.total_reviews ?? d.count ?? 0,
    products: d.products ?? d.num_products ?? 0,
    // pass-through raw for advanced cards if you want
    raw: d,
  };
  return NextResponse.json(payload);
}
