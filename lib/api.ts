import { cookies } from "next/headers";

// Internal URL used by Next.js Server Components (never exposed to browser)
const SERVER_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

// Public URL used by browser Client Components (goes through Nginx in production)
export const CLIENT_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Server-side fetch (Server Components / Route Handlers) ────────────────────

async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  return fetch(`${SERVER_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `auth-token=${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await serverFetch(path);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await serverFetch(path, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
