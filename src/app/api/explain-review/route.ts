import { NEXT_PUBLIC_API_BASE } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Expect { text: string }
    const payload = await req.json();
    const r = await fetch(`${NEXT_PUBLIC_API_BASE}/explain-request`, {
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
