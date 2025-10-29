export async function postJSON<T>(
  url: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    body: JSON.stringify(body),
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST ${url} -> ${res.status}\n${txt}`);
  }
  return (await res.json()) as T;
}

export async function getJSON<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { method: "GET", cache: "no-store", ...init });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status}\n${txt}`);
  }
  return (await res.json()) as T;
}
