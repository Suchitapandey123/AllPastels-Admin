import { NextRequest } from "next/server";
import { backendFetch, passthrough, proxyJson } from "@/lib/server/backend";

export async function GET() {
  return passthrough(await backendFetch("/api/products"));
}

export async function POST(request: NextRequest) {
  return proxyJson(request, "/api/products", "POST");
}
