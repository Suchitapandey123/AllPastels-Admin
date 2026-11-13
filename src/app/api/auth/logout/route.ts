import { NextRequest, NextResponse } from "next/server";
import {
  assertSameOrigin,
  clearSessionCookie,
} from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const result = NextResponse.json({ success: true });
  clearSessionCookie(result);
  return result;
}
