# syntax=docker/dockerfile:1

# Production image, built by CI (.github/workflows/deploy.yml).
# Contains the Next.js standalone server plus the migration and seed scripts,
# so migrations run as a one-off container from the same image as the app.

FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
# pnpm version comes from "packageManager" in package.json.
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
# The scripts run outside Next.js, so they need whole packages, not the traced subset.
RUN mkdir -p /tools/node_modules \
    && cp -RL node_modules/drizzle-orm node_modules/postgres /tools/node_modules/

FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# Migrations and seed: node tools/scripts/migrate.ts, node tools/scripts/seed.ts
COPY --from=build /tools/node_modules ./tools/node_modules
COPY drizzle ./tools/drizzle
COPY src/db/config.ts src/db/schema.ts ./tools/src/db/
COPY scripts/migrate.ts scripts/seed.ts ./tools/scripts/
RUN echo '{ "type": "module" }' > tools/package.json

USER node
EXPOSE 3000
CMD ["node", "server.js"]
