import type { FooterLink } from '@enutie/design/SiteFooter.vue'

// enutie.com is the hub: its footer carries the full catalogue.
// Spoke sites (sketcheduler, blog) use the package's default set.
export const HUB_FOOTER_LINKS: FooterLink[] = [
  { label: 'rss', href: 'https://blog.enutie.com/index.xml' },
  { label: 'github', href: 'https://github.com/Enutie' },
  { label: 'bachelor project', href: 'https://enutie.github.io' },
  { label: 'sketcheduler', href: 'https://sketcheduler.enutie.com' },
  { label: 'blog.enutie.com', href: 'https://blog.enutie.com' },
]
