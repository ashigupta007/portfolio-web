import { EASE, EASE_INOUT, reduceMotion } from "./motion.js";

/* ------------------------------------------------------------
   Case-study dialogs — WAAPI open/close, scroll lock,
   focus restored to the opener.
   ------------------------------------------------------------ */
export function initDialogs() {
  let opener = null;

  const openDialog = (dialog) => {
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    dialog.querySelector(".cs-scroll")?.scrollTo(0, 0);
    if (!reduceMotion.matches) {
      dialog.animate(
        [
          { opacity: 0, transform: "translateY(28px) scale(0.985)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 550, easing: EASE }
      );
    }
  };

  const closeDialog = (dialog) => {
    const finish = () => {
      dialog.close();
      document.documentElement.style.overflow = "";
      opener?.focus({ preventScroll: true });
      opener = null;
    };
    if (reduceMotion.matches) return finish();
    dialog
      .animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(16px) scale(0.99)" },
        ],
        { duration: 260, easing: EASE_INOUT }
      )
      .finished.then(finish, finish);
  };

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = document.getElementById(btn.dataset.open);
      if (!dialog) return;
      opener = btn;
      openDialog(dialog);
    });
  });

  document.querySelectorAll("dialog.cs").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((btn) =>
      btn.addEventListener("click", () => closeDialog(dialog))
    );
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog(dialog);
    });
  });
}
