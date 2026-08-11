import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { notifyPromise } = useNotify()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    try {
      await notifyPromise(register(name, email, password), {
        loadingTitle: 'Creating account…',
        loadingMessage: email || 'Setting up TaskFlow',
        successTitle: 'Account ready',
        successMessage: (user) => `Welcome, ${user.name}`,
        errorTitle: 'Registration failed',
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="brand" aria-hidden="true">
          <span className="brand-mark">
            <span>TF</span>
          </span>
          TaskFlow
        </div>
        <h1>Create account</h1>
        <p className="auth-lead">Start organizing work in minutes.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
            <span className="field-hint">Use 6+ characters.</span>
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Register'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
