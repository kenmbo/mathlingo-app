# MathLingo Frontend TODO

This document defines the implementation roadmap for the MathLingo frontend.

The roadmap is divided into milestones so that contributors and Codex agents can work on one system or feature at a time without expanding the scope of the task.

The initial roadmap targets the version 1.0 quiz experience:

* Configure a quiz.
* Fetch questions from the backend.
* Present one question at a time.
* Submit answers.
* Show immediate feedback.
* Track session progress.
* Display a final summary.
* Handle loading, empty, and error states.
* Support desktop, mobile, keyboard, and assistive-technology users.

---

## Current Focus

Milestone 14: Accessibility Review

Status: Complete

Next: Milestone 15 — Add Frontend Test Infrastructure.

Note: Screen-reader software was not available in this environment. The
accessibility tree was inspected with Playwright's ARIA snapshot as an
assistive-technology proxy, and a real screen-reader pass remains recommended
when one is available.

---

## How to Use This File

### Agent workflow

Before beginning a task:

1. Read:

   * `README.md`
   * `docs/api-contract.md`
   * `docs/frontend-architecture.md`
   * This file
2. Identify the active milestone.
3. Work only on the requested checklist item or milestone.
4. Do not begin later milestones unless explicitly requested.
5. Preserve the documented API contract and architecture boundaries.
6. Run the validation commands required by the milestone.
7. Report:

   * Files changed.
   * Validation commands run.
   * Any validation failures.
   * Any unresolved decisions or blockers.
8. Mark an item complete only after its acceptance criteria are satisfied.

### Scope rules

* A milestone should leave the application in a working state.
* Avoid unrelated refactoring.
* Do not install dependencies unless the milestone explicitly requires them.
* Do not create placeholder components for future milestones.
* Do not silently change the backend contract.
* Do not claim that a command passed unless it was actually run.
* Stop when the requested milestone is complete.

### Checklist notation

* `[ ]` Not started
* `[~]` In progress
* `[x]` Completed
* `[!]` Blocked

---

# Milestone 0 — Align Planning Documents and Development Fixture

## Summary

Milestone 0 is a documentation and fixture alignment pass. Before production quiz code is introduced, the frontend contract, architecture notes, and local example response should agree on the required question fields, stable question IDs, and the fact that `GET /stream_questions` returns one complete JSON payload rather than an incremental stream.

## Goal

Ensure that the API contract, architecture document, and local development fixture agree on the required question shape before production code depends on them.

## Tasks

* [x] Compare the question shape in:

  * `docs/api-contract.md`
  * `docs/frontend-architecture.md`
  * `example_stream_questions.json`
* [x] Add a stable example `id` to every question in `example_stream_questions.json`.
* [x] Update the question-shape example in `docs/frontend-architecture.md` to include `id`.
* [x] Confirm that the documented frontend question shape contains:

  * `id`
  * `difficulty`
  * `math_subject`
  * `question`
  * `answer_choice_list`
  * `answer`
* [x] Confirm that no frontend document describes `/stream_questions` as an incremental stream.
* [x] Record any remaining contract disagreement as an explicit open decision.

## Open Decisions

None. The fixture and frontend architecture now match the public question shape documented in `docs/api-contract.md`.

## Acceptance Criteria

* Every fixture question contains a unique string `id`.
* The fixture and architecture document match the public success shape in `docs/api-contract.md`.
* The documentation consistently states that `GET /stream_questions` returns one complete JSON response.
* No production frontend behavior is introduced in this milestone.
* Documentation remains readable and internally consistent.

## Non-Goals

* Building the API client.
* Changing the backend endpoint.
* Adding `question_type`.
* Adding explanations, diagrams, hints, or rich content.
* Introducing a schema-validation dependency.
* Implementing authentication.

## Validation

* [x] Manually inspect the three relevant files.
* [x] Confirm that `example_stream_questions.json` is valid JSON.

---

# Milestone 1 — Remove the Vite Starter Interface

## Goal

Replace the default Vite demonstration interface with a minimal MathLingo application shell.

## Tasks

* [x] Remove unused Vite starter assets and demonstration code.
* [x] Update `App.jsx` to render a basic MathLingo application container.
* [x] Keep `main.jsx` limited to application startup responsibilities.
* [x] Add a clear application heading.
* [x] Add a temporary placeholder describing the upcoming quiz interface.
* [x] Remove unused CSS from the starter template.
* [x] Establish basic global typography and page spacing in `src/index.css`.
* [x] Confirm there are no unused imports from the Vite starter.

## Acceptance Criteria

* The Vite and React logos are no longer displayed.
* The page clearly identifies itself as MathLingo.
* The application loads without console errors.
* The page has a minimal usable layout on desktop and mobile widths.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Fetching questions.
* Building quiz configuration controls.
* Implementing quiz state.
* Choosing the final visual design.
* Adding routing.
* Adding a CSS framework.
* Adding animations.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Manually open the application with `npm run dev`.
* [x] Check the page at a narrow mobile viewport.

---

# Milestone 2 — Add Frontend Environment Configuration

## Goal

Create a documented and safe method for configuring the backend base URL.

## Tasks

* [x] Add `.env.example`.

* [x] Add the variable:

  ```text
  VITE_API_BASE_URL=http://127.0.0.1:5000
  ```

* [x] Confirm local environment files are ignored by Git where appropriate.

* [x] Add a small configuration module if needed to centralize environment access.

* [x] Provide a clear development error when `VITE_API_BASE_URL` is missing.

* [x] Confirm no backend secrets are present in frontend files.

* [x] Update documentation only if the implemented behavior differs from the existing instructions.

## Acceptance Criteria

* A contributor can determine the required environment variable from `.env.example`.
* Frontend code does not hard-code deployment-specific backend URLs.
* No OpenAI key, database URL, internal API key, or cron secret appears in frontend code.
* Missing configuration produces a clear and understandable failure.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Adding deployment-provider configuration.
* Adding multiple environment profiles.
* Calling the backend.
* Adding authentication tokens.
* Creating a general-purpose configuration framework.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Verify the application with a valid local environment value.
* [x] Verify the missing-variable behavior.

---

# Milestone 3 — Implement Question Response Validation

## Goal

Add lightweight runtime validation for question responses before connecting React components to the backend.

## Tasks

* [x] Create `src/utils/questionValidation.js`.
* [x] Validate that the response is a non-null object.
* [x] Validate that `questions` is an array.
* [x] Validate every question contains a non-empty string `id`.
* [x] Validate `difficulty` is:

  * `easy`
  * `medium`
  * `hard`
* [x] Validate `math_subject` is a string.
* [x] Validate `question` is a string.
* [x] Validate `answer_choice_list` contains exactly four strings.
* [x] Validate `answer` is:

  * `A`
  * `B`
  * `C`
  * `D`
* [x] Reject the response as a whole when a required field is invalid.
* [x] Return or throw a predictable validation result for the API module to use.
* [x] Keep validation functions independent of React.

## Acceptance Criteria

* Valid fixture data passes validation.
* Missing IDs fail validation.
* Missing fields fail validation.
* Invalid difficulty values fail validation.
* Incorrect answer-choice counts fail validation.
* Invalid answer letters fail validation.
* Empty `questions` arrays remain valid so the UI can display an empty state.
* Validation code does not import React or UI components.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Installing Zod, Joi, Yup, or another schema library.
* Correcting malformed responses.
* Rendering an error message.
* Fetching data.
* Validating future question types.
* Performing backend authorization or security validation.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Manually exercise valid and invalid sample objects.
* [ ] Add automated tests only if the testing milestone has already been completed.

---

# Milestone 4 — Implement the Questions API Module

## Goal

Create a centralized API function for retrieving quiz questions from the backend.

## Tasks

* [x] Create `src/api/questionsApi.js`.

* [x] Implement:

  ```js
  fetchQuestions({
    numQuestions,
    difficulty,
    signal,
  })
  ```

* [x] Read the backend base URL from `VITE_API_BASE_URL`.

* [x] Build the request URL with `URL` and `URLSearchParams`, or an equivalent safe method.

* [x] Send:

  ```http
  GET /stream_questions
  ```

* [x] Include:

  * `num_questions`
  * `difficulty`

* [x] Parse the complete response as JSON.

* [x] Handle non-successful HTTP responses.

* [x] Extract backend `message` or `error` text when available.

* [x] Normalize request failures into a predictable frontend error shape.

* [x] Distinguish aborted requests from normal failures.

* [x] Pass successful responses through `questionValidation.js`.

* [x] Keep React state and UI messages out of the API module.

## Acceptance Criteria

* A request with `numQuestions: 5` and `difficulty: "medium"` uses the expected query parameters.
* Successful valid JSON returns a question array or documented result object.
* Invalid response data is rejected.
* Backend `400`, `500`, `502`, and `503` responses produce normalized errors.
* Network failures produce a normalized error.
* An aborted request is identifiable and is not treated as an ordinary server failure.
* The API module does not import React components or hooks.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Displaying loading indicators.
* Retrying automatically.
* Caching requests.
* Calling `/chat`.
* Calling internal or cron endpoints.
* Adding Axios, React Query, or another request library.
* Falling back silently to fixture data.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Verify request construction with a mocked or local backend.
* [x] Verify at least one handled backend error.
* [x] Verify malformed response handling.

---

# Milestone 5 — Build the Quiz Setup Form

## Goal

Allow the user to select a difficulty and number of questions before beginning a quiz.

## Tasks

* [x] Create `src/components/quiz/QuizSetup.jsx`.
* [x] Add difficulty controls for:

  * Easy
  * Medium
  * Hard
* [x] Add a question-count control accepting integers from `1` through `20`.
* [x] Choose documented defaults:

  * Difficulty: `medium`
  * Number of questions: `10`
* [x] Associate visible labels with every form control.
* [x] Validate values before submitting.
* [x] Display a clear validation message for invalid question counts.
* [x] Expose the selected configuration through an `onStart` callback.
* [x] Support a disabled or loading state through props.
* [x] Prevent duplicate submission while loading.
* [x] Ensure the form is usable with a keyboard.

## Acceptance Criteria

* The user can select easy, medium, or hard.
* The user can request between 1 and 20 questions.
* Values outside the valid range cannot start a quiz.
* Decimal and non-numeric question counts are rejected.
* Submitting valid values calls `onStart` with normalized data.
* The start action is disabled while loading.
* All controls have accessible labels.
* Keyboard-only use is possible.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Fetching questions directly inside `QuizSetup`.
* Displaying quiz questions.
* Adding a timer.
* Adding subject selection.
* Saving preferences.
* Adding difficulty descriptions generated by the backend.
* Final visual polish.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Test each valid difficulty.
* [x] Test question counts `1` and `20`.
* [x] Test invalid values such as `0`, `21`, decimals, and empty input.
* [x] Complete the form using only the keyboard.

---

# Milestone 6 — Implement Quiz Session State

## Goal

Create one state-management boundary for the complete in-memory quiz session.

## Tasks

* [x] Create `src/hooks/useQuizSession.js`.
* [x] Represent the session statuses:

  * `idle`
  * `loading`
  * `active`
  * `completed`
  * `error`
* [x] Store the selected session configuration.
* [x] Store loaded questions.
* [x] Store the current question index.
* [x] Store answer records keyed by question ID.
* [x] Store normalized request errors.
* [x] Implement a session-start action that calls `fetchQuestions`.
* [x] Use `AbortController` for active requests.
* [x] Ignore aborted requests when setting user-facing errors.
* [x] Implement answer selection or submission state.
* [x] Prevent the same question from being scored more than once.
* [x] Implement progression to the next question.
* [x] Complete the session after the final question.
* [x] Implement session reset.
* [x] Derive rather than duplicate:

  * Current question
  * Total question count
  * Current answer record
  * Current score
  * Progress percentage
  * Final percentage score

## Acceptance Criteria

* Starting a session transitions from `idle` to `loading`.
* Valid loaded questions transition the session to `active`.
* A failed request transitions the session to `error`.
* An empty successful response can be distinguished from an ordinary failure.
* Answers are recorded by question ID.
* A submitted answer cannot increase the score more than once.
* Advancing from the final question produces `completed`.
* Resetting returns the session to its initial state.
* Starting a replacement request cancels the previous active request.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Persistent storage.
* Global state-management libraries.
* Authentication.
* Sending completion records to the backend.
* Timer state.
* Achievement or point systems.
* UI implementation beyond what is needed to exercise the hook.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Verify the happy-path state transitions.
* [x] Verify request failure behavior.
* [x] Verify empty-result behavior.
* [x] Verify duplicate answer submission does not change the score twice.
* [x] Verify the final question completes the session.
* [x] Verify reset behavior.

---

# Milestone 7 — Render the Active Quiz Question

## Goal

Display the active question and its four answer choices using focused components.

## Tasks

* [x] Create `src/components/quiz/QuizQuestion.jsx`.
* [x] Create `src/components/quiz/AnswerList.jsx`.
* [x] Create `src/components/quiz/AnswerChoice.jsx`.
* [x] Display:

  * Math subject
  * Difficulty
  * Question prompt
  * Four answer choices
* [x] Derive choice letters from their array positions.
* [x] Preserve the choice text returned by the backend.
* [x] Use semantic form controls or buttons.
* [x] Allow the user to select an answer without immediately scoring it.
* [x] Expose the selected answer to the session coordinator.
* [x] Add a separate submit-answer action.
* [x] Disable submission until an answer is selected.
* [x] Keep session and request state outside presentational components.
* [x] Provide a meaningful accessible group label for the question and choices.

## Acceptance Criteria

* One question is displayed at a time.
* Exactly four choices are rendered for valid data.
* The user can identify the selected choice.
* Selecting a choice does not automatically advance the quiz.
* The answer cannot be submitted before a selection is made.
* Answer controls work with a keyboard.
* Presentational components do not call the backend.
* Presentational components do not calculate the final session score.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Correct and incorrect visual feedback.
* Progress display.
* Final summary.
* Question diagrams.
* Written-response questions.
* Automatic next-question behavior.
* Persisting answers.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Render a question using fixture data.
* [ ] Select each answer using a mouse.
* [ ] Select and submit an answer using only the keyboard.
* [x] Verify that no answer is scored before explicit submission.

---

# Milestone 8 — Add Submitted-Answer Feedback

## Goal

Show clear correct or incorrect feedback after the user explicitly submits an answer.

## Tasks

* [x] Lock the submitted answer for the current question.
* [x] Prevent changing the answer after submission.
* [x] Show whether the selected answer was correct or incorrect.
* [x] Identify the correct answer after submission.
* [x] Add text or icons so feedback does not rely only on color.
* [x] Announce feedback to assistive technology.
* [x] Display a next-question action after feedback.
* [x] Display a finish action after feedback on the final question.
* [x] Prevent advancing before the answer has been submitted.
* [x] Ensure repeated clicks do not score the answer more than once.

## Acceptance Criteria

* Correct submissions are visibly and textually identified.
* Incorrect submissions identify both the selected answer and correct answer.
* The answer is locked after submission.
* Feedback can be understood without color.
* Feedback is announced appropriately to assistive technology.
* The next action appears only after submission.
* Repeated submission does not alter the score.
* The final question uses a finish action rather than a misleading next action.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Backend-based scoring.
* Explanations for why an answer is correct.
* Animations or celebration effects.
* Partial credit.
* Changing a submitted answer.
* Automatically advancing after a delay.
* Persistent review history.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Submit a correct answer.
* [x] Submit an incorrect answer.
* [x] Attempt to change an answer after submission.
* [x] Attempt repeated submission.
* [x] Verify final-question behavior.
* [x] Verify feedback without depending on color.

---

# Milestone 9 — Add Quiz Header and Progress

## Goal

Show the user where they are within the current quiz session.

## Tasks

* [x] Create `src/components/quiz/QuizHeader.jsx`.
* [x] Use a native `<progress>` element in `QuizHeader`; a dedicated `ProgressBar.jsx` is not justified until the pattern is reused.
* [x] Display the current question number.
* [x] Display the total question count.
* [x] Display progress in text.
* [x] Add a semantic progress indicator.
* [x] Ensure the first question does not display zero progress.
* [x] Ensure the final question displays complete question-position progress.
* [x] Decide whether the current score is visible during the active quiz.
* [x] Document the score-visibility decision in `docs/frontend-architecture.md`.
* [x] Keep progress values derived from session state.

## Acceptance Criteria

* The interface displays “Question X of Y” or equivalent wording.
* Progress updates only when moving to another question.
* The progress indicator exposes a meaningful accessible value.
* The progress calculation is correct for the first and final questions.
* Progress values are not stored as duplicate state.
* The active-score visibility decision is documented.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Timers.
* Experience points.
* Levels.
* Streaks.
* Persistent progress.
* Animated progress effects.
* Navigation to previously completed questions.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Verify progress with a one-question quiz.
* [x] Verify progress with a multi-question quiz.
* [x] Verify first-question progress.
* [x] Verify final-question progress.
* [x] Inspect accessible progress semantics.

---

# Milestone 10 — Integrate the Main Quiz Flow

## Goal

Connect quiz setup, API loading, active questions, feedback, progression, and session completion through `App`.

## Tasks

* [x] Update `App.jsx` to coordinate the primary application states.
* [x] Display `QuizSetup` while the session is idle.
* [x] Start the session using the setup configuration.
* [x] Display loading UI while questions are being requested.
* [x] Display the active quiz after successful loading.
* [x] Connect answer selection to session state.
* [x] Connect answer submission to session state.
* [x] Connect next-question and finish actions.
* [x] Avoid placing raw request construction in `App.jsx`.
* [x] Avoid placing low-level answer-choice rendering in `App.jsx`.
* [x] Verify a complete quiz can be finished from beginning to end.

## Acceptance Criteria

* The user can configure and start a quiz.
* The selected difficulty and count reach the API module.
* The first returned question appears.
* The user can submit an answer and review feedback.
* The user can advance through every question.
* Completing the final question transitions to the completed state.
* Starting a quiz does not require a page reload.
* No stale question from a previous session is shown as part of a new session.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Final session summary presentation.
* Detailed error-state design.
* Persistent storage.
* Routing.
* Gamification.
* Chat.
* Timer functionality.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Complete a one-question quiz.
* [x] Complete a multi-question quiz.
* [x] Complete a quiz with at least one correct and one incorrect answer.
* [x] Start a second quiz without reloading the page.

Validation note: flow-completion scenarios were verified with the live backend
through the existing API module and exported quiz-session reducer. The setup
screen was also checked with a headless Firefox screenshot of the running Vite
app. No browser automation dependency is installed for full click-through UI
testing.

---

# Milestone 11 — Implement Loading, Empty, and Error States

## Goal

Provide clear recovery behavior for every question-request outcome.

## Tasks

* [x] Create `src/components/common/LoadingIndicator.jsx`.
* [x] Create `src/components/common/ErrorMessage.jsx`.
* [x] Add a dedicated empty-result state.
* [x] Display a stable loading layout.
* [x] Disable duplicate quiz-start requests while loading.
* [x] Map normalized API errors to user-friendly messages.
* [x] Provide a retry action when appropriate.
* [x] Provide a return-to-setup action.
* [x] Preserve or restore the last selected configuration when useful.
* [x] Ensure aborted requests do not display an error.
* [x] Ensure stale questions are not displayed during a replacement request.
* [x] Avoid exposing stack traces or sensitive technical details in production UI.

## Acceptance Criteria

* Loading is clearly communicated.
* Duplicate start requests are prevented.
* An empty `questions` array displays a dedicated empty-state message.
* Network failures display a useful connection message.
* Backend `400` responses direct the user toward configuration correction.
* Backend `500`, `502`, and `503` responses display safe fallback messages.
* Retry issues a new request.
* Return to setup restores a usable form.
* Aborted requests do not flash an ordinary error message.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Automatic retry loops.
* Offline caching.
* Detailed backend diagnostics.
* Error-reporting services.
* Production monitoring.
* Fixture fallback in production.
* Changing backend error responses.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Verify loading behavior.
* [x] Verify empty-success behavior.
* [x] Verify a network failure.
* [x] Verify a backend validation error.
* [x] Verify a backend service error.
* [x] Verify retry behavior.
* [x] Verify return-to-setup behavior.
* [x] Verify request-abort behavior.

Validation note: normal successful requests were verified against the live local
backend at `http://127.0.0.1:5000/stream_questions?num_questions=5&difficulty=medium`.
Edge states were verified with temporary Playwright route interception in the
browser so no fixture fallback, debug controls, or forced-error code remains in
production.

---

# Milestone 12 — Implement the Session Summary

## Goal

Show the final result for the completed in-memory quiz session.

## Tasks

* [x] Create `src/components/quiz/QuizSummary.jsx`.
* [x] Display the number of correct answers.
* [x] Display the total number of questions.
* [x] Display the percentage score.
* [x] Handle zero-question defensive cases without dividing by zero.
* [x] Add a start-another-quiz action.
* [x] Calculate subject-level summary totals from current session questions and answers.
* [x] Display correct answers by math subject.
* [x] Handle missing or empty `math_subject` values with an “Uncategorized” fallback.
* [x] Include a simple version 1.0 per-question review.
* [x] In the review, display each question, subject, difficulty, selected answer, correct answer, and correctness status.
* [x] Ensure the review is read-only and does not allow submitted answers to be changed.
* [x] Defer AI-generated explanations to future work.
* [x] Document the review decision in `docs/frontend-architecture.md`.
* [x] If review is included:

  * Display each question.
  * Display the selected answer.
  * Display the correct answer.
  * Display whether the response was correct.
* [x] Keep the summary based only on current in-memory session data.

## Acceptance Criteria

* The summary appears only after the session is completed.
* Correct-answer count is accurate.
* Total-question count is accurate.
* Percentage calculation is accurate.
* A perfect score displays correctly.
* A zero score displays correctly.
* The summary displays the number of correct answers and total questions for each math subject present in the completed session.
* Subject totals are calculated from the completed in-memory session.
* Questions with missing or blank `math_subject` values are grouped under `Uncategorized`.
* The per-question review displays the question, selected answer, correct answer, and correctness status.
* The review is read-only and does not reopen answer submission.
* No ChatGPT API call or backend explanation endpoint is added.
* Starting another quiz returns the user to a usable setup state.
* The per-question review decision is documented.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Saving results to the backend.
* User accounts.
* Historical analytics.
* Leaderboards.
* Sharing results.
* Badges or rewards.
* Recommendations generated from the score.
* AI-generated answer explanations.
* Backend-generated review feedback.
* Persistent per-question review history.
* Review filters beyond the simple version 1.0 review.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Complete a quiz with a perfect score.
* [x] Complete a quiz with a zero score.
* [x] Complete a quiz with a mixed score.
* [x] Start another quiz from the summary.
* [x] Verify the documented review decision matches the implementation.

Validation note: perfect, zero, and mixed quiz summaries were verified through a
headless Playwright pass against the running Vite app with `/stream_questions`
route interception, so no backend persistence or new API behavior was involved.
Subject breakdown, per-question review content, and the start-another-quiz path
were checked in that UI pass. The defensive zero-question case was verified with
the pure scoring helper because a completed empty quiz is not reachable through
the normal UI flow.

---

# Milestone 13 — Responsive Layout and Visual Foundation

## Goal

Create a calm, readable quiz layout that works on desktop and mobile without introducing a large design system.

## Tasks

* [x] Define reusable CSS custom properties for:

  * Spacing
  * Typography
  * Borders
  * Border radii
  * Backgrounds
  * Surfaces
  * Text
  * Muted text
  * Focus
  * Correct feedback
  * Incorrect feedback
* [x] Set a readable maximum content width.
* [x] Make answer controls comfortably sized.
* [x] Prevent long question text from overflowing.
* [x] Prevent long answer choices from overflowing.
* [x] Ensure controls remain usable at narrow viewport widths.
* [x] Add visible hover states where appropriate.
* [x] Add visible focus states.
* [x] Keep layout stable during loading and feedback changes.
* [x] Respect reduced-motion preferences if any motion is present.
* [x] Remove temporary placeholder styles.

## Acceptance Criteria

* The quiz remains usable at common desktop widths.
* The quiz remains usable at approximately 320 CSS pixels wide.
* No essential content requires horizontal scrolling.
* Long question and answer text wraps safely.
* Focus states are clearly visible.
* Correct and incorrect feedback remain readable.
* Touch targets are comfortably sized.
* The visual design supports rather than distracts from the quiz.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* A full branding system.
* Dark mode/light mode themes.
* Theme switching.
* CSS frameworks.
* Component libraries.
* Complex animation.
* Marketing-page design.
* Gamification visuals.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Check approximately 320-pixel viewport width.
* [x] Check a tablet-sized viewport.
* [x] Check a desktop viewport.
* [x] Test unusually long question text.
* [x] Test unusually long choice text.
* [x] Inspect hover and focus states.

Validation note: the responsive pass was run against the local Vite app at
320, 390, 768, 1280, and 1600 CSS pixel viewport widths with Playwright route
interception for `/stream_questions`. The pass covered setup, loading, empty,
error, active quiz, selected answers, incorrect feedback, correct feedback,
session summary, long question prompts, long answer choices, long subject
labels, long error details, keyboard focus, hover states, reduced motion, and
horizontal-overflow checks without calling the real backend.

---

# Milestone 14 — Accessibility Review

## Goal

Review and correct the complete quiz flow for keyboard and assistive-technology use.

## Tasks

* [x] Verify logical heading order.
* [x] Verify every setup control has an associated label.
* [x] Verify answer choices use appropriate semantic controls.
* [x] Verify question and answer groups have useful accessible names.
* [x] Verify visible keyboard focus throughout the application.
* [x] Verify feedback is not communicated through color alone.
* [x] Verify correct and incorrect feedback is announced.
* [x] Verify loading changes are announced where appropriate.
* [x] Verify error messages are associated with relevant controls or regions.
* [x] Verify the progress indicator has accessible semantics.
* [x] Review focus behavior when:

  * A quiz starts
  * A new question appears
  * Feedback appears
  * The summary appears
  * An error occurs
* [x] Verify the interface does not advance before feedback can be reviewed.
* [x] Review color contrast.
* [x] Review touch-target sizing.
* [x] Correct accessibility issues found during the review.

## Acceptance Criteria

* The complete quiz can be finished using only a keyboard.
* Focus is never trapped or lost.
* Current focus is visibly identifiable.
* Screen-reader users receive meaningful question and feedback context.
* Correct and incorrect status does not depend only on color.
* Setup errors can be associated with their controls.
* Major view changes use deliberate focus behavior.
* No automatic transition prevents the user from reviewing feedback.
* `npm run lint` succeeds.
* `npm run build` succeeds.

## Non-Goals

* Formal third-party accessibility certification.
* Supporting obsolete browsers or assistive technologies.
* Adding voice input.
* Adding text-to-speech.
* Adding extensive keyboard shortcuts.
* Replacing semantic HTML with custom ARIA widgets.

## Validation

* [x] Run `npm run lint`.
* [x] Run `npm run build`.
* [x] Complete the entire flow using only the keyboard.
* [x] Inspect the accessibility tree using browser developer tools.
* [!] Test at least one screen-reader flow when available.
* [x] Check key text and control color contrast.
* [x] Test focus behavior at every major view transition.

Validation note: the accessibility review was run against the local Vite app
with Playwright route interception for `/stream_questions`, without calling the
real backend. The pass covered setup validation, loading, active quiz,
incorrect feedback, correct feedback, next-question flow, final summary,
service error, empty result, keyboard-only completion, focus transitions,
mobile-width horizontal overflow, touch-target sizing, progress semantics, and
an ARIA accessibility-tree snapshot. Screen-reader software was not available
in this environment, so a real screen-reader pass remains a follow-up
recommendation.

---

# Milestone 15 — Add Frontend Test Infrastructure

## Goal

Introduce the smallest testing setup needed to verify user-visible quiz behavior.

## Tasks

* [ ] Add:

  * Vitest
  * React Testing Library
  * `@testing-library/user-event`
  * Required DOM test environment packages
* [ ] Add a test script to `package.json`.
* [ ] Add shared test setup only when needed.
* [ ] Confirm test files are included by the configured runner.
* [ ] Mock the API module rather than the global network where practical.
* [ ] Do not make live backend or OpenAI requests.
* [ ] Add one basic application-render test.
* [ ] Document the test command in:

  * `README.md`
  * `docs/frontend-architecture.md`
  * This file’s validation section

## Acceptance Criteria

* The test command runs successfully.
* A basic React component test passes.
* Tests execute in a browser-like DOM environment.
* Tests do not depend on a running backend.
* No production code silently changes behavior only for tests.
* `npm run lint` succeeds.
* `npm run build` succeeds.
* The new test command succeeds.

## Non-Goals

* End-to-end browser testing.
* Visual regression testing.
* Coverage thresholds.
* Snapshot-heavy testing.
* Continuous-integration configuration.
* Testing the Flask backend.
* Broad refactoring solely to improve testability.

## Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Run the new test command.

---

# Milestone 16 — Add Core Quiz Behavior Tests

## Goal

Protect the primary version 1.0 quiz flow with user-centered automated tests.

## Tasks

* [ ] Test quiz setup validation.
* [ ] Test that selected configuration reaches the API module.
* [ ] Test loading-state presentation.
* [ ] Test valid question rendering.
* [ ] Test invalid response handling.
* [ ] Test empty-response handling.
* [ ] Test network or normalized API error handling.
* [ ] Test answer selection.
* [ ] Test explicit answer submission.
* [ ] Test correct feedback.
* [ ] Test incorrect feedback.
* [ ] Test submitted-answer locking.
* [ ] Test prevention of duplicate scoring.
* [ ] Test question progression.
* [ ] Test final-question completion.
* [ ] Test session-summary scoring.
* [ ] Test retry behavior.
* [ ] Test starting another quiz.
* [ ] Use `user-event` for user interactions.
* [ ] Avoid testing internal state variables directly.

## Acceptance Criteria

* Tests cover the primary happy path.
* Tests cover at least one request failure.
* Tests cover invalid or malformed question data.
* Tests verify correct and incorrect submissions.
* Tests verify that a submitted answer cannot be changed.
* Tests verify that duplicate submission does not duplicate scoring.
* Tests verify transition to the summary.
* Tests verify restart behavior.
* All tests are deterministic.
* Tests do not call the live backend.
* `npm run lint` succeeds.
* `npm run build` succeeds.
* The test command succeeds.

## Non-Goals

* Achieving a specific coverage percentage.
* Testing implementation details such as private hook variables.
* Browser end-to-end tests.
* Load testing.
* Backend contract tests.
* Testing future authentication or persistence.

## Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Run the documented test command.
* [ ] Confirm tests pass without a running backend.

---

# Milestone 17 — Version 1.0 Release Review

## Goal

Confirm that the initial quiz experience satisfies the documented release goal and contains no unfinished starter behavior.

## Tasks

* [ ] Review all completed milestones.
* [ ] Search for remaining Vite starter content.
* [ ] Search for temporary placeholders and debug output.
* [ ] Search for hard-coded backend URLs.
* [ ] Search for accidentally committed secrets.
* [ ] Verify the public API request matches `docs/api-contract.md`.
* [ ] Verify the implementation matches `docs/frontend-architecture.md`.
* [ ] Update architecture documentation for resolved open decisions.
* [ ] Verify every major UI state:

  * Idle
  * Loading
  * Active
  * Empty
  * Error
  * Completed
* [ ] Complete a manual desktop quiz.
* [ ] Complete a manual mobile-width quiz.
* [ ] Complete a keyboard-only quiz.
* [ ] Run every documented validation command.
* [ ] Record remaining known limitations.
* [ ] Move unfinished optional work into the Future section.

## Acceptance Criteria

* A user can configure and complete a quiz.
* Questions are fetched from the documented backend endpoint.
* Correct and incorrect feedback works.
* Progress is accurate.
* The session summary is accurate.
* Loading, empty, and error states are usable.
* The interface works at desktop and mobile widths.
* The primary flow is keyboard-accessible.
* No backend secrets are included in the frontend.
* No known console error occurs during the normal flow.
* All available validation commands succeed.
* Documentation describes the implemented architecture accurately.

## Non-Goals

* User accounts.
* Persistent history.
* Gamification.
* Chat.
* Timers.
* Additional subjects.
* Additional question types.
* Offline support.
* Production analytics.
* Features listed under Future Work.

## Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Run the documented test command.
* [ ] Complete the manual happy path.
* [ ] Test the error path.
* [ ] Test the empty path.
* [ ] Test at desktop width.
* [ ] Test at mobile width.
* [ ] Complete a keyboard-only pass.
* [ ] Inspect the browser console.
* [ ] Review the production build locally.

---

# Future Work

These features are intentionally outside the version 1.0 roadmap. They should be divided into their own milestones before implementation.

* [ ] Optional quiz timer.
* [ ] User accounts and authentication.
* [ ] Persistent completed-question history.
* [ ] Saved quiz sessions.
* [ ] Per-question explanations.
* [ ] Review incorrect answers.
* [ ] Subject selection.
* [ ] ACT-specific quiz modes.
* [ ] Additional question types.
* [ ] Question diagrams and rich content.
* [ ] Tutor chat integration.
* [ ] Points and experience.
* [ ] Badges and achievements.
* [ ] Levels.
* [ ] Study streaks.
* [ ] Analytics dashboard.
* [ ] Dark mode/light mode
* [ ] Client-side routing.
* [ ] Backend completion-record endpoints.
* [ ] End-to-end browser tests.
* [ ] Continuous-integration validation.
* [ ] Production monitoring and error reporting.
* [ ] AI-generated explanations for completed questions.
* [ ] Review-only mode for missed questions.
* [ ] Personalized study recommendations based on completed quiz results.

---

# Milestone Template

Copy this template when adding a new milestone.

## Milestone N — Milestone Name

### Goal

Describe one concrete system, feature, or outcome.

### Dependencies

List only milestones or decisions that must already be complete.

* Milestone:
* Required decision:
* Required backend capability:

### Tasks

* [ ] Add one small, observable implementation task.
* [ ] Add another implementation task.
* [ ] Add documentation updates when architecture or contracts change.
* [ ] Add validation work.

### Acceptance Criteria

* The feature produces a user-visible or technically verifiable result.
* Important edge cases are handled.
* Existing behavior remains functional.
* Required validation commands succeed.
* Documentation matches the implementation.

### Non-Goals

* List adjacent features that should not be implemented.
* List tempting refactors that are outside the milestone.
* List future integrations that are intentionally deferred.

### Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Run the documented test command when available.
* [ ] Complete milestone-specific manual verification.
