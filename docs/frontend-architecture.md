# Frontend Architecture

## 1. Purpose

This document describes the initial frontend architecture for MathLingo.

It records the current structural decisions for the React application so that contributors and Codex agents can implement features consistently. It is intended to evolve as the frontend grows.

The initial architecture is designed for the version 1.0 goal:

* Fetch multiple-choice math questions.
* Present one question at a time.
* Allow the user to select an answer.
* Show immediate correct or incorrect feedback.
* Track progress through the current quiz session.
* Handle loading, empty, and error states.
* Show a session summary after the quiz is completed.
* Work on desktop and mobile.
* Remain keyboard-accessible.

Features such as authentication, persistent history, achievements, analytics, chat, and additional question types are outside the initial architecture unless explicitly added to the current milestone.

---

## 2. Current Technology Decisions

The frontend currently uses:

* React
* Vite
* JavaScript with JSX
* CSS
* ESLint

The initial implementation should use React’s built-in state-management tools.

Do not add the following without a documented need:

* Redux or another global state library.
* Authentication libraries.

These tools may be considered later if the application’s requirements justify them.

Avoid choosing a global state library before the quiz state proves too complex for React state and reducer patterns.

---

## 3. Architectural Principles

### 3.1 Keep the quiz flow central

The quiz experience is the primary application screen. The initial frontend should not be organized around a marketing landing page or a large multi-page application.

### 3.2 Separate data access from presentation

React components should not construct backend URLs or contain repeated `fetch` logic.

Backend requests belong in a small API module. Components should call functions from that module and respond to returned data or errors.

### 3.3 Keep session state explicit

The frontend should explicitly represent the current quiz state, including:

* Selected difficulty.
* Requested number of questions.
* Loaded questions.
* Current question index.
* Selected answers.
* Feedback state.
* Session score.
* Session completion.

Avoid deriving important state from the DOM.

### 3.4 Model all request states

Every backend request must support:

* Idle.
* Loading.
* Success.
* Empty success.
* Error.

The UI must not assume that a successful request always contains questions.

### 3.5 Prefer focused components

Components should have clear responsibilities. A presentational component should not also manage backend requests, session navigation, and application-wide state.

### 3.6 Avoid premature abstractions

Create shared abstractions only when they simplify current code or eliminate real duplication.

Do not design for future authentication, additional question types, or persistent history before those features enter the active roadmap.

---

## 4. Backend Integration

### 4.1 API base URL

The frontend should obtain the backend base URL from:

```text
VITE_API_BASE_URL
```

Example local value:

```text
VITE_API_BASE_URL=http://127.0.0.1:5000
```

The frontend must not contain OpenAI API keys, internal API keys, cron secrets, database credentials, or other backend secrets.

Environment access is centralized in:

```text
src/config/environment.js
```

This module validates that `VITE_API_BASE_URL` is present and exposes the configured backend base URL for later API code.

If the value is missing, the application should show a clear startup configuration error instead of continuing with an unknown backend URL.

### 4.2 Public question endpoint

The initial quiz flow uses:

```http
GET /stream_questions
```

Supported query parameters:

```text
num_questions
difficulty
```

Example request:

```text
/stream_questions?num_questions=10&difficulty=medium
```

Although the route is named `stream_questions`, it returns one complete JSON response. The frontend should use a normal JSON request and must not implement NDJSON, Server-Sent Events, or incremental stream parsing for this endpoint.

### 4.3 Current question shape

The frontend expects each question to have this shape:

```js
{
  id: "8c9f3f4b-7b7f-44d6-a2db-4d41f8d2f01d",
  difficulty: "medium",
  math_subject: "Algebra",
  question: "What is 3x when x = 4?",
  answer_choice_list: [
    "A. 7",
    "B. 9",
    "C. 12",
    "D. 16"
  ],
  answer: "C"
}
```

Current assumptions:

* `id` is a stable opaque string that identifies the public question.
* `difficulty` is `easy`, `medium`, or `hard`.
* `math_subject` is a display label.
* `question` is plain question text.
* `answer_choice_list` contains exactly four strings.
* `answer` is `A`, `B`, `C`, or `D`.
* `question_type` is not currently available.
* Diagrams, explanations, hints, and rich content are not currently available.

The frontend may compare the selected choice letter against `answer` to provide immediate feedback. This is presentation logic only. The browser must not be treated as a trusted authority for scoring, authorization, or persistent completion records.

### 4.4 API module

Initial API access should be centralized in a module such as:

```text
src/api/questionsApi.js
```

Expected public function:

```js
fetchQuestions({
  numQuestions,
  difficulty,
  signal
})
```

Responsibilities of the API module:

* Read the API base URL.
* Build the request URL.
* Add query parameters.
* Send the request.
* Parse JSON responses.
* Detect non-successful HTTP responses.
* Normalize backend errors.
* Perform lightweight response-shape validation.
* Support `AbortSignal` when provided.

The API module should not:

* Update React state.
* Display UI messages.
* Advance the quiz.
* Calculate the final score.
* Import quiz components.

### 4.5 Normalized frontend errors

Backend errors should be converted into a predictable frontend error shape.

Suggested shape:

```js
{
  status: 500,
  message: "Failed to load or save questions",
  code: "QUESTION_REQUEST_FAILED"
}
```

The original backend message may be shown when it is safe and useful, but the UI should provide user-friendly fallback wording.

Example mappings:

| Backend status                | Suggested UI behavior                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| `400`                         | Show a configuration error and allow the user to adjust quiz settings. |
| `500`                         | Show a general server error and a retry action.                        |
| `502`                         | Explain that question generation failed and allow retrying.            |
| `503`                         | Explain that the question service is temporarily unavailable.          |
| Network failure               | Explain that the backend could not be reached.                         |
| Invalid JSON or invalid shape | Show a general data error rather than rendering partial content.       |

The known undocumented server failure caused by a missing backend OpenAI key should be handled by the frontend as a general server error until the backend normalizes it.

---

## 5. Proposed Source Structure

The initial project structure should remain small:

```text
src/
├── api/
│   └── questionsApi.js
├── components/
│   ├── common/
│   │   ├── ErrorMessage.jsx
│   │   ├── LoadingIndicator.jsx
│   │   └── ProgressBar.jsx
│   └── quiz/
│       ├── AnswerChoice.jsx
│       ├── AnswerList.jsx
│       ├── QuizHeader.jsx
│       ├── QuizQuestion.jsx
│       ├── QuizSetup.jsx
│       └── QuizSummary.jsx
├── hooks/
│   └── useQuizSession.js
├── utils/
│   ├── questionValidation.js
│   └── quizScoring.js
├── App.jsx
├── main.jsx
└── index.css
```

This structure is provisional. Create directories only when they are needed by the current implementation.

Avoid creating empty placeholder files or deeply nested directories solely to match this example.

---

## 6. Application Responsibilities

### 6.1 `App`

`App` is the top-level application coordinator.

Initial responsibilities:

* Display quiz setup before a session begins.
* Start a quiz session.
* Display the active quiz.
* Display the completed-session summary.
* Allow the user to start another session.

`App` should not contain low-level answer-choice rendering or raw request construction.

### 6.2 `QuizSetup`

`QuizSetup` collects the initial session configuration.

Initial settings:

* Difficulty: `easy`, `medium`, or `hard`.
* Number of questions: integer from `1` to `20`.

Responsibilities:

* Maintain or receive form values.
* Validate user input before starting.
* Disable submission while a request is already loading.
* Communicate the selected configuration to the session coordinator.

The frontend should still expect the backend to validate these values.

### 6.3 `QuizQuestion`

`QuizQuestion` displays the active question.

Responsibilities:

* Display subject and difficulty.
* Display the question prompt.
* Render the answer list.
* Provide accessible question context.
* Avoid owning application-level session state.

### 6.4 `AnswerList` and `AnswerChoice`

These components display the four available answer choices.

Responsibilities:

* Display each choice as an interactive control.
* Report the selected choice letter.
* Show selected, correct, and incorrect states.
* Disable answer changes after submission when required by the current interaction design.
* Remain keyboard-accessible.
* Avoid relying only on color for feedback.

The frontend may derive the answer letter from the choice index:

```text
0 → A
1 → B
2 → C
3 → D
```

The visible choice string should still be displayed as received from the backend.

### 6.5 `QuizHeader`

`QuizHeader` displays current-session context.

Possible content:

* Current question number.
* Total question count.
* Progress indicator.
* Current score, when appropriate.
* Difficulty or subject.

The timer is not part of the initial architecture unless it enters the active milestone.

### 6.6 `QuizSummary`

`QuizSummary` displays the final result for the current in-memory session.

Possible content:

* Number of correct answers.
* Total number of questions.
* Percentage score.
* Per-question review.
* Action to start another quiz.

Persistent saving is not part of the initial version.

---

## 7. Quiz Session State

The quiz session should be managed in one location rather than distributed across several unrelated components.

The initial session boundary is implemented as a custom hook:

```text
src/hooks/useQuizSession.js
```

The hook uses `useReducer` so loading, request replacement, answer submission, duplicate-scoring prevention, and completion transitions stay explicit.

Suggested state model:

```js
{
  status: "idle",
  config: {
    difficulty: "medium",
    numQuestions: 10
  },
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  submittedQuestionIds: [],
  score: 0,
  error: null
}
```

Suggested session statuses:

```text
idle
loading
active
completed
error
```

Empty successful question responses keep the required status set unchanged. The hook exposes an `isEmptyResult` derived flag so later UI can distinguish an empty success from an ordinary request failure.

Suggested answer record:

```js
{
  questionId: {
    selectedAnswer: "B",
    correctAnswer: "C",
    isCorrect: false
  }
}
```

Use question IDs as answer-record keys. Do not use question text or array position as persistent identifiers.

### 7.1 Derived values

Prefer deriving the following values instead of storing duplicate state:

* Current question.
* Total question count.
* Progress percentage.
* Whether the current question has been answered.
* Whether the current answer is correct.
* Whether the current question is the final question.
* Final percentage score.

Example:

```js
const currentQuestion = questions[currentQuestionIndex];
```

### 7.2 Suggested session actions

A reducer-based implementation may use actions such as:

```text
SESSION_START_REQUESTED
SESSION_LOAD_SUCCEEDED
SESSION_LOAD_FAILED
ANSWER_SUBMITTED
NEXT_QUESTION
SESSION_COMPLETED
SESSION_RESET
```

Action names are implementation suggestions rather than a required public API.

---

## 8. Quiz Interaction Flow

The initial happy-path flow is:

1. The user chooses a difficulty and number of questions.
2. The frontend requests questions from the backend.
3. The frontend validates the returned response.
4. The first question is displayed.
5. The user chooses an answer.
6. The answer is submitted for the current question.
7. Correct or incorrect feedback is displayed.
8. The user advances to the next question.
9. After the final question, the session becomes complete.
10. The summary screen displays the result.
11. The user may start another session.

### 8.1 Answer-selection decision

For the starter implementation:

* Selecting an answer should record the current selection.
* The user should explicitly submit or confirm the answer.
* After submission, the answer should be locked.
* Feedback should appear immediately after submission.
* The next-question action should appear after feedback.

This separation prevents accidental answer submission and supports keyboard users.

This interaction decision may be revised after usability testing.

### 8.2 Request cancellation

When possible, active question requests should use `AbortController`.

A request may be cancelled when:

* The requesting component unmounts.
* A new session request replaces the previous request.
* The user explicitly cancels the loading state in a future design.

An aborted request should not display a normal error message.

---

## 9. Response Validation

The frontend should perform lightweight runtime validation before rendering backend data.

Validation should confirm:

* The response is an object.
* `questions` is an array.
* Every question has a non-empty string `id`.
* Every question has a supported `difficulty`.
* Every question has a string `math_subject`.
* Every question has a string `question`.
* Every question has exactly four answer-choice strings.
* Every answer is `A`, `B`, `C`, or `D`.

The frontend should reject the response as a whole when required question fields are missing or malformed.

The initial project does not need a schema-validation dependency. A small validation function is sufficient unless validation requirements become more complex.

---

## 10. UI State Design

### 10.1 Idle state

Display the quiz setup interface.

### 10.2 Loading state

Display:

* A clear loading message.
* A disabled start action.
* Stable layout that avoids unnecessary content movement.

Do not display stale questions from a previous session while presenting the new request as current.

### 10.3 Empty state

A successful response containing zero questions should display a dedicated empty state.

Suggested message:

```text
No questions are available for this quiz. Try another difficulty or try again.
```

Even though the current contract normally returns the requested number or an error, the frontend should remain safe if an empty array is returned.

### 10.4 Error state

Display:

* A user-friendly explanation.
* A retry action when appropriate.
* An action to return to quiz setup.
* Technical details only when useful during development.

### 10.5 Active state

Display:

* Quiz progress.
* Question context.
* Answer choices.
* Submission controls.
* Feedback after submission.

### 10.6 Completed state

Display:

* Score.
* Completion message.
* Session review when implemented.
* Start-another-quiz action.

---

## 11. Styling Strategy

The initial frontend should use regular CSS.

Suggested approach:

* Keep global reset, typography, color variables, and page layout in `src/index.css`.
* Add component-specific CSS files when a component becomes large enough to justify one.
* Use clear class names scoped by component or feature.
* Define reusable CSS custom properties for spacing, colors, borders, and typography.
* Avoid introducing a CSS framework during the initial quiz implementation.

Example token categories:

```css
:root {
  --space-xs: ...;
  --space-sm: ...;
  --space-md: ...;
  --space-lg: ...;

  --radius-sm: ...;
  --radius-md: ...;

  --color-background: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-muted: ...;
  --color-correct: ...;
  --color-incorrect: ...;
}
```

Exact visual values should be defined during UI design rather than in this architecture document.

---

## 12. Accessibility Requirements

The initial quiz must support keyboard and assistive-technology users.

Requirements:

* Use semantic buttons or form controls for answer choices.
* Provide visible keyboard focus styles.
* Associate form labels with quiz setup controls.
* Ensure answer feedback is announced appropriately.
* Do not communicate correct or incorrect status through color alone.
* Maintain sufficient color contrast.
* Keep touch targets comfortably sized.
* Use headings in a logical order.
* Move focus deliberately when the interface changes significantly.
* Avoid automatically moving to the next question before the user has reviewed feedback.
* Respect reduced-motion preferences when animations are added.

A question and its choices may be represented with a `fieldset` and `legend` when that produces appropriate semantics.

---

## 13. Testing Strategy

The repository does not currently have a documented automated test command.

When frontend testing is added, the preferred initial tools are:

* Vitest.
* React Testing Library.
* `@testing-library/user-event`.

Adding the test dependencies should be a separate, explicit implementation task.

Priority test cases:

* Quiz setup validates question count.
* Question request uses the selected configuration.
* Loading state is displayed.
* Questions are rendered from a valid response.
* Invalid response data shows an error.
* Answer submission identifies correct and incorrect answers.
* Submitted answers become locked.
* Progress advances correctly.
* The final question leads to the summary.
* Retry sends another request.
* Keyboard interaction works for answer selection and submission.

Tests should mock the API module rather than making live backend or OpenAI requests.

---

## 14. Development Fixtures

The happy-path JSON fixture may be used for:

* Component development.
* Story-like manual testing.
* Automated API mocks.
* Testing the quiz flow without a running backend.

Fixture data should be treated as example data, not as the complete contract.

The backend API contract remains the source of truth for required fields, error responses, and query parameters.

Do not add production code that silently falls back to fixture data unless an explicit mock-development mode is designed and documented.

---

## 15. Current Non-Goals

The following are not part of the starter architecture:

* User accounts.
* Login or registration.
* Persistent completion history.
* Cloud-saved quiz sessions.
* Points or badges.
* Levels or streaks.
* Analytics dashboards.
* Tutor chat integration.
* Admin question generation.
* Internal API endpoints.
* Cron endpoints.
* Question diagrams.
* Written-response questions.
* Multiple simultaneous quiz tabs.
* Offline support.
* Client-side routing.
* Global state management libraries.

These items may appear in `TODO.md` under future work.

---

## 16. Open Decisions

The following decisions may be resolved during implementation:

* Whether selected answers can be changed before submission.
* Whether the session summary includes a full per-question review in version 1.0.
* Whether score is visible during the active quiz.
* Whether the quiz setup remains visible after a request error.
* Whether API response validation remains custom or later uses a schema library.
* Whether component styles use colocated CSS files or a feature-level stylesheet.
* Whether a timer enters the initial release.
* Whether `/chat` becomes part of the frontend in a later release.

When an open decision is resolved, update this document and the related implementation milestone.

---

## 17. Initial Component Hierarchy

The initial rendered hierarchy may resemble:

```text
App
├── QuizSetup
├── LoadingIndicator
├── ErrorMessage
└── ActiveQuiz
    ├── QuizHeader
    │   └── ProgressBar
    ├── QuizQuestion
    │   └── AnswerList
    │       └── AnswerChoice × 4
    └── QuizControls

App
└── QuizSummary
```

`ActiveQuiz` and `QuizControls` may begin inside `App` and be extracted only when their responsibilities become substantial.

---

## 18. Validation Commands

Before completing frontend implementation work, run:

```bash
npm run lint
npm run build
```

When an automated test script is added, it should also become part of the required validation process.

Contributors must report any command that could not be run and must not claim that unavailable tests passed.

---

## 19. Architecture Change Policy

Update this document when a task changes:

* Source directory organization.
* State ownership.
* API access patterns.
* Request or response assumptions.
* Navigation architecture.
* Styling strategy.
* Testing strategy.
* Accessibility requirements.
* Major dependency decisions.

Small implementation details that do not affect broader frontend structure do not require an architecture update.
