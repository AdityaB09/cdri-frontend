// frontend/src/lib/config.ts
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/,'') || 'http://localhost:8080';
