import "./lead.css";
import { FALLBACK_EMAIL, FORMSPREE_ENDPOINT, ROLES, SCOPE } from "./config.js";
import { mountSelect } from "../core/select.js";
import { track } from "../core/analytics.js";
import { revealBooking } from "./booking.js";

/* ============================================================
   LEAD FORM

   Six fields. The UI is entirely the site's own — Formspree is
   only the submission backend, and the dropdowns are real
   listboxes rather than native selects.

   Values survive a failed submission, duplicate submits are
   impossible, and every error is announced as well as shown.
   ============================================================ */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let seq = 0;

/** Markup for one enquiry form. `id` scopes every element to this instance. */
export function formMarkup(id = `lead-${seq++}`) {
  return `
    <form class="lead-form" id="${id}" novalidate>
      <div class="f-grid">
        <div class="f-field">
          <label class="f-label" for="${id}-name">Name <span class="f-req" aria-hidden="true">*</span></label>
          <input class="f-input" id="${id}-name" name="name" type="text" autocomplete="name"
                 required aria-describedby="${id}-e-name" />
          <p class="f-error" id="${id}-e-name" data-error role="alert"></p>
        </div>

        <div class="f-field">
          <label class="f-label" for="${id}-email">Work email <span class="f-req" aria-hidden="true">*</span></label>
          <input class="f-input" id="${id}-email" name="email" type="email" autocomplete="email"
                 required aria-describedby="${id}-e-email" />
          <p class="f-error" id="${id}-e-email" data-error role="alert"></p>
        </div>
      </div>

      <div class="f-field">
        <label class="f-label" for="${id}-url">Product URL <span class="f-req" aria-hidden="true">*</span></label>
        <input class="f-input" id="${id}-url" name="productUrl" type="text" inputmode="url"
               placeholder="app.acme.com" required aria-describedby="${id}-e-url" />
        <p class="f-error" id="${id}-e-url" data-error role="alert"></p>
      </div>

      <div class="f-grid">
        <div class="f-field">
          <span class="f-label" id="${id}-l-role">Your role <span class="f-req" aria-hidden="true">*</span></span>
          <span data-select-mount="role"></span>
          <p class="f-error" id="${id}-e-role" data-error role="alert"></p>
        </div>

        <div class="f-field">
          <span class="f-label" id="${id}-l-scope">Rough scope</span>
          <span data-select-mount="scope"></span>
        </div>
      </div>

      <div class="f-field">
        <label class="f-label" for="${id}-concern">What's prompting the review? <span class="f-req" aria-hidden="true">*</span></label>
        <textarea class="f-input f-textarea" id="${id}-concern" name="primaryConcern" rows="3"
                  placeholder="A sentence is enough — what makes you think the product needs a look?"
                  required aria-describedby="${id}-e-concern"></textarea>
        <p class="f-error" id="${id}-e-concern" data-error role="alert"></p>
      </div>

      <div class="f-field f-consent">
        <label class="f-check">
          <input type="checkbox" id="${id}-consent" name="consent" required aria-describedby="${id}-e-consent" />
          <span>I'm happy for Ashish to contact me about this enquiry. <span class="f-req" aria-hidden="true">*</span></span>
        </label>
        <p class="f-error" id="${id}-e-consent" data-error role="alert"></p>
      </div>

      <div class="f-submit">
        <button class="btn-pill is-primary" type="submit" data-form-submit>
          <span data-form-submit-label>Book a UX audit call</span>
        </button>
        <p class="f-status" data-form-status role="status" aria-live="polite"></p>
      </div>
    </form>`;
}

/* ---- validation -------------------------------------------- */
const RULES = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
  email: (v) =>
    !v.trim()
      ? "Please enter your work email."
      : EMAIL.test(v.trim())
        ? ""
        : "That doesn't look like a valid email address.",
  productUrl: (v) => {
    const raw = v.trim();
    if (!raw) return "Please enter the product URL.";
    try {
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return url.hostname.includes(".") ? "" : "Please enter a full URL, e.g. app.acme.com";
    } catch {
      return "Please enter a valid URL, e.g. app.acme.com";
    }
  },
  role: (v) => (v ? "" : "Please select your role."),
  primaryConcern: (v) =>
    v.trim().length >= 10 ? "" : "A sentence or two is enough — what prompted this?",
  consent: (v, field) => (field.checked ? "" : "Please confirm so I can reply to you."),
};

function setError(form, name, message) {
  const field = form.elements[name];
  const target = field instanceof RadioNodeList ? field[0] : field;
  if (!target) return;
  const box =
    target.closest(".f-field") ||
    form.querySelector(`[data-select-mount="${name}"]`)?.closest(".f-field");
  const errorEl = box?.querySelector("[data-error]");
  // a hidden input can't take aria-invalid usefully — mark the control instead
  const control = box?.querySelector(".c-sel-btn") ?? target;
  control.setAttribute?.("aria-invalid", message ? "true" : "false");
  box?.classList.toggle("has-error", Boolean(message));
  if (errorEl) errorEl.textContent = message;
  return box;
}

function validate(form, only) {
  let firstBad = null;
  for (const [name, rule] of Object.entries(RULES)) {
    if (only && only !== name) continue;
    const field = form.elements[name];
    if (!field) continue;
    const box = setError(form, name, rule(field.value ?? "", field));
    if (box?.classList.contains("has-error") && !firstBad) {
      firstBad = box.querySelector("input:not([type=hidden]), textarea, .c-sel-btn");
    }
  }
  return firstBad;
}

function payloadOf(form) {
  const data = new FormData(form);
  const url = String(data.get("productUrl") || "").trim();
  const email = String(data.get("email") || "");
  return {
    name: data.get("name"),
    email,
    company: email.split("@")[1] || "—",
    productUrl: /^https?:\/\//i.test(url) ? url : `https://${url}`,
    role: data.get("role"),
    scope: data.get("scope") || "Not sure yet",
    primaryConcern: data.get("primaryConcern"),
    source: form.dataset.leadSource || "page",
    _subject: `UX Audit enquiry — ${email.split("@")[1] || data.get("name")}`,
  };
}

/**
 * Wire up one form instance.
 * @param {HTMLFormElement} form
 * @param {() => void} [onSuccess] swap the surrounding UI to its success state
 */
export function initLeadForm(form, onSuccess) {
  if (!form || form.dataset.wired) return;
  form.dataset.wired = "true";

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("[data-form-submit]");
  const submitLabel = submit?.querySelector("[data-form-submit-label]");

  // real listboxes in place of native selects
  const roleMount = form.querySelector('[data-select-mount="role"]');
  if (roleMount) {
    mountSelect(roleMount, {
      name: "role",
      options: ROLES,
      placeholder: "Select your role",
      labelId: `${form.id}-l-role`,
    });
  }
  const scopeMount = form.querySelector('[data-select-mount="scope"]');
  if (scopeMount) {
    mountSelect(scopeMount, {
      name: "scope",
      options: SCOPE,
      value: SCOPE[0],
      labelId: `${form.id}-l-scope`,
    });
  }

  if (FORMSPREE_ENDPOINT) {
    form.action = FORMSPREE_ENDPOINT;
    form.method = "post";
  }

  form.addEventListener("input", () => track("ux_audit_form_started", {}, true), { once: true });

  // re-validate a field only once it has already been marked bad, so nobody
  // is corrected while they're still typing
  form.addEventListener("blur", (e) => {
    const name = e.target?.name;
    if (name && name in RULES && e.target.closest(".has-error")) validate(form, name);
  }, true);
  form.addEventListener("change", (e) => {
    const name = e.target?.name;
    if (name && name in RULES) validate(form, name);
  });

  let sending = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;

    const firstBad = validate(form);
    if (firstBad) {
      if (status) status.textContent = "Some details need a look before this can be sent.";
      firstBad.focus?.();
      track("ux_audit_form_error", { reason: "validation" });
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      if (status) {
        status.innerHTML = `The form isn't connected yet. Please email <a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a> and I'll pick it up from there.`;
      }
      track("ux_audit_form_error", { reason: "not_configured" });
      return;
    }

    sending = true;
    form.classList.add("is-sending");
    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = "Sending…";
    if (status) status.textContent = "Sending your details…";

    try {
      const payload = payloadOf(form);
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.errors?.map((x) => x.message).join(" ") || "Submission rejected.");
      }

      track("ux_audit_form_submitted", { source: form.dataset.leadSource || "page" });
      onSuccess?.();
      revealBooking(form.closest("[data-lead-scope]") ?? document, payload);
    } catch (error) {
      // values are untouched — the form is never cleared on failure
      sending = false;
      form.classList.remove("is-sending");
      if (submit) submit.disabled = false;
      if (submitLabel) submitLabel.textContent = "Book a UX audit call";
      if (status) {
        status.innerHTML = `That didn't send — ${navigator.onLine ? "please try again" : "you appear to be offline"}. Your answers are still here. If it keeps failing, email <a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`;
      }
      track("ux_audit_form_error", { reason: "network" });
      console.warn("[lead] submission failed:", error.message);
    }
  });
}
