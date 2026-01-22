// =====================
// SEGURANÇA
// =====================
const usuario = sessionStorage.getItem("usuario");
if (!usuario) window.location.href = "index.html";

// =====================
// ELEMENTOS
// =====================
const imgCorrida = document.getElementById("imagemCorrida");
const imgVencedor = document.getElementById("imgVencedor");
const msgVencedor = document.getElementById("msgVencedor");
const msg = document.getElementById("msg");
const timerEl = document.getElementById("timer");
const infoAposta = document.getElementById("infoAposta");

let cavaloEscolhido = null;
let cavaloApostado = null;
let proximaCorrida = 0;
let intervaloTimer = null;
let corridaDisparada = false;

// =====================
// CONFIG
// =====================
const DURACAO = 5 * 60 * 1000;

// =====================
// INIT
// =====================
db.ref("corrida").once("value").then(snap => {
  if (!snap.exists()) iniciarNovaCorrida();
});

db.ref("apostas/" + usuario).on("value", snap => {
  if (snap.exists()) {
    const a = snap.val();
    infoAposta.textContent = `🐎 Cavalo ${a.cavalo} | 🥞 ${a.valor}`;
    cavaloEscolhido = a.cavalo;
  } else {
    infoAposta.textContent = "";
    cavaloEscolhido = null;
  }
});

// =====================
// CORRIDA
// =====================
function iniciarNovaCorrida() {
  corridaDisparada = false;

  db.ref("corrida").set({
    status: "aberta",
    proxima: Date.now() + DURACAO,
    resultado: null
  });

  imgCorrida.src = "img/baia.jpg";
  imgVencedor.style.display = "none";
  msgVencedor.textContent = "";
  msg.textContent = "";
}

// ====================
// CORES
// ====================
const coresCavalos = {
  1: "Marrom",
  2: "Vermelho",
  3: "Laranja",
  4: "Amarelo",
  5: "Verde",
  6: "Azul",
  7: "Roxo",
  8: "Rosa"
};

// =====================
// APOSTA
// =====================
function selecionarCavalo(n) {
  if (cavaloEscolhido) {
    msg.textContent = "Você já apostou";
    return;
  }

  cavaloSelecionado = n;
  const cor = coresCavalos[n];
  msg.textContent = `Cavalo ${cor} selecionado`;
}

function apostar() {
  if (!cavaloSelecionado) return;

  const valor = Number(document.getElementById("valorAposta").value);
  if (valor <= 0) return;

  db.ref("usuarios/" + usuario + "/panquecas").once("value").then(snap => {
    if (snap.val() < valor) {
      msg.textContent = "Panquecas insuficientes";
      return;
    }

    db.ref("usuarios/" + usuario + "/panquecas")
      .transaction(p => p - valor);

    cavaloEscolhido = cavaloSelecionado; // 🔒 agora sim apostou

    db.ref("apostas/" + usuario).set({
      cavalo: cavaloEscolhido,
      valor,
      pago: false
    });

    msg.textContent = "Aposta confirmada!";
  });
}

function cancelarAposta() {
  db.ref("apostas/" + usuario).once("value").then(snap => {
    if (!snap.exists()) return;

    const a = snap.val();

    db.ref("usuarios/" + usuario + "/panquecas")
      .transaction(p => p + a.valor);

    db.ref("apostas/" + usuario).remove();
    msg.textContent = "Aposta cancelada";
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
    intervaloTimer = setInterval(() => atualizarTimer(), 1000);
  }

  if (c.status === "finalizada" && c.resultado) {
    mostrarResultado(c);
  }
});

// =====================
// TIMER
// =====================
function atualizarTimer() {
  const r = proximaCorrida - Date.now();

  if (r <= 0 && !corridaDisparada) {
    corridaDisparada = true;
    dispararCorrida();
    timerEl.textContent = "🏁 Corrida em andamento!";
    return;
  }

  if (r > 0) {
    const m = Math.floor(r / 60000);
    const s = Math.floor((r % 60000) / 1000);
    timerEl.textContent = `⏱️ ${m}m ${s}s`;
  }
}

// =====================
// DISPARO
// =====================
function dispararCorrida() {
  const ordem = embaralhar([1,2,3,4,5,6,7,8]);

  db.ref("corrida").update({
    status: "finalizada",
    resultado: {
      primeiro: ordem[0],
      segundo: ordem[1],
      terceiro: ordem[2]
    }
  });

  pagarApostas(ordem[0]);

  setTimeout(iniciarNovaCorrida, 10000);
}

function embaralhar(a) {
  return a.sort(() => Math.random() - 0.5);
}

// =====================
// RESULTADO / FEEDBACK
// =====================
function mostrarResultado(c) {
  const v = c.resultado.primeiro;

  imgVencedor.src = `img/cavalo${v}.png`;
  imgVencedor.style.display = "block";
  imgVencedor.style.margin = "10px auto";

  msgVencedor.textContent = `🏆 Vencedor: Cavalo ${v}`;

  db.ref("apostas/" + usuario).once("value").then(snap => {
    if (!snap.exists()) {
      msg.textContent = "Você não apostou nessa corrida";
      return;
    }

    const a = snap.val();
    if (a.cavalo === v) {
      msg.textContent = `🎉 Você ganhou ${a.valor * 3} panquecas!`;
    } else {
      msg.textContent = "❌ Você perdeu a aposta";
    }
  });
}

// =====================
// PAGAMENTO
// =====================
function pagarApostas(vencedor) {
  db.ref("apostas").once("value").then(snap => {
    snap.forEach(u => {
      const a = u.val();
      if (a.pago) return;

      let ganho = 0;
      if (a.cavalo === vencedor) ganho = a.valor * 3;

      db.ref("apostas/" + u.key).update({ pago: true });

      if (ganho > 0) {
        db.ref("usuarios/" + u.key + "/panquecas")
          .transaction(p => (p || 0) + ganho);
      }
    });
  });
}
