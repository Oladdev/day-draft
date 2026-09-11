# Day Draft — Second Brain Daily Routine Scheduler

A routine-driven schedule manager that helps you *see your whole day, protect your free time, and get nudged before every commitment* — built around five pillars:

1. **Fixed vs. Fluid blocks** — Anchors (hard times: classes, meetings) vs Routine blocks (slidable, tied to a phase of day) with Tasks nested inside blocks.
2. **Energy routing** — every block/task is tagged High Focus / Medium / Admin; one-click *downshift* when energy drops.
3. **Day templates** — archetypes (Lecture-Heavy, Open-Dev, Weekend-Recovery) that instantiate onto a day and auto-fill open gaps.
4. **"Now" Focus HUD** — one screen for *what you're doing now + next*, an Engage session timer, and a hotkey Quick-Capture drawer.
5. **Slippage & rebalancing** — when the day slips, fluid blocks reflow into the remaining gaps and overflow is surfaced.

## Status: Increment 1 (in progress)

A local-first web app (React + TypeScript + Vite + Tailwind). Data persists in the browser behind a clean data layer, so the planned **self-hosted server** (source of truth for phone sync) and **Tauri native shell** (tray + autostart + native reminders) slot in next without reworking the UI.

## Run it

```bash
npm install      # from this folder (installs the web workspace)
npm run dev      # then open the printed http://localhost:5173
```

## Roadmap

- **Increment 1** — Core UX in the browser: Day view, fixed/fluid layout, energy routing, backlog, Now HUD, quick-capture, templates, rebalance. ← *now*
- **Increment 2** — Self-hosted Node + SQLite server as source of truth (behind the same data interface).
- **Increment 3** — Recurrence engine + full rebalancing dialog + free-time analytics.
- **Increment 4** — Tauri desktop app: tray, launch-on-startup, native OS reminders.
- **Increment 5** — PWA + Web Push + secure remote access (phone).

See `C:\Users\USER\.claude\plans\i-want-to-build-cheeky-garden.md` for the full plan.
