# syntax=docker/dockerfile:1

FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# SvelteKit validates env vars at build time; real values are provided at runtime.
RUN DATABASE_URL=build ADMIN_PASSWORD=build COOKIE_SECRET=build bun run build

FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_URL=/app/data/dabei.db

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/lib/server/db ./src/lib/server/db
COPY package.json ./

# The data folder is a volume; create it owned by the bun user so the SQLite file is writable.
RUN mkdir -p /app/data && chown bun:bun /app/data
USER bun
EXPOSE 3000

# Apply migrations (and ensure the settings row), then start the server.
CMD ["sh", "-c", "bun src/lib/server/db/migrate.ts && bun build/index.js"]
