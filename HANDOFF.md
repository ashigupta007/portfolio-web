# Portfolio — Design System & Developer Handoff

Hand-built site. **Zero runtime dependencies** — no framework, no CSS library, no font requests.
Vite is used only as a dev server / bundler (`npm run dev`, `npm run build`).

Two pages:

| Route | Entry HTML | Page CSS | Entry JS |
|---|---|---|---|
| `/` | `index.html` | `styles.css` + `demos.css` | `main.js` |
| `/ux-audit` | `ux-audit/index.html` | `styles.css` + `ux-audit/audit.css` | `src/audit/entry.js` |

`styles.css` is the shared design system; both pages link it and Vite emits it as one shared
asset. JS lives in ES modules under `src/` — see §10.

---

## 1. Design tokens

Defined as CSS custom properties in `:root` (styles.css §1).

### Color

| Token | Value | Use |
|---|---|---|
| `--bg` | `#090909` | Page background (dark charcoal) |
| `--bg-2` | `#0d0d0c` | Raised surfaces: figures, code, diagrams |
| `--bg-3` | `#131311` | Diagram boxes |
| `--ink` | `#f2efe9` | Headings, primary text (soft warm white) |
| `--ink-2` | `#b9b5ac` | Body text — 9.4:1 on `--bg` |
| `--ink-3` | `#8e8a80` | Secondary text — 5.7:1 (AA normal text) |
| `--ink-4` | `#5c5951` | Decorative / oversized labels only — never body copy |
| `--accent` | `#c9b08a` | Champagne — italic accents, warm dots, primary-hover |
| `--accent-2` | `#9d8b6c` | Muted champagne — rules, indices, diagram flows |
| `--line` | `rgba(242,239,233,.08)` | Hairlines |
| `--line-2` | `rgba(242,239,233,.18)` | Interactive borders |

Rule: **no other colors.** The one green-ish tint (`#a8b8a0`) exists only inside code-snippet strings.

### Typography

System stacks — zero font network requests:

- `--font-sans` — SF Pro Display / Segoe UI Variable → display + body
- `--font-serif` — New York / Georgia *italic only* → editorial accents (`.serif-accent`, essences, theses)
- `--font-mono` — SF Mono / Menlo → labels, meta, code, numbers

Fluid scale (`clamp`):

| Token | Range | Used for |
|---|---|---|
| `--t-hero` | 3.4rem → 11.5rem | Hero name |
| `--t-d2` | 2.3rem → 5.4rem | Section headlines (`.display`) |
| `--t-d3` | 1.6rem → 3rem | Project titles |
| `--t-lede` | 1.125rem → 1.44rem | Ledes, bio |
| `--t-body` | 0.94rem → 1.06rem | Body |
| `--t-label` | 0.6875rem | Mono labels, ls 0.14–0.22em, uppercase |

Display tracking: −0.03em to −0.045em. Body line-height 1.65; display 0.94–1.05.

**Production upgrade (optional):** self-host a display face (Söhne, Neue Haas Grotesk, or Inter
Display) via `@font-face` + `font-display: swap` + preload. Keep the mono/serif stacks.

### Spacing & grid

- `--gutter`: clamp(1.25rem, 4vw, 4rem) — page margins
- `--section-pad`: clamp(6rem, 16vh, 13rem) — vertical rhythm between acts
- `--container`: 1680px max, centered
- Layouts are asymmetric 2-column grids (`1.35fr/1fr` hero, `1.15fr/1fr` work rows, alternating)

### Motion tokens

- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out, the "keynote" curve. Default for everything entering.
- `--ease-inout`: `cubic-bezier(0.65, 0, 0.35, 1)` — exits and loops.
- Durations: micro 200ms · small 450ms · reveal 950ms · hero 1200ms.

---

## 2. Motion specification

| System | Mechanic | Timing |
|---|---|---|
| Hero entrance | Name lines rise from overflow masks; eyebrow/positioning/statement rise + de-blur (6px→0); machine panel scales 0.94→1 | 1.2s, staggered 60/120/420/560/700/1100/1500ms |
| Scroll reveals | `[data-reveal]` rise 30px + de-blur 7px; `[data-reveal="mask"]` clip-path curtain (bottom→up); `[data-reveal="line"]` scaleX; stagger via `--i` × 90ms | 950–1200ms |
| Split headlines | `[data-split]` — JS wraps words in overflow masks, each rises 115%→0, 45ms/word | 900ms |
| Ambient background | Canvas at 1/8 resolution, 3 radial lights (champagne/steel/deep-warm ≤ 5.5% alpha) drifting on sine paths | ~30fps, period minutes |
| Grain | Static SVG turbulence tile, `mix-blend: overlay`, opacity 0.05, above all content | none (static by design) |
| Hero machine | `VOICE → TRANSCRIPT → AGENT → TOOL → INTERFACE`. The rail node lights per stage, the stage panel cross-fades, and a clock counts the real latency budget to 940ms. Waveform is a 46px canvas drawn only during VOICE. Pauses offscreen | 2.2–3.4s per stage |
| Product demos | Five Selected Work compositions, each gated by its own IntersectionObserver: MeetAira phone conversation (11s loop), Trends dashboard (new interval every 3.2s), Copilot agent trace (plays once per entry), Live Orders FLIP leaderboard (2.8s), component playground (interaction-driven) | `src/home/demos/` |
| Lab experiments | L·01 voice budget, L·03 prompt diff, L·04 generative UI — each initialises on first open, so an unopened experiment costs nothing | on demand |
| Navigation | Blur+border after 24px; hides after 160px scrolling down, returns on any up-scroll | 600ms ease-out |
| Work figures | SVG art scales 1.02→1.06 on row hover; title shifts 6px; per-project looped micro-motion (dash flow, pulse, drift) paused offscreen via IO | 1.4s hover |
| Case studies | Real pages at `/work/<slug>` (see §15). Browser Back, refresh and sharing all work natively; "All work" returns to the exact homepage scroll position | 550/260ms |
| Philosophy | Sticky-stacked full-height statements; previous panel fades to 0 and recedes (scale 0.96, −24px) as next covers it | scroll-linked |
| Timeline | Section pins; scroll drives track horizontally (1px scroll = 1px translate); progress hairline fills. Touch/small/reduced → native horizontal scroll + snap | scroll-linked |
| Magnetic buttons | Pills lerp toward cursor (max 10px, factor 0.28, lerp 0.18), spring home on leave. Pointer-fine only | rAF |

**Reduced motion:** every transition/animation collapses to instant; canvases render a single
static frame; timeline becomes a native scroller; philosophy unstacks; dialogs open instantly. Fully readable.

**Performance rules encoded:** transforms + opacity only (no layout properties animated); one shared
rAF loop that self-suspends when no system is active; IntersectionObserver gates all offscreen work;
scroll listener is passive and only stores a number.

---

## 3. Component inventory

| Component | Location | Notes |
|---|---|---|
| `.site-nav` / `.menu` | header + dialog | hide/reveal logic in `initNav`, mobile takeover in `initMenu` |
| Hero (`.hero-*`) | §hero | name masks, meta `dl`, `#machine` runtime trace |
| `.work-row` | ×8 | figure + body; even rows flip columns. Modifiers `.is-phone` (01), `.is-wide` (02), `.is-trace` (03), `.is-play` (06), `.is-board` (08); the other three stay editorial SVG rows for rhythm |
| `.demo-frame` | ×5 | shared demo stage — same material as `.figure-frame`, sized by its contents |
| `.portrait` | about | editorial plate with a real `<img>` slot; falls back to a composed monogram (§4) |
| `.phil-evidence` | ×6 | disclosure revealing one line of supporting product evidence |
| `.audit-band` | after Selected Work | the commercial block — headline, CTAs and a sample audit card |
| `.hero-actions` | §hero | the homepage's two CTAs |
| `.c-sel` | every form | custom listbox; there are no native `<select>` elements on the site |
| `dialog.lead` | injected | the lead modal, on both pages |
| case study page | `work/<slug>/` ×8 | bar (All work · index) / title / lede / meta-grid / numbered sections / diagram / code / stats / lessons / next case study |
| `.cs-diagram` + `.dgm` | 4 flagships | inline SVG architecture diagrams, animated flow dashes |
| `.code` | MeetAira, Copilot | hand-tinted snippets (`.c .k .s .f` spans) |
| `.phil-panel` | ×6 | sticky cinematic statements |
| `.timeline-*` | experience | pinned horizontal band, 8 milestones |
| `.stat` | exp + case studies | hairline-top number blocks |
| `.eco` | ×4 | capability ecosystems (no skill bars, ever) |
| `.lab-item` | ×6 | experiment ledger with status pills; three carry `.is-runnable` + a `.lab-panel` |
| `.btn-pill` / `.cs-open` | contact + work | magnetic pills; `.cs-open` is a link to the case study page |

---

## 4. Image & 3D prompts

Every visual is currently a **generative inline SVG placeholder**. To replace with AI imagery,
each `<svg class="art">` and the portrait carry a `data-image-prompt` attribute with the exact
prompt. Summary:

1. **MeetAira** — "Cinematic macro of concentric glass ripples on black reflective surface, single warm point of light, charcoal + champagne, 8k"
2. **Trends** — "Thin illuminated lines rising across a dark charcoal wall like a minimalist stock-chart sculpture, brass accents, museum lighting"
3. **Copilot** — "Chain of small glass tiles connected by hairline light traces, one tile glowing warm, cinematic product render"
4. **Dockyard** — "Brushed-metal hub with luminous filaments to floating glass nodes, black studio, warm rim light"
5. **TwentyTwo** — "Minimal rotary dial machined from dark anodized aluminium, 22 fine ticks, one warm index, luxury watchmaking photography"
6. **Components** — "Exploded-view of interface components as frosted-glass panels in ordered rows, one edge-lit champagne"
7. **Migration** — "Two columns of illuminated nodes connected by fine crossing threads, like a mapping between constellations"
8. **Live Orders** — "Long-exposure timing screen: horizontal light streaks like a race leaderboard, one champagne streak overtaking"
9. **Portrait** — "B&W editorial portrait, Rembrandt lighting, charcoal backdrop, medium format, Aesop-campaign aesthetic"

**Portrait slot — how to fill it.** Drop a black-and-white editorial frame at `public/portrait.jpg`
(4:5, ≤200KB). Nothing else needs changing: `src/home/portrait.js` adds `.has-image` on a successful
load and the photograph fades in over the plate. Until then the frame holds a composed `AG` monogram
and caption rail — deliberate, not unfinished, and with no broken-image flash.

**Hero 3D (if upgrading canvas → real 3D):** "Floating architectural lattice sculpture — geodesic
wireframe in soft white light with a warm metallic core, slowly rotating, black void, no robot, no
face, museum-piece minimalism." Keep triangle count trivial; the current 2D-canvas projection is
the performance-safe default.

Replacement rule: keep every image ≤ 200KB AVIF/WebP, `loading="lazy"`, explicit aspect-ratio box
(`.figure-frame` already reserves 16/10 — zero CLS).

---

## 5. Responsive rules

- **≥1000px** — full editorial: 2-col hero, alternating work rows, pinned timeline, full nav row.
- **<1000px** — the nav links move into the `Menu` dialog, but the **CTA pill stays out on the bar**
  next to the Menu button. The breakpoint is 1000px rather than 760px because both navs now carry a
  CTA and neither fits below it; under it the row wrapped mid-label, and a wrapped inline pill paints
  its background per line box, which made the CTA look broken rather than merely cramped.
  `.nav-link` and `.wordmark` are `white-space: nowrap` so this can't silently regress when someone
  adds a nav item — it will overflow visibly instead of wrapping into a mess.
- **760–999px** — hero machine moves above the name (smaller); work rows stack (figure first).
- **<760px** — timeline switches to native horizontal scroll with snap; contact pills go 2-up.
- **≤430px** — Lab rows go single-column: `.lab-status` is nowrap, so its `auto` column pushed past
  the viewport below this.
- **≤380px** — nav tracking tightens so wordmark + CTA + Menu still fit a 320px bar.
- Typography is fluid everywhere (`clamp`) — there are no fixed-size headings to break.
- Horizontal-scroll surfaces (`.cs-diagram`, `.code`) scroll inside their own container; the page never scrolls sideways.

## 6. Accessibility

- Semantic landmarks (`header/nav/main/section/footer`), one `h1`, ordered headings.
- Skip link → `#main`. The mobile menu and lead modal are native `<dialog>`s: real focus trap + `Esc`.
- Each case study page has exactly one `h1` (its title) and `h2` sections.
- All text ≥ AA on `#090909` (see token table); `--ink-4` reserved for decorative labels.
- `:focus-visible` ring in champagne on every interactive element.
- Full `prefers-reduced-motion` treatment (see §2).
- Decorative SVGs are `aria-hidden`; architecture diagrams have `role="img"` + descriptive labels.

## 7. Performance budget

**Verified Lighthouse (throttled mobile emulation, `vite preview`, 2026-09-10):**

| Route | Performance | A11y | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 96–99 | 100 | 100 | 100 | 1.2–1.7s | 0 |
| `/ux-audit` | 100 | 100 | 100 | 100 | 1.1–1.2s | 0 |

Transferred on `npm run build`: homepage **25.6KB gz HTML · 12.7KB gz CSS · 3.4KB gz JS** on the
critical path, with the Selected Work demos (3.5KB gz) and Lab (1KB gz) split into chunks fetched
only as those sections approach. `/ux-audit` is **9.9KB gz HTML · 11.4KB gz CSS · 6.8KB gz JS**.

No fonts, no images. Third-party requests: the pre-existing Google Analytics tag on both pages, and
the Calendly widget — which is fetched **only after a lead has been submitted**, never on load.
No layout shift: every async visual sits in a fixed-aspect or min-height box.

**Rules that keep it there.** Transforms and opacity only. One shared rAF loop that suspends when
nothing is on screen and when the tab is hidden. Every demo is gated by an IntersectionObserver and
de-registers its tick on exit. Two hazards worth knowing about, both hit during this build:

- `IntersectionObserver` `threshold` is a ratio **of the target**, so a tall section can never reach
  a fractional threshold from a `rootMargin` preload. `onceVisible` therefore pins `threshold: 0`.
- Chromium reports a **fully `clip-path`-clipped element as non-intersecting**, and does not
  re-notify when the clip animates open. Since `[data-reveal="mask"]` clips its inner frame,
  `whenVisible` observes the unclipped reveal wrapper instead (`visibilityProxy` in `src/core/motion.js`).

## 8. Content to verify before publishing (personal claims)

These came from the brief + the previous site; confirm or edit in `index.html`:

- Timeline years (2019 start, role dates 2022–present, MeetAira 2024–25, TwentyTwo 2025–26)
- "Senior Product Engineer, AI — Shiprocket" title wording
- Impact numbers: ~80% (Trends), 10K+ queries/mo (Copilot), 70% tool-resolution, top-5 hackathon
- Resume Google Drive link + Calendly link (carried over from the old site)
- Pricing on `/ux-audit` — `PRICING` in `src/audit/config.js` is the only place it lives
- Credibility line "7 years · 20+ products shipped", repeated in the audit hero

## 9. Repo cleanup — done (2026-07-13)

The Bolt/React scaffold (Tailwind/PostCSS configs, eslint config, tsconfigs, .bolt/) has been
removed; `package.json` still has a single dev dependency: `vite`.

`vite.config.js` was reintroduced on 2026-09-10 for the second page — see §11.

Preserved from the old `vite.config.ts` (Vercel deploy hook that was noted there):
`https://api.vercel.com/v1/integrations/deploy/prj_RKA2GeNPrnEyujARBvLn4rnPfFZ9/rA4ZapxPxI`


---

## 10. JavaScript architecture

ES modules, bundled by Vite. No framework, still zero runtime dependencies.

```
main.js                     homepage entry
src/core/                   shared by every page
  motion.js                 rAF hub, scroll state, reduceMotion, visibility helpers
  reveal.js                 splitText + the [data-reveal] observer
  nav.js                    condensing nav + mobile dialog menu
  magnetic.js               cursor-following pills
  select.js                 accessible listbox used in place of <select>
  analytics.js              track() / trackOnView() / initClickTracking()
src/lead/                   lead capture, shared by BOTH pages
  config.js                 Formspree, Calendly, form options, auto-open rules
  form.js                   the six-field form: template + validation + submit
  modal.js                  the dialog, its triggers and the auto-open gates
  booking.js                Calendly, loaded only after a successful submission
  lead.css                  form, select, modal and booking styles
src/home/
  ambient.js                background light canvas
  hero-machine.js           VOICE → TRANSCRIPT → AGENT → TOOL → INTERFACE
  scroll-systems.js         pinned timeline, philosophy stack, evidence toggles
  portrait.js               portrait slot
  lab.js                    the three runnable experiments (lazy)
  demos/                    the five Selected Work demos (lazy)
    cue.js                  the scripted-timeline runner they all share
src/audit/
  entry.js                  /ux-audit entry
  config.js                 ALL pricing, sample findings, score, audit matrix
  sample.js                 renders the score, severity, findings, pricing, matrix
src/case/
  entry.js                  /work/<slug> entry: nav, menu, the "All work" back link
partials/                   shared HTML, inlined at build and dev time (see §15)
work/
  case.css                  the page around a case study
  <slug>/index.html         one case study per directory
```

Two conventions worth keeping:

- **`data-track="event_name"`** on any element reports a click. No per-link wiring.
- **`.is-running`** — a scripted demo adds this to its root when it takes over. Until then CSS shows
  the demo in its *resolved* state, so the page never renders an empty box before hydration or for
  a visitor without JS.

---

## 11. Deployment & environment

Vercel, static output, no server. `vite.config.js` declares both HTML entries, so
`ux-audit/index.html` builds to `dist/ux-audit/index.html`; `vercel.json` sets `cleanUrls` so
`/ux-audit` resolves to it. A direct visit or a browser refresh on that URL is a plain static file
hit — there is nothing to rewrite and nothing to keep warm.

The config also registers a small `cleanUrls` middleware for `vite dev` / `vite preview`, so the
route behaves identically locally. Without it, MPA mode 404s the extensionless path and SPA mode
silently serves the homepage — both of which hide routing problems until after deploy. It only
rewrites paths that name a real page directory, so it can't touch Vite internals (`/@vite/client`).

**`ux-audit/index.html` must reference its assets root-absolutely** (`/styles.css`,
`/ux-audit/audit.css`, `/src/audit/entry.js`). The page is served at `/ux-audit` with no trailing
slash, so a relative `./audit.css` resolves against `/` and 404s. This only shows up in `vite dev`:
the production build rewrites those links to absolute hashed `/assets/…` paths, so a build-only
check will not catch it. Test `vite dev` as well as `vite preview` when touching this page's head.

### Configuration

There are **no environment variables and no `.env` file**. Everything configurable is a constant in
source, so a deploy can't behave differently from local because a key was set in one place and not
the other.

| Constant | Where | Purpose |
|---|---|---|
| `FORMSPREE_ID` | `src/lead/config.js` | `meaqydwv` — the last segment of `https://formspree.io/f/meaqydwv`. Leads are managed from the Formspree dashboard. **Emptying it is safe**: the form still validates and, on submit, tells the visitor to email `FALLBACK_EMAIL` rather than failing silently. |
| `SCHEDULING.url` | `src/lead/config.js` | `calendly.com/love4css/product-ux-review-intro-call` — the dedicated 45-minute "Product UX Review — Intro Call" event. Keep `SCHEDULING.duration` in step with the event; it's printed above the embedded calendar. The homepage Contact section intentionally still links the separate hiring-conversation event. |
| `FALLBACK_EMAIL` | `src/lead/config.js` | Where enquiries go if the form is unavailable. |
| `PRICING` | `src/audit/config.js` | The only place prices **and scope promises** live: `tiers` (name, price, best-for, CTA), `groups` of comparison rows (`true` = included, `false` = not included, a string is shown as written) and the `custom` tier. It renders as a comparison `<table>` from 880px and one card per tier below that. The process step, FAQ and deliverables copy on `/ux-audit` restate the tier differences in prose — change those too if a tier's revision, walkthrough or report contents change. |
| `AUTO_OPEN` | `src/lead/config.js` | Modal auto-open thresholds — see §13. |

Neither integration value is a secret: a Formspree form id is a public endpoint by design, and the
Calendly URL is a link people click.

Analytics needs no configuration — the GA property is inline in both `<head>`s.

Leads are read from the **Formspree dashboard**. There is deliberately no database, no CRM and no
admin UI: the point of v1 is to validate the offer before building internal tooling.

---

## 12. `/ux-audit`

A commercial page, not a portfolio page. Same tokens and motion system, tuned denser.

- **Only added colour on the whole site** is four severity tones (`--sev-critical/high/medium/low`
  in `audit.css`), used for severity and nothing else.
- **Every number is sample data** and labelled as such: the hero panel carries a "Sample audit" pill
  and a disclaimer, and the scoring section repeats it. There are **no testimonials, client logos or
  outcome claims anywhere** — none exist yet, so none are shown.
- **Pricing lives only in `PRICING`** (`src/audit/config.js`). Change it there; the cards and the
  note re-render from it. The JSON-LD in `<head>` deliberately does *not* repeat prices, so it can
  never go stale against the config.
- **Funnel events**: `ux_audit_page_view`, `ux_audit_sample_viewed`, `ux_audit_form_started`,
  `ux_audit_form_submitted`, `ux_audit_form_error`, `ux_audit_booking_started`,
  `ux_audit_booking_completed`, `ux_audit_portfolio_clicked`, plus `ux_audit_nav_clicked` /
  `ux_audit_teaser_clicked` from the homepage. Each fires once where firing twice would be wrong.
- **The CTA never opens the calendar directly.** Every "Book a UX audit call" opens the lead modal;
  the Calendly widget — and its script — appear only after a successful submission, so context is
  captured before a slot is taken.
- **Failure behaviour**: a rejected or offline submission keeps every entered value, re-enables the
  button, and offers an email fallback. Duplicate submits are impossible while a request is in
  flight (verified: six rapid submits → one request).


---

## 13. Lead capture

One form, one modal, both pages. `src/lead/` owns all of it; `src/lead/lead.css` is imported from
`form.js` so Vite folds it into whichever page's CSS bundle needs it — no extra request on either.

### The form

Six fields: name, work email, product URL, role, rough scope, and what prompted the review — plus
consent. It was eleven. Company is derived from the work-email domain rather than asked for, and
product type, review areas, timeline and free-text context were all moved to the intro call,
which is what an intro call is for. A first contact should cost under a minute.

Both placements — the modal and the `#enquiry` section on `/ux-audit` — are built from the same
`formMarkup()` template and wired by the same `initLeadForm()`, so they cannot drift apart.

### The custom select

There are **no native `<select>` elements on the site**. `src/core/select.js` implements the APG
listbox pattern: focus stays on the list, the active option is tracked with `aria-activedescendant`,
arrow keys / Home / End / Escape / type-ahead all behave as a native select does, and the value is
mirrored into a hidden input so `FormData` and validation work unchanged. A native control renders
OS chrome that ignores every token on the page — on a site whose argument is interface craft, it was
the one component that couldn't be borrowed.

### Auto-open

Deliberately conservative, and all of it in `AUTO_OPEN` (`src/lead/config.js`). The modal opens on
whichever of these the visitor reaches first:

| Trigger | Threshold | Why |
|---|---|---|
| Dwell | 45s | Common guidance for time-triggered prompts is 30–60s; under ~5s reads as an ambush and measurably depresses conversion. |
| Scroll depth | 55% | The other conventional trigger — it fires on demonstrated interest rather than on arrival. |
| Exit intent | pointer leaves toward browser chrome | Desktop only; there is no equivalent gesture on touch. |

Then it stops asking: dismissing sets a **30-day snooze** in `localStorage`, and the triggers
disarm for the rest of the page view. Nothing covers the page on arrival, which also keeps it clear
of Google's intrusive-interstitial guidance for mobile search landings.

To change the cadence, edit `AUTO_OPEN`. To disable auto-open entirely, set `afterMs` very high and
`afterScroll` above 1 — the CTAs keep working.

### Details worth keeping

- The submit row is **sticky to the bottom of the modal's scroll area**. Six fields don't fit a
  740px laptop, and a conversion form whose only button needs scrolling to find has a hole in it.
- Auto-open focuses the **heading**, not the first input — landing in a text field is disorienting
  when a dialog opened on its own.
- `close()` is not gated on its exit animation; a cancelled or never-settling `finished` would
  otherwise trap the visitor.
- `dialog.lead` sets `margin: auto` explicitly. The global reset's `margin: 0` on `*` overrides the
  UA stylesheet rule that centres a modal dialog, which pins it to the top-left corner.

---

## 14. The Lab has no "Run" button

L·01 previously offered `Run` / `Replay`, which played a scripted sequence lighting five boxes with
numbers hardcoded in the source. Nothing ran, nothing was computed, there was no output — the exact
"decorative animation with no meaning" this site is otherwise built to avoid.

The panels now **disclose rather than perform**. L·01 renders its latency budget immediately, as a
budget. L·03 (prompt diff) and L·04 (generative UI) genuinely switch real content, so they keep
their disclosure. If a future experiment can't produce a real result, it doesn't get a button.


---

## 15. Case studies are routes

Each case study is its own page, not an overlay on the homepage:

| Route | Project |
|---|---|
| `/work/meetaira` | MeetAira |
| `/work/shiprocket-trends` | Shiprocket Trends |
| `/work/shiprocket-copilot` | Shiprocket Copilot |
| `/work/dockyard` | Dockyard |
| `/work/twentytwo` | TwentyTwo |
| `/work/agentic-component-library` | Agentic Component Library |
| `/work/angular-migration-framework` | Angular Migration Framework |
| `/work/live-orders-dashboard` | Live Orders Dashboard |

They used to be `<dialog>`s. A dialog has no history entry, so the browser's Back button — and the
swipe-back gesture on a phone — had nothing to undo and took the visitor off the site entirely. As
pages, Back returns to the homepage at the exact scroll position they left (bfcache), refresh keeps
the case study, links can be shared, and each case study gets its own title, description,
canonical URL and analytics page view. It also took 36 KB of markup out of the homepage.

**Navigation on a case page**
- **All work** is a real link to `/#work`. When the visitor arrived from the homepage in the same
  tab, it calls `history.back()` instead, so they land where they were rather than at the top of Work.
- **Next case study** follows the homepage order and wraps from the last back to the first.
- No lead modal and no auto-open here — interrupting someone mid-read costs more than it earns. The
  nav's UX Audit pill still links to `/ux-audit`.

**Adding a case study**
1. Create `work/<slug>/index.html` — copy an existing one and replace the head metadata, the bar,
   the `<article>` and the next link. Vite picks up every `work/*/index.html` automatically.
2. Link the homepage row's `Case study` button to `/work/<slug>`.
3. Point the previous case study's **Next** link at it, and its own Next at the one after.

**Shared HTML.** The case pages share one head fragment, header and footer via
`<!-- @include /partials/… -->`, inlined by a small `html-includes` plugin in `vite.config.js` in
both dev and build. Edit `partials/site-header.html` once and all eight pages follow. The homepage
still carries its own copy of the nav (its wordmark scrolls to `#top`), so keep the two in step.
A running `vite dev` must be restarted after `vite.config.js` changes — Vite does not reliably pick
up a new plugin in an already-running server, and until it does the includes stay as raw comments.
That's why **stylesheet links are written directly in each case page's `<head>`, never in a
partial**: a missed include then costs the page its nav, not every one of its styles.

**Asset paths stay root-absolute** (`/styles.css`, `/work/case.css`, `/src/case/entry.js`), for the
same reason as `/ux-audit`: the pages are served without a trailing slash.
