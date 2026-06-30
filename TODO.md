# TODO

This file is the milestone tracker for MathLingo frontend implementation.

Future Codex agents should work on one milestone at a time. Do not build across multiple systems unless the current task explicitly says to do so. Each milestone includes scope, acceptance criteria, and non-goals to keep implementation focused and reviewable.

## Current Focus

Milestone 1: Static Quiz UI From Fixture

Status: next

Goal: replace the Vite starter screen with a fixture-backed quiz experience.

## Milestone 0: Planning Docs

Status: complete

Scope:

- [x] Rewrite `README.md` with project context, setup, backend expectations, and Codex notes.
- [x] Create this milestone-based `TODO.md`.
- [x] Create `AGENTS.md` with Codex-specific implementation guidance.
- [x] Confirm `docs/api-contract.md` is the API source of truth.

Acceptance criteria:

- A future Codex agent can understand what MathLingo is.
- A future Codex agent can find the active milestone before writing code.
- Setup, backend URL, and core API contract references are documented.
- Deferred features and non-goals are clearly stated.

Non-goals:

- Do not replace the Vite starter UI yet.
- Do not add frontend dependencies.
- Do not implement quiz behavior yet.

## Milestone 1: Static Quiz UI From Fixture

Scope:

- [ ] Replace the Vite starter screen with a MathLingo quiz experience.
- [ ] Use `example_stream_questions.json` as the initial happy-path fixture.
- [ ] Display one question at a time.
- [ ] Render the four multiple-choice answers.
- [ ] Let the user select an answer.
- [ ] Show correct and incorrect feedback.
- [ ] Add next-question behavior.
- [ ] Show current session progress.
- [ ] Show an end-of-session summary.

Acceptance criteria:

- The app can run without the backend.
- A user can complete a fixture-backed quiz session.
- Feedback is clear and visually distinct.
- The layout works on desktop and mobile.
- The UI feels like a study product, not the Vite starter.

Non-goals:

- Do not fetch from the backend yet.
- Do not add login or signup.
- Do not persist completed-question records.
- Do not introduce broad routing unless needed for this milestone.

## Milestone 2: Backend Question API Integration

Scope:

- [ ] Add frontend API configuration using `VITE_API_BASE_URL`.
- [ ] Fetch questions from `GET /stream_questions`.
- [ ] Support `difficulty` query values: `easy`, `medium`, `hard`.
- [ ] Support `num_questions` query values from `1` to `20`.
- [ ] Add loading state while questions are fetched.
- [ ] Add error state with retry.
- [ ] Add empty state for successful responses with no questions.
- [ ] Keep fixture-backed development useful for local UI work and tests.

Acceptance criteria:

- The app can load questions from a local backend at `http://127.0.0.1:5000`.
- API behavior matches `docs/api-contract.md`.
- Invalid or failed backend responses do not crash the UI.
- The user can retry after an API error.

Non-goals:

- Do not add authentication.
- Do not store completed-question history permanently.
- Do not consume undocumented backend fields.

## Milestone 3: Practice Session Experience

Scope:

- [ ] Add a difficulty selector.
- [ ] Add a question count selector.
- [ ] Add a timer or elapsed-time display.
- [ ] Add score calculation.
- [ ] Add lightweight points or progress feedback.
- [ ] Improve session summary with score, accuracy, difficulty, and time.
- [ ] Polish responsive desktop and mobile layouts.

Acceptance criteria:

- A user can choose the shape of a practice session.
- Session progress and results are easy to understand.
- Gamification supports studying without obscuring the quiz.
- Controls are accessible by keyboard and screen readers.

Non-goals:

- Do not add database-backed progression.
- Do not add badges, levels, or streaks beyond lightweight local feedback.
- Do not build a full dashboard yet.

## Milestone 4: Test Foundation

Scope:

- [ ] Add a test runner and React component testing tools if approved.
- [ ] Test rendering a fixture-backed quiz question.
- [ ] Test answer selection.
- [ ] Test correct and incorrect feedback.
- [ ] Test next-question behavior.
- [ ] Test session summary.
- [ ] Test API loading, error, retry, and empty states.

Acceptance criteria:

- Core quiz behavior is covered by maintainable tests.
- Tests run with one documented command.
- Tests avoid real backend and OpenAI calls.
- Future UI changes have a safety net around the main practice flow.

Non-goals:

- Do not build a large exhaustive test suite.
- Do not add end-to-end browser tests unless explicitly requested.
- Do not make tests depend on live backend services.

## Milestone 5: Auth Planning And Shell

Scope:

- [ ] Document the expected auth API contract once backend details exist.
- [ ] Add login, signup, logout, and account view shells.
- [ ] Add an auth state boundary or provider if needed.
- [ ] Decide which routes require authentication.
- [ ] Preserve unauthenticated practice if that remains a product goal.

Acceptance criteria:

- The frontend has a clear place for auth UI and auth state.
- Auth assumptions are documented before real integration.
- The quiz flow is not broken for unauthenticated users unless the product decision changes.

Non-goals:

- Do not fake production auth.
- Do not store sensitive tokens insecurely.
- Do not require auth for MVP practice unless explicitly requested.

## Milestone 6: Completed Question Records

Scope:

- [ ] Wait for backend support before implementation.
- [ ] Record completed questions for authenticated users.
- [ ] Store selected answer, correctness, timestamp, and question reference.
- [ ] Add a basic history or review screen.
- [ ] Add empty and error states for history.

Acceptance criteria:

- Completed-question records are backed by backend persistence.
- Records reference stable public question IDs.
- Users can review previous answers.
- Missing or empty history is handled gracefully.

Non-goals:

- Do not implement before backend question IDs and record endpoints are confirmed.
- Do not use temporary client IDs for permanent records.
- Do not build advanced analytics in this milestone.

## Milestone 7: Gamification And Progression

Scope:

- [ ] Add points.
- [ ] Add streaks.
- [ ] Add badges.
- [ ] Add levels or progression.
- [ ] Add subject and difficulty progress indicators.
- [ ] Add a monthly habit tracker.

Acceptance criteria:

- Progression reflects real study activity.
- Reward mechanics are understandable and not noisy.
- Users can see meaningful progress over time.
- The quiz remains the main experience.

Non-goals:

- Do not let gamification obscure question practice.
- Do not add social features unless explicitly requested.
- Do not create permanent progression without backend support.

## Milestone 8: Release Polish

Scope:

- [ ] Run an accessibility pass.
- [ ] Run a responsive design pass.
- [ ] Polish error, empty, and loading copy.
- [ ] Confirm lint passes.
- [ ] Confirm production build passes.
- [ ] Review deployment configuration.
- [ ] Update `README.md`, `TODO.md`, and `AGENTS.md`.

Acceptance criteria:

- The app is ready for a 1.0 quiz UI release.
- Main user flows are stable.
- Documentation reflects the current implementation.
- Known limitations are documented.

Non-goals:

- Do not add major new features during release polish.
- Do not change the API contract without a matching backend task.
