import { reduceMotion, visibleInterval } from "../../core/motion.js";

/* ============================================================
   LIVE ORDERS — MotoGP timing, applied to order data.

   Order on the board is derived from the numbers, never faked:
   values move, the board re-sorts, and the rows that changed
   place are animated with a real FLIP. The position change is
   the content here, so this demo is allowed more energy than
   anything else on the page.
   ============================================================ */

export function initLiveOrdersDemo() {
  const root = document.querySelector("[data-demo='liveorders']");
  const list = root?.querySelector("[data-board]");
  if (!root || !list) return;

  const rowsOf = () => [...list.children];
  const valueOf = (row) => Number(row.dataset.value) || 0;

  const paint = () => {
    const rows = rowsOf();
    const max = Math.max(...rows.map(valueOf), 1);
    rows.forEach((row, i) => {
      const pos = row.querySelector("[data-board-pos]");
      if (pos) pos.textContent = String(i + 1).padStart(2, "0");
      const value = row.querySelector("[data-board-value]");
      if (value) value.textContent = valueOf(row).toLocaleString("en-IN");
      const track = row.querySelector("[data-board-track]");
      if (track) track.style.setProperty("--w", `${Math.round((valueOf(row) / max) * 100)}%`);
    });
  };

  paint();
  if (reduceMotion.matches) return;

  const step = () => {
    const rows = rowsOf();
    const before = new Map(rows.map((r, i) => [r, { top: r.getBoundingClientRect().top, rank: i }]));

    // each city takes on new orders; the leader gains a little slower,
    // which is what keeps the board changing hands
    rows.forEach((row, i) => {
      const gain = Math.round((6 + Math.random() * 34) * (i === 0 ? 0.55 : 1));
      row.dataset.value = String(valueOf(row) + gain);
    });

    const sorted = [...rows].sort((a, b) => valueOf(b) - valueOf(a));

    // if nobody actually changed place, give second place the push it
    // needs — a board that never moves isn't demonstrating anything
    if (sorted.every((row, i) => row === rows[i]) && rows.length > 1) {
      rows[1].dataset.value = String(valueOf(rows[0]) + 12);
      sorted.sort((a, b) => valueOf(b) - valueOf(a));
    }

    sorted.forEach((row) => list.append(row));
    paint();

    for (const row of sorted) {
      const prev = before.get(row);
      const delta = prev.top - row.getBoundingClientRect().top;
      if (delta) {
        row.animate(
          [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
          { duration: 620, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
      }
      const now = sorted.indexOf(row);
      if (now < prev.rank) row.classList.add("is-gaining");
      else if (now > prev.rank) row.classList.add("is-losing");
    }

    setTimeout(
      () => sorted.forEach((r) => r.classList.remove("is-gaining", "is-losing")),
      1400
    );
  };

  visibleInterval(root, 2800, step);
}
