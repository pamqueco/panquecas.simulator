const usuario = sessionStorage.getItem("usuario");

if (!usuario) {
  window.location.href = "index.html";
}

const rankingDiv = document.getElementById("ranking");

db.ref("usuarios").on("value", snap => {
  const dados = snap.val();
  let lista = [];

  for (let nome in dados) {
    lista.push({
      nome: nome,
      panquecas: dados[nome].panquecas
    });
  }

  lista.sort((a, b) => b.panquecas - a.panquecas);

  rankingDiv.innerHTML = "";

  lista.forEach((u, i) => {
    rankingDiv.innerHTML +=
      `${i + 1}º ${u.nome} — ${u.panquecas} 🥞<br>`;
  });
});
