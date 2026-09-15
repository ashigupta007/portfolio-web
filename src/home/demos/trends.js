import { addTick, reduceMotion, removeTick, visibleInterval } from "../../core/motion.js";

/* ============================================================
   SHIPROCKET TRENDS — a dashboard that answers questions.

   The motion here is the product: a new interval lands, the
   series slides, the KPI re-reads, and every few cycles the
   conversational layer turns a question into a data view.
   Nothing moves that isn't explaining something.
   ============================================================ */

const SLOT = 26;          // viewBox units between points
const HEIGHT = 68;        // plot baseline, in viewBox units
const AMPLITUDE = 58;     // how much of the plot the series is allowed to use
const WINDOW = 13;        // visible points

const QUESTIONS = [
  { q: "Which city grew fastest this week?", a: "Bengaluru · +34% wk/wk" },
  { q: "Where are RTOs concentrated?", a: "Tier-2 North · 61% of RTO cost" },
  { q: "Which SKU is losing margin?", a: "SKU-4471 · −8.2 pts" },
];

function countTo(el, from, to, ms, format) {
  if (!el) return;
  if (reduceMotion.matches) {
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(from + (to - from) * eased);
    if (p === 1) removeTick(tick);
  };
  addTick(tick);
}

export function initTrendsDemo() {
  const root = document.querySelector("[data-demo='trends']");
  if (!root) return;

  const shift = root.querySelector("[data-trends-shift]");
  const line = root.querySelector("[data-trends-line]");
  const area = root.querySelector("[data-trends-area]");
  const head = root.querySelector("[data-trends-head]");
  const kpiValue = root.querySelector("[data-trends-kpi]");
  const kpiDelta = root.querySelector("[data-trends-delta]");
  const askQ = root.querySelector("[data-trends-question]");
  const askA = root.querySelector("[data-trends-answer]");
  const chips = [...root.querySelectorAll("[data-trends-chip]")];

  // a plausible, gently rising series — seeded, not random, so the
  // first paint is identical for every visitor
  let data = [0.42, 0.38, 0.5, 0.47, 0.58, 0.54, 0.63, 0.6, 0.71, 0.66, 0.74, 0.7, 0.79, 0.76];
  let value = 12.4;
  let cycle = 0;
  let phase = 3.1;

  // one slot of lead-in sits outside the viewBox on the left, so the
  // oldest point is already off-stage when the series slides
  const xAt = (i) => i * SLOT - SLOT;
  const yAt = (v) => HEIGHT - v * AMPLITUDE - 4;

  const render = () => {
    const pts = data.map((v, i) => `${xAt(i)},${yAt(v).toFixed(1)}`).join(" ");
    line?.setAttribute("points", pts);
    area?.setAttribute("points", `${xAt(0)},${HEIGHT} ${pts} ${xAt(data.length - 1)},${HEIGHT}`);
    if (head) {
      head.setAttribute("cx", String(xAt(data.length - 1)));
      head.setAttribute("cy", yAt(data.at(-1)).toFixed(1));
    }
  };

  const slide = () => {
    // next value: a bounded walk, so the chart trends without ever
    // wandering off the plot area
    phase += 0.7;
    const next = Math.min(0.94, Math.max(0.24, data.at(-1) + Math.sin(phase) * 0.13 + 0.015));
    data.push(next);
    render();

    if (shift) {
      shift.style.transition = "none";
      shift.style.transform = "translateX(0)";
      void shift.getBoundingClientRect();
      shift.style.transition = "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)";
      shift.style.transform = `translateX(-${SLOT}px)`;
    }

    setTimeout(() => {
      data = data.slice(-(WINDOW + 1));
      render();
      if (shift) {
        shift.style.transition = "none";
        shift.style.transform = "translateX(0)";
      }
    }, 900);

    const nextValue = Math.max(8, value + (next - 0.5) * 3.4);
    countTo(kpiValue, value, nextValue, 700, (v) => `₹${v.toFixed(1)}L`);
    value = nextValue;

    if (kpiDelta) {
      const up = next >= data.at(-2);
      kpiDelta.textContent = `${up ? "▲" : "▼"} ${(Math.abs(next - data.at(-2)) * 42).toFixed(1)}%`;
      kpiDelta.dataset.dir = up ? "up" : "down";
    }

    cycle += 1;

    if (chips.length) {
      chips.forEach((c, i) => c.classList.toggle("is-on", i === cycle % chips.length));
    }

    // every third interval, the conversational layer takes a turn
    if (cycle % 3 === 0) {
      const item = QUESTIONS[(cycle / 3) % QUESTIONS.length];
      root.classList.remove("is-asking");
      void root.offsetWidth;
      if (askQ) askQ.textContent = item.q;
      if (askA) askA.textContent = item.a;
      root.classList.add("is-asking");
    }
  };

  root.classList.add("is-running");
  render();
  if (askQ) askQ.textContent = QUESTIONS[0].q;
  if (askA) askA.textContent = QUESTIONS[0].a;
  chips[0]?.classList.add("is-on");
  // the conversational layer is the point of this product — it shows from the
  // first frame rather than waiting three intervals for its turn to come round
  root.classList.add("is-asking");

  if (reduceMotion.matches) {
    if (kpiValue) kpiValue.textContent = `₹${value.toFixed(1)}L`;
    return;
  }

  visibleInterval(root, 3200, slide);
}
