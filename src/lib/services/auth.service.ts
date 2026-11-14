import { apiGet, apiPost } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants/endpoints";

// The JWT never touches client-side JavaScript: it lives in an HttpOnly
// cookie managed by the same-origin route handlers in src/app/api/auth/*.

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  await apiPost<void>(ENDPOINTS.auth.login, {
    email: email.trim(),
    password,
  });
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiPost<void>(ENDPOINTS.auth.logout);
  } catch {
    // Session cookie cleanup is best-effort; network errors are ignored.
  }
}

export async function hasAdminSession(): Promise<boolean> {
  try {
    await apiGet<unknown>(ENDPOINTS.auth.me);
    return true;
  } catch {
    return false;
  }
}

export const SESSION_EXPIRED_MESSAGE =
  "Your session expired. Please log in again.";
