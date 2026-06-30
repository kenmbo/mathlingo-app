# MathLingo Frontend TODO

This document defines the implementation roadmap for the MathLingo frontend.


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

Milestone 0: Align Planning Documents and Development Fixture

Status: Complete

Next: Milestone 1 — Remove the Vite Starter Interface.

---

## How to Use This File

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

* [ ] Remove unused Vite starter assets and demonstration code.
* [ ] Update `App.jsx` to render a basic MathLingo application container.
* [ ] Keep `main.jsx` limited to application startup responsibilities.
* [ ] Add a clear application heading.
* [ ] Add a temporary placeholder describing the upcoming quiz interface.
* [ ] Remove unused CSS from the starter template.
* [ ] Establish basic global typography and page spacing in `src/index.css`.
* [ ] Confirm there are no unused imports from the Vite starter.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Manually open the application with `npm run dev`.
* [ ] Check the page at a narrow mobile viewport.

---

# Milestone 2 — Add Frontend Environment Configuration

## Goal

Create a documented and safe method for configuring the backend base URL.

## Tasks

* [ ] Add `.env.example`.

* [ ] Add the variable:

  ```text
  VITE_API_BASE_URL=http://127.0.0.1:5000
  ```

* [ ] Confirm local environment files are ignored by Git where appropriate.

* [ ] Add a small configuration module if needed to centralize environment access.

* [ ] Provide a clear development error when `VITE_API_BASE_URL` is missing.

* [ ] Confirm no backend secrets are present in frontend files.

* [ ] Update documentation only if the implemented behavior differs from the existing instructions.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Verify the application with a valid local environment value.
* [ ] Verify the missing-variable behavior.

---

# Milestone 3 — Implement Question Response Validation

## Goal

Add lightweight runtime validation for question responses before connecting React components to the backend.

## Tasks

* [ ] Create `src/utils/questionValidation.js`.
* [ ] Validate that the response is a non-null object.
* [ ] Validate that `questions` is an array.
* [ ] Validate every question contains a non-empty string `id`.
* [ ] Validate `difficulty` is:

  * `easy`
  * `medium`
  * `hard`
* [ ] Validate `math_subject` is a string.
* [ ] Validate `question` is a string.
* [ ] Validate `answer_choice_list` contains exactly four strings.
* [ ] Validate `answer` is:

  * `A`
  * `B`
  * `C`
  * `D`
* [ ] Reject the response as a whole when a required field is invalid.
* [ ] Return or throw a predictable validation result for the API module to use.
* [ ] Keep validation functions independent of React.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Manually exercise valid and invalid sample objects.
* [ ] Add automated tests only if the testing milestone has already been completed.

---

# Milestone 4 — Implement the Questions API Module

## Goal

Create a centralized API function for retrieving quiz questions from the backend.

## Tasks

* [ ] Create `src/api/questionsApi.js`.

* [ ] Implement:

  ```js
  fetchQuestions({
    numQuestions,
    difficulty,
    signal,
  })
  ```

* [ ] Read the backend base URL from `VITE_API_BASE_URL`.

* [ ] Build the request URL with `URL` and `URLSearchParams`, or an equivalent safe method.

* [ ] Send:

  ```http
  GET /stream_questions
  ```

* [ ] Include:

  * `num_questions`
  * `difficulty`

* [ ] Parse the complete response as JSON.

* [ ] Handle non-successful HTTP responses.

* [ ] Extract backend `message` or `error` text when available.

* [ ] Normalize request failures into a predictable frontend error shape.

* [ ] Distinguish aborted requests from normal failures.

* [ ] Pass successful responses through `questionValidation.js`.

* [ ] Keep React state and UI messages out of the API module.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Verify request construction with a mocked or local backend.
* [ ] Verify at least one handled backend error.
* [ ] Verify malformed response handling.

---

# Milestone 5 — Build the Quiz Setup Form

## Goal

Allow the user to select a difficulty and number of questions before beginning a quiz.

## Tasks

* [ ] Create `src/components/quiz/QuizSetup.jsx`.
* [ ] Add difficulty controls for:

  * Easy
  * Medium
  * Hard
* [ ] Add a question-count control accepting integers from `1` through `20`.
* [ ] Choose documented defaults:

  * Difficulty: `medium`
  * Number of questions: `10`
* [ ] Associate visible labels with every form control.
* [ ] Validate values before submitting.
* [ ] Display a clear validation message for invalid question counts.
* [ ] Expose the selected configuration through an `onStart` callback.
* [ ] Support a disabled or loading state through props.
* [ ] Prevent duplicate submission while loading.
* [ ] Ensure the form is usable with a keyboard.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Test each valid difficulty.
* [ ] Test question counts `1` and `20`.
* [ ] Test invalid values such as `0`, `21`, decimals, and empty input.
* [ ] Complete the form using only the keyboard.

---

# Milestone 6 — Implement Quiz Session State

## Goal

Create one state-management boundary for the complete in-memory quiz session.

## Tasks

* [ ] Create `src/hooks/useQuizSession.js`.
* [ ] Represent the session statuses:

  * `idle`
  * `loading`
  * `active`
  * `completed`
  * `error`
* [ ] Store the selected session configuration.
* [ ] Store loaded questions.
* [ ] Store the current question index.
* [ ] Store answer records keyed by question ID.
* [ ] Store normalized request errors.
* [ ] Implement a session-start action that calls `fetchQuestions`.
* [ ] Use `AbortController` for active requests.
* [ ] Ignore aborted requests when setting user-facing errors.
* [ ] Implement answer selection or submission state.
* [ ] Prevent the same question from being scored more than once.
* [ ] Implement progression to the next question.
* [ ] Complete the session after the final question.
* [ ] Implement session reset.
* [ ] Derive rather than duplicate:

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Verify the happy-path state transitions.
* [ ] Verify request failure behavior.
* [ ] Verify empty-result behavior.
* [ ] Verify duplicate answer submission does not change the score twice.
* [ ] Verify the final question completes the session.
* [ ] Verify reset behavior.

---

# Milestone 7 — Render the Active Quiz Question

## Goal

Display the active question and its four answer choices using focused components.

## Tasks

* [ ] Create `src/components/quiz/QuizQuestion.jsx`.
* [ ] Create `src/components/quiz/AnswerList.jsx`.
* [ ] Create `src/components/quiz/AnswerChoice.jsx`.
* [ ] Display:

  * Math subject
  * Difficulty
  * Question prompt
  * Four answer choices
* [ ] Derive choice letters from their array positions.
* [ ] Preserve the choice text returned by the backend.
* [ ] Use semantic form controls or buttons.
* [ ] Allow the user to select an answer without immediately scoring it.
* [ ] Expose the selected answer to the session coordinator.
* [ ] Add a separate submit-answer action.
* [ ] Disable submission until an answer is selected.
* [ ] Keep session and request state outside presentational components.
* [ ] Provide a meaningful accessible group label for the question and choices.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Render a question using fixture data.
* [ ] Select each answer using a mouse.
* [ ] Select and submit an answer using only the keyboard.
* [ ] Verify that no answer is scored before explicit submission.

---

# Milestone 8 — Add Submitted-Answer Feedback

## Goal

Show clear correct or incorrect feedback after the user explicitly submits an answer.

## Tasks

* [ ] Lock the submitted answer for the current question.
* [ ] Prevent changing the answer after submission.
* [ ] Show whether the selected answer was correct or incorrect.
* [ ] Identify the correct answer after submission.
* [ ] Add text or icons so feedback does not rely only on color.
* [ ] Announce feedback to assistive technology.
* [ ] Display a next-question action after feedback.
* [ ] Display a finish action after feedback on the final question.
* [ ] Prevent advancing before the answer has been submitted.
* [ ] Ensure repeated clicks do not score the answer more than once.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Submit a correct answer.
* [ ] Submit an incorrect answer.
* [ ] Attempt to change an answer after submission.
* [ ] Attempt repeated submission.
* [ ] Verify final-question behavior.
* [ ] Verify feedback without depending on color.

---

# Milestone 9 — Add Quiz Header and Progress

## Goal

Show the user where they are within the current quiz session.

## Tasks

* [ ] Create `src/components/quiz/QuizHeader.jsx`.
* [ ] Create `src/components/common/ProgressBar.jsx` if a dedicated component is justified.
* [ ] Display the current question number.
* [ ] Display the total question count.
* [ ] Display progress in text.
* [ ] Add a semantic progress indicator.
* [ ] Ensure the first question does not display zero progress.
* [ ] Ensure the final question displays complete question-position progress.
* [ ] Decide whether the current score is visible during the active quiz.
* [ ] Document the score-visibility decision in `docs/frontend-architecture.md`.
* [ ] Keep progress values derived from session state.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Verify progress with a one-question quiz.
* [ ] Verify progress with a multi-question quiz.
* [ ] Verify first-question progress.
* [ ] Verify final-question progress.
* [ ] Inspect accessible progress semantics.

---

# Milestone 10 — Integrate the Main Quiz Flow

## Goal

Connect quiz setup, API loading, active questions, feedback, progression, and session completion through `App`.

## Tasks

* [ ] Update `App.jsx` to coordinate the primary application states.
* [ ] Display `QuizSetup` while the session is idle.
* [ ] Start the session using the setup configuration.
* [ ] Display loading UI while questions are being requested.
* [ ] Display the active quiz after successful loading.
* [ ] Connect answer selection to session state.
* [ ] Connect answer submission to session state.
* [ ] Connect next-question and finish actions.
* [ ] Avoid placing raw request construction in `App.jsx`.
* [ ] Avoid placing low-level answer-choice rendering in `App.jsx`.
* [ ] Verify a complete quiz can be finished from beginning to end.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Complete a one-question quiz.
* [ ] Complete a multi-question quiz.
* [ ] Complete a quiz with at least one correct and one incorrect answer.
* [ ] Start a second quiz without reloading the page.

---

# Milestone 11 — Implement Loading, Empty, and Error States

## Goal

Provide clear recovery behavior for every question-request outcome.

## Tasks

* [ ] Create `src/components/common/LoadingIndicator.jsx`.
* [ ] Create `src/components/common/ErrorMessage.jsx`.
* [ ] Add a dedicated empty-result state.
* [ ] Display a stable loading layout.
* [ ] Disable duplicate quiz-start requests while loading.
* [ ] Map normalized API errors to user-friendly messages.
* [ ] Provide a retry action when appropriate.
* [ ] Provide a return-to-setup action.
* [ ] Preserve or restore the last selected configuration when useful.
* [ ] Ensure aborted requests do not display an error.
* [ ] Ensure stale questions are not displayed during a replacement request.
* [ ] Avoid exposing stack traces or sensitive technical details in production UI.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Verify loading behavior.
* [ ] Verify empty-success behavior.
* [ ] Verify a network failure.
* [ ] Verify a backend validation error.
* [ ] Verify a backend service error.
* [ ] Verify retry behavior.
* [ ] Verify return-to-setup behavior.
* [ ] Verify request-abort behavior.

---

# Milestone 12 — Implement the Session Summary

## Goal

Show the final result for the completed in-memory quiz session.

## Tasks

* [ ] Create `src/components/quiz/QuizSummary.jsx`.
* [ ] Display the number of correct answers.
* [ ] Display the total number of questions.
* [ ] Display the percentage score.
* [ ] Handle zero-question defensive cases without dividing by zero.
* [ ] Add a start-another-quiz action.
* [ ] Decide whether version 1.0 includes per-question review.
* [ ] Document the review decision in `docs/frontend-architecture.md`.
* [ ] If review is included:

  * Display each question.
  * Display the selected answer.
  * Display the correct answer.
  * Display whether the response was correct.
* [ ] Keep the summary based only on current in-memory session data.

## Acceptance Criteria

* The summary appears only after the session is completed.
* Correct-answer count is accurate.
* Total-question count is accurate.
* Percentage calculation is accurate.
* A perfect score displays correctly.
* A zero score displays correctly.
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

## Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Complete a quiz with a perfect score.
* [ ] Complete a quiz with a zero score.
* [ ] Complete a quiz with a mixed score.
* [ ] Start another quiz from the summary.
* [ ] Verify the documented review decision matches the implementation.

---

# Milestone 13 — Responsive Layout and Visual Foundation

## Goal

Create a calm, readable quiz layout that works on desktop and mobile without introducing a large design system.

## Tasks

* [ ] Define reusable CSS custom properties for:

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
* [ ] Set a readable maximum content width.
* [ ] Make answer controls comfortably sized.
* [ ] Prevent long question text from overflowing.
* [ ] Prevent long answer choices from overflowing.
* [ ] Ensure controls remain usable at narrow viewport widths.
* [ ] Add visible hover states where appropriate.
* [ ] Add visible focus states.
* [ ] Keep layout stable during loading and feedback changes.
* [ ] Respect reduced-motion preferences if any motion is present.
* [ ] Remove temporary placeholder styles.

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
* Dark mode.
* Theme switching.
* CSS frameworks.
* Component libraries.
* Complex animation.
* Marketing-page design.
* Gamification visuals.

## Validation

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Check approximately 320-pixel viewport width.
* [ ] Check a tablet-sized viewport.
* [ ] Check a desktop viewport.
* [ ] Test unusually long question text.
* [ ] Test unusually long choice text.
* [ ] Inspect hover and focus states.

---

# Milestone 14 — Accessibility Review

## Goal

Review and correct the complete quiz flow for keyboard and assistive-technology use.

## Tasks

* [ ] Verify logical heading order.
* [ ] Verify every setup control has an associated label.
* [ ] Verify answer choices use appropriate semantic controls.
* [ ] Verify question and answer groups have useful accessible names.
* [ ] Verify visible keyboard focus throughout the application.
* [ ] Verify feedback is not communicated through color alone.
* [ ] Verify correct and incorrect feedback is announced.
* [ ] Verify loading changes are announced where appropriate.
* [ ] Verify error messages are associated with relevant controls or regions.
* [ ] Verify the progress indicator has accessible semantics.
* [ ] Review focus behavior when:

  * A quiz starts
  * A new question appears
  * Feedback appears
  * The summary appears
  * An error occurs
* [ ] Verify the interface does not advance before feedback can be reviewed.
* [ ] Review color contrast.
* [ ] Review touch-target sizing.
* [ ] Correct accessibility issues found during the review.

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

* [ ] Run `npm run lint`.
* [ ] Run `npm run build`.
* [ ] Complete the entire flow using only the keyboard.
* [ ] Inspect the accessibility tree using browser developer tools.
* [ ] Test at least one screen-reader flow when available.
* [ ] Check key text and control color contrast.
* [ ] Test focus behavior at every major view transition.

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
* [ ] Dark mode.
* [ ] Client-side routing.
* [ ] Backend completion-record endpoints.
* [ ] End-to-end browser tests.
* [ ] Continuous-integration validation.
* [ ] Production monitoring and error reporting.

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

