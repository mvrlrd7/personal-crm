import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "./config";
import * as schema from "./schema";

function createDb() {
  return drizzle(postgres(getDatabaseUrl(), { max: 10 }), { schema });
}

type Database = ReturnType<typeof createDb>;

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Database };

let db: Database | undefined;

/**
 * The database client, created on first use: `next build` loads this module
 * without connection settings, which exist only at runtime.
 */
export function getDb(): Database {
  if (!db) {
    db = globalForDb.db ?? createDb();
    if (process.env.NODE_ENV !== "production") {
      globalForDb.db = db;
    }
  }
  return db;
}
