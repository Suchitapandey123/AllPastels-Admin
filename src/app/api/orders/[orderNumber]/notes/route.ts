import { NextRequest } from "next/server";
import { byId } from "@/lib/constants/endpoints";
import { proxyJson } from "@/lib/server/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  return proxyJson(
    request,
    `${byId("/api/orders", orderNumber)}/notes`,
    "POST",
  );
}
