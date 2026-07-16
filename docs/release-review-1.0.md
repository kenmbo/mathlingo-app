# Version 1.0 Release Review

This document records the MathLingo frontend release-readiness review for the
initial version 1.0 quiz experience.

## Review Summary

The version 1.0 frontend supports the documented quiz flow:

* Quiz setup with difficulty and question count.
* Loading state while questions are requested.
* Active one-question-at-a-time quiz flow.
* Explicit answer selection and submission.
* Correct and incorrect feedback.
* Progress through the current session.
* Empty and error states with recovery actions.
* Completed-session summary with scoring, subject breakdown, per-question
  review, and start-another-quiz action.

The frontend API request matches `docs/api-contract.md`: the app calls
`GET /stream_questions` through `src/api/questionsApi.js`, sends
`num_questions` and `difficulty`, expects one complete JSON response, validates
the public question shape, and does not parse streamed NDJSON.

## Release Checks

Automated checks:

* `npm run lint`
* `npm run build`
* `npm run test`

Manual headless browser checks:

* Desktop happy path with the live local backend.
* Mobile-width happy path with the live local backend.
* Keyboard-only happy path with the live local backend.
* Empty response state using route interception.
* Error response state using route interception.
* Browser console inspection during the normal live-backend flow.
* Production preview review.

The automated test suite mocks the frontend question API module and does not
call the live Flask backend.

## Known Limitations

* Session data is in memory only. User accounts, persistence, saved sessions,
  and completed-question history are future work.
* A real screen-reader software pass has not been completed in this
  environment. Keyboard behavior and headless accessibility-oriented checks
  have been reviewed.
* Empty and error states were reviewed with route interception because the live
  healthy backend returned valid questions.
* The backend contract still documents a known gap for missing backend
  `OPENAI_API_KEY` normalization. The frontend handles undocumented server
  failures as general request errors.

## Release Blockers

No version 1.0 frontend release blockers were found during this review.

