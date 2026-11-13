// Datos de demostración y listas de opciones. Aquí no hay lógica.

const OPTIONS = {
  formats: ["Reel", "Carrusel", "Imagen", "Historia"],
  objectives: ["Generar confianza", "Aumentar las visitas", "Dar a conocer servicios", "Conseguir ventas o reservas", "Crear comunidad", "Educar a la audiencia"],
  goals: ["Generar confianza", "Dar a conocer servicios", "Conseguir visitas o ventas", "Crear comunidad"],
  tones: ["Cercano y profesional", "Divertido", "Educativo", "Elegante y minimalista"],
  sectors: ["Clínica veterinaria", "Restauración", "Comercio local", "Salud y bienestar", "Servicios profesionales", "Otro"],
  channels: ["Instagram", "TikTok", "Facebook"],
  fonts: ["Bricolage Grotesque", "DM Sans", "Fraunces", "Playfair Display", "Lora", "Libre Baskerville", "Poppins", "Montserrat", "Nunito", "Work Sans", "Archivo", "Quicksand"],
  colorRoles: ["Principal", "Secundario", "Acento", "Fondo", "Texto"],
  visualStyles: ["Fotos reales", "Ilustración", "Minimalista", "Colorido", "Cálido", "Elegante", "Divertido"],
  prepTasks: ["Grabar o recopilar recursos", "Editar el contenido", "Revisar el texto", "Preparar portada o imágenes"]
};

const DEFAULT_MONTH = "2026-10";

const initialPosts = [
  {
    id: "post-1",
    title: "3 señales de que tu perro necesita una revisión dental",
    description: "Un Reel con tres señales de posibles problemas dentales en perros: mal aliento persistente, encías enrojecidas y dificultad al masticar. Termina recordando la importancia de las revisiones.",
    format: "Reel",
    channels: ["Instagram", "TikTok"],
    status: "recommendation",
    objective: "Educar a la audiencia",
    reason: "Muchos tutores no identifican los primeros signos de problemas dentales. Una pieza educativa les ayuda a reconocerlos y a recordar la importancia de una revisión profesional.",
    timing: "Encaja con la línea de contenido educativo de la marca. La fecha es una sugerencia inicial.",
    outcome: "Guardados, compartidos y consultas relevantes, sin garantizar un resultado concreto.",
    caption: "¿Sabías que el mal aliento puede ser una señal de un problema dental?\n\nPresta atención al mal aliento persistente, las encías enrojecidas o los cambios al masticar. Si notas algo diferente, consulta con tu veterinario.\n\nCuidar su salud también empieza por la boca.",
    script: "Inicio: ¿Sabías que el mal aliento puede ser una señal de un problema dental?\n\nEscena 1: Mal aliento persistente.\nEscena 2: Encías enrojecidas o sangrado.\nEscena 3: Dificultad para masticar.\n\nCierre: Una revisión ayuda a detectar problemas a tiempo.",
    cta: "Si tienes dudas, consúltanos en la clínica.",
    date: "2026-10-21",
    time: "18:30",
    tasks: []
  },
  {
    id: "post-2",
    title: "Conoce al equipo de la clínica",
    description: "Un carrusel que presenta a cada miembro del equipo con una breve introducción.",
    format: "Carrusel",
    channels: ["Instagram", "Facebook"],
    status: "planned",
    objective: "Crear comunidad",
    caption: "Detrás de cada consulta hay un equipo que cuida de tu mascota.",
    script: "Diapositiva 1: Conoce al equipo.\nDiapositivas 2–4: Cada persona y su especialidad.",
    cta: "Pásate a saludarnos.",
    date: "2026-10-23",
    time: "12:00",
    tasks: []
  },
  {
    id: "post-3",
    title: "Mitos sobre la desparasitación",
    description: "Un carrusel que desmonta mitos habituales sobre la desparasitación y anima a consultar qué cuidados necesita cada mascota.",
    format: "Carrusel",
    channels: ["Instagram", "Facebook"],
    status: "recommendation",
    objective: "Educar a la audiencia",
    reason: "Resolver dudas frecuentes aporta valor y abre conversaciones con los tutores.",
    timing: "Complementa los contenidos educativos sin repetir el tema dental.",
    outcome: "Guardados y preguntas relevantes.",
    caption: "",
    script: "",
    cta: "",
    date: "2026-10-28",
    time: "18:00",
    tasks: []
  }
];

const initialState = {
  posts: initialPosts,
  brand: {
    business: "Clínica Veterinaria Antonio Tudela",
    sector: "Clínica veterinaria",
    offer: "Atención veterinaria, prevención, revisiones y cuidado de mascotas.",
    audience: "Personas de Alberic y alrededores que tienen mascotas y quieren cuidarlas bien.",
    goal: "Generar confianza",
    tone: "Cercano y profesional",
    channels: ["Instagram", "TikTok", "Facebook"]
  },
  // Kit de marca del negocio: lo que Trellat usará para que las piezas se parezcan a su marca.
  brandKit: {
    logo: null,          // imagen (data URL) o null
    icon: null,          // versión reducida o avatar
    colors: [
      { name: "Verde clínica", hex: "#2F6B5A", role: "Principal" },
      { name: "Menta", hex: "#BFE3D3", role: "Secundario" },
      { name: "Coral", hex: "#E8725C", role: "Acento" },
      { name: "Crema", hex: "#FBF8F2", role: "Fondo" },
      { name: "Tinta", hex: "#1F2A28", role: "Texto" }
    ],
    fonts: { heading: "Fraunces", body: "DM Sans" },
    slogan: "Cuidamos de quien te cuida.",
    hashtags: "#Alberic #veterinario #mascotas",
    styles: ["Fotos reales", "Cálido"],
    elements: []         // [{ id, name, src }]
  },
  monthBrief: null,
  tasks: [
    { id: "task-1", title: "Preparar el calendario de contenido", detail: "Definir los temas del mes", done: true, postId: null },
    { id: "task-2", title: "Revisar el perfil de marca", detail: "Comprobar que la información está actualizada", done: false, postId: null },
    { id: "task-3", title: "Elegir fotos y vídeos disponibles", detail: "Recopilar recursos para las próximas publicaciones", done: false, postId: null }
  ]
};

// Ideas que usa la propuesta simulada del mes (hasta conectar la IA).
const demoPlanIdeas = [
  {
    day: 5, format: "Reel", objective: "Educar a la audiencia",
    title: "Cómo preparar a tu perro para su primera vacuna",
    reason: "Un consejo práctico aporta valor y genera confianza antes de la visita.",
    script: "Inicio: ¿Primera vacuna a la vista?\nEscena 1: Llévale con correa o transportín.\nEscena 2: Trae su cartilla.\nEscena 3: Premios para que asocie la visita con algo bueno.\nCierre: Guarda este vídeo para ese día.",
    caption: "Tres gestos sencillos para que su primera vacuna sea más tranquila.",
    cta: "Guarda este consejo para más tarde."
  },
  {
    day: 12, format: "Carrusel", objective: "Dar a conocer servicios",
    title: "Así funciona nuestra revisión anual",
    reason: "Explicar un servicio paso a paso ayuda a entender cuándo es útil.",
    script: "Diapositiva 1: ¿Qué revisamos?\nDiapositiva 2: Para quién es.\nDiapositiva 3: Cuánto dura.\nDiapositiva 4: Cómo pedir cita.",
    caption: "Te contamos qué incluye la revisión anual y por qué merece la pena.",
    cta: "Escríbenos para pedir cita."
  },
  {
    day: 19, format: "Reel", objective: "Generar confianza",
    title: "¿Cada cuánto hay que desparasitar? Te respondemos",
    reason: "Responder dudas reales muestra la experiencia del equipo y acerca la clínica.",
    script: "Inicio: la pregunta, en boca de un tutor.\nDesarrollo: un miembro del equipo responde con palabras sencillas.\nCierre: cada mascota es distinta, consúltanos.",
    caption: "Una de las preguntas que más nos hacéis, respondida.",
    cta: "¿Qué otra duda quieres que respondamos?"
  },
  {
    day: 26, format: "Historia", objective: "Crear comunidad",
    title: "Un día en la clínica",
    reason: "Mostrar el lado humano del negocio acerca la marca a quien la sigue.",
    script: "Historia 1: abrimos la puerta.\nHistoria 2: un detalle del trabajo.\nHistoria 3: encuesta: ¿qué quieres ver?",
    caption: "Un pequeño vistazo a nuestro día.",
    cta: "Déjanos tu pregunta."
  }
];
