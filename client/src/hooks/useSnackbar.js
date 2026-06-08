import { useCallback, useState } from 'react'

const DEFAULT_SNACKBAR_STATE = {
  open: false,
  title: '',
  message: '',
  variant: 'info',
  autoHideDuration: 3200,
}

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState(DEFAULT_SNACKBAR_STATE)

  const showSnackbar = useCallback((message, options = {}) => {
    setSnackbar({
      open: true,
      title: options.title || '',
      message,
      variant: options.variant || 'info',
      autoHideDuration: options.autoHideDuration ?? 3200,
    })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar((current) => ({ ...current, open: false }))
  }, [])

  return { snackbar, showSnackbar, closeSnackbar }
}
