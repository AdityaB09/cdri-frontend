// src/app/api/eda/aspects/route.ts
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET() {
  try {
    const url = `${API_BASE || ""}/eda/aspects`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
