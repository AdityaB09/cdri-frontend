"use client";
import { useEffect, useState } from "react";
import { apiMetrics, apiHealth, type MetricsRes } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // your card.tsx file

export default function DashboardPage() {
  const [m, setM] = useState<MetricsRes | null>(null);
  const [status, setStatus] = useState<string>("…");

  useEffect(() => {
    apiMetrics().then(setM).catch(() => setM(null));
    apiHealth().then(r => setStatus(r.status)).catch(() => setStatus("down"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Backend</CardTitle></CardHeader>
          <CardContent><div className="text-2xl">{status}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Reviews</CardTitle></CardHeader>
          <CardContent><div className="text-2xl">{m?.total_reviews ?? 0}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent><div className="text-2xl">{m?.total_products ?? 0}</div></CardContent></Card>
      </div>
    </div>
  );
}
