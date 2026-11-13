import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  bearerFetch,
  jsonError,
  passthrough,
} from "@/lib/server/backend";

export async function GET(request: NextRequest) {
  return passthrough(await bearerFetch(request, "/api/coupons"));
}

export async function POST(request: NextRequest) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const body = await request.text();
  if (body.length === 0) {
    return jsonError("Request body is required", 400);
  }

  return passthrough(
    await bearerFetch(request, "/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
}
