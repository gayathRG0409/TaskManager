import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import NotifyPopup from '../components/NotifyPopup'

const NotifyContext = createContext(null)

const AUTO_DISMISS = {
  success: 2600,
  info: 2800,
  error: 4200,
  loading: 0,
}

export function NotifyProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)
  const seqRef = useRef(0)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const dismiss = useCallback(() => {
    clearTimer()
    setToast(null)
  }, [clearTimer])

  const notify = useCallback(
    ({ type = 'info', title, message, details } = {}) => {
      clearTimer()
      const id = ++seqRef.current
      setToast({
        id,
        type,
        title: title || defaultTitle(type),
        message: message || '',
        details: details || null,
      })

      const ms = AUTO_DISMISS[type] ?? 2800
      if (ms > 0) {
        timerRef.current = setTimeout(() => {
          setToast((current) => (current?.id === id ? null : current))
        }, ms)
      }

      return id
    },
    [clearTimer],
  )

  const notifyPromise = useCallback(
    async (
      promise,
      {
        loadingTitle = 'Working…',
        loadingMessage = 'Please wait',
        successTitle,
        successMessage,
        errorTitle = 'Something went wrong',
      } = {},
    ) => {
      notify({
        type: 'loading',
        title: loadingTitle,
        message: loadingMessage,
      })

      try {
        const result = await promise
        const resolvedMessage =
          typeof successMessage === 'function'
            ? successMessage(result)
            : successMessage

        notify({
          type: 'success',
          title: successTitle || 'Success',
          message: resolvedMessage || 'Request completed',
          details: summarizeResult(result),
        })
        return result
      } catch (err) {
        notify({
          type: 'error',
          title: errorTitle,
          message: err?.message || 'Request failed',
        })
        throw err
      }
    },
    [notify],
  )

  const value = useMemo(
    () => ({ notify, notifyPromise, dismiss }),
    [notify, notifyPromise, dismiss],
  )

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <NotifyPopup toast={toast} onClose={dismiss} />
    </NotifyContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider')
  return ctx
}

function defaultTitle(type) {
  if (type === 'success') return 'Success'
  if (type === 'error') return 'Error'
  if (type === 'loading') return 'Loading'
  return 'Notice'
}

function summarizeResult(result) {
  if (!result || typeof result !== 'object') return null

  if (result.task) {
    return {
      label: result.task.title,
      meta: STATUS_LABEL[result.task.status] || result.task.status,
      tone: result.task.status,
    }
  }

  const user = result.user || (result.name && result.email ? result : null)
  if (user?.name) {
    return {
      label: user.name,
      meta: user.email || '',
      tone: 'info',
    }
  }

  return null
}

const STATUS_LABEL = {
  todo: 'To do',
  doing: 'Doing',
  done: 'Done',
}
