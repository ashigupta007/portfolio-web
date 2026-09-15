import { AUTO_OPEN } from "./config.js";
import { formMarkup, initLeadForm } from "./form.js";
import { bookingMarkup } from "./booking.js";
import { EASE, EASE_INOUT, reduceMotion } from "../core/motion.js";
import { track } from "../core/analytics.js";

/* ============================================================
   LEAD MODAL

   One dialog, both pages. Opened by any [data-open-lead], and
   once per visitor by the auto-open rules in config — which are
   engagement gates, not a timer that fires at people who just
   arrived.
   ============================================================ */

let dialog = null;
let opened = false;

function build() {
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.className = "lead";
  dialog.id = "lead-modal";
  dialog.setAttribute("aria-labelledby", "lead-title");
  dialog.dataset.leadScope = "";
  dialog.innerHTML = `
    <div class="lead-inner">
      <button type="button" class="lead-close" data-lead-close aria-label="Close">
        <span aria-hidden="true">Close</span>
      </button>

      <div class="lead-body" data-lead-body>
        <p class="eyebrow">UX Audit · intro call</p>
        <h2 class="lead-title" id="lead-title">Let's look at your product.</h2>
        <p class="lead-sub">
          Six questions, under a minute. Then you'll pick a time — and the call opens with your
          product rather than with introductions.
        </p>
        ${formMarkup("lead-modal-form")}
      </div>

      <div class="lead-done" data-lead-done hidden tabindex="-1">
        <p class="eyebrow">Received</p>
        <h2 class="lead-title">Thanks — I've got the context.</h2>
        <p class="lead-sub">I'll read it before we speak. Now choose a time for the intro call.</p>
        ${bookingMarkup()}
      </div>
    </div>`;

  document.body.append(dialog);

  const form = dialog.querySelector("form");
  form.dataset.leadSource = "modal";
  initLeadForm(form, () => {
    dialog.querySelector("[data-lead-body]").hidden = true;
    const done = dialog.querySelector("[data-lead-done]");
    done.hidden = false;
    done.focus();
    dialog.classList.add("is-done");
  });

  dialog.querySelector("[data-lead-close]").addEventListener("click", () => close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });

  return dialog;
}

function snoozed() {
  try {
    const until = Number(localStorage.getItem(AUTO_OPEN.storageKey) || 0);
    return Date.now() < until;
  } catch {
    return false; // private mode — just don't auto-open twice in one session
  }
}

function snooze() {
  try {
    localStorage.setItem(
      AUTO_OPEN.storageKey,
      String(Date.now() + AUTO_OPEN.snoozeDays * 864e5)
    );
  } catch { /* storage unavailable is not an error */ }
}

export function openLead(source = "cta") {
  const el = build();
  if (el.open) return;
  opened = true;
  el.showModal();
  document.documentElement.style.overflow = "hidden";
  track("ux_audit_lead_opened", { source });

  if (!reduceMotion.matches) {
    el.animate(
      [{ opacity: 0, transform: "translateY(22px) scale(0.99)" }, { opacity: 1, transform: "none" }],
      { duration: 420, easing: EASE }
    );
  }
  // focus the heading, not the first input — landing in a text field is
  // disorienting when the dialog opened on its own
  el.querySelector(".lead-title")?.setAttribute("tabindex", "-1");
  el.querySelector(".lead-title")?.focus({ preventScroll: true });
}

export function close() {
  if (!dialog?.open) return;

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    dialog.close();
    document.documentElement.style.overflow = "";
  };

  snooze();
  if (reduceMotion.matches) return finish();

  // never let the exit animation decide whether the dialog actually closes —
  // a cancelled or never-settling `finished` would trap the visitor
  setTimeout(finish, 300);
  dialog
    .animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(12px)" }], {
      duration: 220,
      easing: EASE_INOUT,
    })
    .finished.then(finish, finish);
}

/* ------------------------------------------------------------
   Triggers
   ------------------------------------------------------------ */
export function initLeadModal() {
  document.addEventListener("click", (e) => {
    const trigger = e.target instanceof Element ? e.target.closest("[data-open-lead]") : null;
    if (!trigger) return;
    e.preventDefault();
    openLead(trigger.dataset.openLead || "cta");
  });

  if (snoozed()) return;

  let armed = true;
  const fire = (source) => {
    if (!armed || opened || document.querySelector("dialog[open]")) return;
    armed = false;
    cleanup();
    openLead(source);
  };

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max >= AUTO_OPEN.afterScroll) fire("scroll");
  };

  const onLeave = (e) => {
    // only a genuine exit toward the browser chrome, and only with a mouse
    if (e.clientY <= 0 && window.matchMedia("(pointer: fine)").matches) fire("exit_intent");
  };

  const timer = setTimeout(() => fire("dwell"), AUTO_OPEN.afterMs);

  function cleanup() {
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    if (AUTO_OPEN.exitIntent) document.removeEventListener("mouseout", onLeave);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  if (AUTO_OPEN.exitIntent) document.addEventListener("mouseout", onLeave);
}
