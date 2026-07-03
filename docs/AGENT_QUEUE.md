# Agent queue — daily scratch pad

Rough tasks you jot down during the day. A **scheduled night agent** reads the **Draft** section, turns bullets into a todo list, implements what it can, then writes a **Nightly report** below.

**Do not put secrets** (API keys, passwords) in this file.

---

## Rules for the night agent

- Process only the **latest dated Draft section** unless told otherwise.
- Max **3 tasks** per night unless the draft explicitly says more.
- Prefer small, shippable PRs — branch name `cursor/<short-description>-fc38`.
- Run lint/build/tests before committing when code changes.
- If a task is ambiguous, **skip it** and explain why in the report (do not guess on auth, billing, or production data).
- Never deploy or change Supabase production without explicit instruction in the draft.
- When done: move completed draft bullets to **Done archive**, clear that draft section, append a **Nightly report**.

---

## Draft

Write messy bullets here. One `## Draft — YYYY-MM-DD` section per day.

### Draft — 2026-07-03

<!-- Example — delete or replace:
- fix thing on mobile
- geocode remaining dorms (oejab, kolping) — see seeds
- don't touch auth
-->

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

### Ideas for later
- …

### Manual tasks for you
- [ ] … (link to docs/MANUAL_TASKS.md section if relevant)

-->
