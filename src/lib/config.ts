export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || process.env.BACKEND_URL?.replace(/\/+$/, "") || process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||"http://localhost:8080";

