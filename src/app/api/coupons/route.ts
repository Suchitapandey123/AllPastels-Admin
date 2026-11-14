import { NextRequest } from "next/server";
import { bearerFetch, passthrough, proxyJson } from "@/lib/server/backend";

export async function GET(request: NextRequest) {
  return passthrough(await bearerFetch(request, "/api/coupons"));
}

export async function POST(request: NextRequest) {
  return proxyJson(request, "/api/coupons", "POST");
}
