// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { API_BASE } from "@/src/lib/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(`${API_BASE || ""}/search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
