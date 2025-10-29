// frontend/src/lib/backend.ts

// Read the backend base URL from env at build/runtime.
// On Vercel you will define NEXT_PUBLIC_BACKEND_URL in Project Settings.
export const BACKEND_BASE =
  "https://cdri-backend.onrender.com" || "http://localhost:8080";

// Helper to safely join base + path
export function backend(path: string): string {
  const base = BACKEND_BASE.replace(/\/+$/, "");
  const clean = path.replace(/^\/+/, "");
  return `${base}/${clean}`;
}
