import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createPublicSupabase, isServerSupabaseConfigured, requireUser } from './supabase.js'
import { rankStories } from './recommendations.js'

const app = express()
const port = Number(process.env.PORT || 4000)
app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
)
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    const localDevOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/(?:(?:localhost|127\.0\.0\.1)|(?:192\.168\.\d{1,3}\.\d{1,3})|(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})):5173$/.test(origin)
    if (localDevOrigin) return callback(null, true)
    return callback(new Error('This website origin is not allowed by the API. Set CLIENT_ORIGIN on the server.'))
  },
}))
app.use(express.json({ limit: '80kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 240, standardHeaders: 'draft-8', legacyHeaders: false }))

const allowedAgeBands = new Set(['Under 18', '18–24', '25–34', '35–44', '45–59', '60+'])
const allowedInterests = new Set([
  'cooking', 'anime', 'architecture', 'sculpture', 'history', 'mythology',
  'dance_music', 'crafts', 'photography', 'nature', 'festivals', 'temples',
])
const allowedLanguages = new Set(['English', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'हिन्दी (Hindi)'])
const statesAndTerritories = new Set([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
])

function cleanName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 80) : ''
}

function publicError(res, message, status = 500) {
  const safeMessage = process.env.NODE_ENV === 'production'
    ? 'Something went wrong while processing the request.'
    : message
  return res.status(status).json({ error: safeMessage })
}

async function getPublishedSites(db) {
  const { data, error } = await db.from('heritage_sites')
    .select('id, title, short_title, city, state, period, category, description, image_url, image_alt, source_title, source_url, tags')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

async function getProfile(req) {
  const { data, error } = await req.supabase.from('profiles')
    .select('id, full_name, age_band, state, interests, preferred_language, recently_visited_site_id, consent_at, created_at, updated_at')
    .eq('id', req.user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

async function getVisitedSiteIds(req) {
  const { data, error } = await req.supabase.from('user_visits')
    .select('site_id')
    .eq('user_id', req.user.id)
    .order('visited_at', { ascending: false })
  if (error) throw error
  return (data || []).map((visit) => visit.site_id)
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'eternal-heritage-api', configured: isServerSupabaseConfigured() })
})

app.get('/api/sites', async (req, res, next) => {
  try {
    const db = createPublicSupabase()
    if (!db) return res.status(503).json({ error: 'Supabase is not configured yet.' })
    const sites = await getPublishedSites(db)
    return res.json({ sites })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/me', requireUser, async (req, res, next) => {
  try {
    const profile = await getProfile(req)
    if (!profile) return res.status(404).json({ error: 'Your profile row was not found. Check that the Supabase schema and signup trigger have been installed.' })
    const visitedSiteIds = await getVisitedSiteIds(req)
    return res.json({ profile, visitedSiteIds })
  } catch (error) {
    return next(error)
  }
})

app.put('/api/me', requireUser, async (req, res, next) => {
  try {
    const body = req.body || {}
    const full_name = cleanName(body.full_name)
    const age_band = body.age_band
    const state = body.state
    const interests = body.interests
    const preferred_language = body.preferred_language
    const recently_visited_site_id = body.recently_visited_site_id || null

    if (full_name.length < 1) return res.status(400).json({ error: 'Name is required.' })
    if (!allowedAgeBands.has(age_band)) return res.status(400).json({ error: 'Select a valid age band.' })
    if (!statesAndTerritories.has(state)) return res.status(400).json({ error: 'Select a valid Indian state or territory.' })
    if (!Array.isArray(interests) || interests.length < 1 || interests.some((item) => !allowedInterests.has(item))) {
      return res.status(400).json({ error: 'Choose at least one valid interest.' })
    }
    if (!allowedLanguages.has(preferred_language)) return res.status(400).json({ error: 'Select a supported language preference.' })
    if (recently_visited_site_id) {
      const { data: site, error: siteError } = await req.supabase.from('heritage_sites')
        .select('id').eq('id', recently_visited_site_id).eq('is_published', true).maybeSingle()
      if (siteError) throw siteError
      if (!site) return res.status(400).json({ error: 'Choose a heritage site from the available list.' })
    }

    const { data, error } = await req.supabase.from('profiles').update({
      full_name, age_band, state, interests: [...new Set(interests)], preferred_language,
      recently_visited_site_id, updated_at: new Date().toISOString(),
    }).eq('id', req.user.id)
      .select('id, full_name, age_band, state, interests, preferred_language, recently_visited_site_id, consent_at, created_at, updated_at')
      .single()
    if (error) throw error
    return res.json({ profile: data })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/recommendations', requireUser, async (req, res, next) => {
  try {
    const [profile, visitedSiteIds] = await Promise.all([getProfile(req), getVisitedSiteIds(req)])
    if (!profile) return res.status(404).json({ error: 'Profile not found. Please check the database setup.' })
    const [sites, storyResult] = await Promise.all([
      getPublishedSites(req.supabase),
      req.supabase.from('heritage_stories')
        .select('id, site_id, title, category, read_time, summary, body, interest_tags, target_states, related_to_site_id, source_title, source_url, review_status')
        .eq('is_published', true)
        .eq('review_status', 'verified'),
    ])
    if (storyResult.error) throw storyResult.error
    const recommendations = rankStories({ stories: storyResult.data || [], sites, profile, visitedSiteIds })
    return res.json({ recommendations, profileSummary: { state: profile.state, interests: profile.interests, recently_visited_site_id: profile.recently_visited_site_id } })
  } catch (error) {
    return next(error)
  }
})

app.post('/api/visits', requireUser, async (req, res, next) => {
  try {
    const siteId = typeof req.body?.site_id === 'string' ? req.body.site_id : ''
    if (!siteId) return res.status(400).json({ error: 'A heritage site is required.' })
    const { data: site, error: siteError } = await req.supabase.from('heritage_sites')
      .select('id').eq('id', siteId).eq('is_published', true).maybeSingle()
    if (siteError) throw siteError
    if (!site) return res.status(404).json({ error: 'That heritage site is not in the published collection.' })

    const { error: visitError } = await req.supabase.from('user_visits').upsert(
      { user_id: req.user.id, site_id: siteId, visited_at: new Date().toISOString() },
      { onConflict: 'user_id,site_id' },
    )
    if (visitError) throw visitError
    const { error: profileError } = await req.supabase.from('profiles')
      .update({ recently_visited_site_id: siteId, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
    if (profileError) throw profileError
    const visitedSiteIds = await getVisitedSiteIds(req)
    return res.json({ ok: true, visitedSiteIds })
  } catch (error) {
    return next(error)
  }
})

app.delete('/api/me', requireUser, async (req, res, next) => {
  try {
    const { error } = await req.supabase.rpc('delete_my_account')
    if (error) throw error
    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

app.use((req, res) => res.status(404).json({ error: 'API route not found.' }))
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  console.error(`[API error] ${req.method} ${req.path}:`, error?.message || error)
  const status = error?.status && Number.isInteger(error.status) ? error.status : 500
  if (error?.message?.includes('origin is not allowed')) return res.status(403).json({ error: error.message })
  return publicError(res, error?.message || 'Internal server error', status)
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Eternal Heritage API listening on http://localhost:${port}`)
  console.log(`Supabase: ${isServerSupabaseConfigured() ? 'configured' : 'not configured — see server/.env.example'}`)
})
