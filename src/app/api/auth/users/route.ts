import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin, hashPassword } from "@/lib/auth";

export const runtime = "edge";

// GET — list all users (admin only)
export async function GET(req: Request) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const rows = await db.select({
    email: schema.users.email, role: schema.users.role, createdAt: schema.users.createdAt
  }).from(schema.users).orderBy(schema.users.createdAt);
  return NextResponse.json({ users: rows });
}

// POST — create a user directly (admin only): { email, password, role }
export async function POST(req: Request) {
  let admin; try { admin = await requireAdmin(req); } catch (r) { return r as Response; }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = body?.role === "admin" ? "admin" : "user";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (password.length < 4) return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "User already exists" }, { status: 409 });

  const passwordHash = await hashPassword(password);
  await db.insert(schema.users).values({ email, passwordHash, role });
  await db.delete(schema.authorizedEmails).where(eq(schema.authorizedEmails.email, email));
  return NextResponse.json({ ok: true, email, role });
}

// PATCH — update a user (admin only): { email, role? , password? }
export async function PATCH(req: Request) {
  let admin; try { admin = await requireAdmin(req); } catch (r) { return r as Response; }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const updates: any = {};
  if (body?.role === "admin" || body?.role === "user") updates.role = body.role;
  if (typeof body?.password === "string" && body.password.length >= 4) {
    updates.passwordHash = await hashPassword(body.password);
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  await db.update(schema.users).set(updates).where(eq(schema.users.email, email));
  return NextResponse.json({ ok: true });
}

// DELETE — remove a user (admin only): query ?email=
export async function DELETE(req: Request) {
  let admin; try { admin = await requireAdmin(req); } catch (r) { return r as Response; }
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  if (email === admin.email) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  // Last-admin protection
  const admins = await db.select().from(schema.users).where(eq(schema.users.role, "admin"));
  if (admins.length === 1 && admins[0].email === email) {
    return NextResponse.json({ error: "Cannot delete the only admin. Promote another user first." }, { status: 400 });
  }
  await db.delete(schema.sessions).where(eq(schema.sessions.email, email));
  await db.delete(schema.users).where(eq(schema.users.email, email));
  return NextResponse.json({ ok: true });
}
