import { NextRequest } from "next/server";
import { byId } from "@/lib/constants/endpoints";
import { proxyMutation } from "@/lib/server/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  return proxyMutation(
    request,
    `${byId("/api/orders", orderNumber)}/cancel`,
    { method: "POST" },
  );
}
