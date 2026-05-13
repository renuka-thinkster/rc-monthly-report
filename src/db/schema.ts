import { pgTable, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";

// Singleton row (id=1) holding the entire app state as JSONB (years × all tabs).
// All authenticated users share the same data — like a Google Sheet.
export const appData = pgTable("app_data", {
  id: integer("id").primaryKey(),
  data: jsonb("data").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// User accounts. passwordHash format: "<salt>:<sha256hex>".
export const users = pgTable("users", {
  email: text("email").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Pre-authorized emails (admins add; user sets password on first login).
export const authorizedEmails = pgTable("authorized_emails", {
  email: text("email").primaryKey(),
  invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow()
});

// Active sessions, keyed by random token used as the auth cookie value.
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
