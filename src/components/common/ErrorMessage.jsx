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
  const hasRetry = typeof onRetry === 'function'
  const hasReturnToSetup = typeof onReturnToSetup === 'function'

  return (
    <section className="error-message" role="alert">
      <div className="error-message__content">
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
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
