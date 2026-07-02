export type PursuitState = 'active' | 'resting' | 'queued'

export interface StatLine {
  text: string
  link?: { label: string; href: string }
}

export interface LatestEntry {
  title: string
  date: string 
  url: string
}

export interface Pursuit {
  name: string
  tag: string
  tagUrl: string
  state: PursuitState
  stats: StatLine[]
  latest: LatestEntry | null
  pending?: { title: string; note: string }
}

const BLOG = 'https://blog.enutie.com'

export const pursuits: Pursuit[] = [
  {
    name: 'Drawing',
    tag: 'drawing',
    tagUrl: `${BLOG}/tags/drawing/`,
    state: 'active',
    stats: [{ text: '3 lessons done' }, { text: '250 boxes · 1 dragon' }],
    latest: {
      title: 'Lesson 3 complete — holy smokes',
      date: 'jun 26',
      url: `${BLOG}/posts/lesson-3-review/`,
    },
  },
  {
    name: 'Warbands',
    tag: 'wargaming',
    tagUrl: `${BLOG}/tags/wargaming/`,
    state: 'active',
    stats: [{ text: '0 models painted' }, { text: 'red scheme, obviously' }],
    latest: null,
    pending: { title: 'First log entry pending', note: 'the warband is on the desk' },
  },
  {
    name: 'Game dev',
    tag: 'gamedev',
    tagUrl: `${BLOG}/tags/gamedev/`,
    state: 'resting',
    stats: [
      { text: '1 game shipped' },
      { text: '', link: { label: 'pong.enutie.com ↗', href: 'https://pong.enutie.com' } },
    ],
    latest: {
      title: 'Game #1 complete — pong clone',
      date: 'sep 25',
      url: `${BLOG}/posts/first-game/`,
    },
  },
  {
    name: 'Writing',
    tag: 'writing',
    tagUrl: `${BLOG}/tags/writing/`,
    state: 'queued',
    stats: [{ text: '0 pieces — though' }, { text: 'every blog post counts' }],
    latest: null,
    pending: { title: 'Not started', note: "and that's fine" },
  },
  {
    name: 'Music',
    tag: 'music',
    tagUrl: `${BLOG}/tags/music/`,
    state: 'queued',
    stats: [{ text: '0 entries' }, { text: 'instrument undecided' }],
    latest: null,
    pending: { title: 'Not started', note: 'the queue is honest' },
  },
]
