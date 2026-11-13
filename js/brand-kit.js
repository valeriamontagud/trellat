// Kit de marca del negocio: logo, colores, tipografías, elementos y estilo.
// Se guarda solo al cambiar algo. Las imágenes se reducen antes de guardarlas
// para que quepan en el navegador.

const kit = () => state.brandKit;
const kitRoot = () => $("#brand-kit");
const MAX_COLORS = 8;

/* ---------- Utilidades ---------- */

/** Reduce una imagen a `max` píxeles de lado y la devuelve como data URL. */
function readImage(file, max = 600) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("No es una imagen"));
    if (file.type === "image/svg+xml") {               // los SVG se guardan tal cual
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      return reader.readAsDataURL(file);
    }
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Carga una fuente de Google Fonts una sola vez (necesita conexión). */
function loadFont(family) {
  const id = `font-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

/** Negro o blanco, lo que se lea mejor encima de un color. */
function textOn(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1F1D18" : "#FFFFFF";
}

const colorByRole = (role, fallback) => kit().colors.find(c => c.role === role)?.hex || fallback;

function initials() {
  const words = (state.brand.business || "Mi marca").split(/\s+/).filter(w => w.length > 2);
  return words.slice(-2).map(w => w[0].toUpperCase()).join("") || "M";
}

function saveKit(message) {
  commit({ source: "kit" });
  const status = $("#kit-status");
  if (status) status.textContent = message || "Guardado en este navegador";
}

/* ---------- Pintar ---------- */

function logoSlot(key, title, hint) {
  const src = kit()[key];
  const placeholder = `<span class="kit-monogram" style="background:${colorByRole("Principal", "#22201A")};color:${textOn(colorByRole("Principal", "#22201A"))}">${escapeHTML(initials())}</span>`;
  return `
    <div class="logo-slot">
      <div class="logo-previews">
        <div class="logo-bg light">${src ? `<img src="${src}" alt="${title}">` : placeholder}</div>
        <div class="logo-bg dark">${src ? `<img src="${src}" alt="">` : placeholder}</div>
      </div>
      <div class="logo-meta">
        <strong>${title}</strong>
        <p class="helper">${hint}</p>
        <div class="kit-actions">
          <label class="button button-light">${src ? "Cambiar" : "Subir imagen"}
            <input type="file" accept="image/*" data-upload="${key}" hidden></label>
          ${src ? `<button class="text-button danger" data-remove="${key}">Quitar</button>` : ""}
        </div>
      </div>
    </div>`;
}

function colorRow(color, index) {
  return `
    <div class="color-row" data-index="${index}">
      <input type="color" value="${color.hex}" data-color="hex" aria-label="Color">
      <input value="${escapeHTML(color.name)}" data-color="name" aria-label="Nombre del color" placeholder="Nombre">
      <input value="${color.hex.toUpperCase()}" data-color="hexText" aria-label="Código" maxlength="7" class="hex">
      <select data-color="role" aria-label="Uso">${optionsHTML(OPTIONS.colorRoles, color.role)}</select>
      <button class="icon-button" data-remove-color="${index}" aria-label="Quitar color">×</button>
    </div>`;
}

function section(number, title, text, body) {
  return `
    <section class="kit-section">
      <div class="form-section-title"><span class="form-number">${number}</span><div><h2>${title}</h2><p>${text}</p></div></div>
      ${body}
    </section>`;
}

function renderBrandKit() {
  const k = kit();
  [k.fonts.heading, k.fonts.body].forEach(loadFont);

  kitRoot().innerHTML = `
    <div class="kit-layout">
      <div class="panel kit-editor">
        ${section("01", "Logo", "Sube tu logo y una versión reducida para avatares.", `
          <div class="logo-slots">
            ${logoSlot("logo", "Logo principal", "PNG o SVG, mejor con fondo transparente.")}
            ${logoSlot("icon", "Icono o avatar", "Versión cuadrada para perfiles y esquinas.")}
          </div>`)}

        ${section("02", "Colores", "Tu paleta y para qué se usa cada color.", `
          <div class="color-list">${k.colors.map(colorRow).join("")}</div>
          ${k.colors.length < MAX_COLORS ? `<button class="button button-light" data-add-color>+ Añadir color</button>` : ""}`)}

        ${section("03", "Tipografías", "Una para titulares y otra para el texto.", `
          <div class="grid-2">
            <label class="field">Titulares<select data-font="heading">${optionsHTML(OPTIONS.fonts, k.fonts.heading)}</select></label>
            <label class="field">Texto<select data-font="body">${optionsHTML(OPTIONS.fonts, k.fonts.body)}</select></label>
          </div>
          <div class="font-specimen">
            <p class="spec-heading" style="font-family:'${k.fonts.heading}'">Aa · ${escapeHTML(k.fonts.heading)}</p>
            <p class="spec-body" style="font-family:'${k.fonts.body}'">Cuidamos de tu mascota como si fuera nuestra. 0123456789</p>
          </div>`)}

        ${section("04", "Elementos gráficos", "Patrones, iconos, fotos de producto… lo que suelas usar.", `
          <div class="elements-grid">
            ${k.elements.map(el => `
              <figure class="element">
                <img src="${el.src}" alt="${escapeHTML(el.name)}">
                <figcaption>${escapeHTML(el.name)}</figcaption>
                <button class="element-remove" data-remove-element="${el.id}" aria-label="Quitar ${escapeHTML(el.name)}">×</button>
              </figure>`).join("")}
            <label class="element add">
              <span>+</span>Añadir
              <input type="file" accept="image/*" multiple data-upload="elements" hidden>
            </label>
          </div>`)}

        ${section("05", "Estilo y voz", "Cómo quieres que se vean y suenen tus publicaciones.", `
          <div class="grid-2">
            <label class="field">Eslogan<input data-text="slogan" value="${escapeHTML(k.slogan)}" placeholder="Tu frase de marca"></label>
            <label class="field">Hashtags habituales<input data-text="hashtags" value="${escapeHTML(k.hashtags)}" placeholder="#tuciudad #tusector"></label>
          </div>
          <div class="field" style="margin-top:16px">Estilo visual<div class="chips">${chipsHTML("kit-style", OPTIONS.visualStyles, k.styles)}</div></div>`)}

        <p class="save-feedback" id="kit-status" role="status">Los cambios se guardan solos.</p>
      </div>

      <aside class="kit-preview">
        <p class="eyebrow">Vista previa</p>
        <div id="kit-post"></div>
        <div class="kit-swatches" id="kit-swatches"></div>
        <p class="helper">Así aplicará Trellat tu kit en las publicaciones que te proponga.</p>
      </aside>
    </div>`;
  renderKitPreview();
}

/** Solo la vista previa: se repinta en cada cambio sin perder el foco de los campos. */
function renderKitPreview() {
  const k = kit();
  const main = colorByRole("Principal", "#22201A");
  const accent = colorByRole("Acento", "#E4572E");
  const ink = textOn(main);
  const logo = k.icon || k.logo;

  $("#kit-post").innerHTML = `
    <div class="mock-post" style="background:${main};color:${ink}">
      <div class="mock-top">
        ${logo ? `<img src="${logo}" alt="">` : `<span class="kit-monogram small" style="background:${ink};color:${main}">${escapeHTML(initials())}</span>`}
        <span style="font-family:'${k.fonts.body}'">${escapeHTML(state.brand.business)}</span>
      </div>
      <h3 style="font-family:'${k.fonts.heading}'">Cómo preparar a tu perro para su primera vacuna</h3>
      <span class="mock-bar" style="background:${accent}"></span>
      <p style="font-family:'${k.fonts.body}'">${escapeHTML(k.slogan)}</p>
      <small style="font-family:'${k.fonts.body}'">${escapeHTML(k.hashtags)}</small>
    </div>`;
  $("#kit-swatches").innerHTML = k.colors.map(c =>
    `<span title="${escapeHTML(c.name)} · ${c.role}" style="background:${c.hex}"></span>`).join("");
}

/* ---------- Eventos ---------- */

async function handleUpload(input) {
  const key = input.dataset.upload;
  const files = [...input.files];
  if (!files.length) return;
  try {
    if (key === "elements") {
      for (const file of files) {
        kit().elements.push({ id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: file.name.replace(/\.[^.]+$/, ""), src: await readImage(file, 500) });
      }
    } else {
      kit()[key] = await readImage(files[0], 600);
    }
    saveKit("Imagen guardada");
    renderBrandKit();
  } catch {
    toast("Ese archivo no parece una imagen.");
  }
}

function initBrandKit() {
  const root = kitRoot();

  // Pestañas Perfil / Kit de marca
  $$(".tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".tab").forEach(t => { t.classList.toggle("active", t === tab); t.setAttribute("aria-selected", t === tab); });
    $$(".tab-panel").forEach(p => (p.hidden = p.dataset.panel !== tab.dataset.tab));
    $("#save-profile").hidden = tab.dataset.tab !== "profile";
  }));

  root.addEventListener("change", event => {
    const t = event.target;
    if (t.dataset.upload) return handleUpload(t);
    if (t.dataset.font) {
      kit().fonts[t.dataset.font] = t.value;
      saveKit();
      return renderBrandKit();
    }
    if (t.name === "kit-style") {
      kit().styles = $$("[name=kit-style]:checked", root).map(box => box.value);
      return saveKit();
    }
    if (t.dataset.color === "role") {
      kit().colors[t.closest(".color-row").dataset.index].role = t.value;
      saveKit();
      renderKitPreview();
    }
  });

  root.addEventListener("input", event => {
    const t = event.target;
    const row = t.closest(".color-row");
    if (row) {
      const color = kit().colors[row.dataset.index];
      if (t.dataset.color === "hex") {
        color.hex = t.value;
        $("[data-color=hexText]", row).value = t.value.toUpperCase();
      } else if (t.dataset.color === "hexText") {
        if (!/^#[0-9a-f]{6}$/i.test(t.value)) return;   // espera a que el código esté completo
        color.hex = t.value.toLowerCase();
        $("[data-color=hex]", row).value = color.hex;
      } else if (t.dataset.color === "name") {
        color.name = t.value;
      }
    } else if (t.dataset.text) {
      kit()[t.dataset.text] = t.value;
    } else {
      return;
    }
    renderKitPreview();
    clearTimeout(initBrandKit.timer);                     // guarda al dejar de escribir
    initBrandKit.timer = setTimeout(() => saveKit(), 400);
  });

  root.addEventListener("click", event => {
    const t = event.target.closest("button");
    if (!t) return;
    if (t.dataset.remove) {
      kit()[t.dataset.remove] = null;
    } else if (t.hasAttribute("data-add-color")) {
      kit().colors.push({ name: "Nuevo color", hex: "#888888", role: "Acento" });
    } else if (t.dataset.removeColor) {
      if (kit().colors.length <= 1) return toast("Deja al menos un color en tu paleta.");
      kit().colors.splice(Number(t.dataset.removeColor), 1);
    } else if (t.dataset.removeElement) {
      kit().elements = kit().elements.filter(el => el.id !== t.dataset.removeElement);
    } else {
      return;
    }
    saveKit();
    renderBrandKit();
  });
}
