const usuario = sessionStorage.getItem("usuario");

if (!usuario) {
  window.location.href = "index.html";
}

document.getElementById("usuario").textContent =
  "Usuário: " + usuario;

function ir(pagina) {
  window.location.href = pagina;
}

