import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  bearerFetch,
  jsonError,
  passthrough,
} from "@/lib/server/backend";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const { orderNumber } = await params;
  const body = await request.text();
  if (body.length === 0) {
    return jsonError("Request body is required", 400);
  }

  return passthrough(
    await bearerFetch(
      request,
      `/api/orders/${encodeURIComponent(orderNumber)}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      },
    ),
  );
}
