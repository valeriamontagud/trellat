// Referencias visuales del Reel. Se abre desde una publicación con formato "Reel".
// Por cada escena del guion dibuja un esquema vertical (9:16) con el plano recomendado:
// dónde va la persona, la mascota o el objeto, la cuadrícula de tercios, las zonas que tapa
// la interfaz de Instagram/TikTok, dónde poner el texto y cómo mover la cámara.
//
// Son dibujos propios (SVG), no fotos: Trellat no saca imágenes de internet.
// Conectar la IA → shotFor(): hoy elige el plano con palabras clave; la IA puede devolver
// la misma forma { kind, onScreen } por escena.

/* ---------- Escenas del guion ---------- */

function scenesFromScript(post) {
  const scenes = [];
  (post.script || "").split("\n").map(line => line.trim()).filter(Boolean).forEach(line => {
    const m = line.match(/^(inicio|gancho|escena\s*\d+|desarrollo|cierre|final|historia\s*\d+)\s*[:.]\s*(.+)$/i);
    if (m) scenes.push({ label: capitalize(m[1].toLowerCase()), text: m[2].trim() });
    else if (scenes.length) scenes[scenes.length - 1].text += ` ${line}`;
    else scenes.push({ label: "Escena", text: line });
  });
  if (!scenes.length) {
    scenes.push(
      { label: "Inicio", text: post.title || "Presenta el tema con una pregunta." },
      { label: "Desarrollo", text: post.description || "Muestra la idea principal." },
      { label: "Cierre", text: post.cta || "Invita a escribiros o a visitaros." }
    );
  }
  return scenes.slice(0, 8);
}

/* ---------- Qué plano usar ---------- */

const SHOTS = {
  talk: {
    name: "Plano medio a cámara", subject: "person", move: null,
    frame: "Los ojos sobre la línea de arriba de la cuadrícula. Deja un poco de aire encima de la cabeza.",
    camera: "Fija (trípode o apoyada en algo) a la altura de los ojos. De cara a una ventana."
  },
  talkPet: {
    name: "Plano medio con la mascota", subject: "personPet", move: null,
    frame: "La persona en el tercio izquierdo y la mascota en el derecho, los dos dentro del plano.",
    camera: "Fija, un poco más abierta para que quepan los dos. A la altura de la persona sentada."
  },
  detail: {
    name: "Plano detalle", subject: "detail", move: "in",
    frame: "El detalle ocupa casi todo el plano, centrado. Nada más que distraiga.",
    camera: "Acércate a 20–30 cm y toca la pantalla para enfocar. Mejor acercarte despacio que hacer zoom."
  },
  wide: {
    name: "Plano general", subject: "place", move: "forward",
    frame: "El suelo en la línea de abajo; la persona en uno de los tercios laterales, no en el centro.",
    camera: "En mano, caminando despacio hacia dentro, con el estabilizador del móvil activado."
  },
  pet: {
    name: "Plano medio de la mascota", subject: "pet", move: null,
    frame: "Sus ojos en la línea de arriba. Que no queden cortadas las orejas.",
    camera: "Agáchate a la altura de sus ojos. Un premio justo detrás del móvil hace que mire a cámara."
  }
};

const DURATION = { talk: "4–6 s", talkPet: "4–6 s", detail: "2–3 s", wide: "3–4 s", pet: "3–4 s" };

function shotFor(scene, index, total) {
  const t = plain(`${scene.label} ${scene.text}`);
  const pet = /perro|gato|mascota|cachorro|animal|correa|transportin|premio/.test(t);
  let kind;
  if (index === 0) kind = pet && !/pregunta|sabias|\?/.test(t) ? "talkPet" : "talk";   // el gancho, siempre a cámara
  else if (/aliento|boca|encia|diente|cartilla|pata|oreja|producto|pipeta|sangrado|detalle|mastic/.test(t)) kind = "detail";
  else if (/clinica|puerta|sala|abrimos|entrada|local|un dia|recepcion|calle|tienda/.test(t)) kind = "wide";
  else if (index === 0 || index === total - 1 || /responde|equipo|explica|veterinari|cuenta|habla|pregunta|tutor/.test(t)) kind = pet ? "talkPet" : "talk";
  else kind = pet ? "pet" : "talk";

  const short = scene.text.length > 70 ? `${scene.text.slice(0, 67).trim()}…` : scene.text;
  let textPos, onScreen;
  if (index === 0) { textPos = "top"; onScreen = `El gancho, grande y arriba: «${short}». Que se lea en 2 segundos.`; }
  else if (index === total - 1 && total > 1) { textPos = "cta"; onScreen = "La llamada a la acción, encima de la zona de abajo que tapa la app. Añade tu logo."; }
  else if (kind === "detail") { textPos = "top"; onScreen = `Una etiqueta corta arriba que nombre lo que se ve: «${short}».`; }
  else { textPos = "subs"; onScreen = "Subtítulos de lo que se dice, en el centro-abajo. Mucha gente lo ve sin sonido."; }

  const shot = { kind, ...SHOTS[kind], duration: DURATION[kind], textPos, onScreen };
  // Detalle de la mascota (boca, patas…) u objeto (cartilla, producto…): dibujos distintos.
  if (kind === "detail") shot.subject = /aliento|boca|encia|diente|sangrado|mastic|pata|oreja/.test(t) ? "petDetail" : "objectDetail";
  return shot;
}

/* ---------- Dibujo del plano (SVG 9:16) ---------- */

const SUBJECTS = {
  person: `
    <path class="sb-subject" d="M30 320 C30 214 56 172 90 172 C124 172 150 214 150 320 Z"/>
    <rect class="sb-subject" x="80" y="140" width="20" height="38" rx="8"/>
    <circle class="sb-subject" cx="90" cy="110" r="30"/>
    <circle class="sb-eye" cx="80" cy="108" r="2.6"/><circle class="sb-eye" cx="100" cy="108" r="2.6"/>`,
  personPet: `
    <path class="sb-subject" d="M10 320 C10 228 34 190 62 190 C90 190 112 228 112 320 Z"/>
    <circle class="sb-subject" cx="62" cy="128" r="26"/>
    <circle class="sb-eye" cx="54" cy="128" r="2.3"/><circle class="sb-eye" cx="70" cy="128" r="2.3"/>
    <ellipse class="sb-pet" cx="134" cy="262" rx="32" ry="44"/>
    <path class="sb-pet" d="M112 182 l-6 -24 l20 14 Z M156 182 l6 -24 l-20 14 Z"/>
    <circle class="sb-pet" cx="134" cy="200" r="26"/>
    <circle class="sb-eye" cx="125" cy="196" r="2.3"/><circle class="sb-eye" cx="143" cy="196" r="2.3"/>
    <ellipse class="sb-eye" cx="134" cy="210" rx="5" ry="3.5"/>`,
  pet: `
    <ellipse class="sb-pet" cx="90" cy="218" rx="46" ry="62"/>
    <rect class="sb-pet" x="62" y="240" width="18" height="62" rx="8"/><rect class="sb-pet" x="100" y="240" width="18" height="62" rx="8"/>
    <path class="sb-pet" d="M58 96 l-10 -34 l30 20 Z M122 96 l10 -34 l-30 20 Z"/>
    <circle class="sb-pet" cx="90" cy="112" r="36"/>
    <circle class="sb-eye" cx="77" cy="106" r="3"/><circle class="sb-eye" cx="103" cy="106" r="3"/>
    <ellipse class="sb-eye" cx="90" cy="124" rx="7" ry="5"/>`,
  petDetail: `
    <path class="sb-pet" d="M-10 130 C10 60 170 60 190 130 L190 320 L-10 320 Z"/>
    <circle class="sb-eye" cx="52" cy="122" r="5"/><circle class="sb-eye" cx="128" cy="122" r="5"/>
    <ellipse class="sb-pet" cx="90" cy="196" rx="62" ry="44"/>
    <ellipse class="sb-eye" cx="90" cy="168" rx="16" ry="11"/>
    <path class="sb-mouth" d="M48 206 Q90 250 132 206 Z"/>
    <path class="sb-teeth" d="M60 210 l6 10 l6 -9 M108 211 l6 9 l6 -10"/>
    <path class="sb-focus" d="M36 186 v-12 h12 M144 186 v-12 h-12 M36 246 v12 h12 M144 246 v12 h-12"/>`,
  objectDetail: `
    <rect class="sb-place" x="40" y="112" width="100" height="118" rx="8" transform="rotate(-6 90 171)"/>
    <rect class="sb-text-line sb-obj-line" x="56" y="134" width="64" height="6" rx="3" transform="rotate(-6 90 171)"/>
    <rect class="sb-text-line sb-obj-line" x="56" y="150" width="48" height="6" rx="3" transform="rotate(-6 90 171)"/>
    <path class="sb-subject" d="M118 320 L112 236 C110 218 128 214 134 230 L140 210 C143 196 160 198 160 214 L162 320 Z"/>
    <path class="sb-focus" d="M30 104 v-12 h12 M150 104 v-12 h-12 M30 240 v12 h12 M150 240 v12 h-12"/>`,
  place: `
    <line class="sb-floor" x1="0" y1="213" x2="180" y2="213"/>
    <rect class="sb-place" x="14" y="118" width="54" height="50" rx="3"/>
    <line class="sb-floor" x1="41" y1="118" x2="41" y2="168"/>
    <rect class="sb-place" x="104" y="96" width="56" height="117" rx="3"/>
    <circle class="sb-eye" cx="150" cy="158" r="2.5"/>
    <circle class="sb-subject" cx="60" cy="168" r="10"/>
    <rect class="sb-subject" x="50" y="180" width="20" height="40" rx="7"/>`
};

const TEXT_BOXES = {
  top: `<rect class="sb-text" x="18" y="43" width="144" height="34" rx="6"/><rect class="sb-text-line" x="30" y="51" width="120" height="7" rx="3"/><rect class="sb-text-line" x="30" y="63" width="84" height="7" rx="3"/>`,
  subs: `<rect class="sb-text" x="30" y="222" width="120" height="26" rx="5"/><rect class="sb-text-line" x="40" y="232" width="100" height="6" rx="3"/>`,
  cta: `<rect class="sb-text" x="24" y="206" width="132" height="42" rx="21"/><rect class="sb-text-line" x="44" y="223" width="92" height="8" rx="4"/>`
};

const MOVES = {
  in: `<path class="sb-move" d="M6 104 l14 14 m0 -9 v9 h-9 M174 104 l-14 14 m0 -9 v9 h9 M6 246 l14 -14 m0 9 v-9 h-9 M174 246 l-14 -14 m0 9 v-9 h9"/>`,
  forward: `<path class="sb-move" d="M90 300 v-48 m-10 12 l10 -12 l10 12"/>`
};

function frameSVG(shot, index) {
  const id = `hatch-${index}`;
  return `
  <svg viewBox="0 0 180 320" role="img" aria-label="Esquema: ${escapeHTML(shot.name)}">
    <defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="sb-hatch"/></pattern></defs>
    <rect class="sb-bg" width="180" height="320"/>
    ${SUBJECTS[shot.subject]}
    <path class="sb-grid" d="M60 0 V320 M120 0 V320 M0 106.7 H180 M0 213.3 H180"/>
    <rect x="0" y="0" width="180" height="40" fill="url(#${id})"/>
    <rect x="0" y="256" width="180" height="64" fill="url(#${id})"/>
    ${TEXT_BOXES[shot.textPos]}
    ${shot.move ? MOVES[shot.move] : ""}
  </svg>`;
}

/* ---------- Ventana ---------- */

function openReelGuide(post) {
  const scenes = scenesFromScript(post);
  const accent = colorByRole("Acento", "#E4572E");
  const shots = scenes.map((scene, i) => shotFor(scene, i, scenes.length));
  // Dos escenas seguidas con el mismo plano: pedimos cambiar el ángulo para que el vídeo tenga ritmo.
  shots.forEach((shot, i) => {
    if (i > 0 && shots[i - 1].kind === shot.kind) shot.camera += " Cambia un poco el ángulo respecto a la escena anterior para que no parezca la misma toma.";
  });
  const seconds = shots.reduce((sum, s) => sum + parseInt(s.duration.split("–")[1], 10), 0);

  const body = $("#reel-body");
  body.style.setProperty("--sb-accent", accent);
  body.innerHTML = `
    <div class="sb-legend">
      <span><i class="lg-grid"></i>Cuadrícula de tercios</span>
      <span><i class="lg-safe"></i>Lo tapa la app: sin texto aquí</span>
      <span><i class="lg-text"></i>Texto en pantalla</span>
      <span><i class="lg-move"></i>Movimiento de cámara</span>
    </div>

    <div class="scene-list">
      ${scenes.map((scene, i) => {
        const shot = shots[i];
        return `
        <article class="scene-card">
          <figure class="scene-frame">${frameSVG(shot, i)}<figcaption>${i + 1}</figcaption></figure>
          <div class="scene-info">
            <p class="eyebrow">${escapeHTML(scene.label)} · ${shot.duration}</p>
            <h3>${shot.name}</h3>
            <p class="scene-text">${escapeHTML(scene.text)}</p>
            <dl class="scene-tips">
              <div><dt>Encuadre</dt><dd>${shot.frame}</dd></div>
              <div><dt>Cámara</dt><dd>${shot.camera}</dd></div>
              <div><dt>Texto en pantalla</dt><dd>${escapeHTML(shot.onScreen)}</dd></div>
            </dl>
          </div>
        </article>`;
      }).join("")}
    </div>

    <div class="plan-summary">
      <strong>Antes de grabar · unos ${seconds} segundos en total</strong>
      <p>Móvil en vertical (9:16), lente limpia y luz de ventana de frente. Graba cada escena 2 o 3 veces y deja un segundo de margen al principio y al final: luego es más fácil montarlo.</p>
    </div>`;

  openDialog("reel-modal");
  body.scrollTop = 0;
}
