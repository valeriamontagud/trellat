// Punto de entrada: arranca los módulos, la navegación y el repintado.

const VIEW_LABELS = { home: "Inicio", calendar: "Calendario", tasks: "Tareas", results: "Resultados", brand: "Mi marca" };

function setView(view) {
  $$(".view").forEach(el => el.classList.toggle("active", el.id === `view-${view}`));
  $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  $("#page-crumb").textContent = VIEW_LABELS[view];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Cada vez que cambian los datos (commit), se repinta lo necesario.
document.addEventListener("trellat:change", ({ detail }) => {
  if (detail.reset) {
    fillBrandForm();
    renderBrandKit();
    setView("calendar");
    showMonth(DEFAULT_MONTH);
  } else if (detail.month) {
    showMonth(detail.month);
  } else {
    renderCalendar();
  }
  renderTasks();
  renderHome();
  if (detail.source !== "kit" && $("#kit-post")) renderKitPreview();
});

$$(".nav-item").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
// El logo y los botones con data-go="vista" también navegan.
document.addEventListener("click", event => {
  const link = event.target.closest("[data-go]");
  if (!link) return;
  event.preventDefault();
  setView(link.dataset.go);
});
$("#reset-demo").addEventListener("click", () => {
  if (!confirm("¿Restablecer la demo y borrar los cambios guardados en este navegador?")) return;
  resetState();
  toast("Demo restablecida.");
});

initDialogs();
initCalendar();
initPosts();
initCarousel();
initMonthPlanner();
initTasks();
initBrand();
initHome();
initBrandKit();

fillBrandForm();
renderCalendar();
renderTasks();
renderHome();
renderBrandKit();
