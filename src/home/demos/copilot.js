import { playWhileVisible } from "./cue.js";

/* ============================================================
   SHIPROCKET COPILOT — agentic UI, shown as a trace.

   request → reasoning → tool call → structured result →
   an actual action taken inside the application.

   The last step is the one that matters: the assistant does
   the work, it doesn't just describe it.
   ============================================================ */

export function initCopilotDemo() {
  const root = document.querySelector("[data-demo='copilot']");
  if (!root) return;

  const steps = [...root.querySelectorAll("[data-trace-step]")];
  const rows = [...root.querySelectorAll("[data-trace-row]")];
  const toolStatus = root.querySelector("[data-trace-tool-status]");
  const toolTime = root.querySelector("[data-trace-tool-time]");

  root.classList.add("is-running");

  const show = (name) =>
    steps.find((s) => s.dataset.traceStep === name)?.classList.add("is-in");

  const reset = () => {
    steps.forEach((s) => s.classList.remove("is-in"));
    rows.forEach((r) => r.classList.remove("is-in"));
    root.dataset.toolState = "idle";
    if (toolStatus) toolStatus.textContent = "calling";
    if (toolTime) toolTime.textContent = "";
  };

  const cues = [
    { at: 0,    run: reset },
    { at: 400,  run: () => show("request") },
    { at: 1300, run: () => show("reason") },
    { at: 2200, run: () => { show("tool"); root.dataset.toolState = "running"; } },
    { at: 3500, run: () => {
        root.dataset.toolState = "done";
        if (toolStatus) toolStatus.textContent = "200 OK";
        if (toolTime) toolTime.textContent = "128 ms";
      } },
    { at: 3900, run: () => show("result") },
    ...[0, 1, 2].map((i) => ({
      at: 4200 + i * 220,
      run: () => rows[i]?.classList.add("is-in"),
    })),
    { at: 5600, run: () => show("action") },
    { at: 6600, run: () => show("summary") },
  ];

  const settle = () => {
    steps.forEach((s) => s.classList.add("is-in"));
    rows.forEach((r) => r.classList.add("is-in"));
    root.dataset.toolState = "done";
    if (toolStatus) toolStatus.textContent = "200 OK";
    if (toolTime) toolTime.textContent = "128 ms";
  };

  // plays once per viewport entry and stays complete. A transcript that wiped
  // itself every twelve seconds would read as a glitch, not a demonstration.
  playWhileVisible(root, cues, 0, settle);
}
