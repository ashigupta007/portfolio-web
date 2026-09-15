import { playWhileVisible } from "./cue.js";

/* ============================================================
   MEETAIRA — a companion, demonstrated rather than described.

   One exchange, on a phone: the character wakes, a message
   arrives, the voice engine listens, thinks, then speaks back.
   No audio is ever played.
   ============================================================ */

export function initMeetAiraDemo() {
  const root = document.querySelector("[data-demo='meetaira']");
  if (!root) return;

  const face = root.querySelector("[data-aira-face]");
  const wave = root.querySelector("[data-aira-wave]");
  const stateEl = root.querySelector("[data-aira-state]");
  const userMsg = root.querySelector("[data-aira-msg='user']");
  const botMsg = root.querySelector("[data-aira-msg='bot']");
  const mood = root.querySelector("[data-aira-mood]");

  // the script now owns the choreography; CSS shows a resolved
  // conversation until this lands
  root.classList.add("is-running");

  const setState = (label, tone) => {
    if (stateEl) stateEl.textContent = label;
    root.dataset.airaTone = tone;
  };

  const reset = () => {
    face?.classList.remove("is-awake");
    wave?.classList.remove("is-live", "is-speaking");
    userMsg?.classList.remove("is-in");
    botMsg?.classList.remove("is-in");
    if (mood) mood.textContent = "calm";
    setState("Idle", "idle");
  };

  const cues = [
    { at: 0,    run: reset },
    { at: 160,  run: () => face?.classList.add("is-awake") },
    { at: 620,  run: () => userMsg?.classList.add("is-in") },
    { at: 1750, run: () => { setState("Listening", "listen"); wave?.classList.add("is-live"); } },
    { at: 3300, run: () => { setState("Thinking", "think"); wave?.classList.remove("is-live"); } },
    { at: 4100, run: () => {
        setState("Speaking", "speak");
        wave?.classList.add("is-live", "is-speaking");
        if (mood) mood.textContent = "warm";
      } },
    { at: 4350, run: () => botMsg?.classList.add("is-in") },
    { at: 7100, run: () => { setState("Listening", "listen"); wave?.classList.remove("is-speaking"); } },
    { at: 9000, run: () => { setState("Idle", "idle"); wave?.classList.remove("is-live"); } },
  ];

  // reduced motion: show the conversation resolved and still
  const settle = () => {
    face?.classList.add("is-awake");
    userMsg?.classList.add("is-in");
    botMsg?.classList.add("is-in");
    if (mood) mood.textContent = "warm";
    setState("Speaking", "speak");
  };

  playWhileVisible(root, cues, 11000, settle);
}
