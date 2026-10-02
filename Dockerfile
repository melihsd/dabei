# syntax=docker/dockerfile:1

FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# SvelteKit validates env vars at build time; the real values are read at runtime.
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
COPY package.json ./

# The SQLite file lives in /app/data. Mount a volume there; the folder is owned by the bun user.
RUN mkdir -p /app/data && chown bun:bun /app/data
VOLUME /app/data
USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000)).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Migrations run automatically when the server starts.
CMD ["bun", "build/index.js"]
