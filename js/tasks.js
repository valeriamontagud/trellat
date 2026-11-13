// Vista Tareas y contador de la navegación.

function renderTasks() {
  const total = state.tasks.length;
  const done = state.tasks.filter(task => task.done).length;
  const pending = total - done;

  $("#task-count").textContent = pending || "";
  $("#task-summary").innerHTML = [
    [total, "Tareas totales"], [pending, "Por hacer"], [done, "Completadas"]
  ].map(([n, label]) => `<div class="summary-box"><strong>${n}</strong><span>${label}</span></div>`).join("");

  const list = $("#task-list");
  if (!total || !pending) {
    list.innerHTML = `
      <div class="empty-state">
        <p class="refrany">${total ? "Això sí que té trellat." : "A poc a poc i bona lletra."}</p>
        <p>${total ? "Lo tienes todo hecho." : "Cuando planifiques una publicación, aquí aparecerá lo que necesitas preparar."}</p>
      </div>`;
    if (!total) return;
  } else {
    list.innerHTML = "";
  }

  list.insertAdjacentHTML("beforeend", state.tasks.map(task => `
    <label class="task-card ${task.done ? "done" : ""}">
      <input type="checkbox" data-task="${escapeHTML(task.id)}" ${task.done ? "checked" : ""}>
      <span class="task-copy"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.detail || "Tarea pendiente")}</small></span>
      <span class="task-tag">${task.done ? "Completada" : "Por hacer"}</span>
    </label>`).join(""));
}

function initTasks() {
  $("#task-list").addEventListener("change", event => {
    const task = state.tasks.find(item => item.id === event.target.dataset.task);
    if (!task) return;
    task.done = event.target.checked;
    commit();
  });
}
