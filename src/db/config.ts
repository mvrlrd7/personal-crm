// Shared by the app, drizzle-kit and the seed script, so it must not import "server-only".

/**
 * Returns the PostgreSQL connection string.
 * Uses DATABASE_URL when set, otherwise builds it from the same POSTGRES_*
 * variables that docker-compose.yml uses to create the database.
 */
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
      "Database connection is not configured: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB in .env",
    );
  }

  const host = process.env.POSTGRES_HOST || "127.0.0.1";
  const port = process.env.POSTGRES_PORT || "5432";
  const user = encodeURIComponent(POSTGRES_USER);
  const password = encodeURIComponent(POSTGRES_PASSWORD);
  const database = encodeURIComponent(POSTGRES_DB);

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

/** Loads .env for command-line tools. Next.js loads it on its own. */
export function loadEnvFile(): void {
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env file: rely on variables already present in the environment.
  }
}
