import { reduceMotion } from "./motion.js";

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
export function initReveals() {
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
