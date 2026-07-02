import { ref, onMounted } from 'vue'
import { pursuits, type Pursuit, type LatestEntry } from '@/data/pursuits'

interface FeedPost {
  title?: string
  url?: string
  permalink?: string
  date?: string 

interface TagFeed {
  count?: number
  posts?: FeedPost[]
  latest?: FeedPost
}

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]

function formatDate(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function pickLatest(feed: TagFeed): LatestEntry | null {
  const post = feed.latest ?? feed.posts?.[0]
  if (!post) return null
  const url = post.url ?? post.permalink
  const date = formatDate(post.date)
  if (!post.title || !url || !date) return null
  return { title: post.title, url, date }
}

async function fetchTag(pursuit: Pursuit): Promise<LatestEntry | null> {
  const res = await fetch(`${pursuit.tagUrl}index.json`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`feed ${pursuit.tag}: ${res.status}`)
  const feed = (await res.json()) as TagFeed
  return pickLatest(feed)
}

export function useBlogFeed() {
  const items = ref<Pursuit[]>(pursuits.map((p) => ({ ...p })))

  onMounted(async () => {
    await Promise.all(
      items.value.map(async (pursuit) => {
        try {
          const latest = await fetchTag(pursuit)
          if (latest) pursuit.latest = latest
        } catch {
        }
      }),
    )
  })

  return { items }
}
