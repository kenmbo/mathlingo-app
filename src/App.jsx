import { environmentConfig } from './config/environment'
import QuizSetup from './components/quiz/QuizSetup'
import './App.css'

function App() {
  if (!environmentConfig.isValid) {
    return (
      <main className="app-shell app-shell--error" aria-labelledby="app-title">
        <section className="app-intro" role="alert">
          <p className="eyebrow">Configuration required</p>
          <h1 id="app-title">MathLingo</h1>
          <p className="lede">{environmentConfig.errorMessage}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="app-intro">
        <p className="eyebrow">SAT and ACT math practice</p>
        <h1 id="app-title">MathLingo</h1>
        <p className="lede">
          A focused study space for multiple-choice math practice, immediate
          feedback, and steady session progress.
        </p>

        <section className="quiz-workspace" aria-label="Quiz setup">
          <QuizSetup />
        </section>
      </section>
    </main>
  )
}

export default App

