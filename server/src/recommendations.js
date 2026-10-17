const INTEREST_LABELS = {
  cooking: 'food and cooking',
  anime: 'anime and visual storytelling',
  architecture: 'architecture',
  sculpture: 'sculpture and crafts',
  history: 'history and legends',
  mythology: 'mythology',
  dance_music: 'dance and music',
  crafts: 'traditional crafts',
  photography: 'photography',
  nature: 'nature and travel',
  festivals: 'festivals and rituals',
  temples: 'temples and pilgrimage',
  food: 'food traditions',
  traditions: 'living traditions',
  visual_storytelling: 'visual storytelling',
}

export function rankStories({ stories, sites, profile, visitedSiteIds = [] }) {
  const siteById = new Map(sites.map((site) => [site.id, site]))
  const selectedInterests = Array.isArray(profile?.interests) ? profile.interests : []
  const recentSiteId = profile?.recently_visited_site_id || ''
  const state = profile?.state || ''

  const ranked = stories.map((story) => {
    const site = siteById.get(story.site_id) || null
    const tags = Array.isArray(story.interest_tags) ? story.interest_tags : []
    const interestMatches = tags.filter((tag) => selectedInterests.includes(tag))
    const targetStates = Array.isArray(story.target_states) ? story.target_states : []
    const stateMatches = Boolean(state && (targetStates.includes(state) || site?.state === state))
    const visitMatches = Boolean(recentSiteId && (story.related_to_site_id === recentSiteId || story.site_id === recentSiteId))
    const previouslyVisited = visitedSiteIds.includes(story.site_id)
    let score = interestMatches.length * 4
    if (stateMatches) score += 8
    if (visitMatches) score += 5
    if (selectedInterests.includes('cooking') && story.site_id === 'tirumala' && tags.includes('food')) score += 5
    if (selectedInterests.includes('anime') && tags.includes('anime')) score += 3
    if (previouslyVisited && story.site_id !== recentSiteId) score -= 2

    const reasons = []
    if (visitMatches) {
      const recentSite = siteById.get(recentSiteId)
      reasons.push(`Builds on your recent ${recentSite?.short_title || recentSite?.title || 'heritage-site'} visit`)
    }
    if (stateMatches && site?.state === state && story.site_id !== recentSiteId) {
      reasons.push(`A heritage discovery in ${state}`)
    }
    if (interestMatches.length) {
      const interestLabel = INTEREST_LABELS[interestMatches[0]] || interestMatches[0].replaceAll('_', ' ')
      reasons.push(`matches your interest in ${interestLabel}`)
    }
    if (!reasons.length) reasons.push('a curated starting point from the collection')
    if (selectedInterests.includes('anime') && tags.includes('anime')) {
      reasons.push('through visual motifs and storytelling—not a claim that the historic site is connected to anime')
    }
    return {
      ...story,
      site,
      score,
      reason: `${reasons.join(' · ')}.`,
      is_visited: previouslyVisited,
    }
  })

  return ranked.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title))).slice(0, 6)
}
