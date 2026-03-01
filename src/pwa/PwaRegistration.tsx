import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaRegistration() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed', error)
    },
  })

  useEffect(() => {
    if (!offlineReady) {
      return
    }

    console.info('IKTNB Todo is ready for offline usage')
  }, [offlineReady])

  useEffect(() => {
    if (!needRefresh) {
      return
    }

    const shouldUpdate = window.confirm('Доступна новая версия приложения. Обновить сейчас?')
    if (shouldUpdate) {
      void updateServiceWorker(true)
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
