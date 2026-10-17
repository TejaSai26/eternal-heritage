
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

export function rankStories({
  stories,
  sites,
  profile,
  visitedSiteIds = [],
}) {
  const siteById = new Map(sites.map((site) => [site.id, site]))

  const selectedInterests = new Set(
    Array.isArray(profile?.interests) ? profile.interests : [],
  )

  const visitedSites = new Set(visitedSiteIds)
  const recentSiteId = profile?.recently_visited_site_id || ''
  const state = profile?.state || ''

  const ranked = stories.map((story) => {
    const site = siteById.get(story.site_id) || null

    const tags = [
      ...new Set(
        Array.isArray(story.interest_tags)
          ? story.interest_tags
          : [],
      ),
    ]

    const matchingInterests = tags.filter((tag) =>
      selectedInterests.has(tag),
    )

    const targetStates = Array.isArray(story.target_states)
      ? story.target_states
      : []

    const stateMatches = Boolean(
      state &&
      (targetStates.includes(state) || site?.state === state),
    )

    const visitMatches = Boolean(
      recentSiteId &&
      (
        story.related_to_site_id === recentSiteId ||
        story.site_id === recentSiteId
      ),
    )

    const previouslyVisited = visitedSites.has(story.site_id)

    // Explainable scoring: each factor has one clear purpose.
    const interestScore = matchingInterests.length * 5
    const regionalScore = stateMatches ? 3 : 0
    const visitScore = visitMatches ? 4 : 0
    const repeatPenalty = previouslyVisited ? -5 : 0

    const score =
      interestScore +
      regionalScore +
      visitScore +
      repeatPenalty

    // Build the explanation from the same factors used in scoring.
    const reasons = []

    if (matchingInterests.length > 0) {
      const labels = matchingInterests.map(
        (tag) => INTEREST_LABELS[tag] || tag.replaceAll('_', ' '),
      )

      reasons.push(`Matches your interest in ${labels.join(' and ')}`)
    }

    if (stateMatches) {
      reasons.push(
        site?.state === state
          ? `A heritage discovery in ${state}`
          : `Connects with your interest in heritage from ${state}`,
      )
    }

    if (visitMatches) {
      const recentSite = siteById.get(recentSiteId)
      const recentTitle =
        recentSite?.short_title ||
        recentSite?.title ||
        'a heritage site you recently visited'

      reasons.push(`Builds on your recent ${recentTitle} visit`)
    }

   if (selectedInterests.has('anime') && tags.includes('anime')) {
  reasons.push(
    'This connection is about visual motifs and storytelling, not a claim that the historic site is connected to anime',
  )
}
    if (reasons.length === 0) {
      reasons.push('A curated discovery from the heritage collection')
    }

    return {
      ...story,
      site,
      score,
      reason: `${reasons.join(' · ')}.`,
      is_visited: previouslyVisited,
    }
  })

  return ranked
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.title).localeCompare(String(b.title)),
    )
    .slice(0, 6)
}
