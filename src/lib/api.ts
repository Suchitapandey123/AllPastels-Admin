export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Same-origin only: all requests go to Next.js route handlers under
// src/app/api/*, which forward to the backend (server-side API_BASE_URL).
export const API_BASE = "";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  token?: string;
  data?: T;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
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

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await request(path, options);

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

  return payload.data as T;
}

// Responses whose interesting field sits next to `success`/`data` (for
// example the login endpoint's root-level `token`) go through here.
export async function apiFetchEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const response = await request(path, options);

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
