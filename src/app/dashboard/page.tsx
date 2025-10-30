// src/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/metrics-overview", { cache: "no-store" });
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error || "metrics failed");
        setData(d);
      } catch (e: any) {
        setErr(e.message ?? "metrics error");
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {err && <div className="text-red-600">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-600">Backend</div>
          <div className="text-xl">{data?.backend ?? "unknown"}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-600">Total Reviews</div>
          <div className="text-2xl">{data?.total_reviews ?? 0}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-600">Products</div>
          <div className="text-2xl">{data?.products ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
