// Generador de carrusel. Se abre desde una publicación con formato "Carrusel".
// Paso 1: diapositivas sacadas del guion + qué foto necesita cada una (el negocio sube las suyas).
// Paso 2: montaje con el kit de marca (colores, tipografías, logo) y descarga en PNG.
//
// Conectar la IA → suggestCarousel() y photoBrief(). Hoy usan reglas sencillas;
// la IA solo tiene que devolver la misma forma: [{ text, noPhoto, closing }] y un texto por foto.
// Trellat no busca fotos en internet: las fotos son siempre del propio negocio.

const SLIDE_W = 1080;   // 4:5, el formato vertical de Instagram
const SLIDE_H = 1350;
const MAX_SLIDES = 10;

let carouselPost = null;     // la publicación (el borrador de posts.js)
let carouselSlides = [];     // [{ text, photo, noPhoto, closing }]
let carouselStep = 1;

/* ---------- Propuesta de diapositivas ---------- */

const plain = (text = "") => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const CLOSING_WORDS = /cita|contact|escrib|llam|visit|reserv|pasate|ven a|siguenos|guarda/;

/** "Diapositiva 1: …" y "Diapositivas 2–4: …" → textos. */
function slidesFromScript(script = "") {
  const texts = [];
  script.split("\n").forEach(line => {
    const m = line.trim().match(/^diapositivas?\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*[:.]\s*(.+)$/i);
    if (!m) return;
    const from = Number(m[1]);
    const to = Math.min(Number(m[2] || m[1]), from + 7);
    for (let n = from; n <= to; n++) {
      texts.push(to > from ? `${m[3].trim()}\n${n - from + 1} de ${to - from + 1}` : m[3].trim());
    }
  });
  return texts;
}

function suggestCarousel(post) {
  let texts = slidesFromScript(post.script);

  if (!texts.length) {
    // Sin guion por diapositivas: usamos las frases del texto o de la descripción.
    const ideas = (post.caption || post.description || "")
      .split(/(?<=[.?!])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 12).slice(0, 4);
    texts = ideas.length >= 2 ? ideas : ["Idea clave 1", "Idea clave 2", "Idea clave 3"];
  }

  // La portada lleva el título si el guion no empieza con él.
  const title = post.title.trim();
  if (title && !plain(texts[0]).startsWith(plain(title).slice(0, 10))) texts.unshift(title);

  const slides = texts.map(text => ({
    text, photo: null, closing: false,
    noPhoto: /mito|verdad|falso|sabias|dato|\?$/.test(plain(text)) && !/revis|equipo/.test(plain(text))
  }));
  slides[0].noPhoto = false;   // la portada siempre pide foto

  // Cierre: la llamada a la acción, si el guion no termina ya con una.
  const last = slides[slides.length - 1];
  if (CLOSING_WORDS.test(plain(last.text)) && slides.length > 1) last.closing = true;
  else if (post.cta) slides.push({ text: post.cta, photo: null, noPhoto: false, closing: true });

  return slides.slice(0, MAX_SLIDES);
}

/* ---------- Qué foto necesita cada diapositiva ---------- */

const PHOTO_IDEAS = [
  [/equipo|persona|especialidad|nosotros|quien/, "Retrato de medio cuerpo de la persona en su puesto, mirando a cámara y sonriendo. Fondo despejado."],
  [/dient|boca|encia|aliento|mastic/, "Primer plano de la boca de una mascota durante una exploración, con guantes."],
  [/vacun|desparasit|pipeta|pastilla|tratamiento|medicament/, "Detalle de las manos del veterinario con el producto. Mejor sin agujas en primer plano."],
  [/cita|reserv|pedir|contact|horario|llam|escrib/, "La recepción o el mostrador, o una mano con el móvil escribiendo para pedir cita."],
  [/revis|consulta|explor|camilla/, "Un veterinario explorando a una mascota en la camilla, en plano medio."],
  [/dura|tiempo|minuto|cuanto/, "La sala de espera tranquila o un detalle de la consulta preparada."],
  [/para quien|cachorro|senior|mayor|edad/, "Una mascota mirando a cámara, a la altura de sus ojos (mejor de un cliente que dé permiso)."],
  [/perro|gato|mascota|animal/, "Una mascota real, a la altura de sus ojos y con luz natural."],
  [/producto|tienda|plato|local|escaparate|carta/, "El producto o el espacio bien iluminado, sin objetos que distraigan."]
];

const STYLE_HINTS = {
  "Fotos reales": "foto real, sin imágenes de banco",
  "Cálido": "luz cálida",
  "Minimalista": "fondo limpio",
  "Colorido": "colores vivos",
  "Elegante": "composición sobria",
  "Divertido": "un gesto espontáneo"
};

function photoBrief(slide, index, total) {
  const text = plain(`${slide.text} ${index === 0 ? carouselPost.title : ""}`);
  const match = PHOTO_IDEAS.find(([re]) => re.test(text));
  let what;
  if (slide.noPhoto) what = "Esta funciona mejor sin foto: el texto en grande sobre tus colores de marca.";
  else if (index === 0) what = `La foto más llamativa del carrusel. ${match ? match[1] : "Una mascota o alguien del equipo, en un momento real."} Deja aire arriba para el logo.`;
  else if (slide.closing && index === total - 1) what = match ? match[1] : "El equipo o la entrada del local, una foto cercana que invite a venir.";
  else what = match ? match[1] : "Una foto que muestre lo que dice el texto, de tu día a día.";

  const style = (state.brandKit.styles || []).map(s => STYLE_HINTS[s]).filter(Boolean);
  const meta = slide.noPhoto ? "Se monta con tu color de fondo" : ["Vertical (4:5)", "luz natural", ...style].join(" · ");
  return { what, meta };
}

/* ---------- Pintar la ventana ---------- */

function roleOf(slide, index, total) {
  if (index === 0) return "Portada";
  if (slide.closing && index === total - 1) return "Cierre";
  return "Contenido";
}

function renderCarouselStep1() {
  const n = carouselSlides.length;
  const withPhoto = carouselSlides.filter(s => !s.noPhoto).length;
  const ready = carouselSlides.filter(s => !s.noPhoto && s.photo).length;

  $("#carousel-eyebrow").textContent = "Carrusel · Paso 1 de 2";
  $("#carousel-modal-title").textContent = "Las fotos que necesitas.";
  $("#carousel-intro").textContent = `${n} diapositivas a partir de tu guion. Para cada una te decimos qué foto hacer; súbela, o márcala "sin foto" y la montamos solo con tus colores.`;

  $("#carousel-body").innerHTML = `
    <div class="photo-progress"><strong>${ready} de ${withPhoto}</strong> fotos subidas
      <span class="helper">· Puedes generar el carrusel aunque falte alguna: esas diapositivas irán solo con color.</span></div>
    <div class="slide-list">
      ${carouselSlides.map((slide, i) => {
        const brief = photoBrief(slide, i, n);
        return `
        <article class="slide-item" data-index="${i}">
          <div class="slide-thumb ${slide.noPhoto ? "no-photo" : ""}">
            ${slide.photo && !slide.noPhoto ? `<img src="${slide.photo}" alt="Foto de la diapositiva ${i + 1}">`
              : `<span>${slide.noPhoto ? "Aa" : "+"}</span><small>${slide.noPhoto ? "Solo color" : "Falta foto"}</small>`}
          </div>
          <div class="slide-fields">
            <div class="slide-head">
              <span class="pill">${i + 1} · ${roleOf(slide, i, n)}</span>
              ${n > 2 ? `<button type="button" class="text-button danger" data-remove-slide>Quitar</button>` : ""}
            </div>
            <label class="field">Texto<span class="helper">La primera línea es el titular; el resto, el texto pequeño.</span>
              <textarea data-slide-text rows="2">${escapeHTML(slide.text)}</textarea></label>
            <div class="photo-brief">
              <p class="eyebrow">${slide.noPhoto ? "Sin foto" : "Foto que necesitas"}</p>
              <p>${escapeHTML(brief.what)}</p>
              <small>${escapeHTML(brief.meta)}</small>
            </div>
            <div class="slide-actions">
              ${slide.noPhoto ? "" : `<label class="button button-light">${slide.photo ? "Cambiar foto" : "Subir foto"}
                <input type="file" accept="image/*" data-slide-photo hidden></label>`}
              ${slide.photo && !slide.noPhoto ? `<button type="button" class="text-button danger" data-remove-photo>Quitar foto</button>` : ""}
              <label class="inline-check"><input type="checkbox" data-slide-nophoto ${slide.noPhoto ? "checked" : ""} ${i === 0 ? "disabled" : ""}>Sin foto</label>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
    <div class="slide-list-actions">
      ${n < MAX_SLIDES ? `<button type="button" class="button button-light" data-add-slide>+ Añadir diapositiva</button>` : ""}
      <button type="button" class="text-button" data-reset-slides>Volver a sacarlas del guion</button>
    </div>`;

  $("#carousel-back").textContent = "Cerrar";
  $("#carousel-next").textContent = "Generar carrusel →";
}

function renderCarouselStep2() {
  const n = carouselSlides.length;
  $("#carousel-eyebrow").textContent = "Carrusel · Paso 2 de 2";
  $("#carousel-modal-title").textContent = "Tu carrusel, con tu marca.";
  $("#carousel-intro").textContent = "Montado con los colores, tipografías y logo de tu kit de marca. Descárgalo y súbelo a Instagram en este orden.";

  $("#carousel-body").innerHTML = `
    <div class="slide-strip">
      ${carouselSlides.map((_, i) => `
        <figure class="slide-render">
          <canvas width="${SLIDE_W}" height="${SLIDE_H}" data-render="${i}" aria-label="Diapositiva ${i + 1}"></canvas>
          <figcaption><span>${i + 1} / ${n}</span><button type="button" class="text-button" data-download="${i}">Descargar ↓</button></figcaption>
        </figure>`).join("")}
    </div>
    <div class="plan-summary">
      <strong>Guardado con la publicación.</strong>
      <p>¿Quieres cambiar colores o tipografías? Edítalos en Mi marca → Kit de marca y vuelve a generarlo.</p>
    </div>`;

  $("#carousel-back").textContent = "← Cambiar fotos o textos";
  $("#carousel-next").textContent = "Descargar todas ↓";
}

function renderCarousel() {
  if (carouselStep === 1) renderCarouselStep1();
  else renderCarouselStep2();
  $("#carousel-body").scrollTop = 0;
}

function openCarousel(post) {
  carouselPost = post;
  const saved = post.carousel?.slides;
  carouselSlides = saved?.length ? structuredClone(saved) : suggestCarousel(post);
  carouselStep = saved?.length ? 2 : 1;
  renderCarousel();
  openDialog("carousel-modal");
  if (carouselStep === 2) drawCarousel();
}

/* ---------- Montaje en canvas ---------- */

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

/** Espera a que la fuente de Google esté lista para pintarla en el canvas (máx. 3 s). */
async function fontsReady(families) {
  const wait = families.map(async family => {
    loadFont(family);
    const link = document.getElementById(`font-${family.replace(/\s+/g, "-")}`);
    if (link && !link.sheet) await new Promise(r => { link.addEventListener("load", r, { once: true }); link.addEventListener("error", r, { once: true }); });
    await document.fonts.load(`700 80px "${family}"`);
    await document.fonts.load(`400 40px "${family}"`);
  });
  await Promise.race([Promise.allSettled(wait), new Promise(r => setTimeout(r, 3000))]);
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  text.split("\n").forEach(paragraph => {
    let line = "";
    paragraph.split(/\s+/).filter(Boolean).forEach(word => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    });
    lines.push(line);
  });
  return lines;
}

/** Busca el tamaño de letra más grande con el que el texto cabe en la caja. */
function fitText(ctx, text, font, maxWidth, maxHeight, start, min, lineHeight = 1.1) {
  for (let size = start; size > min; size -= 4) {
    ctx.font = font(size);
    const lines = wrapLines(ctx, text, maxWidth);
    if (lines.length * size * lineHeight <= maxHeight) return { lines, size, height: lines.length * size * lineHeight };
  }
  ctx.font = font(min);
  const lines = wrapLines(ctx, text, maxWidth);
  return { lines, size: min, height: lines.length * min * lineHeight };
}

function drawLines(ctx, { lines, size }, x, y, lineHeight = 1.1) {
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * size * lineHeight));
}

/** Como object-fit: cover. */
function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale, sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function drawContain(ctx, img, x, y, maxW, maxH, align = "left") {
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * scale, h = img.height * scale;
  ctx.drawImage(img, align === "center" ? x - w / 2 : x, y, w, h);
}

function brandMark(ctx, assets, x, y, color, align = "left") {
  if (assets.logo) return drawContain(ctx, assets.logo, x, y, 260, 90, align);
  ctx.fillStyle = color;
  ctx.font = `700 34px ${assets.bodyFont}`;
  ctx.textAlign = align;
  ctx.fillText(state.brand.business, x, y + 24);
  ctx.textAlign = "left";
}

function drawSlide(canvas, slide, index, total, assets) {
  const ctx = canvas.getContext("2d");
  const { colors, headFont, bodyFont } = assets;
  const W = SLIDE_W, H = SLIDE_H, pad = 88;
  const photo = slide.noPhoto ? null : assets.photos[index];
  const [headline, ...rest] = slide.text.trim().split("\n");
  const body = rest.join("\n").trim();
  const head = size => `700 ${size}px ${headFont}`;
  const text = size => `400 ${size}px ${bodyFont}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const role = roleOf(slide, index, total);

  if (role === "Portada") {
    let ink;
    if (photo) {
      drawCover(ctx, photo, 0, 0, W, H);
      const shade = ctx.createLinearGradient(0, H * 0.3, 0, H);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,.78)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);
      ink = "#FFFFFF";
    } else {
      ctx.fillStyle = colors.main;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = colors.accent;
      ctx.beginPath(); ctx.arc(W - 60, 220, 300, 0, Math.PI * 2); ctx.fill();
      ink = textOn(colors.main);
    }
    brandMark(ctx, assets, pad, pad, ink);

    const t = fitText(ctx, headline, head, W - pad * 2, 560, 120, 64);
    const b = body ? fitText(ctx, body, text, W - pad * 2, 160, 40, 30, 1.3) : null;
    const bottom = H - pad - 60;
    const top = bottom - t.height - (b ? b.height + 28 : 0);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(pad, top - 44, 110, 12);
    ctx.fillStyle = ink;
    ctx.font = head(t.size);
    drawLines(ctx, t, pad, top);
    if (b) { ctx.font = text(b.size); drawLines(ctx, b, pad, top + t.height + 28, 1.3); }
    ctx.font = `700 30px ${bodyFont}`;
    ctx.textAlign = "right";
    ctx.fillText("Desliza →", W - pad, H - pad - 10);
    return;
  }

  if (role === "Cierre") {
    const ink = textOn(colors.main);
    ctx.fillStyle = colors.main;
    ctx.fillRect(0, 0, W, H);
    let top;
    if (photo) {
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, 360, 250, 0, Math.PI * 2); ctx.clip();
      drawCover(ctx, photo, W / 2 - 250, 110, 500, 500);
      ctx.restore();
      ctx.strokeStyle = colors.accent; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(W / 2, 360, 256, 0, Math.PI * 2); ctx.stroke();
      top = 690;
    } else {
      top = 330;
    }
    ctx.textAlign = "center";
    ctx.fillStyle = ink;
    const t = fitText(ctx, slide.text.trim(), head, W - pad * 2, photo ? 300 : 420, 96, 52);
    ctx.font = head(t.size);
    drawLines(ctx, t, W / 2, top);
    let y = top + t.height + 40;
    const slogan = state.brandKit.slogan?.trim();
    if (slogan) {
      ctx.font = text(38);
      ctx.globalAlpha = 0.85;
      wrapLines(ctx, slogan, W - pad * 2).forEach(line => { ctx.fillText(line, W / 2, y); y += 50; });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = colors.accent;
    ctx.fillRect(W / 2 - 55, y + 20, 110, 10);
    brandMark(ctx, assets, W / 2, H - pad - 90, ink, "center");
    const tags = state.brandKit.hashtags?.trim();
    if (tags) { ctx.fillStyle = ink; ctx.globalAlpha = 0.7; ctx.font = text(28); ctx.textAlign = "center"; ctx.fillText(tags, W / 2, H - pad + 10); ctx.globalAlpha = 1; }
    ctx.textAlign = "left";
    return;
  }

  // Contenido
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);
  const number = String(index + 1).padStart(2, "0");
  let top;
  if (photo) {
    const photoH = Math.round(H * 0.55);
    drawCover(ctx, photo, 0, 0, W, photoH);
    ctx.fillStyle = colors.accent;
    ctx.beginPath(); ctx.arc(pad + 46, photoH, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = textOn(colors.accent);
    ctx.font = `700 38px ${headFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, pad + 46, photoH + 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    top = photoH + 90;
  } else {
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 0, 28, H);
    ctx.fillStyle = colors.accent;
    ctx.font = `700 180px ${headFont}`;
    ctx.fillText(number, pad, pad);
    top = pad + 260;
  }
  const room = H - pad - 70 - top;
  const t = fitText(ctx, headline, head, W - pad * 2, body ? room * 0.55 : room, photo ? 76 : 100, 44);
  const b = body ? fitText(ctx, body, text, W - pad * 2, room - t.height - 30, 40, 28, 1.35) : null;
  // Sin foto, el texto se centra en el espacio libre para que no quede media diapositiva vacía.
  if (!photo) top += Math.max(0, (room - t.height - (b ? b.height + 30 : 0)) / 2 - 40);
  ctx.fillStyle = colors.ink;
  ctx.font = head(t.size);
  drawLines(ctx, t, pad, top);
  if (b) {
    ctx.font = text(b.size);
    ctx.globalAlpha = 0.85;
    drawLines(ctx, b, pad, top + t.height + 30, 1.35);
    ctx.globalAlpha = 1;
  }
  ctx.font = `700 26px ${bodyFont}`;
  ctx.globalAlpha = 0.6;
  ctx.fillText(state.brand.business, pad, H - pad);
  ctx.textAlign = "right";
  ctx.fillText(`${index + 1}/${total}`, W - pad, H - pad);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

async function drawCarousel() {
  const k = state.brandKit;
  await fontsReady([k.fonts.heading, k.fonts.body]);
  const tryLoad = src => (src ? loadImage(src).catch(() => null) : null);
  const assets = {
    colors: {
      main: colorByRole("Principal", "#22201A"),
      secondary: colorByRole("Secundario", colorByRole("Acento", "#E4572E")),
      accent: colorByRole("Acento", "#E4572E"),
      bg: colorByRole("Fondo", "#FBF8F2"),
      ink: colorByRole("Texto", "#1F1D18")
    },
    headFont: `"${k.fonts.heading}", Georgia, serif`,
    bodyFont: `"${k.fonts.body}", system-ui, sans-serif`,
    logo: await tryLoad(k.logo || k.icon),
    photos: await Promise.all(carouselSlides.map(s => tryLoad(s.photo)))
  };
  $$("#carousel-body canvas[data-render]").forEach(canvas => {
    const i = Number(canvas.dataset.render);
    drawSlide(canvas, carouselSlides[i], i, carouselSlides.length, assets);
  });
}

/* ---------- Guardar y descargar ---------- */

function saveCarousel() {
  carouselPost.carousel = { slides: structuredClone(carouselSlides), updatedAt: new Date().toISOString() };
  // Si la publicación ya existe en el calendario, se guarda al momento (sin esperar al paso 3).
  const stored = state.posts.find(post => post.id === carouselPost.id);
  if (stored) {
    stored.carousel = structuredClone(carouselPost.carousel);
    commit({ source: "carousel" });
  }
  refreshFormatTool();
}

const slug = text => plain(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "carrusel";

function downloadSlide(index) {
  const canvas = $(`#carousel-body canvas[data-render="${index}"]`);
  if (!canvas) return;
  canvas.toBlob(blob => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug(carouselPost.title)}-${String(index + 1).padStart(2, "0")}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }, "image/png");
}

/** Reduce la foto a 1350 px de lado (lo que mide la diapositiva) para que quepa en el navegador. */
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("No es una imagen"));
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, SLIDE_H / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- Eventos ---------- */

function initCarousel() {
  const body = $("#carousel-body");
  const slideIndex = el => Number(el.closest(".slide-item")?.dataset.index);

  body.addEventListener("input", event => {
    if (event.target.matches("[data-slide-text]")) carouselSlides[slideIndex(event.target)].text = event.target.value;
  });

  body.addEventListener("change", async event => {
    const t = event.target;
    const i = slideIndex(t);
    if (t.matches("[data-slide-text]")) return renderCarousel();          // actualiza la foto sugerida
    if (t.matches("[data-slide-nophoto]")) { carouselSlides[i].noPhoto = t.checked; return renderCarousel(); }
    if (t.matches("[data-slide-photo]") && t.files[0]) {
      try {
        carouselSlides[i].photo = await readPhoto(t.files[0]);
        renderCarousel();
      } catch {
        toast("Ese archivo no parece una imagen.");
      }
    }
  });

  body.addEventListener("click", event => {
    const t = event.target.closest("button");
    if (!t) return;
    const i = slideIndex(t);
    if (t.hasAttribute("data-download")) return downloadSlide(Number(t.dataset.download));
    if (t.hasAttribute("data-remove-slide")) carouselSlides.splice(i, 1);
    else if (t.hasAttribute("data-remove-photo")) carouselSlides[i].photo = null;
    else if (t.hasAttribute("data-add-slide")) {
      const at = carouselSlides.at(-1)?.closing ? carouselSlides.length - 1 : carouselSlides.length;
      carouselSlides.splice(at, 0, { text: "Nueva diapositiva", photo: null, noPhoto: false, closing: false });
    } else if (t.hasAttribute("data-reset-slides")) {
      if (carouselSlides.some(s => s.photo) && !confirm("Se quitarán las fotos que has subido. ¿Seguimos?")) return;
      carouselSlides = suggestCarousel(carouselPost);
    } else return;
    renderCarousel();
  });

  $("#carousel-next").addEventListener("click", async () => {
    if (carouselStep === 2) {
      carouselSlides.forEach((_, i) => setTimeout(() => downloadSlide(i), i * 350));
      return toast("Descargando las diapositivas en orden…");
    }
    if (carouselSlides.some(s => !s.text.trim())) return toast("Hay alguna diapositiva sin texto.");
    carouselStep = 2;
    renderCarousel();
    await drawCarousel();
    saveCarousel();
  });

  $("#carousel-back").addEventListener("click", () => {
    if (carouselStep === 1) return closeDialog("carousel-modal");
    carouselStep = 1;
    renderCarousel();
  });
}
