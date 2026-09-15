/* ============================================================
   CUSTOM SELECT

   A real listbox, not a native <select>. The native control
   renders OS chrome that ignores every token on the page —
   on a site whose argument is interface craft, that's the one
   component that can't be borrowed.

   Follows the APG listbox pattern: focus stays on the list,
   the active option is tracked with aria-activedescendant, and
   the value is mirrored into a hidden input so FormData and
   validation work exactly as they would natively.
   ============================================================ */

let uid = 0;

/**
 * @param {Element} mount     element to replace with the select
 * @param {object}  config
 * @param {string}  config.name        form field name
 * @param {string[]} config.options
 * @param {string}  [config.value]     initially selected option
 * @param {string}  [config.placeholder] shown when nothing is selected
 * @param {string}  [config.labelId]   id of the visible label
 */
export function mountSelect(mount, { name, options, value = "", placeholder = "Select…", labelId = "" }) {
  const id = `sel-${name}-${uid++}`;
  const wrap = document.createElement("div");
  wrap.className = "c-sel";

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = name;
  hidden.value = value;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "c-sel-btn";
  button.id = `${id}-btn`;
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  if (labelId) button.setAttribute("aria-labelledby", `${labelId} ${id}-btn`);

  const valueEl = document.createElement("span");
  valueEl.className = "c-sel-value";
  const caret = document.createElement("span");
  caret.className = "c-sel-caret";
  caret.setAttribute("aria-hidden", "true");
  button.append(valueEl, caret);

  const list = document.createElement("ul");
  list.className = "c-sel-list";
  list.setAttribute("role", "listbox");
  list.tabIndex = -1;
  list.hidden = true;
  if (labelId) list.setAttribute("aria-labelledby", labelId);

  const items = options.map((option, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.id = `${id}-opt-${i}`;
    li.dataset.value = option;
    li.textContent = option;
    li.setAttribute("aria-selected", String(option === value));
    list.append(li);
    return li;
  });

  wrap.append(hidden, button, list);
  mount.replaceWith(wrap);

  let open = false;
  let active = Math.max(0, items.findIndex((li) => li.dataset.value === value));

  const paint = () => {
    valueEl.textContent = hidden.value || placeholder;
    wrap.classList.toggle("is-empty", !hidden.value);
    items.forEach((li, i) => {
      li.setAttribute("aria-selected", String(li.dataset.value === hidden.value));
      li.classList.toggle("is-active", i === active && open);
    });
    list.setAttribute("aria-activedescendant", open ? items[active]?.id ?? "" : "");
  };

  const setOpen = (next) => {
    open = next;
    button.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
    wrap.classList.toggle("is-open", open);
    paint();
    if (open) {
      list.focus();
      items[active]?.scrollIntoView({ block: "nearest" });
    }
  };

  const choose = (i) => {
    active = i;
    hidden.value = items[i].dataset.value;
    // fire the event a native select would, so validation and any
    // listener bound to the form behave identically
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
    setOpen(false);
    button.focus();
  };

  const move = (to) => {
    active = (to + items.length) % items.length;
    paint();
    items[active].scrollIntoView({ block: "nearest" });
  };

  button.addEventListener("click", () => setOpen(!open));
  button.addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
  });

  items.forEach((li, i) => {
    li.addEventListener("click", () => choose(i));
    li.addEventListener("mousemove", () => { if (active !== i) move(i); });
  });

  let typed = "";
  let typedAt = 0;

  list.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); return move(active + 1);
      case "ArrowUp":   e.preventDefault(); return move(active - 1);
      case "Home":      e.preventDefault(); return move(0);
      case "End":       e.preventDefault(); return move(items.length - 1);
      case "Enter":
      case " ":         e.preventDefault(); return choose(active);
      case "Escape":
      case "Tab":
        setOpen(false);
        if (e.key === "Escape") { e.preventDefault(); button.focus(); }
        return;
      default: break;
    }
    // type-ahead, same as a native select
    if (e.key.length !== 1) return;
    const now = Date.now();
    typed = now - typedAt > 700 ? e.key : typed + e.key;
    typedAt = now;
    const match = items.findIndex((li) =>
      li.dataset.value.toLowerCase().startsWith(typed.toLowerCase())
    );
    if (match >= 0) move(match);
  });

  list.addEventListener("focusout", (e) => {
    if (!wrap.contains(e.relatedTarget)) setOpen(false);
  });

  document.addEventListener("pointerdown", (e) => {
    if (open && !wrap.contains(e.target)) setOpen(false);
  });

  paint();

  return {
    element: wrap,
    input: hidden,
    get value() { return hidden.value; },
    focus: () => button.focus(),
  };
}
