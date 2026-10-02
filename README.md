# dabei

**Same minimal planner. More range.**

A small self-hosted planner for teams: everyone marks when they're in – full days or time slots – and can leave a short note on their entry, shown as a chat bubble. One container, one SQLite file, no login.

<!-- TODO: add a screenshot, e.g. docs/screenshot.png -->

![Screenshot placeholder](docs/screenshot.png)

## Features

- **Two modes:** full days, or time slots such as `09:00-13:00` (a global setting)
- **Week view:** one card per workday, this week and next week (from Sunday on, next week is the default)
- **One tap to toggle** your presence, with optimistic updates and a refresh every 30 s
- **Notes:** one optional note per entry (max 140 characters), shown as a chat bubble on your chip
- **In-app settings:** mode, slots, workdays and the list of names (add / remove), behind an admin password
- **No accounts:** pick your name or add yourself, choose your own color, remembered in a cookie
- **Brutalist design:** black and white, hard edges, light and dark mode

## Stack

Bun · SvelteKit (Svelte 5) · Tailwind CSS v4 · bits-ui · SQLite (`bun:sqlite`) with Drizzle ORM · Docker Compose

## Environment variables

| Variable         | Description                                     |
| ---------------- | ----------------------------------------------- |
| `DATABASE_URL`   | Path to the SQLite file, e.g. `./data/dabei.db` |
| `ADMIN_PASSWORD` | Password for the `/settings` page               |
| `COOKIE_SECRET`  | Long random string that signs the admin cookie  |

Copy `.env.example` to `.env` and fill it in. `.env` is never committed.

## Development

```sh
bun install
cp .env.example .env     # then set ADMIN_PASSWORD and COOKIE_SECRET
bun run dev               # migrations run automatically on start
# optional: bun run db:seed  (3 placeholder members)
```

Open `/styleguide` to see the design tokens and components. After changing `src/lib/server/db/schema.ts`, run `bun run db:generate` and commit the new migration in `drizzle/`. It is applied automatically the next time the server starts.

## Deploy with Docker

```sh
export ADMIN_PASSWORD=change-me
export COOKIE_SECRET=$(openssl rand -hex 32)
docker compose up -d --build
```

- The SQLite file lives on the `dabei-data` volume (`/app/data`). Include it in your backups.
- Migrations run automatically on every start. Add names in `/settings` after signing in with `ADMIN_PASSWORD`, or let people add themselves.
- **Run it behind a TLS-terminating reverse proxy** that sets `X-Forwarded-Proto` and `X-Forwarded-Host`. The Bun adapter assumes HTTPS, and form posts are rejected otherwise.
- The app has no login for regular use. If the URL is public, protect it with Basic Auth at the proxy.

## Credit

Inspired by [office-zeit](https://github.com/nestoririondo/office-zeit) by Nestor Iriondo. Written from scratch.

## License

MIT
