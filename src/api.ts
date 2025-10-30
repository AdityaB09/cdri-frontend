"use server";

import { API_BASE } from "@/lib/config";
import { jsonFetch } from "@/lib/fetcher";

// ----- Types your backend expects/returns -----
export type SearchReq = { query: string; top_k?: number; domain?: string };
export type SearchHit = { id: number; product: string; review: string; score: number };
export type SearchRes = { hits: SearchHit[] };

export type ExplainReq = { text: string };
export type ExplainRes = {
  aspects: { aspect: string; sentiment: number; confidence: number; polarity?: string }[];
  tokens: { token: string; score: number }[];
};

export type EdaAspect = { aspect: string; mentions: number; avg_sentiment: number };
export type EdaRes = { items: EdaAspect[] };

export type MetricsRes = {
  total_reviews: number;
  total_products: number;
  last_ingest_at?: string | null;
};

export async function apiSearch(body: SearchReq) {
  return jsonFetch<SearchRes>(`${API_BASE}/search`, { method: "POST", body: JSON.stringify(body) });
}
export async function apiExplain(body: ExplainReq) {
  return jsonFetch<ExplainRes>(`${API_BASE}/explain-request`, { method: "POST", body: JSON.stringify(body) });
}
export async function apiEdaAspects() {
  return jsonFetch<EdaRes>(`${API_BASE}/eda/aspects`);
}
export async function apiMetrics() {
  return jsonFetch<MetricsRes>(`${API_BASE}/metrics-overview`);
}
export async function apiHealth() {
  return jsonFetch<{ status: string }>(`${API_BASE}/health`);
}
