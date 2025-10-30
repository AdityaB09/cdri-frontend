export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8080";

export const API_BASE =
  process.env.BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:8080";
