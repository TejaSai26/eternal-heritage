import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { AGE_BANDS, DEMO_SITES, INDIAN_STATES, INTERESTS, LANGUAGES, localRecommendations } from './content'
import './App.css'

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  age_band: '',
  state: '',
  interests: ['temples', 'architecture'],
  preferred_language: 'English',
  recently_visited_site_id: '',
  consent: false,
}

async function apiRequest(path, { token, ...options } = {}) {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${base}/api${path}`, { ...options, headers })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`)
  return result
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M4 12h15"/><path d="m13 5 7 7-7 7"/></>,
    arrowUp: <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.4 4.6-4.6 2.4 2.4-4.6z"/></>,
    bookmark: <><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11"/><path d="m9 12 2 2 4-4"/></>,
    close: <><path d="m18 6-12 12"/><path d="m6 6 12 12"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    sparkles: <><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.sparkles}</svg>
}

function SiteImage({ site, className = '' }) {
  return (
    <div className={`site-image ${className}`}>
      <img src={site?.image_url || site?.image || ''} alt={site?.image_alt || site?.imageAlt || `${site?.title || 'Heritage site'} architectural detail`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
      <span className="image-tint" />
      <span className="image-location"><Icon name="location" size={13} /> {site?.state || 'India'}</span>
    </div>
  )
}

function AuthModal({ mode, setMode, initialProfile, sites, onClose, onAuth, onDeleteAccount, isConfigured, busy, error, setError }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...(initialProfile || {}) }))
  const [showPassword, setShowPassword] = useState(false)
  const [localBusy, setLocalBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    setForm({ ...emptyForm, ...(initialProfile || {}), email: '', password: '', consent: mode === 'profile' })
    setLocalError('')
    setConfirmation('')
  }, [mode, initialProfile])

  const isProfile = mode === 'profile'
  const isSignup = mode === 'signup'
  const activeError = error || localError
  const isBusy = busy || localBusy

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setLocalError('')
    setError('')
  }

  function toggleInterest(id) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((interest) => interest !== id)
        : [...current.interests, id],
    }))
    setLocalError('')
  }

  async function submit(event) {
    event.preventDefault()
    setLocalError('')
    setConfirmation('')
    if (!isConfigured && !isProfile) {
      setLocalError('Accounts are not connected yet. Complete the Supabase setup in the project README, then restart the app.')
      return
    }
    if (!form.full_name.trim() && (isSignup || isProfile)) return setLocalError('Please enter your name.')
    if ((isSignup || isProfile) && (!form.age_band || !form.state)) return setLocalError('Please select an age band and the state or territory where you live.')
    if ((isSignup || isProfile) && !form.interests.length) return setLocalError('Choose at least one interest so we can personalise your journey.')
    if (isSignup && !form.consent) return setLocalError('Please confirm the profile-storage consent to continue.')
    if (!isProfile && (!form.email.trim() || form.password.length < 8)) return setLocalError('Enter a valid email address and a password with at least 8 characters.')

    setLocalBusy(true)
    try {
      const result = await onAuth(mode, form)
      if (result?.confirmationRequired) {
        setConfirmation('Your account has been created. Check your email to confirm the address, then sign in. Your submitted profile details are attached to the account registration.')
      } else if (result?.error) {
        setLocalError(result.error)
      }
    } catch (err) {
      setLocalError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLocalBusy(false)
    }
  }

  return (
    <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div className="modal-art">
          <div className="modal-art-content">
            <span className="eyebrow eyebrow-light">ETERNAL HERITAGE</span>
            <h2>Let curiosity<br /><em>lead the way.</em></h2>
            <p>One profile. A thousand ways to discover the stories of India.</p>
            <div className="modal-art-stamp"><span>YOUR</span><strong>∞</strong><span>JOURNEY</span></div>
          </div>
        </div>
        <div className="modal-form-panel">
          <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close account window"><Icon name="close" /></button>
          <div className="account-switch" aria-label="Account action">
            {!isProfile && <button className={isSignup ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setError('') }}>Create account</button>}
            {!isProfile && <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => { setMode('signin'); setError('') }}>Sign in</button>}
            {isProfile && <span className="account-switch-heading">YOUR PROFILE</span>}
          </div>
          <p className="eyebrow">{isProfile ? 'YOUR DETAILS' : isSignup ? 'A MORE PERSONAL WAY TO EXPLORE' : 'WELCOME BACK'}</p>
          <h2 id="account-title">{isProfile ? 'Your profile' : isSignup ? 'Create your account' : 'Welcome back.'}</h2>
          <p className="modal-lede">{isProfile ? 'Update the details that shape your recommendations.' : isSignup ? 'A few details help us connect you with heritage that feels relevant to you.' : 'Sign in to continue your saved heritage journey.'}</p>
          <form onSubmit={submit} className="account-form">
            {(isSignup || isProfile) && <div className="field"><label htmlFor="full_name">Name</label><input id="full_name" value={form.full_name || ''} onChange={(event) => update('full_name', event.target.value)} autoComplete="name" maxLength={80} required placeholder="What should we call you?" /></div>}
            {!isProfile && <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" value={form.email || ''} onChange={(event) => update('email', event.target.value)} autoComplete="email" required placeholder="you@example.com" /></div>}
            {!isProfile && <div className="field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" type={showPassword ? 'text' : 'password'} minLength={8} value={form.password || ''} onChange={(event) => update('password', event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} required placeholder={isSignup ? 'At least 8 characters' : 'Your password'} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></div>}
            {(isSignup || isProfile) && <>
              <div className="field-row">
                <div className="field"><label htmlFor="age_band">Age band</label><select id="age_band" value={form.age_band || ''} onChange={(event) => update('age_band', event.target.value)} required><option value="">Select age band</option>{AGE_BANDS.map((band) => <option key={band}>{band}</option>)}</select></div>
                <div className="field"><label htmlFor="state">State / territory</label><select id="state" value={form.state || ''} onChange={(event) => update('state', event.target.value)} required><option value="">Choose state</option>{INDIAN_STATES.map((state) => <option key={state}>{state}</option>)}</select></div>
              </div>
              <fieldset className="field interest-fieldset">
                <legend>What are you interested in? <span>Select all that apply</span></legend>
                <div className="interest-grid">
                  {INTERESTS.map((interest) => <label key={interest.id} className={`interest-pill ${form.interests.includes(interest.id) ? 'selected' : ''}`}><input type="checkbox" checked={form.interests.includes(interest.id)} onChange={() => toggleInterest(interest.id)} /><span className="interest-symbol">{interest.symbol}</span><span>{interest.label}</span><span className="interest-check"><Icon name="check" size={13} /></span></label>)}
                </div>
              </fieldset>
              <div className="field-row">
                <div className="field"><label htmlFor="preferred_language">Preferred language</label><select id="preferred_language" value={form.preferred_language || 'English'} onChange={(event) => update('preferred_language', event.target.value)}>{LANGUAGES.map((language) => <option key={language}>{language}</option>)}</select></div>
                <div className="field"><label htmlFor="recently_visited_site_id">Recently visited <span className="optional">Optional</span></label><select id="recently_visited_site_id" value={form.recently_visited_site_id || ''} onChange={(event) => update('recently_visited_site_id', event.target.value)}><option value="">Not selected</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.title}</option>)}</select></div>
              </div>
              {isSignup && <label className="consent-check"><input type="checkbox" checked={Boolean(form.consent)} onChange={(event) => update('consent', event.target.checked)} /><span>I agree to store these profile details to provide personalised recommendations. I can update or delete my profile later.</span></label>}
            </>}
            {activeError && <p className="form-error" role="alert">{activeError}</p>}
            {confirmation && <p className="form-success" role="status">{confirmation}</p>}
            {!isConfigured && !isProfile && <p className="setup-nudge"><Icon name="shield" size={16} /> Database connection setup is still required before registration can save real accounts.</p>}
            <button className="button button-primary submit-account" type="submit" disabled={isBusy}>{isBusy ? 'Please wait…' : isProfile ? 'Save profile' : isSignup ? 'Create my account' : 'Sign in'} <Icon name="arrow" size={17} /></button>
            {isProfile && <button className="button button-quiet full-width" type="button" onClick={onClose}>Cancel</button>}
            {isProfile && <button className="delete-account-button" type="button" onClick={onDeleteAccount}>Delete my account and saved data</button>}
            {!isProfile && <p className="form-footnote"><Icon name="shield" size={15} /> We use your chosen interests and broad age band—not your exact date of birth—to tailor recommendations.</p>}
          </form>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [sites, setSites] = useState(DEMO_SITES)
  const [recommendations, setRecommendations] = useState(() => localRecommendations({ interests: ['temples', 'architecture'] }))
  const [visitedIds, setVisitedIds] = useState([])
  const [authMode, setAuthMode] = useState('signup')
  const [authOpen, setAuthOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loadingAccount, setLoadingAccount] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [storyModal, setStoryModal] = useState(null)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const loadPublicSites = useCallback(async () => {
    try {
      const result = await apiRequest('/sites')
      if (Array.isArray(result.sites) && result.sites.length) setSites(result.sites)
    } catch {
      // Keep the source-labelled preview catalog visible until the database is connected.
    }
  }, [])

  const loadAccount = useCallback(async (activeSession) => {
    if (!activeSession?.access_token) return
    setLoadingAccount(true)
    try {
      const [me, recs] = await Promise.all([
        apiRequest('/me', { token: activeSession.access_token }),
        apiRequest('/recommendations', { token: activeSession.access_token }),
      ])
      setProfile(me.profile)
      setVisitedIds(me.visitedSiteIds || [])
      if (Array.isArray(recs.recommendations)) setRecommendations(recs.recommendations)
      setNotice(`Welcome back${me.profile?.full_name ? `, ${me.profile.full_name}` : ''}. Your recommendations are up to date.`)
    } catch (err) {
      setNotice('You are signed in, but the profile API could not load. Check that schema.sql has been run and the server is configured.')
      setError(err?.message || 'Could not load your profile.')
    } finally {
      setLoadingAccount(false)
    }
  }, [])

  useEffect(() => {
    loadPublicSites()
    if (!supabase) return undefined
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      if (data.session) loadAccount(data.session)
    }).catch(() => {})
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!alive) return
      setSession(nextSession)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setVisitedIds([])
        setRecommendations(localRecommendations({ interests: ['temples', 'architecture'] }))
      } else if (nextSession && ['SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
        window.setTimeout(() => { if (alive) loadAccount(nextSession) }, 0)
      }
    })
    return () => {
      alive = false
      listener.subscription.unsubscribe()
    }
  }, [loadPublicSites, loadAccount])

  const visibleRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations
    return recommendations.filter((item) => {
      const tags = item.interestTags || item.interest_tags || []
      return tags.includes(activeFilter)
    })
  }, [recommendations, activeFilter])

  function openAuth(mode = 'signup') {
    setAuthMode(mode)
    setError('')
    setAuthOpen(true)
  }

  async function handleAuth(mode, form) {
    if (mode === 'profile') {
      if (!session?.access_token) return { error: 'Please sign in again to update your profile.' }
      setBusy(true)
      try {
        const result = await apiRequest('/me', {
          method: 'PUT', token: session.access_token,
          body: JSON.stringify({
            full_name: form.full_name.trim(), age_band: form.age_band, state: form.state,
            interests: form.interests, preferred_language: form.preferred_language,
            recently_visited_site_id: form.recently_visited_site_id || null,
          }),
        })
        setProfile(result.profile)
        const refreshed = await apiRequest('/recommendations', { token: session.access_token })
        setRecommendations(refreshed.recommendations || [])
        setAuthOpen(false)
        setNotice('Your profile was saved to the database and your recommendations have been refreshed.')
      } catch (err) {
        return { error: err.message }
      } finally {
        setBusy(false)
      }
      return {}
    }

    if (!supabase) return { error: 'Supabase is not configured. Follow the “Connect Supabase” steps in README.md first.' }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.full_name.trim(),
              age_band: form.age_band,
              state: form.state,
              interests: form.interests,
              preferred_language: form.preferred_language,
              recently_visited_site_id: form.recently_visited_site_id || null,
            },
          },
        })
        if (signUpError) return { error: signUpError.message }
        if (!data.session) return { confirmationRequired: true }
        setSession(data.session)
        await loadAccount(data.session)
        setAuthOpen(false)
        setNotice('Your account has been created and your profile saved. Your recommendations are ready.')
        return {}
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
      if (signInError) return { error: signInError.message }
      setSession(data.session)
      await loadAccount(data.session)
      setAuthOpen(false)
      return {}
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setNotice(signOutError.message)
    else setNotice('You have signed out. Your saved profile remains in your account.')
  }

  async function markVisited(siteId) {
    if (!session?.access_token) {
      openAuth('signup')
      return
    }
    try {
      const result = await apiRequest('/visits', { method: 'POST', token: session.access_token, body: JSON.stringify({ site_id: siteId }) })
      setVisitedIds(result.visitedSiteIds || [...visitedIds, siteId])
      setProfile((current) => current ? { ...current, recently_visited_site_id: siteId } : current)
      const recs = await apiRequest('/recommendations', { token: session.access_token })
      setRecommendations(recs.recommendations || [])
      setNotice('Visit saved. We’ll use it to avoid repeating the same suggestions and find related stories.')
    } catch (err) {
      setNotice(err.message || 'Could not save this visit.')
    }
  }

  async function deleteAccount() {
    if (!session?.access_token || !supabase) return
    const shouldDelete = window.confirm('Delete your Eternal Heritage account and its saved profile/visit data? This cannot be undone.')
    if (!shouldDelete) return
    try {
      await apiRequest('/me', { method: 'DELETE', token: session.access_token })
      await supabase.auth.signOut({ scope: 'local' })
      setProfile(null)
      setAuthOpen(false)
      setNotice('Your account and profile data were deleted.')
    } catch (err) {
      setNotice(err.message || 'Account deletion could not be completed.')
    }
  }

  const displayName = profile?.full_name?.split(/\s+/)[0] || ''
  const siteMap = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {!isSupabaseConfigured && <div className="preview-banner"><span className="preview-dot" /> PREVIEW MODE <span>Connect Supabase to turn on real accounts and database saving.</span><button type="button" onClick={() => setPrivacyOpen(true)}>How to connect ↗</button></div>}

      <header className="site-header">
        <a href="#home" className="brand" aria-label="Eternal Heritage home">
          <span className="brand-emblem">E<span>✳</span></span>
          <span className="brand-words"><strong>ETERNAL</strong><small>H E R I T A G E</small></span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#discover">Discover</a><a href="#how-it-works">Your journey</a><a href="#our-promise">Our promise</a>
        </nav>
        <div className="header-actions">
          {session && profile ? <>
            <button className="profile-shortcut" type="button" onClick={() => openAuth('profile')}><span className="mini-avatar">{profile.full_name?.[0]?.toUpperCase() || 'E'}</span><span className="profile-shortcut-text">{displayName || 'My profile'}</span></button>
            <button className="signout-button" type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><Icon name="logout" size={17} /></button>
          </> : <>
            <button className="signin-link" type="button" onClick={() => openAuth('signin')}>Sign in</button>
            <button className="button button-primary header-join" type="button" onClick={() => openAuth('signup')}>Join the journey <Icon name="arrowUp" size={15} /></button>
          </>}
        </div>
      </header>

      <main id="main-content">
        <section className="hero-section" id="home" aria-labelledby="hero-title">
          <div className="hero-text">
            <div className="eyebrow"><span className="eyebrow-rule" /> A LIVING ARCHIVE OF INDIA</div>
            <h1 id="hero-title">Some places stay<br />with you <em>forever.</em></h1>
            <p className="hero-description">Go beyond the photograph. Discover the flavours, beliefs, craft and quiet details that make India's heritage unforgettable — shaped around what makes you curious.</p>
            <div className="hero-buttons"><button className="button button-primary hero-cta" type="button" onClick={() => openAuth('signup')}>Create your heritage profile <Icon name="arrow" size={17} /></button><a className="button button-secondary" href="#discover">Explore the collection <span>↓</span></a></div>
            <div className="hero-meta"><span><Icon name="shield" size={16} /> Thoughtful by design</span><span className="meta-divider" /><span>One experience, made for everyone</span></div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1759134334340-9398d9814bcb?auto=format&fit=crop&w=1800&q=90" alt="An intricately carved South Indian temple tower rising above the surrounding architecture." fetchPriority="high" onError={(event) => { event.currentTarget.style.display = 'none' }} />
            <div className="hero-image-fallback" />
            <div className="hero-image-gradient" />
            <div className="hero-image-label"><span>01 / 08</span><span>THE SACRED SOUTH</span></div>
            <div className="hero-photo-caption"><span className="caption-kicker">A PLACE TO BEGIN</span><strong>Find the story<br />behind the stone.</strong></div>
            <div className="hero-roundel"><span>EXPLORE</span><strong>∞</strong><span>DISCOVER</span></div>
          </div>
          <div className="hero-vertical-note" aria-hidden="true">CULTURE · CRAFT · CONTINUITY</div>
          <div className="hero-bottom-line" />
        </section>

        <section className="welcome-strip" aria-label="Personalised journey">
          <div className="welcome-icon"><Icon name="sparkles" size={21} /></div>
          <div className="welcome-copy"><span className="eyebrow">A MORE PERSONAL HERITAGE GUIDE</span><strong>{session && profile ? `Welcome back, ${profile.full_name}.` : 'Your curiosity is the starting point.'}</strong><p>{session && profile ? `Exploring ${profile.interests.map((id) => INTERESTS.find((item) => item.id === id)?.label).filter(Boolean).slice(0, 3).join(' · ').toLowerCase() || 'India’s heritage'}${profile.state ? ` · ${profile.state}` : ''}` : 'Tell us what you love. We’ll connect your interests to remarkable places and stories.'}</p></div>
          <div className="welcome-action">{session && profile ? <button className="text-link" type="button" onClick={() => openAuth('profile')}>Edit my profile <Icon name="arrow" size={16} /></button> : <button className="text-link" type="button" onClick={() => openAuth('signup')}>Personalise my journey <Icon name="arrow" size={16} /></button>}</div>
        </section>

        {notice && <div className="status-message" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}
        {error && !authOpen && <div className="status-message is-error" role="alert">{error}</div>}

        <section className="discover-section section-frame" id="discover">
          <div className="section-overline"><span className="eyebrow">CURATED WITH CARE</span><span className="section-index">THE COLLECTION / 001—008</span></div>
          <div className="discover-heading-row"><div><h2>Start with a place.<br /><em>Leave with a story.</em></h2><p className="section-intro">A first collection of living temples, sculptural wonders and historic places — paired with source-linked stories selected for your interests.</p></div><div className="recommendation-label"><span className="recommendation-spark"><Icon name="sparkles" size={17} /></span><span><strong>{session && profile ? 'YOUR RECOMMENDATIONS' : 'A CURATED PREVIEW'}</strong><small>{session && profile ? 'Ranked for your profile' : 'Create a profile for personal matches'}</small></span></div></div>

          <div className="filter-bar" aria-label="Filter recommended stories">
            <span className="filter-label">FOLLOW YOUR CURIOSITY</span>
            {[{ id: 'all', label: 'All stories' }, { id: 'cooking', label: 'Food & traditions' }, { id: 'anime', label: 'Visual storytelling' }, { id: 'architecture', label: 'Architecture' }, { id: 'history', label: 'History' }].map((filter) => <button key={filter.id} className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`} type="button" onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
          </div>

          {loadingAccount && <div className="loading-inline"><span className="loader" /> Refreshing your recommendations…</div>}
          <div className="story-grid">
            {visibleRecommendations.map((story, index) => {
              const site = story.site || siteMap.get(story.site_id || story.siteId) || DEMO_SITES.find((candidate) => candidate.id === (story.siteId || story.site_id))
              const storyId = story.id
              const tags = story.interestTags || story.interest_tags || []
              const sourceTitle = story.sourceTitle || story.source_title || 'Source material'
              const sourceUrl = story.sourceUrl || story.source_url
              const reason = story.reason || story.match_reason || 'A curated place to continue your heritage journey.'
              const isVisited = visitedIds.includes(site?.id)
              return <article className={`story-card ${index === 0 ? 'story-card-lead' : ''}`} key={storyId}>
                <button className="story-image-button" type="button" onClick={() => setStoryModal({ ...story, site, reason, sourceTitle, sourceUrl })} aria-label={`Read more about ${story.title}`}><SiteImage site={site} className="story-photo" /><span className="story-number">{String(index + 1).padStart(2, '0')}</span><span className="story-open"><Icon name="arrowUp" size={19} /></span></button>
                <div className="story-copy"><div className="story-meta"><span>{story.category || story.story_type || site?.category || 'Heritage story'}</span><span>{story.readTime || story.read_time || '3 min read'}</span></div><h3><button className="story-title-button" type="button" onClick={() => setStoryModal({ ...story, site, reason, sourceTitle, sourceUrl })}>{story.title}</button></h3><p className="story-summary">{story.summary || story.excerpt}</p><div className="match-reason"><Icon name="sparkles" size={15} /><span>{reason}</span></div><div className="story-footer"><button className="read-story" type="button" onClick={() => setStoryModal({ ...story, site, reason, sourceTitle, sourceUrl })}>Read the story <Icon name="arrow" size={15} /></button><button className={`visited-button ${isVisited ? 'marked' : ''}`} type="button" onClick={() => markVisited(site?.id)} aria-label={isVisited ? `${site?.title} marked as visited` : `Mark ${site?.title} as visited`}>{isVisited ? <><Icon name="check" size={14} /> Visited</> : <><Icon name="bookmark" size={14} /> Been here?</>}</button></div></div>
              </article>
            })}
          </div>
          {!visibleRecommendations.length && <div className="empty-filter"><p>No stories in this category match the current profile yet.</p><button className="text-link" type="button" onClick={() => setActiveFilter('all')}>Show all stories <Icon name="arrow" size={15} /></button></div>}
          <p className="content-integrity"><Icon name="shield" size={16} /> Heritage facts are paired with source links. Recommendations explain why a story was selected; they are not AI-generated in Release 1.</p>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-frame how-grid"><div className="how-heading"><span className="eyebrow">DESIGNED AROUND YOU</span><h2>Not another list<br />of monuments. <em>A way in.</em></h2><p>Your interests can lead to surprising connections — from what goes into a famous prasadam to a remarkable temple closer to home.</p><button className="button button-light" type="button" onClick={() => openAuth(session ? 'profile' : 'signup')}>{session ? 'Update my preferences' : 'Build my profile'} <Icon name="arrow" size={16} /></button></div><div className="steps-list"><div className="step"><span className="step-number">01</span><div><h3>Tell us what you love</h3><p>Choose interests, a broad age band, your state and a language preference. No exact birth date or live location needed.</p></div><span className="step-symbol">✳</span></div><div className="step"><span className="step-number">02</span><div><h3>Find a personal connection</h3><p>Interests and a recent visit help rank relevant food traditions, sculpture, storytelling and regional discoveries.</p></div><span className="step-symbol">↗</span></div><div className="step"><span className="step-number">03</span><div><h3>Explore at your own pace</h3><p>Read accessible summaries, follow source links and mark places you have visited to improve future recommendations.</p></div><span className="step-symbol">∞</span></div></div></div>
        </section>

        <section className="promise-section section-frame" id="our-promise"><div className="promise-mark">E<span>.</span></div><div className="promise-copy"><span className="eyebrow">OUR PROMISE</span><h2>Heritage belongs<br /><em>to everyone.</em></h2><p>One shared platform. Designed for screen readers, keyboard navigation and clear language from the start. We want every visitor to feel included in the same story.</p></div><div className="promise-points"><div><Icon name="shield" size={20} /><span><strong>Respectful by design</strong><small>Only the profile details needed for personalisation.</small></span></div><div><Icon name="book" size={20} /><span><strong>Grounded in sources</strong><small>Heritage claims link back to a cited source.</small></span></div><div><Icon name="compass" size={20} /><span><strong>Curiosity, not tracking</strong><small>No precise location tracking or third-party ad profile.</small></span></div></div></section>
      </main>

      <footer className="site-footer"><a href="#home" className="footer-wordmark">ETERNAL <span>HERITAGE</span></a><span>Stories that connect us to where we come from.</span><button type="button" className="footer-privacy" onClick={() => setPrivacyOpen(true)}>Privacy & data <Icon name="arrowUp" size={14} /></button><span className="copyright">© {new Date().getFullYear()} Eternal Heritage · Release 1</span></footer>

      {authOpen && <AuthModal key={authMode} mode={authMode} setMode={(mode) => { setAuthMode(mode); setError('') }} initialProfile={authMode === 'profile' ? profile : null} sites={sites} onClose={() => { setAuthOpen(false); setError('') }} onAuth={handleAuth} onDeleteAccount={deleteAccount} isConfigured={isSupabaseConfigured} busy={busy} error={error} setError={setError} />}

      {storyModal && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setStoryModal(null) }}><section className="story-modal" role="dialog" aria-modal="true" aria-labelledby="story-modal-title"><button className="icon-button story-modal-close" onClick={() => setStoryModal(null)} type="button" aria-label="Close story"><Icon name="close" /></button><SiteImage site={storyModal.site} className="story-modal-image" /><div className="story-modal-body"><span className="eyebrow">{storyModal.category || 'HERITAGE STORY'} · {storyModal.site?.city || storyModal.site?.state || 'INDIA'}</span><h2 id="story-modal-title">{storyModal.title}</h2><p className="story-modal-summary">{storyModal.summary || storyModal.excerpt}</p><p className="story-modal-text">{storyModal.body || storyModal.content}</p><div className="source-panel"><Icon name="book" size={20} /><div><strong>Read the source</strong><span>{storyModal.sourceTitle || storyModal.source_title}</span><a href={storyModal.sourceUrl || storyModal.source_url} target="_blank" rel="noreferrer">Open original source <Icon name="arrowUp" size={14} /></a></div></div><button className="button button-primary" type="button" onClick={() => { markVisited(storyModal.site?.id); setStoryModal(null) }}>Mark this place as visited <Icon name="check" size={16} /></button></div></section></div>}

      {privacyOpen && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setPrivacyOpen(false) }}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><button className="icon-button privacy-close" onClick={() => setPrivacyOpen(false)} type="button" aria-label="Close privacy information"><Icon name="close" /></button><span className="eyebrow">DATA & TRUST</span><h2 id="privacy-title">Personalisation, with boundaries.</h2><p>Release 1 stores your name, email account identifier, broad age band, state or territory, chosen interests, language preference and optional recent/visited sites. We do not ask for an exact date of birth or precise GPS location.</p><p>Registration requires a connected Supabase project. The profile table is protected with row-level security so a signed-in user can read or update only their own profile. Public heritage content is separate from private profile data.</p><p>You can edit the profile, mark visits and request account deletion in the connected release. Do not put Supabase secret/service-role keys in frontend environment variables.</p><div className="privacy-modal-actions"><button className="button button-primary" onClick={() => { setPrivacyOpen(false); openAuth('signup') }} type="button">Create an account <Icon name="arrow" size={16} /></button><button className="button button-secondary" onClick={() => setPrivacyOpen(false)} type="button">Close</button></div></section></div>}
    </div>
  )
}

export default App
