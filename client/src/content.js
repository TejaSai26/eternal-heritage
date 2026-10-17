// Local preview content only. The connected app reads published content from Supabase.
// Every fact-focused recommendation carries a source link; this file keeps the UI useful before setup.
export const INTERESTS = [
  { id: 'cooking', label: 'Food & cooking', hint: 'Prasadam, ingredients, food traditions', symbol: '✳' },
  { id: 'anime', label: 'Anime & visual stories', hint: 'Characters, symbolism, epic storytelling', symbol: '◈' },
  { id: 'architecture', label: 'Architecture', hint: 'Structures, geometry, engineering', symbol: '⌂' },
  { id: 'sculpture', label: 'Sculpture & crafts', hint: 'Carving, materials, artisans', symbol: '❋' },
  { id: 'history', label: 'History & legends', hint: 'People, dynasties, stories', symbol: '◷' },
  { id: 'mythology', label: 'Mythology', hint: 'Deities, epics, iconography', symbol: '✧' },
  { id: 'dance_music', label: 'Dance & music', hint: 'Performance, rhythm, ritual', symbol: '♫' },
  { id: 'crafts', label: 'Traditional crafts', hint: 'Textiles, metalwork, stonework', symbol: '✥' },
  { id: 'photography', label: 'Photography', hint: 'Details, light, composition', symbol: '▧' },
  { id: 'nature', label: 'Nature & travel', hint: 'Landscapes, routes, places', symbol: '♧' },
  { id: 'festivals', label: 'Festivals & rituals', hint: 'Living traditions and calendars', symbol: '✺' },
  { id: 'temples', label: 'Temples & pilgrimage', hint: 'Sacred places and traditions', symbol: '⌘' },
]

export const AGE_BANDS = ['Under 18', '18–24', '25–34', '35–44', '45–59', '60+']

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
]

export const LANGUAGES = ['English', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'हिन्दी (Hindi)']

export const DEMO_SITES = [
  {
    id: 'tirumala', title: 'Sri Venkateswara Temple', shortTitle: 'Tirumala', city: 'Tirumala, Tirupati', state: 'Andhra Pradesh', period: 'Living heritage', category: 'Pilgrimage & traditions',
    description: 'A major pilgrimage destination whose stories include sacred offerings, a temple kitchen and traditions that continue today.',
    image: 'https://images.unsplash.com/photo-1759134334340-9398d9814bcb?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'A richly sculpted South Indian temple tower.',
    sourceTitle: 'Tirumala Tirupati Devasthanams — Temple History', sourceUrl: 'https://www.tirumala.org/TTDTempleHistory.aspx',
    tags: ['temples', 'history', 'traditions', 'cooking', 'food', 'mythology'],
  },
  {
    id: 'yadadri', title: 'Yadagirigutta Temple', shortTitle: 'Yadadri', city: 'Yadadri Bhuvanagiri', state: 'Telangana', period: 'Living heritage', category: 'Hill shrine',
    description: 'A Telangana hill shrine associated with Sri Lakshmi Narasimha Swamy and a long-standing pilgrimage tradition.',
    image: 'https://images.unsplash.com/photo-1762415796791-039fe54e36b1?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Intricate carvings on the exterior of a historic temple.',
    sourceTitle: 'Yadadri Bhuvanagiri District — Yadagirigutta', sourceUrl: 'https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/',
    tags: ['temples', 'history', 'traditions', 'mythology', 'nature'],
  },
  {
    id: 'lepakshi', title: 'Veerabhadra Temple', shortTitle: 'Lepakshi', city: 'Lepakshi', state: 'Andhra Pradesh', period: '16th century', category: 'Architecture & murals',
    description: 'A historic temple celebrated for its sculptural detail, painted ceilings and distinctive architectural features.',
    image: 'https://images.unsplash.com/photo-1768921350453-043bcacc1ed9?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Carved stone details of a historic Indian temple.',
    sourceTitle: 'Incredible India — Explore the Lepakshi Temple', sourceUrl: 'https://www.incredibleindia.gov.in/en/andhra-pradesh/anantapur/lepakshi-temple',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'photography'],
  },
  {
    id: 'brihadeeswarar', title: 'Brihadisvara Temple', shortTitle: 'Brihadisvara', city: 'Thanjavur', state: 'Tamil Nadu', period: '11th century', category: 'Chola architecture',
    description: 'A great Chola temple that demonstrates the achievements of South Indian architecture, sculpture and painting.',
    image: 'https://images.unsplash.com/photo-1759134334340-9398d9814bcb?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'A large traditional South Indian temple tower with detailed ornament.',
    sourceTitle: 'UNESCO — Great Living Chola Temples', sourceUrl: 'https://whc.unesco.org/en/list/250/',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'dance_music', 'photography'],
  },
  {
    id: 'hampi', title: 'Group of Monuments at Hampi', shortTitle: 'Hampi', city: 'Hampi, Vijayanagara', state: 'Karnataka', period: '14th–16th century', category: 'Sacred & royal city',
    description: 'Explore the surviving temples, halls, gateways and urban remains of the Vijayanagara capital.',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Historic Indian stone architecture surrounded by a dramatic landscape.',
    sourceTitle: 'UNESCO — Group of Monuments at Hampi', sourceUrl: 'https://whc.unesco.org/en/list/241/',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'mythology', 'nature', 'photography'],
  },
  {
    id: 'konark', title: 'Sun Temple, Konârak', shortTitle: 'Konark', city: 'Konark', state: 'Odisha', period: '13th century', category: 'Sculptural storytelling',
    description: 'A monumental representation of Surya’s chariot, with carved wheels and reliefs that reward close observation.',
    image: 'https://images.unsplash.com/photo-1768921350453-043bcacc1ed9?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Intricately carved stonework at an Indian heritage monument.',
    sourceTitle: 'UNESCO — Sun Temple, Konârak', sourceUrl: 'https://whc.unesco.org/en/list/246/',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'mythology', 'photography', 'dance_music'],
  },
  {
    id: 'khajuraho', title: 'Khajuraho Group of Monuments', shortTitle: 'Khajuraho', city: 'Khajuraho', state: 'Madhya Pradesh', period: '10th–11th century', category: 'Temple sculpture',
    description: 'A group of temples known for their artistic programme, sculptural narratives and architectural coherence.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Ornate Indian temple architecture and stone sculpture.',
    sourceTitle: 'UNESCO — Khajuraho Group of Monuments', sourceUrl: 'https://whc.unesco.org/en/list/240/',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'mythology', 'dance_music'],
  },
  {
    id: 'modhera', title: 'Sun Temple, Modhera', shortTitle: 'Modhera', city: 'Modhera, Mehsana', state: 'Gujarat', period: '11th century', category: 'Solar architecture',
    description: 'An evocative sun temple complex where the architectural layout and sculpted surfaces invite careful exploration.',
    image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Historic stone architecture in India.',
    sourceTitle: 'UNESCO — Sun Temple, Modhera and its adjoining monuments', sourceUrl: 'https://whc.unesco.org/en/tentativelists/6627',
    tags: ['temples', 'architecture', 'sculpture', 'history', 'mythology', 'photography'],
  },
]

export const DEMO_STORIES = [
  {
    id: 'tirumala-laddu', siteId: 'tirumala', title: 'The story behind Tirumala’s famous laddu', category: 'Food & living traditions', readTime: '3 min read',
    summary: 'Follow the food tradition through its ingredients and the temple kitchen that prepares sacred offerings.',
    body: 'In a 3 June 2026 update, Tirumala Tirupati Devasthanams listed the large-scale raw materials used for Srivari Laddu: sugar, gram flour, ghee, cashews, raisins, cardamom and sugar candy. The temple also describes prescribed ingredient proportions as “Dittam” standards. These are institutional production figures, not a complete home recipe; use the official source for context and any newer updates.',
    interestTags: ['cooking', 'food', 'traditions', 'history'], targetStates: ['Andhra Pradesh'], relatedToSiteId: 'tirumala',
    sourceTitle: 'TTD — Srivari Laddu production and raw materials', sourceUrl: 'https://news.tirumala.org/sacred-laddu-sales-hits-all-time-high-in-may-_-%E0%B0%AE%E0%B1%87-%E0%B0%A8%E0%B1%86%E0%B0%B2%E0%B0%B2%E0%B1%8B-%E0%B0%B0%E0%B0%BF%E0%B0%95%E0%B0%BE%E0%B0%B0%E0%B1%8D%E0%B0%A1%E0%B1%81/',
  },
  {
    id: 'yadadri-connection', siteId: 'yadadri', title: 'A hill shrine in your state', category: 'A place close to home', readTime: '2 min read',
    summary: 'If you live in Telangana and visited Tirumala, explore Yadagirigutta as another major pilgrimage destination in your state.',
    body: 'Yadagirigutta is associated with Sri Lakshmi Narasimha Swamy and is described by the Telangana district administration as a well-known pilgrimage destination. The deities and traditions differ from Tirumala, so this is a suggested comparison between pilgrimage places—not a claim that the temples are identical.',
    interestTags: ['temples', 'mythology', 'traditions', 'history', 'nature'], targetStates: ['Telangana'], relatedToSiteId: 'tirumala',
    sourceTitle: 'Yadadri Bhuvanagiri District — Yadagirigutta', sourceUrl: 'https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/',
  },
  {
    id: 'lepakshi-connection', siteId: 'lepakshi', title: 'A sculptural journey in Andhra Pradesh', category: 'Regional discovery', readTime: '2 min read',
    summary: 'If you live in Andhra Pradesh, continue exploring temple art through Lepakshi’s historic architecture and carvings.',
    body: 'Lepakshi is a regional heritage lead for visitors interested in temple architecture and sculpture. The discovery card points you to the Andhra Pradesh tourism portal; the project team should validate and expand the specific details against authoritative sources before a public launch.',
    interestTags: ['temples', 'architecture', 'sculpture', 'photography', 'history'], targetStates: ['Andhra Pradesh'], relatedToSiteId: 'tirumala',
    sourceTitle: 'Incredible India — Explore the Lepakshi Temple', sourceUrl: 'https://www.incredibleindia.gov.in/en/andhra-pradesh/anantapur/lepakshi-temple',
  },
  {
    id: 'tirumala-kitchen', siteId: 'tirumala', title: 'Inside the temple kitchen tradition', category: 'Ritual & practice', readTime: '3 min read',
    summary: 'Learn what the official temple history says about the Potu kitchen and the preparation of offerings.',
    body: 'TTD’s temple history page describes the Padi Potu as the temple kitchen where sweets and savouries—including laddu, vada, appam and other offerings—are prepared. This connects culinary curiosity to a specific place, practice and source rather than an unsourced recipe.',
    interestTags: ['cooking', 'food', 'traditions', 'history', 'temples'], targetStates: [], relatedToSiteId: 'tirumala',
    sourceTitle: 'TTD — Temple History', sourceUrl: 'https://www.tirumala.org/TTDTempleHistory.aspx',
  },
  {
    id: 'visual-storytelling', siteId: 'konark', title: 'Myth, motifs and visual storytelling', category: 'For visual-story lovers', readTime: '3 min read',
    summary: 'Use the lens of character design and world-building to look more closely at temple sculpture—without confusing modern anime with historical heritage.',
    body: 'If anime draws you in through character design, symbolic details and visual storytelling, temple sculpture offers a different historical art form to examine: poses, repeated motifs, figures and narrative reliefs. The Konark Sun Temple is described by UNESCO as a monumental representation of Surya’s chariot, with carved wheels and sculptural embellishment. This is a way to look closely at visual storytelling, not a claim of a historical connection to anime.',
    interestTags: ['anime', 'mythology', 'sculpture', 'photography', 'history', 'architecture'], targetStates: [], relatedToSiteId: null,
    sourceTitle: 'UNESCO — Sun Temple, Konârak', sourceUrl: 'https://whc.unesco.org/en/list/246/',
  },
  {
    id: 'chola-engineering', siteId: 'brihadeeswarar', title: 'How Chola architecture makes scale feel human', category: 'Architecture & engineering', readTime: '4 min read',
    summary: 'Look at the relationship between tower, courtyard, sculpture and movement in a landmark Chola temple.',
    body: 'UNESCO describes the Great Living Chola Temples as outstanding testimony to Chola architecture and art. The Thanjavur Brihadisvara Temple’s towering vimana, sculpted surfaces and extensive temple complex offer a useful case study in how structure, ornament and ritual space work together.',
    interestTags: ['architecture', 'sculpture', 'history', 'photography', 'temples', 'dance_music'], targetStates: ['Tamil Nadu'], relatedToSiteId: null,
    sourceTitle: 'UNESCO — Great Living Chola Temples', sourceUrl: 'https://whc.unesco.org/en/list/250/',
  },
  {
    id: 'hampi-worldbuilding', siteId: 'hampi', title: 'A city built from many stories', category: 'History & world-building', readTime: '4 min read',
    summary: 'Explore temples, public spaces and royal structures as pieces of one historic city.',
    body: 'UNESCO describes Hampi as the remains of the Vijayanagara capital, encompassing temples, shrines, pillared halls, gateways, royal complexes, water structures and more. Looking at these pieces together reveals a historic city rather than a collection of isolated monuments.',
    interestTags: ['history', 'architecture', 'anime', 'mythology', 'photography', 'nature', 'sculpture'], targetStates: ['Karnataka'], relatedToSiteId: null,
    sourceTitle: 'UNESCO — Group of Monuments at Hampi', sourceUrl: 'https://whc.unesco.org/en/list/241/',
  },
  {
    id: 'konark-chariot', siteId: 'konark', title: 'Read the Sun Temple as a stone chariot', category: 'Symbols & sculpture', readTime: '3 min read',
    summary: 'Follow the chariot idea through the temple’s carved wheels and sculptural programme.',
    body: 'UNESCO describes Konark as a monumental representation of the sun god Surya’s chariot and notes its 24 carved wheels and sculptural embellishment. The architecture provides a rich entry point for exploring symbolism and craftsmanship.',
    interestTags: ['temples', 'architecture', 'sculpture', 'mythology', 'history', 'photography', 'anime'], targetStates: ['Odisha'], relatedToSiteId: null,
    sourceTitle: 'UNESCO — Sun Temple, Konârak', sourceUrl: 'https://whc.unesco.org/en/list/246/',
  },
]

export function localRecommendations(profile, visitedSiteIds = []) {
  const interests = profile?.interests || []
  const state = profile?.state || ''
  const recent = profile?.recently_visited_site_id || ''
  const scores = DEMO_STORIES.map((story) => {
    const matching = story.interestTags.filter((tag) => interests.includes(tag))
    const site = DEMO_SITES.find((item) => item.id === story.siteId)
    let score = matching.length * 4
    if (story.targetStates.includes(state) || site?.state === state) score += 7
    if (story.relatedToSiteId && story.relatedToSiteId === recent) score += 5
    if (visitedSiteIds.includes(story.siteId) && story.siteId !== recent) score -= 3
    if (interests.includes('cooking') && story.siteId === 'tirumala' && story.interestTags.includes('food')) score += 5
    if (interests.includes('anime') && story.interestTags.includes('anime')) score += 3
    const interestLabels = matching.map((id) => INTERESTS.find((i) => i.id === id)?.label).filter(Boolean)
    let reason = interestLabels.length ? `Matches your interest in ${interestLabels.slice(0, 2).join(' and ').toLowerCase()}.` : 'A curated starting point for your heritage journey.'
    if (story.targetStates.includes(state) && state) reason = `A heritage discovery connected to ${state}. ${reason}`
    if (story.relatedToSiteId && story.relatedToSiteId === recent) reason = `Builds on your recent visit. ${reason}`
    return { ...story, site, score, reason, isDemo: true }
  })
  return scores.sort((a, b) => b.score - a.score).slice(0, 4)
}
