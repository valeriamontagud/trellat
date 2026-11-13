// Vista Calendario: bienvenida, estado del mes y rejilla.

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const firstOfMonth = key => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
};

let visibleMonth = firstOfMonth(state.monthBrief?.month || DEFAULT_MONTH);

function showMonth(monthKey) {
  visibleMonth = firstOfMonth(monthKey);
  renderCalendar();
}

function moveMonth(step) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + step, 1);
  renderCalendar();
}

function renderCalendar() {
  const hasPlan = Boolean(state.monthBrief?.month);
  $("#calendar-welcome").hidden = hasPlan;
  $("#calendar-workspace").hidden = !hasPlan;
  if (!hasPlan) return;

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthName = capitalize(new Intl.DateTimeFormat("es-ES", { month: "long" }).format(visibleMonth));
  $("#month-title").innerHTML = `${monthName} <span class="muted">${year}</span>`;
  $("#strategy-title").textContent = `Tu estrategia de ${monthName.toLowerCase()}`;

  const planMonth = state.monthBrief.month;
  $("#plan-status-copy").innerHTML = `
    <strong>Propuesta de ${escapeHTML(monthLabel(planMonth))} preparada.</strong>
    <p>Es una recomendación de Trellat: puedes editar, mover o descartar cada publicación.</p>`;

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const today = dateISO(new Date());

  let html = WEEKDAYS.map(day => `<div class="weekday">${day}</div>`).join("");
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month, i - firstWeekday + 1);
    const iso = dateISO(date);
    const inMonth = date.getMonth() === month;
    const posts = inMonth ? state.posts.filter(post => post.date === iso) : [];
    html += `
      <div class="day-cell ${inMonth ? "" : "outside"}">
        <div class="day-number ${iso === today ? "today" : ""}">${date.getDate()}</div>
        ${posts.map(eventHTML).join("")}
      </div>`;
  }
  $("#calendar-grid").innerHTML = html;
}

function eventHTML(post) {
  const planned = post.status === "planned";
  return `<button class="event ${planned ? "planned" : "recommendation"}" data-post="${escapeHTML(post.id)}">
    <strong>${planned ? "PLANIFICADA" : "PROPUESTA"}</strong>${escapeHTML(post.title)}</button>`;
}

function initCalendar() {
  $("#prev-month").addEventListener("click", () => moveMonth(-1));
  $("#next-month").addEventListener("click", () => moveMonth(1));
  $("#today-btn").addEventListener("click", () => showMonth(dateISO(new Date()).slice(0, 7)));
  $("#strategy-details").addEventListener("click", () =>
    toast("La estrategia conecta tus objetivos con las recomendaciones del calendario."));
  $("#calendar-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-post]");
    if (button) openPost(button.dataset.post);
  });
}
