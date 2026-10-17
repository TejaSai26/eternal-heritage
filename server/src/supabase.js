import { createClient } from '@supabase/supabase-js'

export function isServerSupabaseConfigured() {
  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  return Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_SUPABASE'))
}

export function createPublicSupabase() {
  if (!isServerSupabaseConfigured()) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

export async function requireUser(req, res, next) {
  try {
    if (!isServerSupabaseConfigured()) {
      return res.status(503).json({ error: 'The Supabase connection is not configured. Add the server environment variables and restart the API.' })
    }
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' })

    const authClient = createPublicSupabase()
    const { data, error } = await authClient.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' })

    // All database requests in this request carry the signed-in user's JWT. PostgreSQL RLS
    // determines which private rows that user may read or change.
    req.user = data.user
    req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
    return next()
  } catch (error) {
    return next(error)
  }
}
