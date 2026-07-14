import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

globalThis.process.env.VITE_API_BASE_URL ??= 'http://127.0.0.1:5000'

afterEach(() => {
  cleanup()
})
