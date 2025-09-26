// lib/database.ts
// Turso-backed replacement for your sqlite-based database.ts
// This file *requires* TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to be present in the environment.

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error(
    "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required. Set them in .env.local (or your environment) before starting the app."
  );
}

// single client for the whole app
const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // create tables (same schema as your original sqlite)
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          short_description TEXT,
          images TEXT,
          flipkart_link TEXT,
          amazon_link TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `,
      args: [],
    });

    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `,
      args: [],
    });

    // insert default admin user (idempotent)
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    await client.execute({
      sql: "INSERT OR IGNORE INTO admin_users (email, password) VALUES (?, ?)",
      args: ["admin@mittirang.com", hashedPassword],
    });

    initialized = true;
  })();

  return initPromise;
}

async function ensureInitialized() {
  if (!initialized) await initializeDatabase();
}

/**
 * runQuery - intended for INSERT/UPDATE/DELETE
 * returns object similar to sqlite3's run: { id, changes }
 */
export async function runQuery(query: string, params: any[] = []) {
  await ensureInitialized();
  const result: any = await client.execute({ sql: query, args: params } as any);

  // libsql may return lastInsertRowid as number | bigint | string
  let id: number | undefined = undefined;
  if (result && result.lastInsertRowid != null) {
    try {
      id = Number(result.lastInsertRowid);
    } catch (e) {
      id = undefined;
    }
  }

  const changes = result?.rowsAffected ?? 0;

  return { id, changes, raw: result };
}

/**
 * getQuery - single row
 */
export async function getQuery(query: string, params: any[] = []) {
  await ensureInitialized();
  const result: any = await client.execute({ sql: query, args: params } as any);
  // result.rows should be an array of row objects
  return result?.rows?.[0] ?? null;
}

/**
 * allQuery - all rows
 */
export async function allQuery(query: string, params: any[] = []) {
  await ensureInitialized();
  const result: any = await client.execute({ sql: query, args: params } as any);
  return result?.rows ?? [];
}

// Initialize at module load so tables/default user exist quickly
initializeDatabase().catch((e) => {
  console.error("Turso DB init error:", e);
});

// export the client as `db` for backward compatibility
export { client as db };
