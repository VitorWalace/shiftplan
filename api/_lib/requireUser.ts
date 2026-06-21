import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabaseAdmin'
import type { ApiRequest } from './types'

/** Validates the Supabase access token sent by the client and returns the authenticated user, or null. */
export async function requireUser(req: ApiRequest): Promise<User | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null

  return data.user
}
