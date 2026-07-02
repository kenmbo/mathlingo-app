import http from 'node:http'

const validResponse = {
  questions: [
    {
      id: 'question-1',
      difficulty: 'medium',
      math_subject: 'Algebra',
      question: 'What is 3x when x = 4?',
      answer_choice_list: ['A. 7', 'B. 9', 'C. 12', 'D. 16'],
      answer: 'C',
    },
  ],
}

const invalidResponse = {
  questions: [
    {
      id: 'question-2',
      difficulty: 'easy',
      math_subject: 'Algebra',
      question: 'What is 1 + 1?',
      answer_choice_list: ['A. 1', 'B. 2'],
      answer: 'B',
    },
  ],
}

const requests = []

const server = http.createServer((request, response) => {
  requests.push(request.url)

  const requestUrl = new URL(request.url, 'http://127.0.0.1')
  const difficulty = requestUrl.searchParams.get('difficulty')

  if (difficulty === 'hard') {
    response.writeHead(503, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ message: 'Database is not configured' }))
    return
  }

  if (difficulty === 'easy') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(invalidResponse))
    return
  }

  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify(validResponse))
})

await new Promise((resolve) => {
  server.listen(0, '127.0.0.1', resolve)
})

const { port } = server.address()
process.env.VITE_API_BASE_URL = `http://127.0.0.1:${port}`

const { fetchQuestions } = await import(
  'file:///home/kuser/python/mathlingo-v2/mathlingo-app/src/api/questionsApi.js'
)

try {
  const questions = await fetchQuestions({
    numQuestions: 5,
    difficulty: 'medium',
  })

  console.log(
    JSON.stringify({
      requestUrl: requests.at(-1),
      questionCount: questions.length,
      firstQuestionId: questions[0].id,
    }),
  )

  try {
    await fetchQuestions({ numQuestions: 5, difficulty: 'hard' })
  } catch (error) {
    console.log(
      JSON.stringify({
        backendError: {
          name: error.name,
          code: error.code,
          status: error.status,
          message: error.message,
          isAborted: error.isAborted,
        },
      }),
    )
  }

  try {
    await fetchQuestions({ numQuestions: 5, difficulty: 'easy' })
  } catch (error) {
    console.log(
      JSON.stringify({
        malformedError: {
          name: error.name,
          code: error.code,
          status: error.status,
          message: error.message,
          isAborted: error.isAborted,
        },
      }),
    )
  }

  const controller = new AbortController()
  controller.abort()

  try {
    await fetchQuestions({
      numQuestions: 5,
      difficulty: 'medium',
      signal: controller.signal,
    })
  } catch (error) {
    console.log(
      JSON.stringify({
        abortError: {
          name: error.name,
          code: error.code,
          status: error.status,
          message: error.message,
          isAborted: error.isAborted,
        },
      }),
    )
  }
} finally {
  server.close()
}

