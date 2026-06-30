# AGENTS.md

Concise operating manual for future Codex agents working on the MathLingo frontend.

## Read First

Before changing code, read:

1. `README.md` for project context, setup, and frontend goals.
2. `TODO.md` for the current milestone and non-goals.
3. `docs/api-contract.md` for backend response shapes and API behavior.
4. `example_stream_questions.json` when working on fixture-backed quiz UI.

Work on the active milestone in `TODO.md`. Do not build ahead into later milestones unless the user explicitly asks.

After completing any task, update `TODO.md` before finishing the turn. Check off relevant completed tasks, adjust milestone status when appropriate, and update the `Current Focus` section so it reflects what changed and the next goal forward.

## Project Context

MathLingo is a study app focused first on SAT/ACT-style math practice. This repository is the React + Vite frontend. The 1.0 goal is a fully functioning quiz UI with clear multiple-choice practice, feedback, progress, and strong loading/error/empty states.

The frontend should feel calm, focused, and useful for repeated study sessions. Gamification is welcome when it supports studying, but the quiz experience should remain the center of the app.

## Current Stack

- React
- Vite
- JavaScript with JSX
- ESLint
- CSS

Use existing project patterns before adding new architecture. Avoid new dependencies unless the current milestone requires them or the user approves them.

## Commands

Install dependencies:

```bash
npm install
```

Run local frontend:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

For implementation tasks, run `npm run lint` before finishing. Run `npm run build` when changes affect app structure, imports, build config, or production behavior.

## Backend Contract

Local backend default:

```text
http://127.0.0.1:5000
```

Preferred frontend env var:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Main quiz endpoint:

```text
GET /stream_questions
```

Treat `docs/api-contract.md` as the source of truth. Do not consume undocumented fields. Do not put backend secrets in frontend env files.

## Implementation Rules

- Keep changes scoped to the current milestone.
- Prefer small components and plain data flow over broad abstractions.
- Implement loading, empty, and error states for user-facing async work.
- Keep quiz interactions keyboard-friendly and accessible.
- Preserve responsive behavior for mobile and desktop.
- Do not add authentication, persistent history, dashboards, badges, or large routing changes before their milestones.
- Do not use temporary client IDs for permanent completed-question records.

## Design Rules

- Build the actual quiz experience first, not a marketing landing page.
- Keep the interface readable, focused, and study-oriented.
- Make answer choices large and easy to scan.
- Show feedback clearly after answer selection.
- Use gamification to reinforce study progress, not distract from it.
- Avoid decorative UI that does not help the user study.

## Testing Notes

Tests are not installed yet. When the testing milestone starts, prefer behavior-focused tests around:

- fixture-backed quiz rendering
- answer selection
- correct/incorrect feedback
- next-question flow
- session summary
- API loading, error, retry, and empty states

Tests must not call the real backend or OpenAI.

## Documentation Updates

Update documentation when changing:

- API request or response assumptions.
- Environment variables.
- Project commands.
- Frontend architecture.
- Dependency choices.
- Milestone scope.

When a milestone changes the app behavior or setup, update the relevant docs:

- `README.md` for user/project setup changes.
- `TODO.md` for completed task checkboxes, milestone status, `Current Focus`, and next work.
- `AGENTS.md` for Codex operating guidance.
- `docs/api-contract.md` only when the frontend/backend contract intentionally changes.
