import test from 'node:test'
import assert from 'node:assert/strict'
import { rankStories } from '../src/recommendations.js'

const sites = [
  { id: 'tirumala', title: 'Sri Venkateswara Temple', short_title: 'Tirumala', state: 'Andhra Pradesh' },
  { id: 'yadadri', title: 'Yadagirigutta Temple', short_title: 'Yadadri', state: 'Telangana' },
  { id: 'konark', title: 'Sun Temple, Konark', short_title: 'Konark', state: 'Odisha' },
]
const stories = [
  { id: 'laddu', site_id: 'tirumala', title: 'Tirumala Laddu', interest_tags: ['cooking', 'food', 'traditions'], target_states: ['Andhra Pradesh'], related_to_site_id: 'tirumala' },
  { id: 'kitchen', site_id: 'tirumala', title: 'Temple kitchen', interest_tags: ['traditions', 'history'], target_states: [], related_to_site_id: 'tirumala' },
  { id: 'yadadri-local', site_id: 'yadadri', title: 'A Telangana hill shrine', interest_tags: ['temples', 'history', 'mythology'], target_states: ['Telangana'], related_to_site_id: 'tirumala' },
  { id: 'visual', site_id: 'konark', title: 'Myth and visual storytelling', interest_tags: ['anime', 'sculpture', 'mythology'], target_states: [], related_to_site_id: null },
]

test('food interest + recent Tirumala visit ranks the laddu story first', () => {
  const result = rankStories({
    stories, sites,
    profile: { interests: ['cooking'], state: 'Andhra Pradesh', recently_visited_site_id: 'tirumala' },
    visitedSiteIds: ['tirumala'],
  })
  assert.equal(result[0].id, 'laddu')
  assert.match(result[0].reason, /recent Tirumala visit/i)
})

test('state + recent visit ranks a different regional destination', () => {
  const result = rankStories({
    stories, sites,
    profile: { interests: ['temples'], state: 'Telangana', recently_visited_site_id: 'tirumala' },
    visitedSiteIds: ['tirumala'],
  })
  assert.equal(result[0].id, 'yadadri-local')
  assert.match(result[0].reason, /Telangana/i)
})

test('anime/visual-storytelling interest selects source-linked sculpture story', () => {
  const result = rankStories({ stories, sites, profile: { interests: ['anime'], state: 'Punjab', recently_visited_site_id: null }, visitedSiteIds: [] })
  assert.equal(result[0].id, 'visual')
  assert.match(result[0].reason, /not a claim/i)
})
