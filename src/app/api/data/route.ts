import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";

export const runtime = "edge";

// GET — return the current shared state (auth required)
export async function GET(req: Request) {
  try { await requireUser(req); } catch (r) { return r as Response; }
  const rows = await db.select().from(schema.appData).where(eq(schema.appData.id, 1)).limit(1);
  if (!rows[0]) {
    // First read — seed empty
    const initial = { currentYear: 2026, years: {}, editMode: false };
    await db.insert(schema.appData).values({ id: 1, data: initial as any, version: 1 });
    return NextResponse.json({ data: initial, version: 1 });
  }
  return NextResponse.json({ data: rows[0].data, version: rows[0].version });
}

// PUT — replace the shared state. Last-write-wins (simple; no optimistic concurrency by default).
export async function PUT(req: Request) {
  try { await requireUser(req); } catch (r) { return r as Response; }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Missing data" }, { status: 400 });
  const data = body.data ?? body;

  const existing = await db.select().from(schema.appData).where(eq(schema.appData.id, 1)).limit(1);
  if (!existing[0]) {
    await db.insert(schema.appData).values({ id: 1, data, version: 1 });
    return NextResponse.json({ ok: true, version: 1 });
  }
  const newVersion = existing[0].version + 1;
  await db.update(schema.appData)
    .set({ data, version: newVersion, updatedAt: new Date() })
    .where(eq(schema.appData.id, 1));
  return NextResponse.json({ ok: true, version: newVersion });
}
