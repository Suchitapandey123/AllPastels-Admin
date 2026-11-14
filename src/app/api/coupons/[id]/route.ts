import { NextRequest } from "next/server";
import { byId } from "@/lib/constants/endpoints";
import { proxyJson, proxyMutation } from "@/lib/server/backend";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyJson(request, byId("/api/coupons", id), "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyMutation(request, byId("/api/coupons", id), {
    method: "DELETE",
  });
}
