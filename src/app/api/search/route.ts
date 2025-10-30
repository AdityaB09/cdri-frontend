import { API_BASE } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Expect { query: string }
    const payload = await req.json(); // <— IMPORTANT: read JSON, not text
    const r = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const txt = await r.text();
    return new Response(txt, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("Content-Type") || "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "proxy error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
