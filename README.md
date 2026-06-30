# MathLingo Frontend

MathLingo is a studying website for practicing academic subjects, with an initial focus on mathematics for standardized exams such as the SAT and ACT. The larger product goal is to help students improve test readiness through interactive practice, immediate feedback, and study progression.

This repository is the React frontend for MathLingo. It will serve multiple-choice quiz questions to users, communicate with the MathLingo backend, and provide a focused, intuitive study experience. The frontend should feel like a serious study tool with game-informed motivation: points, badges, progress, levels, difficulty selection, timers, and session summaries should support learning rather than distract from it.

## Current Status

This project is currently in the planning phase.

The codebase started from the React + Vite scaffold:

```bash
npm create vite@latest mathlingo-app -- --template react
```

The current UI is still close to the starter template. Planning and reference docs are being created before the first real quiz UI implementation.

## Release Goal

The 1.0 release goal is a fully functioning quiz UI.

At minimum, the app should:

- Fetch math questions from the backend.
- Present one or more multiple-choice questions.
- Let the user select answers.
- Show correct and incorrect feedback.
- Track quiz progress within a session.
- Show good loading, empty, and error states.
- Provide an intuitive, user-friendly interface for studying.

Later releases can expand into persistent user accounts, completed-question history, badges, levels, analytics, review flows, and broader subject support.

## Tech Stack

- React
- Vite
- JavaScript with JSX
- ESLint
- CSS

Current runtime dependencies:

- `react`
- `react-dom`

Current development dependencies:

- `vite`
- `@vitejs/plugin-react`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `@types/react`
- `@types/react-dom`

See `package.json` for exact versions and scripts.

## Requirements

Use a recent Node.js version compatible with the installed Vite version.

Install dependencies with:

```bash
npm install
```

## Local Development

Start the frontend development server:

```bash
npm run dev
```

Vite will print the local frontend URL, usually:

```text
http://127.0.0.1:5173/
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run preview
```

## Backend

During local development, the frontend should expect the backend at:

```text
http://127.0.0.1:5000
```

When adding the API client, prefer an environment variable so the backend URL can change across local development, preview deployments, and production.

Recommended local environment file:

```bash
.env.local
```

Recommended variable:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Vite only exposes frontend environment variables prefixed with `VITE_`. Do not put backend secrets or private API keys in frontend environment files.

## Backend API Contract

The main backend endpoint for the quiz UI is:

```text
GET /stream_questions
```

This endpoint returns a complete JSON response containing a `questions` array. The fixture `example_stream_questions.json` shows a happy-path sample response for frontend planning and UI development.

Use `docs/api-contract.md` as the comprehensive API reference. It documents query params, response fields, handled error responses, and backend compatibility expectations.

Current question data includes:

- `id`
- `difficulty`
- `math_subject`
- `question`
- `answer_choice_list`
- `answer`

Do not assume the fixture covers authentication, completed-question history, explanations, diagrams, or future question types.

## Frontend Design Direction

The quiz experience should be the primary screen, not a marketing landing page. MathLingo should feel calm, focused, and useful for repeated study sessions.

Design priorities:

- Clear question prompt.
- Large, readable answer choices.
- Immediate feedback after answer selection.
- Visible progress through the current session.
- Difficulty and subject context.
- Timer support when added.
- Reward and progression elements that reinforce studying.
- Responsive layout for desktop and mobile.
- Accessible color contrast, focus states, and keyboard-friendly controls.

Gamification should support learning. Points, badges, streaks, levels, and progress visuals should make practice feel rewarding without hiding the core study task.

## Important Project Docs

- `docs/api-contract.md`: frontend/backend API contract and response shapes.
- `TODO.md`: implementation roadmap and milestone checklist.
