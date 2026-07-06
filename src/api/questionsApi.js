import { environmentConfig } from '../config/environment.js'
import { validateQuestionResponse } from '../utils/questionValidation.js'

export const QUESTION_API_ERROR_CODES = Object.freeze({
  CONFIGURATION_ERROR: 'QUESTION_API_CONFIGURATION_ERROR',
  REQUEST_FAILED: 'QUESTION_REQUEST_FAILED',
  NETWORK_ERROR: 'QUESTION_NETWORK_ERROR',
  REQUEST_ABORTED: 'QUESTION_REQUEST_ABORTED',
  INVALID_JSON: 'QUESTION_INVALID_JSON',
  INVALID_RESPONSE: 'QUESTION_INVALID_RESPONSE',
})

const STATUS_ERROR_CODES = Object.freeze({
  400: 'QUESTION_REQUEST_INVALID',
  500: 'QUESTION_SERVER_ERROR',
  502: 'QUESTION_GENERATION_FAILED',
  503: 'QUESTION_SERVICE_UNAVAILABLE',
})

export class QuestionsApiError extends Error {
  constructor({
    message,
    code = QUESTION_API_ERROR_CODES.REQUEST_FAILED,
    status = null,
    isAborted = false,
    cause = null,
  }) {
    super(message)
    this.name = 'QuestionsApiError'
    this.code = code
    this.status = status
    this.isAborted = isAborted
    this.cause = cause
  }
}

function createQuestionsApiError(errorConfig) {
  return new QuestionsApiError(errorConfig)
}

function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function getBackendMessage(responseBody) {
  if (!responseBody || typeof responseBody !== 'object') {
    return null
  }

  if (typeof responseBody.message === 'string' && responseBody.message.trim()) {
    return responseBody.message
  }

  if (typeof responseBody.error === 'string' && responseBody.error.trim()) {
    return responseBody.error
  }

  return null
}

function getHttpErrorCode(status) {
  return STATUS_ERROR_CODES[status] ?? QUESTION_API_ERROR_CODES.REQUEST_FAILED
}

function getHttpErrorMessage(response, responseBody) {
  return (
    getBackendMessage(responseBody) ||
    response.statusText ||
    `Question request failed with status ${response.status}.`
  )
}

async function readResponseJson(response) {
  const responseText = await response.text()

  if (!responseText) {
    return {
      data: null,
      parseError: null,
    }
  }

  try {
    return {
      data: JSON.parse(responseText),
      parseError: null,
    }
  } catch (error) {
    return {
      data: null,
      parseError: error,
    }
  }
}

export function buildQuestionsRequestUrl({
  apiBaseUrl = environmentConfig.apiBaseUrl,
  numQuestions,
  difficulty,
}) {
  const requestUrl = new URL('/stream_questions', apiBaseUrl)
  const requestParams = new URLSearchParams({
    num_questions: String(numQuestions),
    difficulty: String(difficulty),
  })

  requestUrl.search = requestParams.toString()

  return requestUrl
}

function getConfiguredApiBaseUrl() {
  if (!environmentConfig.isValid) {
    throw createQuestionsApiError({
      message: environmentConfig.errorMessage,
      code: QUESTION_API_ERROR_CODES.CONFIGURATION_ERROR,
    })
  }

  return environmentConfig.apiBaseUrl
}

export async function fetchQuestions({ numQuestions, difficulty, signal }) {
  let requestUrl

  try {
    requestUrl = buildQuestionsRequestUrl({
      apiBaseUrl: getConfiguredApiBaseUrl(),
      numQuestions,
      difficulty,
    })
  } catch (error) {
    if (error instanceof QuestionsApiError) {
      throw error
    }

    throw createQuestionsApiError({
      message: 'Question API base URL is invalid.',
      code: QUESTION_API_ERROR_CODES.CONFIGURATION_ERROR,
      cause: error,
    })
  }

  let response

  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw createQuestionsApiError({
        message: 'Question request was aborted.',
        code: QUESTION_API_ERROR_CODES.REQUEST_ABORTED,
        isAborted: true,
        cause: error,
      })
    }

    throw createQuestionsApiError({
      message: 'Question request failed before the backend responded.',
      code: QUESTION_API_ERROR_CODES.NETWORK_ERROR,
      cause: error,
    })
  }

  let jsonResult

  try {
    jsonResult = await readResponseJson(response)
  } catch (error) {
    if (isAbortError(error)) {
      throw createQuestionsApiError({
        message: 'Question request was aborted.',
        code: QUESTION_API_ERROR_CODES.REQUEST_ABORTED,
        isAborted: true,
        cause: error,
      })
    }

    throw createQuestionsApiError({
      message: 'Question response could not be read.',
      code: QUESTION_API_ERROR_CODES.NETWORK_ERROR,
      status: response.status,
      cause: error,
    })
  }

  if (!response.ok) {
    throw createQuestionsApiError({
      message: getHttpErrorMessage(response, jsonResult.data),
      code: getHttpErrorCode(response.status),
      status: response.status,
      cause: jsonResult.parseError,
    })
  }

  if (jsonResult.parseError) {
    throw createQuestionsApiError({
      message: 'Question response was not valid JSON.',
      code: QUESTION_API_ERROR_CODES.INVALID_JSON,
      status: response.status,
      cause: jsonResult.parseError,
    })
  }

  const validationResult = validateQuestionResponse(jsonResult.data)

  if (!validationResult.isValid) {
    throw createQuestionsApiError({
      message: validationResult.errorMessage,
      code: QUESTION_API_ERROR_CODES.INVALID_RESPONSE,
      status: response.status,
    })
  }

  return validationResult.questions
}
