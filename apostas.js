const usuario = sessionStorage.getItem("usuario");

const imgCorrida = document.getElementById("imagemCorrida");
const imgVencedor = document.getElementById("imgVencedor");
const msgVencedor = document.getElementById("msgVencedor");
const msg = document.getElementById("msg");

let cavaloEscolhido = null;

// selecionar cavalo
function selecionarCavalo(n) {
  cavaloEscolhido = n;
  msg.textContent = `Cavalo ${n} selecionado`;
}

// apostar
function apostar() {
  const valor = Number(document.getElementById("valorAposta").value);

  if (!cavaloEscolhido || valor <= 0) {
    msg.textContent = "Escolha um cavalo e um valor válido";
    return;
  }

  db.ref("usuarios/" + usuario + "/panquecas").once("value").then(snap => {
    if (snap.val() < valor) {
      msg.textContent = "Panquecas insuficientes";
      return;
    }

    db.ref("usuarios/" + usuario + "/panquecas")
      .transaction(p => p - valor);

    db.ref("apostas/" + usuario).set({
      cavalo: cavaloEscolhido,
      valor: valor,
      pago: false
    });

    msg.textContent = "Aposta realizada!";
  });
}

// listener da corrida (sincroniza tudo)
db.ref("corrida").on("value", snap => {
  const c = snap.val();
  if (!c) return;

  // antes da corrida
  if (c.status === "aberta") {
    imgCorrida.src = "img/baia.png";
    imgVencedor.style.display = "none";
    msgVencedor.textContent = "";
  }

  // corrida finalizada
  if (c.status === "finalizada" && c.resultado?.primeiro) {
    const v = c.resultado.primeiro;

    msgVencedor.textContent = `🏆 Vencedor: Cavalo ${v}`;
    imgVencedor.src = `img/cavalovitoria${v}.png`;
    imgVencedor.style.display = "block";

    pagarApostas(c);
  }
});

// pagamento (1º, 2º e 3º controlados pelo admin)
function pagarApostas(corrida) {
  db.ref("config/payout").once("value").then(cfgSnap => {
    const cfg = cfgSnap.val() || {};

    const m1 = Number(cfg.primeiro) || 0;
    const m2 = Number(cfg.segundo) || 0;
    const m3 = Number(cfg.terceiro) || 0;

    db.ref("apostas").once("value").then(apSnap => {
      apSnap.forEach(u => {
        const nome = u.key;
        const a = u.val();
        if (a.pago) return;

        db.ref("apostas/" + nome).update({ pago: true });

        let ganho = 0;

        if (a.cavalo === corrida.resultado.primeiro && m1 > 0)
          ganho = a.valor * m1;

        if (a.cavalo === corrida.resultado.segundo && m2 > 0)
          ganho = a.valor * m2;

        if (a.cavalo === corrida.resultado.terceiro && m3 > 0)
          ganho = a.valor * m3;

        if (ganho > 0) {
          db.ref("usuarios/" + nome + "/panquecas")
            .transaction(p => (p || 0) + ganho);
        }
      });
    });
  });
}
