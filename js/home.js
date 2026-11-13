// Pantalla de inicio: saludo, resumen, ilustración y refrán del día.

const REFRANYS = [
  { text: "Quin poc trellat!", meaning: "¡Qué poco sentido! Se dice de algo hecho a lo loco." },
  { text: "A poc a poc i bona lletra.", meaning: "Despacio y con buena letra: sin prisa, pero bien hecho." },
  { text: "Això té trellat.", meaning: "Esto tiene sentido. El mejor elogio para un plan." },
  { text: "Posa-li trellat.", meaning: "Ponle cabeza. Piénsalo antes de hacerlo." },
  { text: "Fes-ho amb trellat.", meaning: "Hazlo con sentido. El lema de la casa." }
];

// El refrán cambia cada día; "Otro refrán" avanza al siguiente.
let refranyIndex = Math.floor(Date.now() / 86400000) % REFRANYS.length;

function renderRefrany() {
  const { text, meaning } = REFRANYS[refranyIndex];
  $("#refrany-text").textContent = text;
  $("#refrany-meaning").textContent = meaning;
}

function renderHomeStats() {
  const today = dateISO(new Date());
  const proposals = state.posts.filter(post => post.status === "recommendation").length;
  const pending = state.tasks.filter(task => !task.done).length;
  const next = state.posts
    .filter(post => post.status === "planned" && post.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextDate = next
    ? new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${next.date}T12:00`))
    : "";

  const cards = [
    { go: "calendar", label: "Propuestas por revisar", value: proposals, note: proposals ? "Ideas de Trellat esperando tu visto bueno" : "Todo revisado" },
    { go: "calendar", label: "Próxima publicación", value: next ? capitalize(nextDate) : "Sin fecha", note: next ? next.title : "Planifica una propuesta para empezar", small: true },
    { go: "tasks", label: "Tareas pendientes", value: pending, note: pending ? "Pequeños pasos para publicar" : "Això sí que té trellat" }
  ];

  $("#home-stats").innerHTML = cards.map(card => `
    <button class="stat-card" data-go="${card.go}">
      <span>${card.label}</span>
      <strong class="${card.small ? "small" : ""}">${escapeHTML(card.value)}</strong>
      <small>${escapeHTML(card.note)}</small>
    </button>`).join("");
}

/** Dibuja en la ilustración los días del mes del plan que tienen publicaciones. */
function renderHomeArt() {
  const key = state.monthBrief?.month || DEFAULT_MONTH;
  const [year, month] = key.split("-").map(Number);
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const byDay = {};
  state.posts.filter(post => post.date.startsWith(key)).forEach(post => {
    byDay[Number(post.date.slice(8))] = post.status;
  });

  let cells = "";
  for (let i = 0; i < 35; i++) {
    const day = i - offset + 1;
    const kind = day < 1 || day > days ? "a-empty" : byDay[day] === "planned" ? "a-planned" : byDay[day] ? "a-proposal" : "a-day";
    const x = 33 + (i % 7) * 36;
    const y = 100 + Math.floor(i / 7) * 34;
    cells += `<rect class="${kind}" x="${x}" y="${y}" width="28" height="26" rx="6"/>`;
  }
  $("#home-art-cells").innerHTML = cells;
}

function renderHome() {
  $("#home-greeting").textContent = `Hola, ${state.brand.business || "bienvenido"}`;
  renderHomeStats();
  renderHomeArt();
  renderRefrany();
}

function initHome() {
  $("#refrany-next").addEventListener("click", () => {
    refranyIndex = (refranyIndex + 1) % REFRANYS.length;
    renderRefrany();
  });
}
