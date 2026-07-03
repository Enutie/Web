import { ref, onMounted } from 'vue'
import { pursuits, type Pursuit, type LatestEntry, type PursuitState } from '@/data/pursuits'

// The honest-numbers pipeline, now on autopilot:
//  - latest entry: newest post per tag
//  - stats: taken from the newest post that carries a `stats` frontmatter list
//  - state: derived from posting recency (active < 90 days, otherwise resting;
//    queued only when a tag has no posts at all) unless the pursuit sets
//    stateOverride in pursuits.ts
//  - resilience: successful feed responses are cached in localStorage, so a
//    returning visitor sees fresh-ish data even when the blog is unreachable;
//    the baked-in config is the last-resort fallback.

interface FeedPost {
  title?: string
  url?: string
  permalink?: string
  date?: string // ISO string
  stats?: string[]
}

interface TagFeed {
  count?: number
  posts?: FeedPost[]
}

const ACTIVE_DAYS = 90
const CACHE_PREFIX = 'enutie-feed-'

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]

function formatDate(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`
  // add the year when the post isn't from the current year — "sep 2" alone
  // would read as recent
  const year = d.getFullYear()
  return year === new Date().getFullYear() ? base : `${base} '${String(year).slice(-2)}`
}

// Hugo serves tag feeds newest-first today, but pickLatest/deriveState read
// posts[0] as "the newest" — sort defensively so a feed change can't break that.
function sortNewestFirst(feed: TagFeed): TagFeed {
  const posts = [...(feed.posts ?? [])].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
  )
  return { ...feed, posts }
}

function pickLatest(feed: TagFeed): LatestEntry | null {
  const post = feed.posts?.[0]
  if (!post) return null
  const url = post.url ?? post.permalink
  const date = formatDate(post.date)
  if (!post.title || !url || !date) return null
  return { title: post.title, url, date }
}

function deriveState(feed: TagFeed): PursuitState {
  const posts = feed.posts ?? []
  if ((feed.count ?? posts.length) === 0) return 'queued'
  const newest = new Date(posts[0]?.date ?? '')
  if (Number.isNaN(newest.getTime())) return 'resting'
  const days = (Date.now() - newest.getTime()) / 86_400_000
  return days <= ACTIVE_DAYS ? 'active' : 'resting'
}

function applyFeed(pursuit: Pursuit, rawFeed: TagFeed) {
  const feed = sortNewestFirst(rawFeed)
  const latest = pickLatest(feed)
  if (latest) pursuit.latest = latest

  pursuit.state = pursuit.stateOverride ?? deriveState(feed)

  // stats come from the newest post that declares them in frontmatter
  const withStats = feed.posts?.find((p) => Array.isArray(p.stats) && p.stats.length > 0)
  if (withStats?.stats) pursuit.stats = withStats.stats.map((text) => ({ text }))
}

async function fetchTag(pursuit: Pursuit): Promise<TagFeed | null> {
  const cacheKey = `${CACHE_PREFIX}${pursuit.tag}`
  try {
    const res = await fetch(`${pursuit.tagUrl}index.json`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`feed ${pursuit.tag}: ${res.status}`)
    const feed = (await res.json()) as TagFeed
    try {
      localStorage.setItem(cacheKey, JSON.stringify(feed))
    } catch {
      /* storage full/blocked — caching is best-effort */
    }
    return feed
  } catch {
    // blog unreachable: fall back to the last successful response
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) return JSON.parse(cached) as TagFeed
    } catch {
      /* corrupt cache — ignore */
    }
    return null
  }
}

export function useBlogFeed() {
  const items = ref<Pursuit[]>(pursuits.map((p) => ({ ...p })))

  onMounted(async () => {
    await Promise.all(
      items.value.map(async (pursuit) => {
        const feed = await fetchTag(pursuit)
        // no feed and no cache → keep the baked-in config untouched
        if (feed) applyFeed(pursuit, feed)
      }),
    )
  })

  return { items }
}
