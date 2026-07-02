const viteApiBaseUrl = import.meta.env?.VITE_API_BASE_URL
const nodeApiBaseUrl = globalThis.process?.env?.VITE_API_BASE_URL
const apiBaseUrl = (viteApiBaseUrl ?? nodeApiBaseUrl)?.trim()

export function validateEnvironmentConfig() {
  if (!apiBaseUrl) {
    return {
      isValid: false,
      errorMessage:
        'Missing required environment variable VITE_API_BASE_URL. Copy .env.example to .env.local and set VITE_API_BASE_URL before starting MathLingo.',
    }
  }

  return {
    isValid: true,
    apiBaseUrl,
  }
}

export const environmentConfig = Object.freeze(validateEnvironmentConfig())

