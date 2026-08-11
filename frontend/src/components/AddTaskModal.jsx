import { useEffect, useId, useRef, useState } from 'react'

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
  defaultStatus = 'todo',
}) {
  const titleId = useId()
  const titleRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    titleRef.current?.focus()
    setError('')
    setSubmitting(false)

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const title = String(form.get('title') || '').trim()
    if (!title) return

    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        title,
        notes: String(form.get('notes') || '').trim(),
        status: String(form.get('status') || 'todo'),
        due: String(form.get('due') || ''),
      })
      formEl.reset()
    } catch (err) {
      setError(err.message || 'Could not save task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-head">
          <h2 id={titleId}>Add task</h2>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              name="title"
              ref={titleRef}
              placeholder="What needs doing?"
              required
              maxLength={80}
              disabled={submitting}
            />
          </div>

          <div className="field">
            <label htmlFor="task-notes">Notes</label>
            <textarea
              id="task-notes"
              name="notes"
              placeholder="Optional details"
              maxLength={280}
              disabled={submitting}
            />
          </div>

          <div className="field">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              name="status"
              key={defaultStatus}
              defaultValue={defaultStatus}
              disabled={submitting}
            >
              <option value="todo">To do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="task-due">Due date</label>
            <input
              id="task-due"
              name="due"
              type="date"
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
