const ICONS = {
  success: '✓',
  error: '!',
  info: 'i',
  loading: '…',
}

export default function NotifyPopup({ toast, onClose }) {
  if (!toast) return null

  const { type, title, message, details } = toast

  return (
    <div className="notify-layer" role="presentation">
      <div
        className={`notify-card notify-${type}`}
        role="alertdialog"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        aria-modal="true"
        aria-label={title}
      >
        <div className={`notify-icon notify-icon-${type}`} aria-hidden="true">
          {type === 'loading' ? (
            <span className="notify-spinner" />
          ) : (
            ICONS[type] || ICONS.info
          )}
        </div>

        <div className="notify-copy">
          <h2>{title}</h2>
          {message ? <p>{message}</p> : null}

          {details ? (
            <div className={`notify-detail notify-detail-${details.tone || 'info'}`}>
              <strong>{details.label}</strong>
              {details.meta ? <span>{details.meta}</span> : null}
            </div>
          ) : null}
        </div>

        {type !== 'loading' ? (
          <button
            type="button"
            className="notify-close"
            onClick={onClose}
            aria-label="Close notification"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  )
}
