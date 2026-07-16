import { createRequire } from 'node:module'

const require = createRequire('../package.json')
const { chromium } = require('playwright')

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173/'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function expectNoHorizontalOverflow(page) {
  const hasNoOverflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth <= root.clientWidth + 1
  })

  assert(hasNoOverflow, 'Page has horizontal overflow')
}

async function createCheckedPage(context, viewport) {
  const page = await context.newPage({ viewport })
  const browserErrors = []

  page.setDefaultTimeout(15000)
  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    browserErrors.push(error.message)
  })

  return { page, browserErrors }
}

async function completeOneQuestionQuiz(page) {
  await page.getByLabel('Number of questions').fill('1')
  await page.getByRole('button', { name: 'Start quiz' }).click()
  await page.getByRole('region', { name: 'Active quiz question' }).waitFor()
  await page.getByText('Question 1 of 1').first().waitFor()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Submit answer' }).click()
  await page.getByRole('status').waitFor()
  await page.getByRole('button', { name: 'Finish quiz' }).click()
  await page.getByRole('heading', { name: 'Session summary' }).waitFor()
}

async function tabUntil(page, predicate, maxTabs = 20) {
  for (let attempt = 0; attempt < maxTabs; attempt += 1) {
    if (await predicate()) {
      return
    }

    await page.keyboard.press('Tab')
  }

  throw new Error('Could not reach expected focused control with Tab')
}

async function activeElementInfo(page) {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element) {
      return {}
    }

    const label = element.id
      ? document.querySelector(`label[for="${element.id}"]`)?.textContent
      : ''

    return {
      tagName: element.tagName,
      role: element.getAttribute('role'),
      type: element.getAttribute('type'),
      label: label?.trim() || '',
      text: element.textContent?.trim() || '',
      value: element.value || '',
    }
  })
}

async function runDesktopHappyPath(context) {
  const { page, browserErrors } = await createCheckedPage(context, {
    width: 1280,
    height: 900,
  })

  await page.goto(baseUrl)
  await page.getByRole('heading', { name: 'MathLingo' }).waitFor()
  await page.getByRole('heading', { name: 'Set up a quiz' }).waitFor()
  await expectNoHorizontalOverflow(page)
  await completeOneQuestionQuiz(page)
  await page.getByText(/You answered [01] of 1 questions correctly\./).waitFor()
  await page.getByRole('button', { name: 'Start another quiz' }).click()
  await page.getByRole('heading', { name: 'Set up a quiz' }).waitFor()
  await expectNoHorizontalOverflow(page)
  await page.close()

  return browserErrors
}

async function runMobileHappyPath(context) {
  const { page, browserErrors } = await createCheckedPage(context, {
    width: 390,
    height: 844,
  })

  await page.goto(baseUrl)
  await page.getByRole('heading', { name: 'Set up a quiz' }).waitFor()
  await expectNoHorizontalOverflow(page)
  await completeOneQuestionQuiz(page)
  await page.getByText(/You answered [01] of 1 questions correctly\./).waitFor()
  await expectNoHorizontalOverflow(page)
  await page.close()

  return browserErrors
}

async function runKeyboardOnlyFlow(context) {
  const { page, browserErrors } = await createCheckedPage(context, {
    width: 1024,
    height: 768,
  })

  await page.goto(baseUrl)
  await page.getByRole('heading', { name: 'Set up a quiz' }).waitFor()
  await tabUntil(page, async () => {
    const info = await activeElementInfo(page)
    return info.label === 'Number of questions'
  })
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await page.keyboard.type('1')
  await tabUntil(page, async () => {
    const info = await activeElementInfo(page)
    return info.tagName === 'BUTTON' && info.text === 'Start quiz'
  })
  await page.keyboard.press('Enter')
  await page.getByRole('region', { name: 'Active quiz question' }).waitFor()
  await tabUntil(page, async () => {
    const info = await activeElementInfo(page)
    return info.type === 'radio'
  })
  await page.keyboard.press('Space')
  await tabUntil(page, async () => {
    const info = await activeElementInfo(page)
    return info.tagName === 'BUTTON' && info.text === 'Submit answer'
  })
  await page.keyboard.press('Enter')
  await page.getByRole('status').waitFor()
  await tabUntil(page, async () => {
    const info = await activeElementInfo(page)
    return info.tagName === 'BUTTON' && info.text === 'Finish quiz'
  })
  await page.keyboard.press('Enter')
  await page.getByRole('heading', { name: 'Session summary' }).waitFor()
  await page.close()

  return browserErrors
}

async function runEmptyState(context) {
  const { page, browserErrors } = await createCheckedPage(context, {
    width: 1280,
    height: 900,
  })

  await page.route('**/stream_questions**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ questions: [] }),
    })
  })
  await page.goto(baseUrl)
  await page.getByRole('button', { name: 'Start quiz' }).click()
  await page.getByRole('heading', { name: 'No questions available' }).waitFor()
  await page.getByRole('button', { name: 'Try again' }).waitFor()
  await expectNoHorizontalOverflow(page)
  await page.close()

  return browserErrors
}

async function runErrorState(context) {
  const { page, browserErrors } = await createCheckedPage(context, {
    width: 1280,
    height: 900,
  })

  await page.route('**/stream_questions**', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Failed to load or save questions' }),
    })
  })
  await page.goto(baseUrl)
  await page.getByRole('button', { name: 'Start quiz' }).click()
  await page.getByRole('heading', { name: 'Question service hit a problem' }).waitFor()
  await page.getByRole('button', { name: 'Try again' }).waitFor()
  await page.getByRole('button', { name: 'Return to setup' }).waitFor()
  await expectNoHorizontalOverflow(page)
  await page.close()

  return browserErrors
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const results = []

  try {
    for (const [name, check] of [
      ['desktop happy path', runDesktopHappyPath],
      ['mobile happy path', runMobileHappyPath],
      ['keyboard-only flow', runKeyboardOnlyFlow],
      ['empty state', runEmptyState],
      ['error state', runErrorState],
    ]) {
      const errors = await check(context)
      results.push({
        name,
        status: errors.length === 0 ? 'passed' : 'passed-with-console-errors',
        consoleErrors: errors,
      })
    }
  } finally {
    await browser.close()
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
