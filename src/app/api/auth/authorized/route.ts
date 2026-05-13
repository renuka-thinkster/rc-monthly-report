import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: Request) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const rows = await db.select().from(schema.authorizedEmails).orderBy(schema.authorizedEmails.invitedAt);
  return NextResponse.json({ emails: rows.map(r => r.email) });
}

export async function POST(req: Request) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  // Skip if already a registered user
  const u = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (u[0]) return NextResponse.json({ error: "Already a registered user" }, { status: 409 });
  // Skip if already in pending list
  const a = await db.select().from(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email)).limit(1);
  if (a[0]) return NextResponse.json({ error: "Already authorized" }, { status: 409 });
  await db.insert(schema.authorizedEmails).values({ email });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  await db.delete(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email));
  return NextResponse.json({ ok: true });
}
