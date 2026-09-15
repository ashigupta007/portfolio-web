/* ============================================================
   LAB — three of the six entries open into something real.

   Each panel initialises the first time it is opened, so an
   unopened experiment costs nothing at all.

   Deliberately no "Run" button: none of these executes anything,
   and an affordance that promises a result it can't produce is
   worse than no affordance. They disclose; they don't perform.
   ============================================================ */

/* ---- L·01 — sub-second voice turn-taking -------------------
   A latency budget, shown as a budget. There is nothing here to
   "run": the numbers are the pipeline's design targets, so
   animating them into place would be theatre pretending to be
   measurement. It just renders. ---- */
function voiceExperiment(panel) {
  const stages = [...panel.querySelectorAll("[data-voice-stage]")];
  const budget = [120, 190, 310, 170, 90]; // endpoint · STT · model · TTS · audio out

  stages.forEach((stage, i) => {
    stage.classList.add("is-on");
    const value = stage.querySelector("[data-voice-ms]");
    if (value) value.textContent = `+${budget[i]} ms`;
  });
}

/* ---- L·04 — generative UI ---------------------------------- */
function generativeUiExperiment(panel) {
  const options = [...panel.querySelectorAll("[data-gen-mode]")];
  const views = [...panel.querySelectorAll("[data-gen-view]")];
  const echo = panel.querySelector("[data-gen-echo]");
  if (!options.length) return;

  const PROMPTS = {
    table: "list last week's returns by city",
    chart: "chart returns by city",
    summary: "summarise what changed and why",
  };

  const select = (mode) => {
    options.forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.genMode === mode)));
    views.forEach((v) => { v.hidden = v.dataset.genView !== mode; });
    if (echo) echo.textContent = PROMPTS[mode] ?? "";
    panel.dataset.genMode = mode;
  };

  options.forEach((o) => o.addEventListener("click", () => select(o.dataset.genMode)));
  select("table");
}

/* ---- L·03 — prompt diff ------------------------------------ */
function promptDiffExperiment(panel) {
  const versions = [...panel.querySelectorAll("[data-diff-version]")];
  const outputs = [...panel.querySelectorAll("[data-diff-output]")];
  if (!versions.length) return;

  const select = (v) => {
    versions.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.diffVersion === v)));
    outputs.forEach((o) => { o.hidden = o.dataset.diffOutput !== v; });
    panel.dataset.diffVersion = v;
  };

  versions.forEach((b) => b.addEventListener("click", () => select(b.dataset.diffVersion)));
  select("v2");
}

const EXPERIMENTS = {
  voice: voiceExperiment,
  "generative-ui": generativeUiExperiment,
  "prompt-diff": promptDiffExperiment,
};

export function initLab() {
  document.querySelectorAll("[data-lab-toggle]").forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;
    let started = false;

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      toggle.querySelector("[data-lab-toggle-label]")?.replaceChildren(
        document.createTextNode(open ? "Open" : "Close")
      );
      if (!open && !started) {
        started = true;
        EXPERIMENTS[panel.dataset.experiment]?.(panel);
      }
    });
  });
}
