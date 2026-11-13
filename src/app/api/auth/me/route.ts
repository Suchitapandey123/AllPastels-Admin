import { NextRequest } from "next/server";
import {
  bearerFetch,
  clearSessionCookie,
  passthrough,
} from "@/lib/server/backend";

export async function GET(request: NextRequest) {
  const response = await bearerFetch(request, "/api/auth/me");

  if (!response.ok) {
    const result = await passthrough(response);
    clearSessionCookie(result);
    return result;
  }

  return passthrough(response);
}
