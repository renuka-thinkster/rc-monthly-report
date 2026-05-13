import { db, schema } from "@/db";
import { eq, and, gt } from "drizzle-orm";

export const COOKIE_NAME = "rc_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest("SHA-256", buf);
  return toHex(new Uint8Array(h));
}
function randomHex(byteLen: number): string {
  const arr = new Uint8Array(byteLen);
  crypto.getRandomValues(arr);
  return toHex(arr);
}

/** Returns "salt:sha256(salt:pw)" for storage. */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomHex(16);
  const h = await sha256Hex(salt + ":" + pw);
  return salt + ":" + h;
}
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const i = stored.indexOf(":");
  if (i < 0) return false;
  const salt = stored.slice(0, i);
  const expected = stored.slice(i + 1);
  const actual = await sha256Hex(salt + ":" + pw);
  return actual === expected;
}

export async function createSession(email: string): Promise<string> {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.sessions).values({ token, email, expiresAt });
  return token;
}
export async function destroySession(token: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
}

/** Parse the session token out of a Request's Cookie header. */
export function tokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const part = cookie.split(/;\s*/).find(p => p.startsWith(COOKIE_NAME + "="));
  return part ? decodeURIComponent(part.slice(COOKIE_NAME.length + 1)) : null;
}

export type UserRow = { email: string; role: string };

/** Returns the user behind the given request, or null. */
export async function getCurrentUser(req: Request): Promise<UserRow | null> {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const rows = await db.select({
    email: schema.users.email,
    role: schema.users.role
  })
  .from(schema.sessions)
  .innerJoin(schema.users, eq(schema.sessions.email, schema.users.email))
  .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
  .limit(1);
  return rows[0] ?? null;
}
export async function requireUser(req: Request): Promise<UserRow> {
  const u = await getCurrentUser(req);
  if (!u) throw new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  return u;
}
export async function requireAdmin(req: Request): Promise<UserRow> {
  const u = await requireUser(req);
  if (u.role !== "admin") throw new Response(JSON.stringify({ error: "Admin only" }), { status: 403 });
  return u;
}

export function setCookieHeader(token: string): string {
  const expires = new Date(Date.now() + SESSION_TTL_MS).toUTCString();
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Expires=${expires}; SameSite=Lax; Secure`;
}
export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
