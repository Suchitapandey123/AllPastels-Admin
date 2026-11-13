import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  bearerFetch,
  jsonError,
  passthrough,
} from "@/lib/server/backend";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const { id } = await params;
  const body = await request.text();
  if (body.length === 0) {
    return jsonError("Request body is required", 400);
  }

  return passthrough(
    await bearerFetch(request, `/api/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const { id } = await params;
  return passthrough(
    await bearerFetch(request, `/api/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  );
}
