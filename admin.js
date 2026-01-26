// 🔐 segurança ADM
const usuario = sessionStorage.getItem("usuario");
if (usuario !== "Polites") {
  window.location.href = "index.html";
}

// =====================
// MULTIPLICADORES
// =====================
function salvarMultiplicadores() {
  db.ref("config/payout").set({
    primeiro: Number(m1.value),
    segundo: Number(m2.value),
    terceiro: Number(m3.value)
  });
}

// carregar valores
db.ref("config/payout").once("value").then(s => {
  const c = s.val() || {};
  m1.value = c.primeiro || 3;
  m2.value = c.segundo || 2;
  m3.value = c.terceiro || 1.5;
});

// =====================
// CORRIDA
// =====================
db.ref("corrida").on("value", s => {
  const c = s.val();
  if (!c) return;
  statusCorrida.textContent = `Status: ${c.status}`;
});

function forcarCorrida() {
  db.ref("corrida/proxima").set(Date.now());
}

function reiniciarCorrida() {
  db.ref("corrida").remove();
}

// =====================
// USUÁRIOS
// =====================
const lista = document.getElementById("listaUsuarios");

db.ref("usuarios").on("value", snap => {
  lista.innerHTML = "";
  snap.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.key;
    opt.textContent = u.key;
    lista.appendChild(opt);
  });
});

function alterarPanquecas() {
  const nome = lista.value;
  const valor = Number(novoValor.value);

  db.ref("usuarios/" + nome + "/panquecas").set(valor);
}
