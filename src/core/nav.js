import { addTick, reduceMotion, view } from "./motion.js";

/* ------------------------------------------------------------
   Navigation — condenses on scroll, hides going down,
   returns going up. Never hides near the top.
   ------------------------------------------------------------ */
export function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  let lastY = view.scrollY;
  let hidden = false;
  let scrolled = false;

  addTick(() => {
    const y = view.scrollY;
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
export function initMenu() {
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
