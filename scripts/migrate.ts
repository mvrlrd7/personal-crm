/**
 * Applies pending migrations from drizzle/ to the database.
 * In production it runs as a one-off container from the app image before the new app starts.
 *
 * Usage: node scripts/migrate.ts
 */
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { getDatabaseUrl, loadEnvFile } from "../src/db/config.ts";

const MIGRATIONS_FOLDER = fileURLToPath(new URL("../drizzle", import.meta.url));

/** Number of migrations recorded by drizzle; 0 before the first run. */
async function appliedCount(client: postgres.Sql): Promise<number> {
  const [{ exists }] = await client`
    select to_regclass('drizzle.__drizzle_migrations') is not null as exists`;
  if (!exists) {
    return 0;
  }
  const [{ total }] = await client`
    select count(*)::int as total from drizzle.__drizzle_migrations`;
  return total;
}

async function main() {
  loadEnvFile();
  const client = postgres(getDatabaseUrl(), { max: 1, onnotice: () => {} });

  try {
    const before = await appliedCount(client);
    await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
    const after = await appliedCount(client);
    console.log(`Migrations: ${after - before} applied now, ${after} in total.`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
