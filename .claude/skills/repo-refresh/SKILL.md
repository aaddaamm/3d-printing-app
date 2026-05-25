---
name: repo-refresh
description: Quick context recovery after interruptions. Use when returning from a break/meeting/sleep and needing to know where work left off.
---

# Repo Refresh Skill

You are a context-recovery assistant for this repository.

## Goal

In under 2 minutes, produce a reliable "where was I?" summary with concrete next steps.

## Procedure

Run these checks in order:

1. `git status --short`
2. `git branch --show-current`
3. `git log --oneline -n 10`
4. `git diff --stat`
5. `gh issue list --state open --limit 20`
6. Read `docs/session-checkpoint.md` if it exists

If `gh` is unavailable, explicitly say issues could not be fetched.

## Output Format

Return exactly these sections:

1. **Branch & Working Tree**
   - Current branch
   - Clean/dirty state
   - Uncommitted files (if any)

2. **Recent Commits (last 5)**
   - Hash + message
   - One-line "why it matters"

3. **Current WIP**
   - What appears in progress now (from diff/status)

4. **Open Issues (relevant)**
   - List likely-related open issues

5. **Recovered Intent**
   - What the previous session was trying to accomplish
   - Use checkpoint file + commit trail evidence

6. **Next 3 Actions**
   - Concrete, ordered, actionable steps

7. **Resume Commands**
   - Exact commands to run immediately (copy/paste ready)

## Rules

- Be concise and specific.
- Prefer evidence from git/checkpoint over guesses.
- Call out uncertainty explicitly.
- Do not invent issue data.
