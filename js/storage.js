// Estado de la app y guardado en el navegador.
// Cualquier módulo que cambie datos llama a commit(); app.js escucha y repinta.

const STORAGE_KEY = "trellat-demo-v2";

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(initialState), ...(saved || {}) };
  } catch (error) {
    console.warn("No se pudo recuperar el estado guardado.", error);
    return structuredClone(initialState);
  }
}

const state = load();

function commit(detail = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("No se pudo guardar localmente.", error);
    toast("No queda espacio en este navegador. Prueba con imágenes más ligeras o borra alguna.");
  }
  document.dispatchEvent(new CustomEvent("trellat:change", { detail }));
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  Object.keys(state).forEach(key => delete state[key]);
  Object.assign(state, structuredClone(initialState));
  commit({ reset: true });
}
