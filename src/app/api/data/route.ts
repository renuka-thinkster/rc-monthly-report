import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";

// Node.js runtime (default). Force-dynamic + revalidate 0 so GET is NEVER
// cached — otherwise the client reads a stale snapshot and writes appear lost.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// requireUser() should throw a Response (e.g. 401) when unauthorized.
// If it throws a real Error (e.g. DB failure), surface it as a readable 500
// instead of letting Next render an opaque HTML error page.
async function auth(req: Request) {
  try {
    return await requireUser(req);
  } catch (r) {
    if (r instanceof Response) throw r;
    throw NextResponse.json(
      { error: "Auth check failed: " + ((r as any)?.message || String(r)) },
      { status: 500 }
    );
  }
}

// GET — return the current shared state (auth required)
export async function GET(req: Request) {
  try {
    await auth(req);

    const rows = await db
      .select()
      .from(schema.appData)
      .where(eq(schema.appData.id, 1))
      .limit(1);

    if (!rows[0]) {
      // Seed an empty row. onConflictDoNothing makes this safe even if two
      // requests try to seed at the same time (no duplicate-key crash).
      const initial = {};
      await db
        .insert(schema.appData)
        .values({ id: 1, data: initial as any, version: 1 })
        .onConflictDoNothing();
      return NextResponse.json(
        { data: initial, version: 1 },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    return NextResponse.json(
      { data: rows[0].data, version: rows[0].version },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("GET /api/data failed:", e);
    return NextResponse.json(
      { error: String((e as any)?.message || e) },
      { status: 500 }
    );
  }
}

// PUT — replace the shared state. Atomic UPSERT: insert id=1 if missing,
// otherwise update it and bump the version. No check-then-act race.
export async function PUT(req: Request) {
  try {
    await auth(req);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }
    const data = body.data ?? body;

    const rows = await db
      .insert(schema.appData)
      .values({ id: 1, data, version: 1 })
      .onConflictDoUpdate({
        target: schema.appData.id,
        set: {
          data,
          version: sql`${schema.appData.version} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ version: schema.appData.version });

    return NextResponse.json({ ok: true, version: rows[0]?.version ?? 1 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("PUT /api/data failed:", e);
    return NextResponse.json(
      { error: String((e as any)?.message || e) },
      { status: 500 }
    );
  }
}