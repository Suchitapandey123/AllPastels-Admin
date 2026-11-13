import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  bearerFetch,
  passthrough,
} from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  return passthrough(
    await bearerFetch(request, "/api/uploads", {
      method: "POST",
      body: await request.formData(),
    }),
  );
}
