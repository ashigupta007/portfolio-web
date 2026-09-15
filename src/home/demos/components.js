/* ============================================================
   AGENTIC COMPONENT LIBRARY — a playground, not a screenshot.

   Enough of the real system to judge it by: two densities, the
   full state ladder, and controls that actually behave —
   keyboard included. Deliberately not a Storybook.
   ============================================================ */

/* ---- density: the 28 / 36px switch the design system ships ---- */
function initDensity(root) {
  const buttons = [...root.querySelectorAll("[data-density]")];
  if (!buttons.length) return;

  const apply = (size) => {
    root.dataset.size = size;
    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.density === size))
    );
  };

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.density)));
  apply(root.dataset.size || "36");
}

/* ---- tabs: roving tabindex, arrow keys, Home/End ---- */
function initTabs(root) {
  const tablist = root.querySelector("[role='tablist']");
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll("[role='tab']")];

  const select = (tab, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab, false)));

  tablist.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(tabs[(map[e.key] + tabs.length) % tabs.length]);
  });

  select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0], false);
}

/* ---- multi-select chips ---- */
function initChips(root) {
  root.querySelectorAll("[data-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const on = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!on));
    });
  });
}

/* ---- input: validity demonstrated live, not mocked ---- */
function initInput(root) {
  const field = root.querySelector("[data-play-input]");
  const message = root.querySelector("[data-play-input-msg]");
  if (!field || !message) return;

  const validate = () => {
    const value = field.value.trim();
    const invalid = value.length > 0 && !/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(value);
    field.setAttribute("aria-invalid", String(invalid));
    message.textContent = invalid
      ? "Enter a valid email — e.g. priya@acme.com"
      : "We only use this to send the export.";
    message.dataset.tone = invalid ? "error" : "hint";
  };

  field.addEventListener("input", validate);
  field.addEventListener("blur", validate);
}

/* ---- custom select: a real listbox ---- */
function initSelect(root) {
  const wrap = root.querySelector("[data-play-select]");
  if (!wrap) return;
  const button = wrap.querySelector("button");
  const listbox = wrap.querySelector("[role='listbox']");
  const label = wrap.querySelector("[data-play-select-value]");
  if (!button || !listbox || !label) return;

  const options = [...listbox.querySelectorAll("[role='option']")];
  let open = false;

  const setOpen = (next) => {
    open = next;
    button.setAttribute("aria-expanded", String(open));
    listbox.hidden = !open;
    if (open) (options.find((o) => o.getAttribute("aria-selected") === "true") || options[0])?.focus();
  };

  const choose = (option) => {
    options.forEach((o) => {
      o.setAttribute("aria-selected", String(o === option));
      o.tabIndex = o === option ? 0 : -1;
    });
    label.textContent = option.textContent.trim();
    setOpen(false);
    button.focus();
  };

  button.addEventListener("click", () => setOpen(!open));
  options.forEach((o) => {
    o.tabIndex = -1;
    o.addEventListener("click", () => choose(o));
  });

  listbox.addEventListener("keydown", (e) => {
    const i = options.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); button.focus(); return; }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(options[i] ?? options[0]); return; }
    const map = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: options.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    options[(map[e.key] + options.length) % options.length].focus();
  });

  document.addEventListener("click", (e) => {
    if (open && !wrap.contains(e.target)) setOpen(false);
  });
}

/* ---- table: selection, a bulk bar that earns its place, sorting ---- */
function initTable(root) {
  const table = root.querySelector("[data-play-table]");
  if (!table) return;

  const all = table.querySelector("[data-select-all]");
  const boxes = [...table.querySelectorAll("[data-select-row]")];
  const bar = root.querySelector("[data-bulk-bar]");
  const count = root.querySelector("[data-bulk-count]");
  const body = table.querySelector("tbody");
  const sortBtn = table.querySelector("[data-sort]");

  const sync = () => {
    const selected = boxes.filter((b) => b.checked).length;
    if (all) {
      all.checked = selected === boxes.length && selected > 0;
      all.indeterminate = selected > 0 && selected < boxes.length;
    }
    boxes.forEach((b) => b.closest("tr")?.classList.toggle("is-selected", b.checked));
    if (bar) bar.hidden = selected === 0;
    if (count) count.textContent = `${selected} selected`;
  };

  boxes.forEach((b) => b.addEventListener("change", sync));
  all?.addEventListener("change", () => {
    boxes.forEach((b) => { b.checked = all.checked; });
    sync();
  });

  sortBtn?.addEventListener("click", () => {
    const next = sortBtn.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    sortBtn.setAttribute("aria-sort", next);
    sortBtn.closest("th")?.setAttribute("aria-sort", next);
    const rows = [...body.querySelectorAll("tr")];
    rows.sort((a, b) => {
      const av = Number(a.dataset.value || 0);
      const bv = Number(b.dataset.value || 0);
      return next === "ascending" ? av - bv : bv - av;
    });
    rows.forEach((r) => body.append(r));
  });

  sync();
}

export function initComponentPlayground() {
  const root = document.querySelector("[data-demo='components']");
  if (!root) return;
  initDensity(root);
  initTabs(root);
  initChips(root);
  initInput(root);
  initSelect(root);
  initTable(root);
}
