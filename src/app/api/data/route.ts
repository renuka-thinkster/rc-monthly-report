import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";

// Node.js runtime (default). Force-dynamic + revalidate 0 so GET is NEVER
// cached — otherwise the client reads a stale snapshot and writes appear lost.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

function n(v: any): number {
  const x = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(x) ? x : 0;
}

// ---------------------------------------------------------------------------
// SAFETY GUARD: does this payload actually contain real business data?
// The database holds the OLD "store" format (data.daily / data.sales / ...).
// We also still recognize the newer "units" format as a fallback, so the guard
// works no matter which shape arrives. Returns false only for a blank/seeded
// state (all zeros). This is what stops an accidental empty save from wiping
// the database.
// ---------------------------------------------------------------------------
function hasMeaningfulData(data: any): boolean {
  try {
    if (!data || typeof data !== "object") return false;

    // ---- STORE format (the format we persist) ----
    if (data.daily || data.sales || data.inv || data.purchase || data.manual) {
      // daily: { "2026-05": [[date,day, ...13 numbers...], ...] }
      for (const rows of Object.values<any>(data.daily || {})) {
        if (Array.isArray(rows)) {
          for (const r of rows) {
            if (Array.isArray(r)) {
              let s = 0;
              for (let i = 2; i < r.length; i++) s += n(r[i]);
              if (s > 0) return true;
            }
          }
        }
      }
      // sales: { "2026-05": { sub, stores:[[dc,hc,da,ha,cs,foc],...] } }
      for (const m of Object.values<any>(data.sales || {})) {
        const stores = m?.stores;
        if (Array.isArray(stores)) {
          for (const row of stores) {
            if (Array.isArray(row) && (n(row[2]) + n(row[3]) + n(row[4]) + n(row[5])) > 0) return true;
          }
        }
        if (n(m?.sub) > 0) return true;
      }
      // purchase: { "2026-05": number }
      for (const v of Object.values<any>(data.purchase || {})) if (n(v) > 0) return true;
      // inv: { "2026-05": [[start,close],...] }
      for (const arr of Object.values<any>(data.inv || {})) {
        if (Array.isArray(arr)) for (const row of arr) if (Array.isArray(row) && (n(row[0]) > 0 || n(row[1]) > 0)) return true;
      }
      // target: { "2026-05": [{t,w},...] }
      for (const arr of Object.values<any>(data.target || {})) {
        if (Array.isArray(arr)) for (const o of arr) if (n(o?.t) > 0) return true;
      }
      // manual: { "2026-05": [staffFood,dump,maintenance,otherIncome] }
      for (const arr of Object.values<any>(data.manual || {})) {
        if (Array.isArray(arr)) for (const v of arr) if (n(v) > 0) return true;
      }
      return false;
    }

    // ---- UNITS format (fallback) ----
    const units = data.units;
    if (units && typeof units === "object") {
      for (const unit of Object.values<any>(units)) {
        for (const yr of Object.values<any>(unit?.years || {})) {
          for (const e of (yr?.daily?.entries || [])) {
            const sum =
              n(e?.cafe?.upi) + n(e?.cafe?.online) + n(e?.cafe?.cash) +
              n(e?.rcExpress?.upi) + n(e?.rcExpress?.cash) +
              n(e?.truck?.upi) + n(e?.truck?.cash) +
              n(e?.tcs?.t1) + n(e?.tcs?.t2) +
              n(e?.rcf?.upi) + n(e?.rcf?.cash);
            if (sum > 0) return true;
          }
          const rc = yr?.rc || {};
          for (const month of Object.values<any>(rc.sales || {}))
            for (const st of Object.values<any>(month || {}))
              if (n(st?.dineAmt) + n(st?.hdAmt) + n(st?.creditAmt) + n(st?.focAmt) > 0) return true;
          for (const v of Object.values<any>(rc.pur || {})) if (n(v) > 0) return true;
          for (const month of Object.values<any>(rc.inv || {}))
            for (const s of Object.values<any>(month || {})) if (n(s?.start) > 0 || n(s?.close) > 0) return true;
          for (const month of Object.values<any>(rc.tgt || {}))
            for (const s of Object.values<any>(month || {})) if (n(s?.target) > 0) return true;
          for (const m of Object.values<any>(yr?.mn || {}))
            if (n(m?.staffFood) + n(m?.dump) + n(m?.maintenance) + n(m?.otherIncome) > 0) return true;
        }
      }
    }
    return false;
  } catch {
    // Unknown shape -> treat as meaningful so we never block a legitimate save.
    return true;
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

// PUT — replace the shared state. Atomic UPSERT with empty-overwrite guard.
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

    // ----- EMPTY-OVERWRITE GUARD -----------------------------------------
    // If the incoming payload has no real data, refuse to overwrite a DB that
    // currently DOES hold real data. Protects against accidental blank saves.
    // Deliberate reset still possible via header `x-allow-empty: true`
    // or body `allowEmpty: true`.
    if (!hasMeaningfulData(data)) {
      const allowEmpty =
        req.headers.get("x-allow-empty") === "true" || body.allowEmpty === true;

      if (!allowEmpty) {
        const existing = await db
          .select()
          .from(schema.appData)
          .where(eq(schema.appData.id, 1))
          .limit(1);

        if (existing[0] && hasMeaningfulData(existing[0].data)) {
          console.warn("PUT /api/data BLOCKED: empty payload would overwrite existing data");
          return NextResponse.json(
            {
              error:
                "Refused: this save is empty but the database already has data. " +
                "Reload the page before saving. (To intentionally clear everything, " +
                "resend with header x-allow-empty: true.)",
              blocked: true,
            },
            { status: 409 }
          );
        }
      }
    }
    // ---------------------------------------------------------------------

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