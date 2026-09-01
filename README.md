# In The House

A local-first household management app: track jobs for your helper and family,
and see the whole week's plan derived directly from who's assigned to what.

No backend, no login — data is stored in your browser's `localStorage`. Anyone
on the shared device/link uses the same app instance.

## Features

- **People** — add family members and the helper.
- **Jobs** — one-off, daily, or weekly recurring chores, errands, and tasks,
  each with a category, priority, duration, an optional fixed time, and a
  default assignee.
- **Schedule** — the 7-day view is a direct projection of your jobs onto the
  calendar (no auto-fitting, nothing ever fails to "fit") — every occurrence
  shows up with its default time and person, and you can adjust or skip any
  single occurrence without changing the job's default.
- **Today** — a simple per-person checklist of what's on today, with
  completion tracking.
- **Meals** and **Shopping** — a 7-day meal planner and a simple categorized
  shopping list.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run lint      # oxlint
```

Built with Vite, React, TypeScript, Tailwind CSS, and Zustand.
