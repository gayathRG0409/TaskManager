import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?'
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, refreshProfile, updateProfile } = useAuth()
  const { notify, notifyPromise } = useNotify()
  const [stats, setStats] = useState({ total: 0, doing: 0, done: 0 })
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await refreshProfile()
        if (cancelled) return
        setStats(data.stats || { total: 0, doing: 0, done: 0 })
        setName(data.user.name)
        setEmail(data.user.email)
      } catch (err) {
        if (!cancelled) {
          const text = err.message || 'Failed to load profile'
          setError(text)
          notify({
            type: 'error',
            title: 'Profile load failed',
            message: text,
          })
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refreshProfile, notify])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await notifyPromise(updateProfile({ name, email }), {
        loadingTitle: 'Saving profile…',
        loadingMessage: 'Updating your account',
        successTitle: 'Profile saved',
        successMessage: (saved) => `${saved.name} · ${saved.email}`,
        errorTitle: 'Save failed',
      })
      setMessage('Profile saved')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    notify({
      type: 'info',
      title: 'Signed out',
      message: 'Come back anytime to manage your board.',
    })
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your account and preferences</p>
        </div>
      </div>

      <section className="profile-card">
        <div className="profile-hero">
          <div className="avatar" aria-hidden="true">
            {initials(name || user?.name)}
          </div>
          <div>
            <h1>{name || user?.name}</h1>
            <p>{email || user?.email}</p>
          </div>
        </div>

        <div className="stats" aria-label="Task stats">
          <div className="stat">
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
          <div className="stat">
            <strong>{stats.doing}</strong>
            <span>Doing</span>
          </div>
          <div className="stat">
            <strong>{stats.done}</strong>
            <span>Done</span>
          </div>
        </div>

        <form className="form profile-section" onSubmit={handleSave}>
          <h2>Account</h2>
          <div className="field">
            <label htmlFor="profile-name">Display name</label>
            <input
              id="profile-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? <p className="form-success">{message}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="profile-section">
          <h2>Session</h2>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            You are signed in. Data is stored by the TaskFlow API.
          </p>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </section>
    </>
  )
}
