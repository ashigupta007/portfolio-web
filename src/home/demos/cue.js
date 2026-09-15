import { reduceMotion, whenVisible } from "../../core/motion.js";

/**
 * A tiny scripted-timeline runner for the product demos.
 *
 * Demos are choreography, not physics — they change state a handful of
 * times over several seconds. Timers express that far more honestly than
 * a per-frame loop, and cost nothing between cues.
 *
 * @param {{at: number, run: () => void}[]} cues  sorted by `at` (ms)
 * @param {number} loopAt  restart the sequence at this offset; 0 = play once
 */
export function createCueList(cues, loopAt = 0) {
  let timers = [];
  let playing = false;

  const stop = () => {
    playing = false;
    timers.forEach(clearTimeout);
    timers = [];
  };

  const play = () => {
    stop();
    playing = true;
    timers = cues.map((cue) => setTimeout(cue.run, cue.at));
    if (loopAt > 0) timers.push(setTimeout(play, loopAt));
  };

  return { play, stop, get playing() { return playing; } };
}

/**
 * Play a cue list while its element is on screen; stop the moment it
 * leaves. Under reduced motion the demo is snapped to its resolved state
 * once and never animates.
 *
 * @param {Element} el
 * @param {{at: number, run: () => void}[]} cues
 * @param {number} loopAt
 * @param {() => void} [settle]  final, motionless state for reduced motion
 */
export function playWhileVisible(el, cues, loopAt, settle) {
  if (!el) return null;

  if (reduceMotion.matches) {
    (settle ?? (() => cues.forEach((c) => c.run())))();
    return null;
  }

  const list = createCueList(cues, loopAt);
  whenVisible(el, () => { if (!list.playing) list.play(); }, () => list.stop(), {
    threshold: 0.25,
  });
  return list;
}
