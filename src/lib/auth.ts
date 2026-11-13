import { ApiError } from "@/lib/api";

// The JWT never touches client-side JavaScript: it lives in an HttpOnly
// cookie managed by the same-origin route handlers in src/app/api/auth/*.

interface ApiPayload {
  success?: boolean;
  message?: string;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Could not reach the API. Check that the backend is running.",
      0,
    );
  }

  let payload: ApiPayload | null = null;
  try {
    payload = (await response.json()) as ApiPayload;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success !== true) {
    throw new ApiError(
      payload?.message || `Login failed with status ${response.status}`,
      response.status,
    );
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    // Session cookie cleanup is best-effort; network errors are ignored.
  }
}

export async function hasAdminSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) return false;
    const payload = (await response.json()) as ApiPayload;
    return payload.success === true;
  } catch {
    return false;
  }
}
