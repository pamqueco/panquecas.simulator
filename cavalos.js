const usuario = sessionStorage.getItem("usuario");
if (!usuario) location.href = "index.html";

const tempoEl = document.getElementById("tempo");
const saldoEl = document.getElementById("saldo");
const msg = document.getElementById("msg");

const cavaloSpan = document.getElementById("cavaloEscolhido");
const valorInput = document.getElementById("valor");

const resultadoDiv = document.getElementById("resultado");
const p1El = document.getElementById("p1");
const p2El = document.getElementById("p2");
const p3El = document.getElementById("p3");

let cavaloEscolhido = null;

// saldo em tempo real
db.ref("usuarios/" + usuario).on("value", snap => {
  saldoEl.textContent = "🥞 Panquecas: " + snap.val().panquecas;
});

// selecionar cavalo
window.selecionarCavalo = n => {
  cavaloEscolhido = n;
  cavaloSpan.textContent = n;
};

// ⏱️ contador + gatilho
setInterval(() => {
  db.ref("corrida").once("value").then(snap => {
    const c = snap.val();
    if (!c) return;

    const diff = c.proxima - Date.now();

    if (diff > 0) {
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      tempoEl.textContent = `⏳ Faltam ${m} min ${s} s`;
    } else {
      tempoEl.textContent = "🏁 Corrida em andamento!";
      if (c.status === "aberta") dispararCorrida();
    }
  });
}, 1000);

// 🏁 disparar corrida (auto-regula)
function sortearCorrida() {
  const cavalos = [1,2,3,4,5,6,7,8];
  for (let i = cavalos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cavalos[i], cavalos[j]] = [cavalos[j], cavalos[i]];
  }
  return cavalos.slice(0, 3);
}

function dispararCorrida() {
  db.ref("corrida").update({ status: "finalizando" });

  const [p1, p2, p3] = sortearCorrida();

  db.ref("corrida").set({
    proxima: Date.now() + 5 * 60 * 1000,
    status: "aberta",
    resultado: { primeiro: p1, segundo: p2, terceiro: p3 }
  });
}

// 🏆 mostrar resultado + pagar
db.ref("corrida").on("value", snap => {
  const c = snap.val();
  if (!c || !c.resultado) return;

  resultadoDiv.style.display = "block";
  p1El.textContent = "🥇 1º lugar: Cavalo " + c.resultado.primeiro;
  p2El.textContent = "🥈 2º lugar: Cavalo " + c.resultado.segundo;
  p3El.textContent = "🥉 3º lugar: Cavalo " + c.resultado.terceiro;

  pagarApostas(c);
});

// 🥞 apostar
document.getElementById("apostar").onclick = () => {
  const valor = Number(valorInput.value);

  if (!cavaloEscolhido || valor <= 0) {
    msg.textContent = "Escolha cavalo e valor válido";
    return;
  }

  db.ref("corrida").once("value").then(snap => {
    if (Date.now() >= snap.val().proxima) {
      msg.textContent = "Apostas encerradas";
      return;
    }

    db.ref("usuarios/" + usuario).once("value").then(uSnap => {
      if (valor > uSnap.val().panquecas) {
        msg.textContent = "Panquecas insuficientes";
        return;
      }

      db.ref("apostas/" + usuario).set({
        cavalo: cavaloEscolhido,
        valor: valor,
        pago: false
      });

      db.ref("usuarios/" + usuario).update({
        panquecas: uSnap.val().panquecas - valor
      });

      msg.textContent = "Aposta registrada!";
    });
  });
};

// 💰 pagamento automático
function pagarApostas(corrida) {
  db.ref("config/payout").once("value").then(cfgSnap => {
    const pay = cfgSnap.val();

    db.ref("apostas").once("value").then(apSnap => {
      apSnap.forEach(u => {
        const nome = u.key;
        const a = u.val();
        if (a.pago) return;

        let mult = 0;
        if (a.cavalo === corrida.resultado.primeiro) mult = pay.primeiro;
        else if (a.cavalo === corrida.resultado.segundo) mult = pay.segundo;
        else if (a.cavalo === corrida.resultado.terceiro) mult = pay.terceiro;

        db.ref("apostas/" + nome).update({ pago: true });

        if (mult > 0) {
          db.ref("usuarios/" + nome + "/panquecas")
            .transaction(p => (p || 0) + a.valor * mult);
        }
      });
    });
  });
}
