import { useEffect, useId, useRef } from 'react'
import './ErrorMessage.css'

function ErrorMessage({
  title = 'Questions could not be loaded',
  message,
  details = '',
  onRetry,
  onReturnToSetup,
  retryLabel = 'Try again',
  returnToSetupLabel = 'Return to setup',
}) {
  const titleId = useId()
  const messageId = useId()
  const errorRef = useRef(null)
  const hasRetry = typeof onRetry === 'function'
  const hasReturnToSetup = typeof onReturnToSetup === 'function'

  useEffect(() => {
    errorRef.current?.focus()
  }, [])

  return (
    <section
      aria-describedby={message ? messageId : undefined}
      aria-labelledby={titleId}
      className="error-message"
      ref={errorRef}
      role="alert"
      tabIndex={-1}
    >
      <div className="error-message__content">
        <h2 id={titleId}>{title}</h2>
        {message ? <p id={messageId}>{message}</p> : null}
      </div>

      {details ? (
        <details className="error-message__details">
          <summary>Details for local development</summary>
          <p>{details}</p>
        </details>
      ) : null}

      {hasRetry || hasReturnToSetup ? (
        <div className="error-message__actions">
          {hasRetry ? (
            <button type="button" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
          {hasReturnToSetup ? (
            <button
              className="error-message__secondary-action"
              type="button"
              onClick={onReturnToSetup}
            >
              {returnToSetupLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default ErrorMessage

