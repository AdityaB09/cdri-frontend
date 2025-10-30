// src/lib/config.ts
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";
if (!API_BASE) {
  // At runtime you'll still work via /api/* proxies below
  // but it's better to set NEXT_PUBLIC_BACKEND_URL in Vercel (https://...).
  // No trailing slash.
  // Example: https://cdri-backend.onrender.com
}
