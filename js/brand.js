// Vista Mi marca: rellenar y guardar el perfil.

const brandForm = () => $("#brand-form");

function fillBrandForm() {
  const f = brandForm();
  const brand = state.brand;
  $$("[data-options]", f).forEach(select => {
    select.innerHTML = optionsHTML(OPTIONS[select.dataset.options], brand[select.name]);
  });
  $("[data-chips=channels]", f).innerHTML = chipsHTML("channels", OPTIONS.channels, brand.channels);
  ["business", "offer", "audience"].forEach(name => (f[name].value = brand[name] || ""));
  $("#brand-feedback").textContent = "";
}

function initBrand() {
  brandForm().addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(brandForm());
    state.brand = {
      business: data.get("business").trim(),
      sector: data.get("sector"),
      offer: data.get("offer").trim(),
      audience: data.get("audience").trim(),
      goal: data.get("goal"),
      tone: data.get("tone"),
      channels: data.getAll("channels")
    };
    commit();
    $("#brand-feedback").textContent = "Cambios guardados en este navegador.";
    toast("Perfil de marca guardado.");
  });
}
