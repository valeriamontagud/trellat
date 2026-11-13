// Ayudas pequeñas que usan todos los módulos.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHTML(value = "") {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, char => map[char]);
}

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

/** Fecha local en formato AAAA-MM-DD. */
function dateISO(date) {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "2026-10" → "octubre de 2026" */
function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

/** <option> para un <select>. */
const optionsHTML = (list, selected) =>
  list.map(value => `<option ${value === selected ? "selected" : ""}>${escapeHTML(value)}</option>`).join("");

/** Chips de selección múltiple. */
const chipsHTML = (name, list, selected = []) =>
  list.map(value => `<label class="chip"><input type="checkbox" name="${name}" value="${escapeHTML(value)}" ${selected.includes(value) ? "checked" : ""}><span>${escapeHTML(value)}</span></label>`).join("");

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}

/* ---- Ventanas ---- */

function openDialog(id) {
  const dialog = $(`#${id}`);
  dialog.classList.add("open");
  dialog.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("input, select, textarea, button:not([data-close])", dialog)?.focus();
}

function closeDialog(id) {
  const dialog = $(`#${id}`);
  if (dialog.contains(document.activeElement)) document.activeElement.blur();
  dialog.classList.remove("open");
  dialog.setAttribute("aria-hidden", "true");
  // Si queda otra ventana abierta debajo (p. ej. la publicación), la página sigue bloqueada.
  if (!$(".modal-backdrop.open")) document.body.style.overflow = "";
}

/** Cierre común: botón ×, clic fuera y tecla Escape. */
function initDialogs() {
  $$(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop || event.target.closest("[data-close]")) closeDialog(backdrop.id);
    });
  });
  document.addEventListener("keydown", event => {
    const open = $$(".modal-backdrop.open").pop();   // la de encima
    if (event.key === "Escape" && open) closeDialog(open.id);
  });
}
