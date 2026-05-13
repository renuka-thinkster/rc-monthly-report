import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";

export const runtime = "edge";

export async function GET(req: Request) {
  const u = await getCurrentUser(req);
  // Also report whether ANY users exist (used by login page to show "register as admin" CTA)
  const anyUser = await db.select().from(schema.users).limit(1);
  return NextResponse.json({ user: u, hasUsers: anyUser.length > 0 });
}
