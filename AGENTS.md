<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Nightly agent queue

When the user (or a scheduled run) asks you to **process the agent queue**:

1. Read [`docs/AGENT_QUEUE.md`](./docs/AGENT_QUEUE.md) — **Rules**, then the latest **`## Draft — YYYY-MM-DD`** section.
2. Turn draft bullets into a **prioritized** todo list (draft order = priority unless `P1`/`P2` or numbers say otherwise). Respect “don’t touch” notes.
3. Execute **all tasks in priority order** — do not stop after an arbitrary count. If runtime ends before the queue is empty, defer the rest to **Deferred** in the report and leave them in the draft for the next run.
4. Implement, test, commit, push, create/update PRs on `cursor/<name>-fc38` branches.
5. Append a **Nightly report** at the top of **Nightly reports** in `AGENT_QUEUE.md` with:
   - **Summary** — what happened in plain language
   - **Completed** — concrete deliverables
   - **Issues / blockers** — failures, flaky tests, skipped/ambiguous items, **Deferred** (not started or unfinished due to time)
   - **Ideas for later** — optional improvements noticed while working
   - **Manual tasks for you** — checkbox list of anything only the operator can do (dashboards, DNS, OAuth, cron, secrets). Link [`docs/MANUAL_TASKS.md`](./docs/MANUAL_TASKS.md) where helpful.
6. Move finished draft items to **Done archive**; remove only completed bullets from the draft (leave **Deferred** items for the next run).
7. Do **not** duplicate long manual checklists — only net-new manual steps from tonight’s work.

Operator checklists live in [`docs/YOUR_TODO.md`](./docs/YOUR_TODO.md) and [`docs/MANUAL_TASKS.md`](./docs/MANUAL_TASKS.md).
