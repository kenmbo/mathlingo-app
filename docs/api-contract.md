# API Contract

This document describes the current Flask API contract that frontend clients and future backend migrations should preserve unless a task explicitly changes it. The highest-priority compatibility rule is preserving JSON response shapes.

## General Notes

- Responses are JSON for the documented success and handled error cases.
- Public routes do not require internal API keys or cron secrets.
- Tests must mock OpenAI and database behavior where appropriate.
- `question_type` is intentionally absent from the current public question payload.
- Storage-only question fields such as `source`, `created_at`, and `updated_at` are private on `GET /stream_questions`.

## `GET /stream_questions`

Returns SAT-style math multiple-choice questions.

Authentication: none.

Query params:

| Name | Default | Allowed values | Notes |
| --- | --- | --- | --- |
| `num_questions` | `10` | integer from `1` to `20` | Invalid values return `400`. |
| `difficulty` | `medium` | `easy`, `medium`, `hard` | Values are lowercased before validation. |

Behavior:

- Loads stored questions from Postgres first.
- Calls OpenAI only for the remaining number of questions needed.
- Saves fresh AI-generated fallback questions before returning them.
- Returns an error instead of ID-less questions when storage is unavailable or saving fails.
- Returns a complete JSON response, not streamed NDJSON.

Success response: `200`

```json
{
  "questions": [
    {
      "id": "8c9f3f4b-7b7f-44d6-a2db-4d41f8d2f01d",
      "difficulty": "medium",
      "math_subject": "Algebra",
      "question": "What is 3x when x = 4?",
      "answer_choice_list": ["A. 7", "B. 9", "C. 12", "D. 16"],
      "answer": "C"
    }
  ]
}
```

Question fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable opaque public ID backed by `questions.id`. |
| `difficulty` | string | `easy`, `medium`, or `hard`. |
| `math_subject` | string | Subject label generated or stored for the question. |
| `question` | string | Question prompt. |
| `answer_choice_list` | string array | Exactly 4 choices. |
| `answer` | string | `A`, `B`, `C`, or `D`. |

Handled error responses:

| Status | Body | Cause |
| --- | --- | --- |
| `400` | `{ "message": "Invalid num_questions parameter" }` | `num_questions` is not an integer, is less than `1`, or is greater than `20`. |
| `400` | `{ "message": "Invalid difficulty parameter" }` | `difficulty` is not one of `easy`, `medium`, or `hard`. |
| `502` | `{ "message": "Failed to parse generated questions" }` | OpenAI output is malformed or fails question validation. |
| `503` | `{ "message": "Database is not configured" }` | Storage is required but `DATABASE_URL` is not configured. |
| `500` | `{ "message": "Failed to load or save questions" }` | Stored questions cannot be loaded or fresh generated questions cannot be saved. |

Current known gap:

- If fresh generation is required and `OPENAI_API_KEY` is missing, this route currently raises an unhandled server error instead of returning a documented JSON `503`. Standardizing that response should be handled as a separate compatibility task.

## `POST /chat`

Returns a basic school-tutor chat reply.

Authentication: none.

Request body:

```json
{
  "message": "Help me study algebra"
}
```

Success response: `200`

```json
{
  "reply": "academic reply"
}
```

Handled error responses:

| Status | Body | Cause |
| --- | --- | --- |
| `400` | `{ "error": "No message provided" }` | `message` is missing or empty. |

Current known gaps:

- Malformed JSON handling is delegated to Flask's `request.get_json(force=True)` behavior.
- Missing `OPENAI_API_KEY` and upstream OpenAI failures are not currently normalized into documented JSON error responses.
- `/chat` is preserved for migration compatibility, but it is not core to question generation.

## `POST /internal/questions/generate`

Generates and saves a batch of questions for internal/admin use.

Authentication:

- Requires header `X-Internal-API-Key`.
- The header value must match `INTERNAL_API_KEY`.
- The key is not accepted in query params or request body.

Request body:

```json
{
  "num_questions": 10,
  "difficulty": "medium"
}
```

Body fields:

| Name | Default | Allowed values | Notes |
| --- | --- | --- | --- |
| `num_questions` | `10` | integer from `1` to `20` | Invalid values return `400`. |
| `difficulty` | `medium` | `easy`, `medium`, `hard` | Values are lowercased before validation. |

Success response: `201`

```json
{
  "saved_count": 1,
  "questions": [
    {
      "id": "8c9f3f4b-7b7f-44d6-a2db-4d41f8d2f01d",
      "difficulty": "medium",
      "math_subject": "Algebra",
      "question": "What is 3x when x = 4?",
      "answer_choice_list": ["A. 7", "B. 9", "C. 12", "D. 16"],
      "answer": "C",
      "source": "pregenerated",
      "created_at": "2026-06-25T00:00:00+00:00",
      "updated_at": "2026-06-25T00:00:00+00:00"
    }
  ]
}
```

Handled error responses:

| Status | Body | Cause |
| --- | --- | --- |
| `503` | `{ "message": "Internal API key is not configured" }` | Server-side `INTERNAL_API_KEY` is missing. |
| `401` | `{ "message": "Invalid internal API key" }` | Header is missing or does not match. |
| `400` | `{ "message": "Invalid num_questions parameter" }` | `num_questions` is not an integer, is less than `1`, or is greater than `20`. |
| `400` | `{ "message": "Invalid difficulty parameter" }` | `difficulty` is not one of `easy`, `medium`, or `hard`. |
| `502` | `{ "message": "Failed to parse generated questions" }` | OpenAI output is malformed or fails question validation. |
| `503` | `{ "message": "Database is not configured" }` | `DATABASE_URL` is not configured. |
| `500` | `{ "message": "Failed to save generated questions" }` | Generated questions cannot be saved. |

## `GET /internal/cron/top-up-questions`

Vercel Cron endpoint for topping up stored questions.

Authentication:

- Requires `Authorization: Bearer <CRON_SECRET>`.
- Authentication is checked before cron enablement.

Enablement:

- Controlled by `QUESTION_GENERATION_CRON_ENABLED`.
- Only `true`, `1`, `yes`, and `on` enable the job.
- Missing or any other value defaults to disabled.
- Vercel cron schedules use UTC.

Disabled response after successful authentication: `200`

```json
{
  "ok": true,
  "skipped": true,
  "reason": "cron_disabled"
}
```

Already-running response: `200`

```json
{
  "ok": true,
  "skipped": true,
  "reason": "already_running"
}
```

Success response: `200`

```json
{
  "ok": true,
  "status": "success",
  "generated_count": 2,
  "saved_count": 2,
  "results": [
    {
      "difficulty": "easy",
      "stored_count": 50,
      "generated": 0,
      "saved": 0,
      "skipped": true,
      "reason": "target_met"
    },
    {
      "difficulty": "medium",
      "stored_count": 48,
      "generated": 2,
      "saved": 2,
      "skipped": false
    }
  ],
  "errors": []
}
```

Partial failure response: `500`

```json
{
  "ok": false,
  "status": "partial_failure",
  "generated_count": 0,
  "saved_count": 0,
  "results": [],
  "errors": [
    {
      "difficulty": "easy",
      "error": "generation_failed"
    }
  ]
}
```

Handled error responses:

| Status | Body | Cause |
| --- | --- | --- |
| `503` | `{ "message": "Cron secret is not configured" }` | Server-side `CRON_SECRET` is missing. |
| `401` | `{ "message": "Invalid cron secret" }` | Authorization header is missing or does not match. |
| `503` | `{ "ok": false, "message": "Database is not configured" }` | `DATABASE_URL` is not configured. |
| `503` | `{ "ok": false, "message": "OpenAI API key is not configured" }` | `OPENAI_API_KEY` is missing when generation is needed. |
| `500` | `{ "ok": false, "message": "Failed to run question generation cron" }` | Cron storage or lock setup fails outside per-difficulty generation. |

## Planned Contract Changes

- `question_type` support is planned but intentionally not part of the current schema.
- Completion records are not implemented yet. When added, they should store `question_id` values that reference the public `id` returned by `GET /stream_questions`.
- The future Django REST Framework migration should preserve the routes, query params, status codes, auth headers, and JSON response shapes documented here unless a task explicitly changes and tests the contract.
