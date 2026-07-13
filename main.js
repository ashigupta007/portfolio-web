/* ============================================================
   ASHISH GUPTA — PORTFOLIO MOTION ENGINE
   Zero dependencies. One rAF loop. GPU transforms only.
   Everything respects prefers-reduced-motion.
   ============================================================ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------
   rAF hub — every animated system registers one tick function.
   Systems flag themselves inactive when offscreen; the loop
   costs nothing when nothing is visible.
   ------------------------------------------------------------ */
const ticks = new Set();
let rafId = null;

function loop(now) {
  for (const t of ticks) t(now);
  rafId = ticks.size ? requestAnimationFrame(loop) : null;
}
function addTick(fn) {
  ticks.add(fn);
  if (rafId === null) rafId = requestAnimationFrame(loop);
}
function removeTick(fn) {
  ticks.delete(fn);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  } else if (!document.hidden && ticks.size && rafId === null) {
    rafId = requestAnimationFrame(loop);
  }
});

/* ------------------------------------------------------------
   Scroll state — one passive listener, read by all systems.
   ------------------------------------------------------------ */
let scrollY = window.scrollY;
let viewportH = window.innerHeight;

window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
window.addEventListener("resize", () => { viewportH = window.innerHeight; }, { passive: true });

/* ------------------------------------------------------------
   Split text — words rise out of overflow masks.
   Elements (e.g. serif accents) are treated as single words.
   ------------------------------------------------------------ */
function splitText(el) {
  const nodes = [...el.childNodes];
  el.textContent = "";
  let wordIndex = 0;

  const wrap = (content) => {
    const mask = document.createElement("span");
    mask.className = "sw-mask";
    const word = document.createElement("span");
    word.className = "sw";
    word.style.setProperty("--wi", wordIndex++);
    word.append(content);
    mask.append(word);
    return mask;
  };

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) el.append(" ");
        else el.append(wrap(part));
      }
    } else {
      el.append(wrap(node));
    }
  }
}

/* ------------------------------------------------------------
   Reveal system — IntersectionObserver adds .in-view once.
   ------------------------------------------------------------ */
function initReveals() {
  const targets = document.querySelectorAll("[data-reveal], [data-split]");
  if (reduceMotion.matches) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  document.querySelectorAll("[data-split]").forEach(splitText);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
  );
  targets.forEach((el) => io.observe(el));

  // pause decorative SVG animation while its frame is offscreen
  const frames = document.querySelectorAll(".figure-frame");
  const frameIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle("is-visible", e.isIntersecting);
    },
    { rootMargin: "10% 0px" }
  );
  frames.forEach((f) => frameIO.observe(f));
}

/* ------------------------------------------------------------
   Navigation — condenses on scroll, hides going down,
   returns going up. Never hides near the top.
   ------------------------------------------------------------ */
function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  let lastY = scrollY;
  let hidden = false;
  let scrolled = false;

  addTick(() => {
    const y = scrollY;
    const wantScrolled = y > 24;
    if (wantScrolled !== scrolled) {
      scrolled = wantScrolled;
      nav.classList.toggle("is-scrolled", scrolled);
    }
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (y > 160 && goingDown && !hidden) {
      hidden = true;
      nav.classList.add("is-hidden");
    } else if ((goingUp || y <= 160) && hidden) {
      hidden = false;
      nav.classList.remove("is-hidden");
    }
    if (goingDown || goingUp) lastY = y;
  });
}

/* ------------------------------------------------------------
   Mobile menu — dialog takeover with staggered links.
   ------------------------------------------------------------ */
function initMenu() {
  const menu = document.getElementById("menu");
  const openBtn = document.getElementById("menu-open");
  const closeBtn = document.getElementById("menu-close");
  if (!menu || !openBtn) return;

  const links = menu.querySelectorAll(".menu-link");

  openBtn.addEventListener("click", () => {
    menu.showModal();
    if (reduceMotion.matches) return;
    // restart the stagger: force hidden start state, then release
    links.forEach((l) => {
      l.style.transition = "none";
      l.style.transform = "translateY(40px)";
      l.style.opacity = "0";
    });
    void menu.offsetHeight;
    links.forEach((l) => {
      l.style.transition = "";
      l.style.transform = "";
      l.style.opacity = "";
    });
  });

  const close = () => menu.close();
  closeBtn?.addEventListener("click", close);
  links.forEach((l) => l.addEventListener("click", close));
  menu.addEventListener("click", (e) => { if (e.target === menu) close(); });
}

/* ------------------------------------------------------------
   Case-study dialogs — WAAPI open/close, scroll lock,
   focus restored to the opener.
   ------------------------------------------------------------ */
function initDialogs() {
  let opener = null;

  const openDialog = (dialog) => {
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    dialog.querySelector(".cs-scroll")?.scrollTo(0, 0);
    if (!reduceMotion.matches) {
      dialog.animate(
        [
          { opacity: 0, transform: "translateY(28px) scale(0.985)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 550, easing: EASE }
      );
    }
  };

  const closeDialog = (dialog) => {
    const finish = () => {
      dialog.close();
      document.documentElement.style.overflow = "";
      opener?.focus({ preventScroll: true });
      opener = null;
    };
    if (reduceMotion.matches) return finish();
    dialog
      .animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(16px) scale(0.99)" },
        ],
        { duration: 260, easing: "cubic-bezier(0.65, 0, 0.35, 1)" }
      )
      .finished.then(finish, finish);
  };

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = document.getElementById(btn.dataset.open);
      if (!dialog) return;
      opener = btn;
      openDialog(dialog);
    });
  });

  document.querySelectorAll("dialog.cs").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((btn) =>
      btn.addEventListener("click", () => closeDialog(dialog))
    );
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog(dialog);
    });
  });
}

/* ------------------------------------------------------------
   Magnetic buttons — pull toward the cursor, spring home.
   ------------------------------------------------------------ */
function initMagnetic() {
  if (reduceMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;

    const tick = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        el.style.transform = "";
        removeTick(tick);
      }
    };

    el.addEventListener("pointerenter", () => {
      active = true;
      addTick(tick);
    });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.28, -10, 10);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.28, -8, 8);
    });
    el.addEventListener("pointerleave", () => {
      active = false;
      tx = 0;
      ty = 0;
    });
  });
}

/* ------------------------------------------------------------
   Ambient background — three lights drifting almost
   imperceptibly. Rendered at 1/8 resolution, ~30fps.
   ------------------------------------------------------------ */
function initAmbient() {
  const canvas = document.getElementById("ambient");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0;

  const size = () => {
    w = canvas.width = Math.max(160, Math.floor(window.innerWidth / 8));
    h = canvas.height = Math.max(90, Math.floor(window.innerHeight / 8));
  };
  size();
  window.addEventListener("resize", size, { passive: true });

  const lights = [
    { c: "201, 176, 138", a: 0.055, r: 0.75, fx: 0.11, fy: 0.07, px: 0.28, py: 0.26 },
    { c: "142, 152, 164", a: 0.045, r: 0.85, fx: 0.07, fy: 0.09, px: 0.74, py: 0.66 },
    { c: "120, 96, 66",  a: 0.038, r: 0.95, fx: 0.05, fy: 0.04, px: 0.5,  py: 0.95 },
  ];

  const paint = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const L of lights) {
      const x = (L.px + Math.sin(t * L.fx) * 0.14) * w;
      const y = (L.py + Math.cos(t * L.fy) * 0.12) * h;
      const r = L.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${L.c}, ${L.a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  };

  if (reduceMotion.matches) {
    paint(2);
    return;
  }

  let last = 0;
  addTick((now) => {
    if (now - last < 33) return; // ~30fps is plenty for fog
    last = now;
    paint(now / 4000);
  });
}

/* ------------------------------------------------------------
   Hero sculpture — a geodesic lattice with a counter-rotating
   core. Line opacity falls with depth (fog). Tilts toward the
   pointer. Pauses when the hero leaves the viewport.
   ------------------------------------------------------------ */
function initSculpture() {
  const canvas = document.getElementById("sculpture");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let size = 0;

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    size = Math.floor(rect.width);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* icosahedron, subdivided once onto the unit sphere */
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalize);

  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  function normalize(v) {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  // one subdivision pass: 12 → 42 vertices, 80 faces
  const midCache = new Map();
  const midpoint = (a, b) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (midCache.has(key)) return midCache.get(key);
    const m = normalize([
      (verts[a][0] + verts[b][0]) / 2,
      (verts[a][1] + verts[b][1]) / 2,
      (verts[a][2] + verts[b][2]) / 2,
    ]);
    verts.push(m);
    const idx = verts.length - 1;
    midCache.set(key, idx);
    return idx;
  };
  const newFaces = [];
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
    newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  faces = newFaces;

  const edgeSet = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const [p, q] of [[a, b], [b, c], [c, a]]) {
      const key = p < q ? `${p}-${q}` : `${q}-${p}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([p, q]);
      }
    }
  }

  /* inner core: octahedron */
  const coreVerts = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];
  const coreEdges = [
    [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 4], [2, 5], [3, 4], [3, 5],
  ];

  let ry = 0;
  let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;

  const rotate = ([x, y, z], rx, ryy) => {
    // around Y
    let c = Math.cos(ryy), s = Math.sin(ryy);
    let x1 = x * c + z * s, z1 = -x * s + z * c;
    // around X
    c = Math.cos(rx); s = Math.sin(rx);
    const y1 = y * c - z1 * s, z2 = y * s + z1 * c;
    return [x1, y1, z2];
  };

  const project = ([x, y, z], scale) => {
    const f = 2.6 / (2.6 + z);
    return [size / 2 + x * scale * f, size / 2 + y * scale * f, z];
  };

  const drawFrame = () => {
    ctx.clearRect(0, 0, size, size);
    const scale = size * 0.34;
    const rx = 0.35 + tiltX + Math.sin(ry * 0.6) * 0.06;

    // outer lattice
    const pts = verts.map((v) => project(rotate(v, rx, ry + tiltY), scale));
    ctx.lineWidth = 1;
    for (const [a, b] of edges) {
      const pa = pts[a], pb = pts[b];
      const depth = (pa[2] + pb[2]) / 2;             // -1 near … 1 far
      const alpha = 0.05 + (1 - (depth + 1) / 2) * 0.30;
      ctx.strokeStyle = `rgba(242, 239, 233, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }
    for (const p of pts) {
      const alpha = 0.15 + (1 - (p[2] + 1) / 2) * 0.5;
      ctx.fillStyle = `rgba(242, 239, 233, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // counter-rotating warm core
    const corePts = coreVerts.map((v) =>
      project(rotate(v, -rx * 0.7, -ry * 1.6), scale * 0.42)
    );
    for (const [a, b] of coreEdges) {
      const pa = corePts[a], pb = corePts[b];
      const depth = (pa[2] + pb[2]) / 2;
      const alpha = 0.08 + (1 - (depth + 1) / 2) * 0.45;
      ctx.strokeStyle = `rgba(201, 176, 138, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }
  };

  if (reduceMotion.matches) {
    ry = 0.8;
    drawFrame();
    return;
  }

  const tick = () => {
    ry += 0.0022;
    tiltX = lerp(tiltX, targetTiltX, 0.04);
    tiltY = lerp(tiltY, targetTiltY, 0.04);
    drawFrame();
  };

  // rotate only while the hero is on screen
  const hero = document.querySelector(".hero");
  const io = new IntersectionObserver(
    ([e]) => (e.isIntersecting ? addTick(tick) : removeTick(tick)),
    { threshold: 0 }
  );
  io.observe(hero);

  if (window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const nyv = e.clientY / viewportH - 0.5;
      targetTiltY = nx * 0.5;
      targetTiltX = nyv * 0.35;
    });
    hero.addEventListener("pointerleave", () => {
      targetTiltX = 0;
      targetTiltY = 0;
    });
  }
}

/* ------------------------------------------------------------
   Horizontal timeline — scroll pins the section and drives
   the track sideways. Falls back to native horizontal scroll
   on touch, small screens, and reduced motion.
   ------------------------------------------------------------ */
function initTimeline() {
  const outer = document.getElementById("timeline-outer");
  const track = document.getElementById("timeline-track");
  const progress = document.getElementById("tl-progress");
  if (!outer || !track) return;

  const wantsStatic = () =>
    reduceMotion.matches ||
    window.innerWidth < 900 ||
    !window.matchMedia("(pointer: fine)").matches;

  let distance = 0;
  let staticMode = false;

  const layout = () => {
    staticMode = wantsStatic();
    outer.classList.toggle("is-static", staticMode);
    if (staticMode) {
      outer.style.height = "";
      track.style.transform = "";
      return;
    }
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    outer.style.height = `${viewportH + distance}px`;
  };
  layout();
  window.addEventListener("resize", layout, { passive: true });

  let lastP = -1;
  const tick = () => {
    if (staticMode || distance === 0) return;
    const top = outer.getBoundingClientRect().top;
    const p = clamp(-top / distance, 0, 1);
    if (Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
    if (progress) progress.style.width = `${(p * 100).toFixed(2)}%`;
  };

  // tick only while the pinned section is on screen
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? addTick(tick) : removeTick(tick))
  ).observe(outer);
}

/* ------------------------------------------------------------
   Philosophy stack — as the next statement arrives, the
   previous one recedes: fades and settles back in depth.
   ------------------------------------------------------------ */
function initPhilosophy() {
  if (reduceMotion.matches) return;
  const stack = document.querySelector(".phil-stack");
  const panels = [...document.querySelectorAll(".phil-panel")];
  if (!stack || panels.length < 2) return;

  const tick = () => {
    for (let i = 0; i < panels.length - 1; i++) {
      const nextTop = panels[i + 1].getBoundingClientRect().top;
      if (nextTop > viewportH || nextTop < -viewportH) continue;
      const p = clamp(1 - nextTop / viewportH, 0, 1);
      const inner = panels[i].firstElementChild;
      inner.style.opacity = clamp(1 - p * 1.25, 0, 1).toFixed(3);
      inner.style.transform = `scale(${(1 - 0.04 * p).toFixed(4)}) translateY(${(-24 * p).toFixed(1)}px)`;
    }
  };

  // tick only while the stack is on screen
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? addTick(tick) : removeTick(tick))
  ).observe(stack);
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  initReveals();
  initNav();
  initMenu();
  initDialogs();
  initTimeline();
  initPhilosophy();

  // hero entrance — after first paint so the masks animate
  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.body.classList.add("is-loaded"))
  );

  // atmosphere starts off the critical path; the hero canvas only
  // becomes visible at +700ms, so a ~300ms deferral is invisible
  const whenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  whenIdle(() => {
    initAmbient();
    initSculpture();
    initMagnetic();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
