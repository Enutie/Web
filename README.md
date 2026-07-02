# enutie.com

My personal site. The companion blog lives separately at
`blog.enutie.com` (Hugo).

## Tech stack

- **Vue 3** (`<script setup>`, TypeScript) + **vue-router**
- **Vite** for dev/build
- **three.js** for the hero scene (lazy-loaded, honours `prefers-reduced-motion`)
- Deployed as a static SPA to **GitHub Pages** via GitHub Actions

## Features

- Light/dark theme ("lamplit") — follows the OS preference, remembers an explicit
  toggle, and defaults the games hall to dark. No flash on load.
- Pursuits board fed by the blog: each card pulls its latest post from the blog's
  per-tag JSON at runtime, with a static fallback so it never fails.
- Data-driven content — pursuits and games are plain typed arrays, no templating.
- Design tokens in one file; radius-0, border-and-band visual system, no shadows.

## Getting started

Requires Node `^20.19 || >=22.12`.

```sh
npm install      # install dependencies
npm run dev      # start the dev server with hot reload
npm run build    # type-check + build to dist/
npm run preview  # serve the production build locally
```

## Project structure

```
public/            static assets served at the root (favicons, CNAME, game screenshots)
src/
  main.ts          app entry
  App.vue          root component; resolves the active theme
  router/          routes → views (/ = home, /games)
  views/           one component per page (HomeView, GamesView)
  components/       reusable pieces (banner, footer, hero, cards)
  data/            content as typed arrays (pursuits.ts, games.ts)  ← edit these
  composables/      theme state + blog feed fetching
  assets/          tokens.css (colors/type/spacing) + base.css
docs/              site-guide.md (full walkthrough) + blog-json-feed.md
```

## Editing content

- **Pursuit cards:** `src/data/pursuits.ts`
- **Games:** `src/data/games.ts` (screenshots go in `public/games/`)
- **Copy:** the relevant `src/views/*.vue`
- **Colors / type:** `src/assets/tokens.css`

## Blog feed

Pursuit cards fetch `https://blog.enutie.com/tags/<tag>/index.json` and show the
latest post per tag, falling back to static content if the feed is unavailable.
The Hugo-side setup (outputs config + `term.json` template) is documented in
[`docs/blog-json-feed.md`](docs/blog-json-feed.md).

## Deployment

Pushing to `main` triggers `.github/workflows/vue.yaml`, which builds and publishes
`dist/` to GitHub Pages. Two supporting pieces:

- `public/CNAME` pins the custom domain (`enutie.com`).
- `vite.config.ts` copies `index.html` → `404.html` at build time so client-side
  routes (e.g. `/games`) resolve on direct load — GitHub Pages has no server-side
  rewrites.

## License

Personal project. Code is free to learn from; the content, copy and artwork are mine.
