import { NextRequest } from "next/server";
import {
  bearerFetch,
  passthrough,
} from "@/lib/server/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  return passthrough(
    await bearerFetch(
      request,
      `/api/orders/${encodeURIComponent(orderNumber)}`,
    ),
  );
}
