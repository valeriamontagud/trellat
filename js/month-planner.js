// Ventana "¿Qué tienes entre manos este mes?" y propuesta simulada.

const monthForm = () => $("#month-form");

function openMonthPlanner() {
  const brief = state.monthBrief || {};
  const f = monthForm();
  f.month.value = brief.month || DEFAULT_MONTH;
  f.frequency.value = brief.frequency || "balanced";
  ["campaigns", "launches", "dates", "notes"].forEach(name => (f[name].value = brief[name] || ""));
  $("[data-chips=goals]", f).innerHTML = chipsHTML("goals", OPTIONS.goals, brief.goals || [state.brand.goal]);
  openDialog("month-modal");
}

function generatePlan(event) {
  event.preventDefault();
  const data = new FormData(monthForm());
  const month = data.get("month");
  const [year, monthNum] = month.split("-").map(Number);
  const goals = data.getAll("goals");

  // Este resumen es lo que más adelante se enviará a la IA.
  state.monthBrief = {
    month, goals,
    frequency: data.get("frequency"),
    campaigns: data.get("campaigns").trim(),
    launches: data.get("launches").trim(),
    dates: data.get("dates").trim(),
    notes: data.get("notes").trim()
  };

  const lastDay = new Date(year, monthNum, 0).getDate();
  const generated = demoPlanIdeas
    .filter(idea => idea.day <= lastDay)
    .map((idea, index) => ({
      id: `generated-${month}-${index}`,
      generatedByBrief: true,
      title: idea.title,
      description: "",
      format: idea.format,
      objective: goals.includes(idea.objective) ? idea.objective : goals[0] || idea.objective,
      channels: [...state.brand.channels],
      status: "recommendation",
      reason: idea.reason,
      timing: "Propuesta inicial basada en tu perfil de marca. Puedes cambiar fecha y formato antes de planificar.",
      outcome: "Observa las interacciones y preguntas que genere para decidir qué temas repetir.",
      script: idea.script,
      caption: idea.caption,
      cta: idea.cta,
      date: `${month}-${String(idea.day).padStart(2, "0")}`,
      time: "18:30",
      tasks: []
    }));

  // Sustituye solo las propuestas generadas antes para este mes; respeta lo planificado.
  state.posts = state.posts.filter(post => !(post.generatedByBrief && post.status === "recommendation" && post.date.startsWith(month)));
  const existing = new Set(state.posts.map(post => post.id));
  state.posts.push(...generated.filter(post => !existing.has(post.id)));

  closeDialog("month-modal");
  commit({ month });
  toast("Propuesta preparada. Revisa las ideas y ajusta lo que necesites.");
}

function initMonthPlanner() {
  document.querySelectorAll("[data-open-month]").forEach(button => button.addEventListener("click", openMonthPlanner));
  monthForm().addEventListener("submit", generatePlan);
}
