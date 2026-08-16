# HyperonX Design System

The visual contract for the HyperonX landing site. Every value the CSS uses traces back to a token in this file. No orphan hex codes, no magic px values.

## 0. Research Log (greenfield)

- Embedded refs: shortlisted [brutalist/industrial, aerospace-HUD, swiss-print] → picked `brutalist-skill.md` (Layer A, "Industrial Brutalism & Tactical Telemetry" — the `Tactical Telemetry / CRT Terminal` archetype, because the brief demands dark, mono-dominant, 90°-corner, borders-only technical accuracy and explicitly rejects cyberpunk/neon and gradients).
- Layer B: **skipped a brand reference on purpose** — the user's 35-section brief IS the reference-fidelity contract (it dictates palette direction, type pairing, section anatomy, interactions, and copy tone with more precision than any generic brand system). The brief's "research terminal / spacecraft control interface / underground engineering lab / 2020s technical brutalism" maps cleanly onto the loaded Layer A archetype.
- ui-ux-db: `technical brutalist dark terminal design system` lookup run → confirmed dark-only, high-contrast, mono-metadata, visible-focus, reduced-motion checklist; accent direction deviated from its terminal-green default toward laboratory amber (below) to avoid the generic dev-tool-green AI-startup association.
- Lazyweb / imagegen: skipped — no browser images needed; the visual language is wholly code-rendered (canvas + SVG + CSS), as the brief demands, so there are no reference screens to harvest.
- `interaction-skill.md` loaded for motion mechanics; `perfection/README.md` loaded for the perf/a11y/SEO floor.

## 1. Atmosphere & Identity

A working instrument panel in an underground engineering lab — not a website. Dense telemetry where signal matters, vast dead space where the statement sits. The signature is **the laboratory amber signal**: one sharp amber accent (`#FFC53D`) burned sparingly into a field of near-black carbon and off-white phosphor, always standing for *live signal / caution / experiment under way*, never decoration. Surfaces separate by hairline borders and panel frames (the "blueprint grid"), not shadows. Big grotesk statements are set huge and tight; every supporting fact is set in small uppercase monospace, like metal-stamped labels. Nothing glows except signal. Nothing is rounded. Everything is measured.

The one moment a visitor remembers: the hero canvas — a dense centralized hub violently breaking apart and re-forming into a flat, cheaper distributed mesh, with amber measurement counters (LATENCY / ENERGY / COST / CONTROL / WASTE) ticking down as it settles.

## 2. Color

### Palette (dark-only, `color-scheme: dark`)

| Role | Token | Hex | Notes |
|------|-------|-----|-------|
| Surface/deepest | `--bg-deep` | `#08090A` | Page canvas, outer frames |
| Surface/base | `--bg` | `#0B0C0D` | Main background |
| Surface/raised | `--bg-raised` | `#101213` | Cards, panels, topbar-on-scroll |
| Surface/inset | `--bg-inset` | `#0D0F10` | Input wells, code strips, canvas bed |
| Border/default | `--border` | `#222527` | Hairline panel borders |
| Border/strong | `--border-strong` | `#3A3F41` | Interactive borders, active states |
| Border/faint | `--border-faint` | `#16181A` | Internal hairlines |
| Text/primary | `--text-primary` | `#E9E9E6` | Off-white phosphor, headline + body |
| Text/secondary | `--text-secondary` | `#9BA0A3` | Supporting text, metadata |
| Text/tertiary | `--text-tertiary` | `#7A7F83` | Dim labels, inactive (4.84:1 vs bg — meets AA for all sizes) |
| Accent/signal | `--accent` | `#FFC53D` | THE accent. Live signal / caution / focus / active |
| Accent/text-on | `--accent-ink` | `#0B0C0D` | Text when sitting on accent |
| Accent/glow | `--accent-glow` | `rgba(255,197,61,0.14)` | Very subtle signal halo (bg fills only) |
| Status/online | `--status-ok` | `#5BF078` | Reserved for ONE readout: the live GitHub status dot |
| Status/offline | `--status-down` | `#FF5A4E` | Reserved for the offline status dot |

### Rules
- One accent to rule: amber is used ONLY for signal — live indicators, focus rings, active links, primary CTA fill, label ticks, marker crosses. Never for body text. Never decorative.
- Green and red exist exclusively for the live-status dot (online/offline). Nothing else may use them. `--status-ok` at reduced saturation in backgrounds is forbidden.
- Text contrast floors: body/secondary ≥ 4.5:1 over the surface underneath; large display text ≥ 3:1; tertiary labels only for non-essential metadata (still ≥ 4.5:1 where they carry meaning).
- No gradient fills across surfaces. Allowed: flat fills + faint radial atmospheric glow behind the hero/thesis (background layers only, very low alpha, never as a "card shine").

## 3. Typography

Two families, both self-hosted variable woff2 in `assets/fonts/`.

- **Space Grotesk** — display + body grotesk. Weights 400 / 500 / 700.
- **JetBrains Mono** — all metadata, labels, readouts, code. Weights 400 / 500 / 600.

### Scale

| Level | Token (rem, base 16) | Weight | LH | Tracking | Usage |
|-------|------|--------|-----|----------|-------|
| Display/XL | `--fs-display: clamp(2.9rem, 9vw, 6.75rem)` | 700 | 0.93 | -0.035em | HEro headline, footer statement |
| Display/L | `--fs-display-l: clamp(2.1rem, 5.4vw, 4.1rem)` | 700 | 1.0 | -0.03em | Section statements |
| Display/M | `--fs-display-m: clamp(1.5rem, 3vw, 2.35rem)` | 700 | 1.05 | -0.02em | Sub-statements, project names |
| H3 | `--fs-h3: 1.125rem` | 500 | 1.35 | -0.005em | Body headings |
| Body | `--fs-body: 1rem` | 400 | 1.65 | 0 | Paragraphs, content |
| Body/sm | `--fs-body-sm: 0.9375rem` | 400 | 1.6 | 0 | Secondary paragraphs |
| Mono/lg | `--fs-mono-lg: 0.8125rem` | 500 | 1.4 | 0.06em | Status lines, card category |
| Mono | `--fs-mono: 0.75rem` | 500 | 1.5 | 0.08em | Metadata, labels, nav links |
| Mono/xs | `--fs-mono-xs: 0.6875rem` | 500 | 1.5 | 0.12em | Overline section labels, captions, ticks |

### Rules
- Uppercase + wide tracking (0.08–0.12em) is for mono metadata only. Headlines are sentence/block case with tight tracking, never all-caps — the brutalist all-caps read is reserved for micro-labels so density stays legible and non-shouty.
- Body text never below 14px. Mono metadata never below 11px.
- `font-display: swap`. Preload only the display latin file (the LCP-critical family).

## 4. Spacing & Layout

Base unit **4px**. Tokenized intent steps; raw `clamp()`/percent for mechanics.

| Token | Value | Usage |
|-------|-------|-------|
| `--sp-1` | 4px | Icon ticks, hairlines |
| `--sp-2` | 8px | Tight labels, tag gaps |
| `--sp-3` | 12px | Compact metadata rows |
| `--sp-4` | 16px | Card inner padding, gutter min |
| `--sp-5` | 20px | Standard inner padding |
| `--sp-6` | 24px | Card padding, cluster gaps |
| `--sp-8` | 32px | Between blocks in a section |
| `--sp-12` | 48px | Section inner rhythm |
| `--sp-16` | 64px | Between major sections |
| `--sp-20` | 80px | Hero/section breathing top |
| `--sp-24` | 96px | Max section separation |

Grid:
- Content max width `1184px` (`--container`), 1 cell grid padding `clamp(16px, 4vw, 40px)`.
- Sections are **frame cells**: bordered container, header row (mono section index + label + rule), then content.
- Breakpoints: `sm 640`, `md 820`, `lg 1080`, `xl 1184`.
- Desktop project grid: 12-col → featured card spans 7, stack spans 5; tall cards stagger vertically (editorial asymmetry). Mobile: single column, intentional recomposition (toggle/group ordering, no card shrinking).

## 5. Components (primitives)

### Topbar
- **Structure**: `<header>` fixed; left brand `HYPERONX` (mono, tracked); right nav (mono links) + CTA; scroll-progress hairline at very top (`transform: scaleX` driven by scroll).
- **Variants**: transparent (top) / raised (`--bg` + border-bottom) after 12px scroll. Mobile: menu collapses to a `button` toggling an off-canvas panel.
- **States**: links hover (amber text-underline via background-size trick), active section gets `▸` marker; focus-visible amber outline.
- **Accessibility**: `<nav aria-label>`, `aria-expanded` on toggle, Escape closes menu, focus trap in menu.
- **Motion**: topbar fill 240ms; menu slides via `transform`, 240ms expo-out; progress hairline is scroll-driven linear (reduced-motion-safe, it is motion *about* scroll).

### Button
- **Structure**: `<a>`/`<button>` inline-flex, mono uppercase, tracked.
- **Variants**: primary (amber fill, `--accent-ink` text, 90° corners, `▸`/`↗` suffix), ghost (1px border, transparent fill, hover: border-strong + amber text), arrow-link (text + amber arrow, underline on hover).
- **States**: hover (background/arrow shift 150ms), active (translate-y 1px), focus-visible (amber 1px outline offset 3px).
- **Motion**: 150ms ease-out on fill/translate; arrow slides +4px on hover.

### Section Frame
- **Structure**: bordered panel + internal header: `[ NN ]` mono index · overline label · full-width hairline rule.
- **Variants**: full frame / open (border-top only, ruled).
- **Motion**: reveal on scroll — inner content translateY(14px)→0 + fade, 600ms expo-out, staggered children via `--stagger` custom prop. Reduced motion: no transform, instant reveal.

### Project Card (R&D artifact)
- **Structure**: framed tile; top row mono category like `COMMUNICATIONS / OPEN INFRASTRUCTURE`; name in Display/M; README-derived summary line; tech tag strip (mono xs, bracketed `[ ]`); footer row: `v{branch?} / stars / updated` + `[ VIEW REPOSITORY ↗ ]`; a live data gutter on the left edge (thin amber bar + `+` crosshair).
- **Variants**: featured (col-span 7, larger name, taller), standard (col-span 5), tall (offset row). Loading skeleton = hairline pulsing block rows (opacity pulse, reduced-motion static). Empty/error states loop back to fallback list.
- **States**: hover (border-strong, amber index flash, arrow slides, card lifts 1px via translateY), focus-visible (amber outline). Entire card is a single click target → opens detail panel (button semantics; the GitHub link inside stops propagation).
- **Motion**: hover 150ms; reveal stagger 600ms expo-out.

### Detail Panel (modal)
- **Structure**: `<dialog>`-like overlay; backdrop `--bg-deep` 70%; panel bordered, bg-raised; top: category + close `[ ESC / × ]`; body: title, verified README summary block (`SOURCE: README` label), stats grid (stars / language / pushed / license / forks / issues — real values), tech tags, thesis line separated under `HYPERONX THESIS / INTERPRETATION` marker.
- **States**: open (transform scale .98→1 + fade 240ms), close (reverse), focus moves into panel, `aria-modal`, Escape closes, scroll locked behind.
- **Keyboard**: full tab loop inside; return focus to triggering card on close.

### Slider (Broken → Rebuilt)
- **Structure**: rail + single thumb (input range) + two zone labels `BROKEN SYSTEM` / `REBUILT SYSTEM`; `transformations` data drives the diagram SVG between the two topologies (node positions interpolated).
- **States**: idle / dragging (thumb grows, accent); focus-visible amber outline on thumb.
- **Motion**: thumb spring via CSS transition 120ms while dragging canceled; diagram positions lerp on input (rAF); reduced-motion swaps to a single 400ms ease at release (no continuous lerp… keep simple: instant snap acceptable, still animated once).

### Status Readout
- **Structure**: mono row: colored dot + label + value (`GITHUB API ● ONLINE`); variants online/offline only use `--status-ok`/`--status-down`.
- **States**: dot pulses at 2.4s (opacity only) — pause under reduced motion; offline = static dim dot.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120–150ms | ease-out | Press, hover, arrow slide, thumb |
| Standard | 240ms | cubic-bezier(0.4,0,0.2,1) | Panel open, topbar fill, menu |
| Reveal | 600–700ms | cubic-bezier(0.16,1,0.3,1) | Scroll reveals, stagger |
| Continuous | rAF / 60fps | linear | Hero canvas, status pulse (opacity) |
| Scroll-driven | tied to scroll | linear | Progress hairline, hero phase tie |

### Rules
- GPU-composited only: `transform`, `opacity`, `filter`. Paint/width never animated.
- Scroll reveals via IntersectionObserver (unobserve after fire). No scroll listeners for reveals.
- `prefers-reduced-motion: reduce`: kill canvas animation (draw one settled frame), replace reveals with instant opacity, stop status pulse, stop scroll-driven canvas, keep scroll progress hairline (it is scroll *truth*, not decoration) and keep editor-scale motion only.
- Every animation maps to a state/affordance. No hover-on-nothing, no decorative idle animation outside the hero canvas (which is the single sanctioned ambient motion).
- Springs: no JS spring lib; CSS cubic-bezier covering micro/standard/reveal. Canvas lerps are linear with easing functions inline.

## 7. Depth & Surface

**Strategy: borders-only (+ flat fills)**, per the brutalist archetype. NO `box-shadow` for elevation anywhere. Elevation is communicated by border `--border-strong` on `--bg-raised`, and by the state of the surrounding frame.

Allowed depth:
- Hairline borders (`1px`) separating cells; `2px` only on active/interactive boundaries and the accent signal line.
- Faint atmospheric radial glow layers BEHIND content (hero canvas bed, thesis numeral): `--accent-glow` and a neutral `rgba(255,255,255,0.02–0.04)` vignette. Background fills only — never borders or "shiny" cards.
- A printed-noise/scanline grain at 2–4% opacity over the whole page (inline SVG data-URI, `pointer-events:none`) to give the carbon a physical cast — removed under `prefers-reduced-motion`.

### Rules
- Zero `border-radius` anywhere except default (inputs/thumb may keep none too — keep 90° for everything).
- Zero `box-shadow` used for elevation. (None at all, to keep the grep-clean rule.)

## 8. Accessibility Constraints & Accepted Debt

### Constraints (WCAG 2.2 AA)
- Contrast floor 4.5:1 body / 3:1 large; verified for all surface/text pairings above (accent-on-deep ≈ 9.3:1, secondary-on-deep ≈ 5.7:1).
- Full keyboard reachability: skip-link, nav, cards (single tab stop + panel), slider operable with arrows/PageUp/Home (native range), modal focus cycled, Escape closes.
- Visible `:focus-visible` amber outline (1px, 3px offset) on every interactive.
- Screen readers: `aria-live="polite"` for project load state; `role="status"` on LIVE index readout; labeled modal; `aria-label` on icon-only controls; canvas gets `role="img"` + descriptive `aria-label`; slider gets full text description via `aria-describedby`.
- `prefers-reduced-motion` honored in every animated surface (Section 6).
- Never convey state by color alone: status dots pair with text labels (`● ONLINE`). Counters animate AND settle to final text.

### Accepted Debt
| Item | Location | Why accepted | Owner / Exit |
|------|----------|--------------|--------------|
| GitHub README fetch is unauthenticated → 60 req/hr cap; we fetch READMEs only for the top ~6 curated repos each load and tolerate partial misses | `app.js` | No auth allowed on a static page; keeps rate limit budget for the core repo list | Exit when rate limiting lands on a static CDN or README summary becomes cached |
| Fonts are latin-subset only | `assets/fonts/` | CJK/Cyrillic project descriptions fall back to system fonts; keeps payloads ~22/31KB | Add subsets if real content needs them |

---

Deploy contract: static files only (`.nojekyll` present), relative asset paths, `https://hyperonx-team.github.io/` root, no runtime deps.
