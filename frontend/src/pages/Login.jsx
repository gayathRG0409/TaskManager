import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordField from '../components/PasswordField'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { notifyPromise } = useNotify()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    try {
      await notifyPromise(login(email, password), {
        loadingTitle: 'Signing in…',
        loadingMessage: email || 'Checking your account',
        successTitle: 'Welcome back',
        successMessage: (user) => `Signed in as ${user.name}`,
        errorTitle: 'Login failed',
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
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
        <h1>Welcome back</h1>
        <p className="auth-lead">Sign in to manage your tasks.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <PasswordField
            id="login-password"
            autoComplete="current-password"
          />
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
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
