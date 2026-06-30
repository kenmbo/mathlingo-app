import './App.css'

function App() {
  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="app-intro">
        <p className="eyebrow">SAT and ACT math practice</p>
        <h1 id="app-title">MathLingo</h1>
        <p className="lede">
          A focused study space for multiple-choice math practice, immediate
          feedback, and steady session progress.
        </p>

        <div className="quiz-placeholder" aria-label="Upcoming quiz interface">
          <h2>Quiz workspace</h2>
          <p>
            Questions, answer choices, feedback, and progress will appear here
            as the practice experience takes shape.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App

