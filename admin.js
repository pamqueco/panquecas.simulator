// 🔒 Proteção
if (sessionStorage.getItem("admin") !== "true") {
  location.href = "index.html";
}

const usuarioInput = document.getElementById("usuarioAlvo");
const qtdInput = document.getElementById("novaQtd");
const botao = document.getElementById("alterar");
const msg = document.getElementById("msg");
const historicoDiv = document.getElementById("historico");

// 🛠 Alterar usuário específico
botao.onclick = () => {
  const nome = usuarioInput.value.trim();
  const novaQtd = Number(qtdInput.value);

  if (!nome || isNaN(novaQtd)) {
    msg.textContent = "Dados inválidos";
    return;
  }

  const refUser = db.ref("usuarios/" + nome);

  refUser.once("value").then(snap => {
    if (!snap.exists()) {
      msg.textContent = "Usuário não encontrado";
      return;
    }

    const antes = snap.val().panquecas || 0;

    refUser.update({ panquecas: novaQtd });

    // 📜 Salva no histórico
    db.ref("historico").push({
      admin: "adm",
      usuario: nome,
      antes: antes,
      depois: novaQtd,
      data: new Date().toLocaleString()
    });

    msg.textContent = `Panquecas de ${nome} atualizadas! 🥞`;
  });
};

// 📜 Carregar histórico
db.ref("historico").limitToLast(20).on("value", snap => {
  historicoDiv.innerHTML = "";

  snap.forEach(item => {
    const h = item.val();
    historicoDiv.innerHTML +=
      `${h.data} — ${h.admin} alterou ${h.usuario}: ${h.antes} → ${h.depois}<br>`;
  });
});
