// BLOQUEIO BÁSICO
if (sessionStorage.getItem("admin") !== "true") {
  location.href = "index.html";
}

const input = document.getElementById("valor");
const botao = document.getElementById("aplicar");
const msg = document.getElementById("msg");

botao.onclick = () => {
  const valor = Number(input.value);

  if (!valor && valor !== 0) {
    msg.textContent = "Valor inválido";
    return;
  }

  db.ref("usuarios").once("value").then(snap => {
    const usuarios = snap.val();

    for (let nome in usuarios) {
      db.ref("usuarios/" + nome).update({
        panquecas: valor
      });
    }

    msg.textContent = "Panquecas atualizadas para todos 🥞";
  });
};
