import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { hashPassword, createSession, setCookieHeader } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (password.length < 4) return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "User already exists — log in instead" }, { status: 409 });

  // Determine role: first user becomes admin; otherwise must be pre-authorized
  const anyUser = await db.select().from(schema.users).limit(1);
  let role: "admin" | "user" = "user";
  if (anyUser.length === 0) {
    role = "admin";
  } else {
    const pre = await db.select().from(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email)).limit(1);
    if (!pre[0]) return NextResponse.json({ error: "Email not authorized. Ask an admin to add you." }, { status: 403 });
    role = "user";
  }
  const passwordHash = await hashPassword(password);
  await db.insert(schema.users).values({ email, passwordHash, role });
  // Remove from pending authorized list
  await db.delete(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email));

  const token = await createSession(email);
  return new NextResponse(JSON.stringify({ ok: true, email, role }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": setCookieHeader(token) }
  });
}
