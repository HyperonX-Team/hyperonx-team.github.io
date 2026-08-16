# HyperonX — hyperonx-team.github.io

The HyperonX landing site. A static, dependency-free site that deploys as-is to
GitHub Pages. No backend, no build step, no runtime server.

> We redesign broken systems.

## Run it

Any static file server works, no build required:

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Push to `main` on `hyperonx-team/hyperonx-team.github.io`. GitHub Pages
serves it at `https://hyperonx-team.github.io/`. `.nojekyll` is committed so
Jekyll never touches it.

## Structure

```
.
├── index.html        semantic page shell, all sections + no-JS fallback
├── style.css         tokenized stylesheet (design tokens in DESIGN.md)
├── app.js            enhancement layer: hero canvas, GitHub index, slider
├── DESIGN.md         the visual contract every CSS value follows
├── favicon → assets/
└── assets/
    ├── favicon.svg
    ├── og.png                        social share image
    └── fonts/                        self-hosted variable woff2
        ├── space-grotesk-latin.woff2
        └── jetbrains-mono-latin.woff2
```

## How the site works

- **Fully readable without JavaScript.** All copy and the section system are
  server-rendered in `index.html`. If JS or the GitHub API fails, a static
  index of the known public systems remains, linked to the real repositories.
- **Live repository index.** `app.js` makes ONE request per load to
  `api.github.com/orgs/HyperonX-Team/repos`, caches it in memory, classifies
  each repo via lightweight heuristics (communications / hardware / biotech /
  compute / research), and renders artifact-style cards. READMEs are pulled
  from `raw.githubusercontent.com` (not rate-limited) to enrich summaries.
  The dataset is never hard-coded — new public repos appear automatically.
- **Honest by construction.** Verified repository facts are labeled as such.
  Design-target statements are labeled as HyperonX thesis/interpretation.
  No testimonials, no investors, no fake metrics, no padded numbers.

## Notes on the GitHub API

Unauthenticated public API is limited to 60 requests/hour. The site uses 1 per
load and degrades to the static fallback on any failure, so a rate-limit hit
never breaks the page.
