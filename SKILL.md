---
name: preflight
description: Use before writing or editing any code — new features, refactors, config changes, "quick" fixes, all of it. Forces confirmation that you actually understand the code path you're about to touch, have questioned whether this is the smallest safe change, and have a validation plan, before the first line is written. Trigger this even when a request sounds simple, low-risk, or urgent ("just add a flag", "should be a one-liner", "quick fix", "go ahead and implement") — confidence in a request is not a reason to skip it. This is the front door to the rest of the engineering skill set: once preflight clears, route to debug-mantra, scrutinize, post-mortem, or management-talk as the situation calls for.
---

# Preflight

Most coding mistakes aren't typos. They're decisions made one step too early — fixing before reproducing, editing before reading the caller, shipping before deciding what "working" even means. Preflight puts a small amount of friction in front of that moment, so it happens before the edit instead of after, in a bug report.

Run the four gates below before the first line of code. Scale the depth to the size of the change: a one-line typo fix doesn't need a written validation plan, but a new endpoint, a changed default, or anything touching shared state does. The goal is checking proportional to risk, not ceremony for its own sake.

## Gate 1 — Restate the ask

State, in one sentence, what "done" looks like and who it's for. If the request could reasonably be satisfied two different ways, that's a sign the ask isn't understood yet — surface the ambiguity instead of silently picking one.

## Gate 2 — Map the terrain before touching it

Read the actual code path the change will live in — not just the file the user named, but its callers, its callees, the tests around it, and the config or feature flags that feed it. Find the convention already used nearby (naming, error handling, logging, abstraction style) and match it instead of inventing a new one. If the data and control flow through this area can't be sketched out, even roughly, that means more reading is needed before more writing.

## Gate 3 — Question the change, not just its implementation

Ask whether this needs to be done at all, and if so, whether there's a smaller, simpler, or lower-risk way to reach the same outcome. Default to the smallest diff that fully solves the stated problem; bigger refactors can be the right call, but they should be a deliberate decision, not the path of least resistance. Name the blast radius — what else calls this code, reads this data, or relies on this behavior — before editing it. If the honest answer to "could this be smaller" is yes, shrink the plan first.

## Gate 4 — Decide how you'll know it worked

Write the validation plan before writing the change: which test, manual check, or observable output will prove it works, and what would prove it broke something else. A change is done when a check that was actually run says so — not when it compiles, and not when the happy path worked once.

If this gate is for a bug, the validation plan starts with a reliable, reproduced failure captured *before* the fix. That discipline lives in `debug-mantra` — preflight's job here is just to trigger it, not replace it.

## Hand-offs

Preflight is the front door, not the whole house:

- **Something's broken** → `debug-mantra`. Don't propose a fix before there's a reliable repro and a falsified hypothesis. Gate 2 above feeds straight into its "trace fail path" step.
- **Reviewing a plan, PR, or diff** (yours or someone else's) → `scrutinize`. Gate 3 above is the lightweight version of it; run the full pass for anything non-trivial or outside code you own.
- **A real bug just got fixed** → `post-mortem`. Capture what broke, why, the fix, and how it reached production while it's still fresh — not in six months when no one remembers.
- **Reporting status to anyone outside this code** → `management-talk`. Translate before pasting a stack trace into a status update.

## Anti-patterns this is meant to catch

- Editing the first file a search turns up without reading what calls it.
- Writing the fix before the test "to save time," then never writing the test.
- Calling something done because it compiled or the happy path worked once.
- Re-implementing a helper that already exists nearby, because writing a new one was faster than finding it.
- Expanding scope mid-task ("while I'm in here...") without flagging it as a separate decision.

## Quick scan

- [ ] Goal and "done" condition stated in one sentence
- [ ] Actual code path read — callers, callees, tests, config
- [ ] Matched existing conventions instead of inventing new ones
- [ ] Smallest viable change and its blast radius named
- [ ] Validation plan written down before editing
- [ ] Bug fix? Reliable repro exists first
- [ ] Know which companion skill this hands off to when done
