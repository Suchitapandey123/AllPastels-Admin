import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  bearerFetch,
  passthrough,
} from "@/lib/server/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const { orderNumber } = await params;
  return passthrough(
    await bearerFetch(
      request,
      `/api/orders/${encodeURIComponent(orderNumber)}/cancel`,
      { method: "POST" },
    ),
  );
}
