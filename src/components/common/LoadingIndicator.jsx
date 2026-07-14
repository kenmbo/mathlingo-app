import { useEffect, useId, useRef } from 'react'
import './LoadingIndicator.css'

function LoadingIndicator({
  title = 'Loading questions',
  message = 'Fetching your quiz from the question service.',
}) {
  const titleId = useId()
  const messageId = useId()
  const loadingRef = useRef(null)

  useEffect(() => {
    loadingRef.current?.focus()
  }, [])

  return (
    <section
      aria-describedby={messageId}
      aria-labelledby={titleId}
      aria-live="polite"
      className="loading-indicator"
      ref={loadingRef}
      role="status"
      tabIndex={-1}
    >
      <span className="loading-indicator__spinner" aria-hidden="true" />
      <div className="loading-indicator__content">
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
      </div>
    </section>
  )
}

export default LoadingIndicator

