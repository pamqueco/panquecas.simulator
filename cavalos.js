// =====================
// SEGURANÇA DE ACESSO
// =====================
const usuario = sessionStorage.getItem("usuario");

if (!usuario) {
  window.location.href = "index.html";
}

db.ref("usuarios/" + usuario).once("value").then(snap => {
  if (!snap.exists()) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
});

// =====================
// ELEMENTOS
// =====================
const imgCorrida = document.getElementById("imagemCorrida");
const imgVencedor = document.getElementById("imgVencedor");
const msgVencedor = document.getElementById("msgVencedor");
const msg = document.getElementById("msg");
const timerEl = document.getElementById("timer");

let cavaloEscolhido = null;
let proximaCorrida = 0;
let intervaloTimer = null;

// =====================
// CONFIGURAÇÃO DA CORRIDA
// =====================
const DURACAO = 5 * 60 * 1000; // 5 minutos

db.ref("corrida").once("value").then(snap => {
  if (!snap.exists()) iniciarNovaCorrida();
});

function iniciarNovaCorrida() {
  db.ref("corrida").set({
    status: "aberta",
    proxima: Date.now() + DURACAO
  });
}

// =====================
// SELEÇÃO / APOSTA
// =====================
function selecionarCavalo(n) {
  cavaloEscolhido = n;
  msg.textContent = `Cavalo ${n} selecionado`;
}

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

// =====================
// LISTENER GLOBAL
// =====================
db.ref("corrida").on("value", snap => {
  const c = snap.val();
  if (!c) return;

  proximaCorrida = c.proxima;

  if (!intervaloTimer) {
    intervaloTimer = setInterval(() => {
      atualizarTimer(proximaCorrida);
    }, 1000);
  }

  if (c.status === "aberta") {
    imgCorrida.src = "img/baia.jpg";
    msgVencedor.textContent = "";
    imgVencedor.style.display = "none";
  }

  if (c.status === "finalizada") {
    mostrarResultado(c);
  }
});

// =====================
// TIMER (TEMPO REAL)
// =====================
function atualizarTimer(proxima) {
  const restante = proxima - Date.now();

  if (restante <= 0) {
    timerEl.textContent = "🏁 Corrida em andamento!";
    dispararCorrida();
    return;
  }

  const m = Math.floor(restante / 60000);
  const s = Math.floor((restante % 60000) / 1000);
  timerEl.textContent = `⏱️ Próxima corrida em ${m}m ${s}s`;
}

// =====================
// DISPARO AUTOMÁTICO
// =====================
function dispararCorrida() {
  db.ref("corrida/status").transaction(st => {
    if (st === "finalizada") return;
    return "finalizada";
  }).then(() => {
    const ordem = embaralhar([1,2,3,4,5,6,7,8]);

    db.ref("corrida").update({
      resultado: {
        primeiro: ordem[0],
        segundo: ordem[1],
        terceiro: ordem[2]
      }
    });

    pagarApostas({
      resultado: {
        primeiro: ordem[0],
        segundo: ordem[1],
        terceiro: ordem[2]
      }
    });

    setTimeout(iniciarNovaCorrida, 10000);
  });
}

function embaralhar(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// =====================
// RESULTADO (IMAGEM FIXA DO VENCEDOR)
// =====================
function mostrarResultado(c) {
  const v = c.resultado.primeiro;

  msgVencedor.textContent = "🏆 Vencedor:";

  imgVencedor.src = `img/cavalo${v}.png`;
  imgVencedor.style.display = "block";
  imgVencedor.style.height = "60px";
  imgVencedor.style.margin = "10px auto";
}

// =====================
// PAGAMENTO
// =====================
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
        if (a.cavalo === corrida.resultado.primeiro) ganho = a.valor * m1;
        if (a.cavalo === corrida.resultado.segundo) ganho = a.valor * m2;
        if (a.cavalo === corrida.resultado.terceiro) ganho = a.valor * m3;

        if (ganho > 0) {
          db.ref("usuarios/" + nome + "/panquecas")
            .transaction(p => (p || 0) + ganho);
        }
      });
    });
  });
}
