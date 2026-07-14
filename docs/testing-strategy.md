# Testing Strategy

This document describes the frontend test setup for MathLingo and the testing
boundaries for the version 1.0 quiz UI.

## Current Tools

The frontend uses:

* Vitest for the test runner because it integrates cleanly with Vite and uses
  the same module pipeline as the app.
* React Testing Library for rendering React components through user-visible
  behavior instead of implementation details.
* `@testing-library/user-event` for realistic keyboard, pointer, and form
  interactions.
* `@testing-library/jest-dom` for readable DOM assertions such as
  `toBeInTheDocument`.
* `jsdom` as the browser-like DOM environment for component tests.

Vitest is configured in `vite.config.js`. Shared test setup lives in:

```text
src/test/setup.js
```

The setup file imports the Vitest-compatible jest-dom entry point and provides
a local `VITE_API_BASE_URL` value for tests. Tests should still mock API calls
and must not use that URL to contact a live service.

## Commands

Run the full frontend test suite:

```bash
npm run test
```

Run tests in watch mode during local development:

```bash
npm run test:watch
```

Before finishing frontend implementation work, run:

```bash
npm run lint
npm run build
npm run test
```

## File Locations And Naming

Place component and hook tests near the code they cover, using names such as:

```text
src/App.test.jsx
src/components/quiz/QuizSetup.test.jsx
src/hooks/useQuizSession.test.js
```

Use `.test.jsx` for tests that render JSX and `.test.js` for plain JavaScript
utility tests.

Keep shared test helpers under `src/test/` only after duplication appears. Do
not add broad helper abstractions for a single test.

## User-Centered Component Tests

Prefer tests that describe what a student can see or do:

* Query by role, label text, accessible name, or visible text.
* Assert visible states such as headings, buttons, feedback, loading messages,
  errors, and summaries.
* Avoid private state, reducer action names, component instance details, and
  CSS class names unless the class is the behavior being tested.
* Avoid snapshots for normal UI behavior.

Good tests should still pass after a safe internal refactor that preserves the
same user-visible behavior.

## `user-event`

Use `@testing-library/user-event` for interactions a real user performs:

* Clicking answer choices or buttons.
* Typing into the number-of-questions field.
* Tabbing between controls.
* Submitting forms through keyboard interaction.

Lower-level event helpers should be rare and reserved for cases that
`user-event` cannot express clearly.

## Mocking The Question API

Tests must mock `src/api/questionsApi.js` instead of calling the live Flask
backend. Mocking the API module keeps tests focused on frontend behavior and
preserves the app's request boundary.

Example:

```js
import { vi } from 'vitest'

vi.mock('./api/questionsApi.js', async () => {
  const actual = await vi.importActual('./api/questionsApi.js')

  return {
    ...actual,
    fetchQuestions: vi.fn(),
  }
})
```

Adjust the relative import path to match the test file location. Import the
mocked `fetchQuestions` in the test when you need to set a resolved or rejected
value.

Do not mock `fetch` globally when the component under test uses
`questionsApi.js`; mock the API module instead. Utility tests for
`questionsApi.js` itself may mock `fetch` later if that behavior is explicitly
in scope.

## External Service Boundary

Frontend tests must not call:

* The live Flask backend.
* OpenAI.
* Postgres.
* Any production or preview service.

Tests should be deterministic and must run without backend services, API keys,
database credentials, or network access.

## Fixture Data

`example_stream_questions.json` may be used as a source for realistic test
data. Tests can also define smaller inline fixtures when only one or two fields
matter.

Fixture data is example data, not a replacement for `docs/api-contract.md`.
When response shape expectations change intentionally, update the API contract
and the relevant fixtures together.

## Milestone Boundaries

Milestone 15 includes only:

* Installing frontend test dependencies.
* Configuring Vitest with a browser-like DOM environment.
* Adding shared setup needed by the first test.
* Adding one basic user-visible app-render smoke test.
* Documenting how contributors should write and run tests.

Milestone 16 is where broad quiz behavior tests belong, including setup
validation, loading, errors, empty responses, answer selection, submission,
feedback, progression, summary scoring, retry behavior, and restart behavior.

Do not expand Milestone 15 into the Milestone 16 suite.

## Troubleshooting

If DOM APIs such as `document` or `HTMLElement` are missing, confirm
`vite.config.js` uses the `jsdom` test environment and that `jsdom` is
installed.

If `toBeInTheDocument` or other jest-dom matchers are missing, confirm
`src/test/setup.js` imports `@testing-library/jest-dom/vitest` and that the
setup file is listed in Vitest config.

If `App` renders the configuration error during tests, confirm the setup file
sets `VITE_API_BASE_URL` before importing `App`.

If a test tries to reach `127.0.0.1:5000`, mock `src/api/questionsApi.js` and
set the mocked `fetchQuestions` result instead of relying on a backend.

If React state updates produce `act` warnings, prefer awaiting the user action
from `user-event` and then awaiting the visible UI change with React Testing
Library queries such as `findByRole`.

