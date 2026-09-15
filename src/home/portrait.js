/* ------------------------------------------------------------
   Portrait slot.

   The layout is built around a real photograph at
   /portrait.jpg. Until one is dropped in, the frame holds a
   composed typographic plate — deliberate, not unfinished, and
   with no broken-image flash on the way there. Nothing here
   fabricates a likeness.
   ------------------------------------------------------------ */
export function initPortrait() {
  const figure = document.querySelector("[data-portrait]");
  const img = figure?.querySelector("img");
  if (!figure || !img) return;

  const reveal = () => figure.classList.add("has-image");

  if (img.complete) {
    if (img.naturalWidth) reveal();
  } else {
    img.addEventListener("load", reveal, { once: true });
  }
}
