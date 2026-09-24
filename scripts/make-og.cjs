/* ============================================================
   SOCIAL PREVIEW IMAGES

   Regenerates public/og/*.png — the cards Twitter, LinkedIn,
   Slack and iMessage show when a page is shared. 1200x630,
   built from the site's own tokens so a shared link looks like
   the site rather than a stock template.

   Run when a page's title or a project's essence changes:

       npm i -D puppeteer-core     # not a project dependency
       node scripts/make-og.cjs .
       npm uninstall puppeteer-core

   Uses the system Chrome, so nothing is downloaded. Editing the
   copy below and re-running is the whole workflow.
   ============================================================ */
const puppeteer = require("puppeteer-core");
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.resolve(process.argv[2] || ".", "public/og");

const CARDS = [
  { file: "home",
    eyebrow: "Product Engineer · Creative Technologist · AI Product Builder",
    title: "Ashish Gupta",
    sub: "Building AI-native products people actually want to use.",
    size: 104 },
  { file: "ux-audit",
    eyebrow: "Independent UX Audit · B2B SaaS",
    title: "Your product has UX problems your team has stopped noticing.",
    sub: "Expert product review plus agentic exploration — a prioritised, evidence-backed backlog.",
    size: 64, badge: "UX AUDIT" },
];

const CASES = [
  ["meetaira", "01", "MeetAira", "A companion that listens, remembers, and speaks — in real time."],
  ["shiprocket-trends", "02", "Shiprocket Trends", "Analytics that answers questions, not just renders charts."],
  ["shiprocket-copilot", "03", "Shiprocket Copilot", "An assistant that does the work, not just answers questions."],
  ["dockyard", "04", "Dockyard", "The platform every AI company builds eventually — built deliberately."],
  ["twentytwo", "05", "TwentyTwo", "A phone agent that recovers revenue while the store sleeps."],
  ["agentic-component-library", "06", "Agentic Component Library", "One design system, two frameworks, zero drift."],
  ["angular-migration-framework", "07", "Angular Migration Framework", "Migrating a decade of enterprise UI without stopping the ship."],
  ["live-orders-dashboard", "08", "Live Orders Dashboard", "Enterprise data with race-day energy."],
];
for (const [slug, n, name, essence] of CASES) {
  CARDS.push({ file: `work-${slug}`, eyebrow: `Case study · ${n} / 08`, title: name, sub: essence, size: 78 });
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const html = (c) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#090909;color:#b9b5ac;
    font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Inter,sans-serif;
    -webkit-font-smoothing:antialiased;position:relative;overflow:hidden}
  .glow{position:absolute;inset:0;
    background:radial-gradient(70% 90% at 82% 8%,rgba(201,176,138,.13),transparent 60%),
               radial-gradient(60% 80% at 8% 100%,rgba(140,150,160,.07),transparent 55%)}
  .frame{position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px}
  .top{display:flex;align-items:center;justify-content:space-between}
  .mark{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:19px;letter-spacing:.24em;
    text-transform:uppercase;color:#f2efe9}
  .mark em{font-style:normal;color:#807c72}
  .badge{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:15px;letter-spacing:.2em;
    text-transform:uppercase;color:#c9b08a;border:1px solid rgba(201,176,138,.4);border-radius:999px;padding:9px 20px}
  .eyebrow{display:flex;align-items:center;gap:20px;font-family:ui-monospace,"SF Mono",Menlo,monospace;
    font-size:17px;letter-spacing:.2em;text-transform:uppercase;color:#8e8a80;margin-bottom:30px}
  .eyebrow::before{content:"";width:46px;height:1px;background:#c9b08a}
  h1{font-size:${c.size}px;line-height:1.03;letter-spacing:-.035em;color:#f2efe9;font-weight:560;max-width:17ch}
  .sub{margin-top:28px;font-size:27px;line-height:1.45;color:#8e8a80;max-width:44ch}
  .bottom{display:flex;align-items:flex-end;justify-content:space-between;
    border-top:1px solid rgba(242,239,233,.1);padding-top:26px}
  .dom{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:17px;letter-spacing:.18em;
    text-transform:uppercase;color:#807c72}
  .dots{display:flex;gap:9px}
  .dots i{width:9px;height:9px;border-radius:50%}
</style></head><body>
  <div class="glow"></div>
  <div class="frame">
    <div class="top">
      <span class="mark">Ashish Gupta <em>— Product Engineer</em></span>
      ${c.badge ? `<span class="badge">${esc(c.badge)}</span>` : ""}
    </div>
    <div>
      <div class="eyebrow">${esc(c.eyebrow)}</div>
      <h1>${esc(c.title)}</h1>
      <p class="sub">${esc(c.sub)}</p>
    </div>
    <div class="bottom">
      <span class="dom">ashish-gupta.com</span>
      <span class="dots">
        <i style="background:#d98d84"></i><i style="background:#d4a256"></i>
        <i style="background:#8fa4b8"></i><i style="background:#c9b08a"></i>
      </span>
    </div>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  for (const card of CARDS) {
    await page.setContent(html(card), { waitUntil: "load" });
    const file = path.join(OUT, `${card.file}.png`);
    await page.screenshot({ path: file, type: "png" });
    console.log(`  ${(fs.statSync(file).size / 1024).toFixed(0).padStart(4)} KB  /og/${card.file}.png`);
  }
  await browser.close();
})();
