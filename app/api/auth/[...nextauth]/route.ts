import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import { authOptions } from "@/auth";
import { authRateLimit } from "@/lib/ratelimit";

async function limitAuth(request: NextRequest) {
  if (!authRateLimit) {
    return null;
  }

  const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const result = await authRateLimit.limit(identifier);

  if (!result.success) {
    return NextResponse.json({ error: "Too many authentication requests." }, { status: 429 });
  }

  return null;
}

const authHandler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

export async function GET(request: NextRequest, context: AuthRouteContext) {
  const response = await limitAuth(request);
  return response ?? authHandler(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const response = await limitAuth(request);
  return response ?? authHandler(request, context);
}
