# Agent queue — daily scratch pad

Rough tasks you jot down during the day. A **scheduled night agent** reads the **Draft** section, turns bullets into a todo list, implements what it can, then writes a **Nightly report** below.

**Do not put secrets** (API keys, passwords) in this file.

---

## Rules for the night agent

- Process only the **latest dated Draft section** unless told otherwise.
- Work through **all tasks in priority order** — do not stop after a fixed count. If time or runtime runs out, finish the current task cleanly, then list remaining items under **Issues / blockers → Deferred** in the nightly report.
- **Priority:** order in the draft = priority (top first). You can prefix `P1` / `P2` / `P3` or `1.` / `2.` if you want to be explicit.
- Prefer small, shippable PRs — branch name `cursor/<short-description>-fc38`.
- Run lint/build/tests before committing when code changes.
- If a task is ambiguous, **skip it** and explain why in the report (do not guess on auth, billing, or production data).
- Never deploy or change Supabase production without explicit instruction in the draft.
- When done: move completed draft bullets to **Done archive**, clear that draft section, append a **Nightly report**.

---

## Draft

Write messy bullets here. One `## Draft — YYYY-MM-DD` section per day.

### Draft — 2026-07-03

- [ ]  put more info about the dorm on dorm page 
- [ ] dashboard/user page not opening when i click on my email in top right corner when logged in ( maybe change it on icon) 
- [ ] is it possible to apply through the dormra website without redirecting to provider website. if yes - work on it 
- [ ] ability to log out 
- [ ] copy filter options from other providers websites 
- [ ] add other dorms 
- [ ] write down list of students groups/ chats and so on where i can in fiture promote/ post info about dormra
- [ ] search bar - strings layout (somewhere middle/ somewhere from the lest - correct) 
- [ ] research if i need to start company if i add subscriptions in austria 
- [ ] make custom map instead of open source one with our brand design 

---

## Done archive

Completed items moved here by the night agent (newest date first).

---

## Nightly reports

Newest report at the top. The agent adds one block per run.

<!-- Agent template:

## Nightly report — YYYY-MM-DD

**Branch(es) / PR(s):** …

### Summary
…

### Completed
- …

### Issues / blockers
- …
- **Deferred** (ran out of time — do next run): …

### Ideas for later
- …

### Manual tasks for you
- [ ] … (link to docs/MANUAL_TASKS.md section if relevant)

-->
