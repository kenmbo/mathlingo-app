import './LoadingIndicator.css'

function LoadingIndicator({
  title = 'Loading questions',
  message = 'Fetching your quiz from the question service.',
}) {
  return (
    <section
      aria-live="polite"
      className="loading-indicator"
      role="status"
    >
      <span className="loading-indicator__spinner" aria-hidden="true" />
      <div className="loading-indicator__content">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </section>
  )
}

export default LoadingIndicator
