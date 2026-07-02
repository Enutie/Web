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
  /** fallback when the feed is unreachable; otherwise derived from post recency */
  state: PursuitState
  /** lock the state so the feed never changes it (e.g. active with no posts yet) */
  stateOverride?: PursuitState
  stats: StatLine[]
  /** permanent tool/project link — survives feed stats overrides */
  link?: { label: string; href: string }
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
    link: { label: 'sketchedular.enutie.com ↗', href: 'https://sketchedular.enutie.com' },
    latest: {
      title: 'Lesson 3 Review',
      date: "sep 2 '25",
      url: `${BLOG}/posts/lesson-3-review/`,
    },
  },
  {
    name: 'Warbands',
    tag: 'wargaming',
    tagUrl: `${BLOG}/tags/wargaming/`,
    state: 'active',
    stateOverride: 'active', // no posts yet, but the warband IS on the desk

    stats: [{ text: '0 models painted' }, { text: 'red scheme, obviously' }],
    latest: null,
    pending: { title: 'First log entry pending', note: 'the warband is on the desk' },
  },
  {
    name: 'Game dev',
    tag: 'gamedev',
    tagUrl: `${BLOG}/tags/gamedev/`,
    state: 'resting',
    stats: [{ text: '1 game shipped' }],
    link: { label: 'pong.enutie.com ↗', href: 'https://pong.enutie.com' },
    latest: {
      title: 'Game #1 Complete - Pong Clone',
      date: "dec 14 '24",
      url: `${BLOG}/posts/first-game/`,
    },
  },
  {
    name: 'Writing',
    tag: 'writing',
    tagUrl: `${BLOG}/tags/writing/`,
    state: 'queued',
    stats: [{ text: '0 pieces — though' }, { text: 'every blog post counts' }],
    latest: {
      title: 'Starting a Habit',
      date: "aug 21 '25",
      url: `${BLOG}/posts/starting-a-habit/`,
    },
  },
  {
    name: 'Music',
    tag: 'music',
    tagUrl: `${BLOG}/tags/music/`,
    state: 'queued',
    stats: [{ text: '0 songs made' }, { text: 'instrument undecided' }],
    latest: {
      title: 'Beginning My Creative Journey',
      date: "dec 10 '24",
      url: `${BLOG}/posts/beginning-journey/`,
    },
  },
]
