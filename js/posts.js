// Ventana de publicación en tres pasos: idea → contenido → planificar.

let step = 1;
let draft = null;

/* ---------- Abrir ---------- */

function openPost(postId = null) {
  const post = state.posts.find(item => item.id === postId);
  draft = post ? structuredClone(post) : newDraft();
  step = draft.status === "planned" ? 2 : 1;
  render();
  openDialog("post-modal");
  $$("[data-autogrow]", $("#post-body")).forEach(autoGrow);   // ya visible: ahora sí mide bien
}

function newDraft() {
  return {
    id: `post-${Date.now()}`,
    title: "", description: "", format: "Reel", status: "recommendation",
    channels: [...state.brand.channels], objective: state.brand.goal, tone: state.brand.tone,
    reason: "", timing: "", outcome: "", caption: "", script: "", cta: "",
    date: dateISO(new Date()), time: "18:30", tasks: []
  };
}

/* ---------- Herramienta según el formato ---------- */

// Carrusel → generador de diapositivas. Reel → referencias visuales de cada escena.
function formatToolHTML() {
  if (draft.format === "Carrusel") {
    const done = draft.carousel?.slides?.length;
    return `
      <div class="studio-card">
        <span class="symbol">▤</span>
        <div>
          <strong>Diseña el carrusel</strong>
          <p>Te decimos qué foto necesita cada diapositiva, las subes y lo montamos con tu kit de marca.</p>
          ${done ? `<small class="studio-done">✓ Tienes ${done} diapositivas preparadas</small>` : ""}
        </div>
        <button type="button" class="button button-primary" data-open-carousel>${done ? "Ver carrusel" : "Generar carrusel"}</button>
      </div>`;
  }
  if (draft.format === "Reel") {
    return `
      <div class="studio-card">
        <span class="symbol">▶</span>
        <div>
          <strong>¿Cómo lo grabo?</strong>
          <p>Un esquema por escena: qué plano usar, dónde colocar cada cosa y dónde irá el texto.</p>
        </div>
        <button type="button" class="button button-primary" data-open-reel>Ver referencias visuales</button>
      </div>`;
  }
  return "";
}

function refreshFormatTool() {
  const slot = $("#format-tool");
  if (slot) slot.innerHTML = formatToolHTML();
}

/* ---------- Títulos largos ---------- */

// El título es un textarea que crece con el texto: los títulos largos se ven enteros en varias líneas.
function autoGrow(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

/* ---------- Pasos ---------- */

const steps = {
  1: () => `
    <p class="eyebrow">La idea que te proponemos</p>
    <textarea class="idea-title" name="title" rows="1" placeholder="Título de la publicación" aria-label="Título" data-autogrow required>${escapeHTML(draft.title)}</textarea>
    <p class="idea-description">${escapeHTML(draft.description || "Una propuesta pensada para aportar valor a tu audiencia. Puedes personalizarla antes de continuar.")}</p>

    <div class="box grid-2">
      <label class="field">Formato recomendado<select name="format">${optionsHTML(OPTIONS.formats, draft.format)}</select></label>
      <label class="field">Objetivo<select name="objective">${optionsHTML(OPTIONS.objectives, draft.objective)}</select></label>
      <span class="helper full">Son sugerencias basadas en tu estrategia. Puedes cambiarlas.</span>
    </div>
    <div id="format-tool">${formatToolHTML()}</div>

    <section class="reason">
      <p class="eyebrow">Por qué tiene trellat</p>
      <p>${escapeHTML(draft.reason || "Esta propuesta puede contribuir a los objetivos de tu marca.")}</p>
      <div class="reason-details">
        <div><p class="eyebrow">Encaje con tu estrategia</p>${escapeHTML(draft.timing || "Complementa el contenido que ya tienes planificado.")}</div>
        <div><p class="eyebrow">Qué buscamos</p>${escapeHTML(draft.outcome || "Observar las interacciones y consultas que genere.")}</div>
      </div>
      <p class="reason-note">El impacto esperado es orientativo, no una garantía de resultados.</p>
    </section>`,

  2: () => `
    <div class="form-stack">
      <label class="field">Idea o título<textarea name="title" rows="1" data-autogrow required>${escapeHTML(draft.title)}</textarea></label>
      <div class="grid-2">
        <label class="field">Formato<select name="format">${optionsHTML(OPTIONS.formats, draft.format)}</select></label>
        <label class="field">Tono<select name="tone">${optionsHTML(OPTIONS.tones, draft.tone || state.brand.tone)}</select></label>
      </div>
      <label class="field">Guion o estructura
        <textarea name="script" rows="6" placeholder="Escenas del vídeo o contenido de cada diapositiva…">${escapeHTML(draft.script)}</textarea>
        <span class="helper">En un Reel, describe las escenas. En un carrusel, cada diapositiva.</span>
      </label>
      <div id="format-tool">${formatToolHTML()}</div>
      <label class="field">Texto para publicar
        <textarea name="caption" rows="4" placeholder="El texto que acompañará la publicación…">${escapeHTML(draft.caption)}</textarea>
      </label>
      <label class="field">Llamada a la acción
        <input name="cta" value="${escapeHTML(draft.cta)}" placeholder="Ej. Guarda este consejo para más tarde">
      </label>
    </div>
    <div class="preview">
      <span class="pill" data-preview="format">${escapeHTML(draft.format)}</span>
      <h3 data-preview="title">${escapeHTML(draft.title || "Tu publicación")}</h3>
      <p data-preview="script">${escapeHTML(draft.script)}</p>
      <p data-preview="caption">${escapeHTML(draft.caption)}</p>
      <strong data-preview="cta">${escapeHTML(draft.cta)}</strong>
    </div>`,

  3: () => `
    <div class="form-stack">
      <div class="grid-2">
        <label class="field">Fecha de publicación<input name="date" type="date" value="${escapeHTML(draft.date)}" required></label>
        <label class="field">Hora propuesta<input name="time" type="time" value="${escapeHTML(draft.time || "18:30")}"></label>
      </div>
      <div class="field">Redes sociales<div class="chips">${chipsHTML("channels", OPTIONS.channels, draft.channels)}</div></div>
    </div>
    <h3 class="subheading">¿Qué necesitas preparar?</h3>
    <div class="checklist">
      ${OPTIONS.prepTasks.map(task => `<label><input type="checkbox" name="tasks" value="${task}" ${draft.tasks.includes(task) ? "checked" : ""}>${task}</label>`).join("")}
    </div>
    <div class="plan-summary">
      <strong>Antes de guardar</strong>
      <p>La publicación se añadirá a tu calendario y las tareas elegidas aparecerán en Tareas.</p>
      <p>Guardar en Trellat no publica automáticamente en tus redes.</p>
    </div>`
};

function render() {
  $("#post-body").innerHTML = steps[step]();
  $$("[data-autogrow]", $("#post-body")).forEach(autoGrow);

  $$("#post-modal .step").forEach((el, index) => {
    el.classList.toggle("active", index + 1 === step);
    el.classList.toggle("complete", index + 1 < step);
  });

  // En el paso 1 de una propuesta, "Volver" se convierte en "Descartar idea".
  const back = $("#back-step");
  const canDiscard = step === 1 && state.posts.some(p => p.id === draft.id && p.status === "recommendation");
  back.hidden = step === 1 && !canDiscard;
  back.textContent = step === 1 ? "Descartar idea" : "Volver";
  back.className = `button ${step === 1 ? "button-ghost-danger" : "button-light"}`;
  $("#next-step").textContent = step === 3 ? "Guardar en calendario ✓" : "Continuar →";
}

/* ---------- Leer el formulario del paso actual ---------- */

function capture() {
  const body = $("#post-body");
  const title = $("[name=title]", body);
  if (title && !title.value.trim()) {
    title.setCustomValidity("Escribe una idea o título para continuar.");
    title.reportValidity();
    title.setCustomValidity("");
    return false;
  }
  $$("input:not([type=checkbox]), select, textarea", body).forEach(field => {
    draft[field.name] = field.name === "title" ? field.value.replace(/\s*\n\s*/g, " ").trim() : field.value;
  });
  ["channels", "tasks"].forEach(name => {
    const boxes = $$(`[name=${name}]`, body);
    if (boxes.length) draft[name] = boxes.filter(box => box.checked).map(box => box.value);
  });
  return true;
}

/* ---------- Acciones ---------- */

function save() {
  if (!draft.date) return toast("Elige una fecha de publicación.");
  draft.status = "planned";

  const index = state.posts.findIndex(post => post.id === draft.id);
  if (index >= 0) state.posts[index] = draft;
  else state.posts.push(draft);

  // Rehacer las tareas de esta publicación conservando las ya completadas.
  const previous = state.tasks.filter(task => task.postId === draft.id);
  state.tasks = state.tasks.filter(task => task.postId !== draft.id);
  draft.tasks.forEach(title => state.tasks.push({
    id: `${draft.id}-${title}`,
    title,
    detail: `Para: ${draft.title}`,
    done: previous.some(task => task.title === title && task.done),
    postId: draft.id
  }));

  closeDialog("post-modal");
  commit({ month: draft.date.slice(0, 7) });
  toast("Això sí que té trellat. Publicación guardada en tu calendario.");
}

function discard() {
  state.posts = state.posts.filter(post => post.id !== draft.id);
  closeDialog("post-modal");
  commit();
  toast("Idea descartada.");
}

function initPosts() {
  $("#next-step").addEventListener("click", () => {
    if (!capture()) return;
    if (step < 3) { step++; render(); } else save();
  });
  $("#back-step").addEventListener("click", () => {
    if (step === 1) return discard();
    capture();
    step--;
    render();
  });
  // Vista previa en directo del paso 2 y herramienta según el formato.
  $("#post-body").addEventListener("input", event => {
    if (event.target.matches("[data-autogrow]")) autoGrow(event.target);
    const target = $(`[data-preview="${event.target.name}"]`);
    if (target) target.textContent = event.target.value || (event.target.name === "title" ? "Tu publicación" : "");
    if (event.target.name === "format") {
      draft.format = event.target.value;
      refreshFormatTool();
    }
  });
  // El título es una sola frase: Intro pasa al siguiente paso en vez de hacer salto de línea.
  $("#post-body").addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.matches("[data-autogrow]")) {
      event.preventDefault();
      $("#next-step").click();
    }
  });
  // Abrir el generador de carrusel o la guía del Reel con lo último que se ha escrito.
  $("#post-body").addEventListener("click", event => {
    const button = event.target.closest("[data-open-carousel], [data-open-reel]");
    if (!button || !capture()) return;
    if (button.hasAttribute("data-open-carousel")) openCarousel(draft);
    else openReelGuide(draft);
  });
}
