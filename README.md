# In The House

A local-first household management app: track jobs for your helper and family,
and let the built-in optimizer fit them into everyone's actual free time.

No backend, no login — data is stored in your browser's `localStorage`. Anyone
on the shared device/link uses the same app instance.

## Features

- **People** — add family members and the helper, each with their own weekly
  availability windows (e.g. helper 9am–3pm weekdays, parent 7–8:30pm evenings).
- **Jobs** — one-off or recurring (daily/weekly) chores, errands, and tasks,
  each with a category, priority, duration, optional due date, and either a
  locked assignee or a set of eligible people (or "anyone").
- **Schedule** — click *Optimize schedule* to auto-fit the next 7 days of jobs
  into people's free time. The algorithm prioritizes by deadline urgency and
  priority, respects who's eligible/available for each job, and balances
  workload across people. Assignments can be manually overridden afterwards.
- **Today** — a simple per-person checklist of what's scheduled today, with
  completion tracking.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run lint      # oxlint
```

Built with Vite, React, TypeScript, Tailwind CSS, and Zustand.
