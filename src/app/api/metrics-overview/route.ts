import { API_BASE } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await fetch(`${API_BASE}/metrics/overview`, {
    method: "GET",
    cache: "no-store",
  });
  const txt = await r.text();
  return new Response(txt, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("Content-Type") || "application/json" },
  });
}
