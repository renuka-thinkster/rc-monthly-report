import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyPassword, createSession, setCookieHeader } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return NextResponse.json({ error: "Missing email or password" }, { status: 400 });

  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = rows[0];
  if (!user) {
    // Distinguish "no account" vs "wrong password" — front-end can prompt to register if email is pre-authorized.
    const pre = await db.select().from(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email)).limit(1);
    if (pre[0]) return NextResponse.json({ error: "register_required", message: "Email authorized — set your password" }, { status: 404 });
    // Otherwise check if any users exist at all (first-user bootstrap)
    const anyUser = await db.select().from(schema.users).limit(1);
    if (anyUser.length === 0) return NextResponse.json({ error: "first_user", message: "No accounts yet — register to become admin" }, { status: 404 });
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  const token = await createSession(email);
  return new NextResponse(JSON.stringify({ ok: true, email, role: user.role }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": setCookieHeader(token) }
  });
}
