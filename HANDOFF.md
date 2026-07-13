# Portfolio — Design System & Developer Handoff

Hand-built site. **Zero runtime dependencies** — no framework, no CSS library, no font requests.
Three source files: `index.html` (content), `styles.css` (design system), `main.js` (motion engine).
Vite is used only as a dev server / bundler (`npm run dev`, `npm run build`); the site also works
opened directly or from any static host.

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
| Hero entrance | Name lines rise from overflow masks; eyebrow/positioning/statement rise + de-blur (6px→0); sculpture scales 0.94→1 | 1.2s, staggered 60/120/420/560/700/1100/1500ms |
| Scroll reveals | `[data-reveal]` rise 30px + de-blur 7px; `[data-reveal="mask"]` clip-path curtain (bottom→up); `[data-reveal="line"]` scaleX; stagger via `--i` × 90ms | 950–1200ms |
| Split headlines | `[data-split]` — JS wraps words in overflow masks, each rises 115%→0, 45ms/word | 900ms |
| Ambient background | Canvas at 1/8 resolution, 3 radial lights (champagne/steel/deep-warm ≤ 5.5% alpha) drifting on sine paths | ~30fps, period minutes |
| Grain | Static SVG turbulence tile, `mix-blend: overlay`, opacity 0.05, above all content | none (static by design) |
| Hero sculpture | Geodesic icosahedron (42 verts / 120 edges) + counter-rotating champagne octahedron core; depth-fogged lines; pointer tilt (lerp 0.04); pauses offscreen | ry += 0.0022/frame |
| Navigation | Blur+border after 24px; hides after 160px scrolling down, returns on any up-scroll | 600ms ease-out |
| Work figures | SVG art scales 1.02→1.06 on row hover; title shifts 6px; per-project looped micro-motion (dash flow, pulse, drift) paused offscreen via IO | 1.4s hover |
| Case studies | `<dialog>` — WAAPI: rise 28px + scale 0.985→1 / 550ms in, 260ms out; backdrop blur 10px; scroll locked; focus returned to opener | 550/260ms |
| Philosophy | Sticky-stacked full-height statements; previous panel fades to 0 and recedes (scale 0.96, −24px) as next covers it | scroll-linked |
| Timeline | Section pins; scroll drives track horizontally (1px scroll = 1px translate); progress hairline fills. Touch/small/reduced → native horizontal scroll + snap | scroll-linked |
| Magnetic buttons | Pills lerp toward cursor (max 10px, factor 0.28, lerp 0.18), spring home on leave. Pointer-fine only | rAF |

**Reduced motion:** every transition/animation collapses to instant; canvases render a single
static frame; timeline becomes a native scroller; philosophy unstacks; dialogs cut. Fully readable.

**Performance rules encoded:** transforms + opacity only (no layout properties animated); one shared
rAF loop that self-suspends when no system is active; IntersectionObserver gates all offscreen work;
scroll listener is passive and only stores a number.

---

## 3. Component inventory

| Component | Location | Notes |
|---|---|---|
| `.site-nav` / `.menu` | header + dialog | hide/reveal logic in `initNav`, mobile takeover in `initMenu` |
| Hero (`.hero-*`) | §hero | name masks, meta `dl`, `#sculpture` canvas |
| `.work-row` | ×8 | figure (SVG art) + body; even rows flip columns |
| `dialog.cs` | ×8 | case study template: topbar / title / lede / meta-grid / numbered sections / diagram / code / stats / lessons |
| `.cs-diagram` + `.dgm` | 4 flagships | inline SVG architecture diagrams, animated flow dashes |
| `.code` | MeetAira, Copilot | hand-tinted snippets (`.c .k .s .f` spans) |
| `.phil-panel` | ×6 | sticky cinematic statements |
| `.timeline-*` | experience | pinned horizontal band, 8 milestones |
| `.stat` | exp + case studies | hairline-top number blocks |
| `.eco` | ×4 | capability ecosystems (no skill bars, ever) |
| `.lab-item` | ×6 | experiment ledger with status pills |
| `.btn-pill` / `.cs-open` | contact + work | magnetic pills |

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

**Hero 3D (if upgrading canvas → real 3D):** "Floating architectural lattice sculpture — geodesic
wireframe in soft white light with a warm metallic core, slowly rotating, black void, no robot, no
face, museum-piece minimalism." Keep triangle count trivial; the current 2D-canvas projection is
the performance-safe default.

Replacement rule: keep every image ≤ 200KB AVIF/WebP, `loading="lazy"`, explicit aspect-ratio box
(`.figure-frame` already reserves 16/10 — zero CLS).

---

## 5. Responsive rules

- **≥1000px** — full editorial: 2-col hero, alternating work rows, pinned timeline.
- **760–999px** — sculpture moves above the name (smaller); work rows stack (figure first); nav links remain.
- **<760px** — `Menu` button + full-screen dialog nav; timeline switches to native horizontal scroll with snap; contact pills go 2-up.
- Typography is fluid everywhere (`clamp`) — there are no fixed-size headings to break.
- Horizontal-scroll surfaces (`.cs-diagram`, `.code`) scroll inside their own container; the page never scrolls sideways.

## 6. Accessibility

- Semantic landmarks (`header/nav/main/section/footer`), one `h1`, ordered headings.
- Skip link → `#main`. Native `<dialog>` = real focus trap + `Esc`; focus returns to the opener.
- All text ≥ AA on `#090909` (see token table); `--ink-4` reserved for decorative labels.
- `:focus-visible` ring in champagne on every interactive element.
- Full `prefers-reduced-motion` treatment (see §2).
- Decorative SVGs are `aria-hidden`; architecture diagrams have `role="img"` + descriptive labels.

## 7. Performance budget

**Verified Lighthouse (throttled mobile emulation, `vite preview`):
Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100 — LCP 1.1s, TBT 0ms, CLS 0.**

Measured on `npm run build` (Vite): **HTML 19.9KB gz · CSS 6.3KB gz · JS 3.8KB gz ≈ 30KB total.**
No fonts, no images, no third-party requests except the pre-existing Google Analytics tag
(remove the `gtag` block in `index.html` `<head>` if you want a perfect network panel).
No layout shift: every async visual lives in a fixed-aspect box.

## 8. Content to verify before publishing (personal claims)

These came from the brief + the previous site; confirm or edit in `index.html`:

- Timeline years (2019 start, role dates 2022–present, MeetAira 2024–25, TwentyTwo 2025–26)
- "Senior Product Engineer, AI — Shiprocket" title wording
- Impact numbers: ~80% (Trends), 10K+ queries/mo (Copilot), 70% tool-resolution, top-5 hackathon
- Resume Google Drive link + Calendly link (carried over from the old site)

## 9. Repo cleanup (optional, safe)

The Bolt/React scaffold is no longer referenced by the build:

```
rm -rf src tailwind.config.js postcss.config.js
npm uninstall react react-dom framer-motion lucide-react tailwindcss autoprefixer postcss @vitejs/plugin-react @types/react @types/react-dom eslint-plugin-react-hooks eslint-plugin-react-refresh
```

Also `vite.config.ts` can drop the React plugin. None of this is required — the build ignores them.
