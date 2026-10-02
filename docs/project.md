# dabei

**Same minimal planner. More range.**

A small self-hosted planner for teams: everyone marks when they're in – full days or time slots – and can leave a short note on their entry, shown as a chat bubble. One container, one SQLite file, no login.

Inspired by [office-zeit](https://github.com/nestor-iriondo/office-zeit) by Nestor Iriondo. Written from scratch, no code taken over.

---

## Tech Stack

| Part        | Choice                         | Note                                                   |
|-------------|--------------------------------|--------------------------------------------------------|
| Framework   | SvelteKit (Svelte 5, TS)       | `adapter-node`                                         |
| Styling     | Tailwind CSS v4                | Design tokens as CSS variables                         |
| Components  | shadcn-svelte setup + bits-ui  | Own components, own look – see "Design"                |
| Database    | SQLite + Drizzle ORM           | `better-sqlite3`, one file, no external service        |
| Identity    | Name picker + cookie           | No accounts, no passwords                              |
| Admin       | `ADMIN_PASSWORD` env           | Protects the settings page only                        |
| Deploy      | Docker Compose                 | Hetzner, SQLite file on a volume                       |

Why Drizzle instead of Prisma: lighter, no query engine binary in the Docker image, scaffolded by `sv add`, schema is plain TypeScript.

---

## Scope

### Modes
- `day`: one toggle per person per day
- `slots`: each day is split into the configured time windows, toggle per slot
- Mode is a global setting

### Week view
- One card per configured workday, side by side, stacked on mobile
- Card shows weekday + date; in slot mode, slots are rows inside the card
- Present people appear as colored name chips
- Own chip highlighted, others slightly dimmed
- Click/tap on day (or slot) = toggle own presence
- Subtle appear/disappear animation
- Tabs: "This week" / "Next week" – from Sunday on, next week is the default

### Comments
- Each presence entry can have one optional note, max 140 chars
- Shown as a chat bubble attached to the person's chip
- Only the owner can add/edit/delete their note
- Removing presence removes the note

### Settings (in-app, stored in SQLite)
- Team members: name, color, order, active/inactive
- Mode: `day` / `slots`
- Slots: list of time windows, e.g. `09:00-13:00`, `13:00-18:00`
- Workdays: any subset of Mon–Sun
- Protected by `ADMIN_PASSWORD` (simple password form, signed cookie)

### Onboarding
- First visit: "Who are you?" – pick name from active members
- Member id stored in a cookie (long-lived, httpOnly)
- "Not you?" link to switch

### Live updates
- Poll every 30 s via `invalidateAll()` while the tab is visible

---

## Data model (Drizzle)

```ts
// src/lib/server/db/schema.ts
import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),            // hex, e.g. "#FF3B00"
  sortOrder: integer('sort_order').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true)
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),             // always 1 – single row
  mode: text('mode', { enum: ['day', 'slots'] }).notNull().default('day'),
  slots: text('slots').notNull().default('09:00-13:00,13:00-18:00'),
  workdays: text('workdays').notNull().default('mon,tue,wed,thu,fri')
});

export const presence = sqliteTable(
  'presence',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),             // ISO "2026-10-05"
    slot: text('slot').notNull().default(''), // '' in day mode, "09:00-13:00" in slot mode
    comment: text('comment'),                 // optional, max 140 chars
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
  },
  (t) => [uniqueIndex('presence_member_date_slot').on(t.memberId, t.date, t.slot)]
);
```

`slot` is `''` instead of `NULL` in day mode on purpose: SQLite treats NULLs as distinct in unique indexes, so `NULL` would allow duplicate day entries.

---

## Design

**Brutalist – black and white as the base.**

- Black, white, hard edges, clear typography
- `--radius: 0` everywhere. No `rounded-*`
- Borders: 2px solid, black (white in dark mode)
- Shadows: only hard offset shadows (e.g. `4px 4px 0 0 #000`) as an accent, never blurred
- Color only as accent: each member's chip color is the main exception
- No pastels – saturated colors only
- Typography: monospace or grotesque, no serif (e.g. JetBrains Mono + Space Grotesk)
- Chat bubble: rectangle with a hard 2px border and a square/triangular tail, no rounded corners
- Motion: short and functional (≤150 ms), respects `prefers-reduced-motion`

### Components (own, in `src/lib/components/ui/`)
Build in this order, each one from zero:
`Button`, `Card`, `Chip`, `Tabs`, `Bubble`, `Input`, `Textarea`, `Dialog`, `Popover`, `Switch`, `ColorPicker`, `Toast`.
Use bits-ui primitives under the hood where accessibility matters (Dialog, Popover, Tabs, Switch).

---

## Environment variables

```
DATABASE_URL="file:./data/dabei.db"
ADMIN_PASSWORD=""
COOKIE_SECRET=""
```

`.env` never in git. `.env.example` with empty values.

---

## Open points

- [ ] Domain / subdomain on Hetzner
- [ ] Basic Auth in front of the whole app (public URL)?
- [ ] Past weeks: read-only view or none?
