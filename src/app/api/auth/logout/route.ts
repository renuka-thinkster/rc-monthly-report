import { NextResponse } from "next/server";
import { destroySession, tokenFromRequest, clearCookieHeader } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const token = tokenFromRequest(req);
  if (token) await destroySession(token);
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": clearCookieHeader() }
  });
}
