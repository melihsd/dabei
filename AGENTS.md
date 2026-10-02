## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: ai-tools, drizzle, sveltekit-adapter, tailwindcss, prettier, eslint

---

# AGENTS.md – dabei

Read `docs/project.md` before starting any task. It defines scope, stack, data model and design.
Reusable workflows live in `.agents/skills/` – use them when a task matches.

---

## How we work

- Step by step. One concept per session, one commit per step.
- Before introducing a new concept (Drizzle, cookies, form actions, Docker): explain it briefly, name alternatives, then code.
- The agent proposes, the developer decides. Announce each commit, developer confirms.
- Only build what is listed in `docs/project.md` → "Scope". Anything else: ask first.
- After any change to scope, stack or design: update `docs/project.md`.

---

## Terminal permissions

| Allowed without asking                | Must be announced                       |
| ------------------------------------- | --------------------------------------- |
| `ls`, `grep`, `find`, `cat` – reading | `bun`, `bunx`, `git commit`, `git push` |
| Exploring the file structure          | Creating or changing files              |

---

## Commits

Conventional Commits, English:

```
feat: add slot mode to day cards
fix: comment bubble overflowing on mobile
chore: configure drizzle with sqlite
```

---

## Rules

- Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`) – no legacy `export let` / `$:`.
- TypeScript everywhere.
- Data access only through Drizzle, only in `+page.server.ts` / `+layout.server.ts` / `src/lib/server/`. Never import server code into components.
- Mutations via SvelteKit form actions with `use:enhance` – no separate REST API unless needed.
- No hardcoded names, colors, slots or workdays – always from the database (settings / members).
- UI components live in `src/lib/components/ui/`, built by us (see skill `brutalist-component`). shadcn-svelte provides the setup (`cn()`, tokens, bits-ui primitives) – never ship a stock shadcn component with its default look.
- No `rounded-*`, no pastel colors, no soft shadows.
- No external auth, no external database, no external services.
- No automated tests for now – manual QA.
