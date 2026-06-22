/**
 * Extracts a human-readable message from an unknown thrown value.
 * Supabase/PostgREST errors aren't always real `Error` instances — they can
 * be plain objects shaped like `{ message, details, hint, code }` — so a
 * strict `instanceof Error` check silently misses them.
 */
export function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return undefined
}
