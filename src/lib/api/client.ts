export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Same-origin only: all requests go to Next.js route handlers under
// src/app/api/*, which forward to the backend (server-side API_BASE_URL).
export const API_BASE = "";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  token?: string;
  data?: T;
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export interface RequestOnlyOptions {
  token?: string | null;
}

async function request(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<Response> {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    return await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Could not reach the API. Check that the backend is running.",
      0,
    );
  }
}

function parseEnvelope<T>(payload: unknown): ApiEnvelope<T> | null {
  if (payload === null || typeof payload !== "object") return null;
  const envelope = payload as ApiEnvelope<T>;
  if (typeof envelope.success !== "boolean") return null;
  return envelope;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = parseEnvelope<T>(await response.json());
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return payload;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await request(path, options);
  const payload = await readEnvelope<T>(response);
  return payload.data as T;
}

// Responses whose interesting field sits next to `success`/`data` (for
// example the login endpoint's root-level `token`) go through here.
export async function apiFetchEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const response = await request(path, options);
  return readEnvelope<T>(response);
}

export function apiGet<T>(
  path: string,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "POST", body });
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "PUT", body });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "PATCH", body });
}

export function apiDelete<T>(
  path: string,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "DELETE" });
}

export function apiUpload<T>(
  path: string,
  body: FormData,
  options: RequestOnlyOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "POST", body });
}

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim().length === 0) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
