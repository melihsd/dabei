# dabei

**Who's in, and when.**

A small self-hosted planner for teams. Everyone marks when they're in – full days or time slots – and can leave a short note or an emoji on their entry. One container, one SQLite file, no external services.

[![Docker](https://github.com/melihsd/dabei/actions/workflows/docker.yml/badge.svg)](https://github.com/melihsd/dabei/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE)

> Inspired by [office-zeit](https://github.com/nestoririondo/office-zeit) by Nestor Iriondo. Written from scratch.

## Features

- **Two modes:** full days, or time slots such as `09:00-13:00` (a global setting)
- **Week view:** one card per workday, this week and next week (from Sunday on, next week is the default). Past days are dimmed and locked
- **One tap to toggle** your presence, with optimistic updates and a live refresh every 10 s while the tab is visible
- **Notes and emojis:** one optional note per entry (max 140 characters) shown as a chat bubble, or a quick emoji (🐶 🍺 ⏰ 🎂) on your chip
- **In-app settings:** mode, slots, workdays and the list of names, behind an admin password
- **No accounts by default:** pick your name or add yourself, choose your own color, remembered in a cookie
- **Optional Outline login:** sign in with your [Outline](https://www.getoutline.com) account, optionally restricted to one group
- **Brutalist design:** black and white, hard edges, light and dark mode

## Stack

Bun · SvelteKit (Svelte 5) · Tailwind CSS v4 · bits-ui · SQLite (`bun:sqlite`) with Drizzle ORM · Docker Compose

## Quick start

```sh
export ADMIN_PASSWORD=change-me
export COOKIE_SECRET=$(openssl rand -hex 32)
docker compose pull && docker compose up -d     # http://localhost:3000
```

Then open `/settings`, sign in with the admin password and add your team's names – or let people add themselves.

## Configuration

Copy `.env.example` to `.env` and fill it in. `.env` is never committed.

| Variable              | Required | Description                                                                                                                                           |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | no       | Path to the SQLite file, e.g. `./data/dabei.db`                                                                                                       |
| `ADMIN_PASSWORD`      | no       | Password for `/settings`. If empty, password login is disabled                                                                                        |
| `COOKIE_SECRET`       | no       | Signs admin and login cookies. If empty, a key is generated once and stored in `.cookie-secret` next to the SQLite file, so sessions survive restarts |
| `OUTLINE_URL`         | no       | Base URL of your Outline instance. Outline login is on once all four `OUTLINE_*`/`OAUTH_*` are set                                                    |
| `OAUTH_CLIENT_ID`     | no       | Outline OAuth client ID                                                                                                                               |
| `OAUTH_CLIENT_SECRET` | no       | Outline OAuth client secret                                                                                                                           |
| `OAUTH_REDIRECT_URI`  | no       | `https://your-dabei-host/auth/callback`                                                                                                               |
| `PORT`                | no       | Published port in Compose (default `3000`)                                                                                                            |

## Login with Outline (optional)

By default there are no accounts: people pick a name. If you run Outline, you can require a login with it instead:

1. In Outline, create an OAuth client (Settings → Applications) with the redirect URI `https://your-dabei-host/auth/callback`.
2. Set `OUTLINE_URL`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` and `OAUTH_REDIRECT_URI`. Login switches on automatically; there is no toggle.

People then sign in with Outline. Their Outline name becomes their dabei name (an existing name with the same spelling is linked on first login), and they choose their own color. Outline admins can open `/settings`; without Outline login, `/settings` is protected by `ADMIN_PASSWORD`.

In `/settings` you can restrict login to one Outline group. Membership is checked at login only, sessions last 7 days. To shut someone out right away, remove them in dabei too.

## Development

```sh
bun install
cp .env.example .env
bun run dev               # migrations run automatically on start
bun run db:seed           # optional: 3 placeholder members
```

| Command               | What it does                                   |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Start the dev server                           |
| `bun run build`       | Production build                               |
| `bun run check`       | Type-check with svelte-check                   |
| `bun run lint`        | Prettier and ESLint                            |
| `bun run db:generate` | Generate a migration after changing the schema |
| `bun run db:studio`   | Browse the database with Drizzle Studio        |

Open `/styleguide` to see the design tokens and components. After changing `src/lib/server/db/schema.ts`, run `bun run db:generate` and commit the new migration in `drizzle/`. It is applied automatically the next time the server starts. More background is in [docs/project.md](docs/project.md).

## Deployment

Every push to `main` builds an image (amd64 and arm64) with GitHub Actions and publishes it to `ghcr.io/melihsd/dabei` (tags: `latest`, the commit SHA, and `vX.Y.Z` for version tags). Pull requests only check that the image builds. If the package is private, make it public under the repository's _Packages_ settings, or log in with `docker login ghcr.io`.

Build locally with Compose:

```sh
docker compose up -d --build
```

Or build the image yourself and run it:

```sh
docker build -t dabei .
docker run -d --name dabei -p 3000:3000 \
  -e ADMIN_PASSWORD=change-me -e COOKIE_SECRET=$(openssl rand -hex 32) \
  -v dabei-data:/app/data dabei
```

Good to know:

- The SQLite file lives in `/app/data`. Mount a volume there and include it in your backups.
- Migrations run automatically on every start. The image has a health check.
- It works on plain http and behind a reverse proxy (form posts are accepted when the `Origin` host matches the `Host` or `X-Forwarded-Host` header). Put a TLS proxy in front if it's reachable from the internet.
- Without Outline login there is no authentication for regular use. If the URL is public, protect it with Basic Auth at the proxy.

## License

[MIT](LICENSE)
