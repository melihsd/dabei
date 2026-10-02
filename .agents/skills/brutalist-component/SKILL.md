---
name: brutalist-component
description: Build or restyle a UI component for dabei in the brutalist black/white design. Use whenever a new component is needed in src/lib/components/ui/ or an existing one looks off-design.
---

# Building a brutalist component

## Before you start

- Read the "Design" section in `docs/project.md`.
- Check `src/lib/components/ui/` – does a similar component already exist? Extend it instead of duplicating.

## Steps

1. **Pick the base**
   - Purely visual (Card, Chip, Bubble, Button): plain Svelte element, no library.
   - Interactive with focus/keyboard/ARIA needs (Dialog, Popover, Tabs, Switch, Select): wrap the matching **bits-ui** primitive. Never copy a styled shadcn component.

2. **Create the files**

   ```
   src/lib/components/ui/<name>/
   ├── <name>.svelte
   └── index.ts        // export { default as <Name> } from './<name>.svelte';
   ```

3. **Write the component**
   - Svelte 5 runes: `let { class: className, children, ...rest } = $props();`
   - Merge classes with `cn()` from `#lib/utils.js` (SvelteKit 3 has no `$lib` alias; use `#lib/...` with the full file path, e.g. `#lib/components/ui/button/index.js`) so callers can extend.
   - Variants via a small `variants` object or `tailwind-variants` – keep it to what the app actually uses.
   - Forward `...rest` to the root element.

4. **Apply the design rules**
   - No `rounded-*`. Radius comes from `--radius: 0`.
   - Border: `border-2 border-foreground`.
   - Colors only from tokens (`bg-background`, `text-foreground`, …). Member colors come in as a prop, set via `style="--chip: {color}"`.
   - Hover/active: invert (black ↔ white) or hard offset shadow – never opacity fades or blur.
   - Focus: visible 2px outline with offset, never removed.
   - Motion ≤150 ms, wrapped in `motion-safe:`.

5. **Check both themes and mobile**
   - Light and dark mode.
   - 360 px width: no overflow, touch target ≥44 px.

6. **Add to the styleguide**
   - Add every variant/state to `src/routes/styleguide/+page.svelte`.

7. **Commit**
   - `feat(ui): add <name> component`

## Don'ts

- No default shadcn styles, no `rounded-*`, no `shadow-sm/md/lg`, no pastel colors.
- No hardcoded colors or text that belong in settings.
