// frontend/src/lib/config.ts
const raw =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_BACKEND_URL ?? // backward-compat
  "";

if (!raw) {
  // When empty on Vercel, you'd silently hit localhost and get "fetch failed".
  // Throwing helps you catch a misconfigured deploy immediately.
  console.warn(
    "[CDRI] Missing NEXT_PUBLIC_API_BASE (or NEXT_PUBLIC_BACKEND_URL). " +
    "Set it to your Render backend URL in Vercel env."
  );
}

export const API_BASE = (raw || "http://localhost:8080").replace(/\/+$/, "");
