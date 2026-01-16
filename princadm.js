const usuario = sessionStorage.getItem("usuario");

if (usuario !== "Polites" && usuario !== "Hermes") {
  window.location.href = "index.html";
}

document.getElementById("usuario").textContent =
  "Usuário: " + usuario;

function ir(pagina) {
  window.location.href = pagina;
}
