import { useCallback, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components -- hook + viewport live together by design
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2500)
  }, [])

  return { message, showToast }
}

export function ToastViewport({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-muted-900 px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  )
}
