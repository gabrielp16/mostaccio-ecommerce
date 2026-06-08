import { useEffect } from 'react'

function Snackbar({
  open,
  mode = 'toast',
  title = '',
  message = '',
  variant = 'info',
  autoHideDuration = 3200,
  onClose,
  actions = [],
  children,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open || mode !== 'toast' || !autoHideDuration) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      onClose?.()
    }, autoHideDuration)

    return () => window.clearTimeout(timerId)
  }, [open, mode, autoHideDuration, onClose])

  if (!open) {
    return null
  }

  if (mode === 'modal') {
    return (
      <>
        <div className="snackbar-modal-layer" role="dialog" aria-modal="true" aria-label={title || 'Dialogo'}>
          <div className="snackbar-modal-card">
            {(title || message) && (
              <div className="snackbar-modal-header">
                {title && <h2 className="snackbar-modal-title">{title}</h2>}
                {onClose && (
                  <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                )}
              </div>
            )}

            {message && <p className="snackbar-modal-message">{message}</p>}

            {children}

            {actions.length > 0 && (
              <div className="snackbar-modal-actions">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={action.className || 'btn btn-outline-dark'}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className="snackbar-modal-backdrop"
          onClick={() => {
            if (closeOnBackdrop) {
              onClose?.()
            }
          }}
        ></div>
      </>
    )
  }

  return (
    <div className={`snackbar-toast snackbar-${variant}`} role="status" aria-live="polite">
      <div className="snackbar-toast-body">
        {title && <p className="snackbar-toast-title">{title}</p>}
        {message && <p className="snackbar-toast-message">{message}</p>}
      </div>
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      )}
    </div>
  )
}

export default Snackbar
