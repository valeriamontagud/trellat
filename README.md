# Trellat · MVP

*Marketing amb trellat.* Prototipo en HTML, CSS y JavaScript sin dependencias.

## Cómo abrirlo
Doble clic en `index.html`. No necesita servidor ni instalación.

## Estructura

```
index.html            Estructura de todas las pantallas y ventanas
css/
  main.css            Importa el resto (es el único que enlaza el HTML)
  tokens.css          Colores, tipografías y radios de la marca
  base.css            Botones, formularios, chips, avisos
  layout.css          Barra lateral, cabecera, vistas
  calendar.css        Bienvenida, estado del mes y rejilla
  modals.css          Ventanas y pasos de creación
  views.css           Tareas, Resultados, Mi marca
  home.css            Pantalla de inicio
  brand-kit.css       Kit de marca, pestañas e icono de naranja
  studio.css          Generador de carrusel y guía visual del Reel
js/
  app.js              Arranque, navegación y repintado
  data.js             Datos de demo y listas de opciones
  storage.js          Estado + guardado (commit / resetState)
  utils.js            Ayudas comunes ($, toast, ventanas…)
  calendar.js         Pinta el calendario
  posts.js            Ventana de publicación en 3 pasos
  carousel.js         Generador de carrusel (fotos necesarias + montaje con el kit)
  reel-guide.js       Referencias visuales del Reel (esquema de cada escena)
  month-planner.js    Ventana "preparar el mes" y propuesta simulada
  tasks.js            Vista de tareas
  brand.js            Formulario de Mi marca (pestaña Perfil)
  brand-kit.js        Kit de marca (logo, colores, tipografías, elementos)
  home.js             Pantalla de inicio
```

Los archivos JS se cargan en `index.html` en un orden concreto (datos → ayudas → estado → vistas → `app.js`); si añades uno, colócalo antes de `app.js`.

**Regla sencilla:** los módulos cambian `state` y llaman a `commit()`. Eso guarda en el navegador y avisa a `app.js`, que repinta lo necesario. Ningún módulo pinta pantallas que no son suyas.

## Dónde tocar cada cosa
- Un color o una fuente → `css/tokens.css`
- Un texto de opciones (formatos, tonos, redes…) → `OPTIONS` en `js/data.js`
- Las ideas de la propuesta simulada → `demoPlanIdeas` en `js/data.js`
- Conectar la IA → `generatePlan()` en `js/month-planner.js` (el resumen `state.monthBrief` ya está listo para enviarse)

- Conectar la IA al carrusel → `suggestCarousel()` y `photoBrief()` en `js/carousel.js`
- Conectar la IA al Reel → `shotFor()` en `js/reel-guide.js`

- Las fuentes que se pueden elegir en el kit → `OPTIONS.fonts` en `js/data.js`
- El kit de ejemplo del negocio → `brandKit` en `js/data.js`

## Estudio de contenido
Al abrir una publicación del mes aparece una herramienta según el formato:

- **Carrusel → Generar carrusel.** Saca las diapositivas del guion ("Diapositiva 1: …", "Diapositivas 2–4: …"), dice qué foto necesita cada una (según el texto y el estilo visual del kit) y deja subirla o marcarla "sin foto". Después monta las diapositivas a 1080×1350 con los colores, tipografías, logo, eslogan y hashtags del kit, y las descarga en PNG. Se guarda con la publicación.
- **Reel → Ver referencias visuales.** Un esquema vertical (9:16) por escena: plano recomendado, dónde colocar persona, mascota u objeto (cuadrícula de tercios), zonas que tapa la app, dónde va el texto y cómo mover la cámara, con duración aproximada.

Trellat no busca fotos en internet: las fotos son del propio negocio y los esquemas son dibujos propios en SVG.

## Limitaciones de la demo
- Datos y resultados de ejemplo; la propuesta del mes es simulada.
- No publica en redes.
- Las ideas de fotos y planos salen de reglas por palabras clave (pensadas para la demo veterinaria) hasta conectar la IA.
- Las fotos del carrusel también ocupan espacio en el navegador (se reducen a 1350 px).
- Guarda solo en este navegador (sin usuarios ni base de datos). Las imágenes del kit se reducen al subirlas, pero el navegador tiene un límite de unos 5 MB.
