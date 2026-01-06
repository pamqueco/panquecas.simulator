// Pega o usuário da sessão
const usuario = sessionStorage.getItem("usuario");
if (!usuario) {
  location.href = "index.html";
}

// Mostra o usuário no HTML
const usuarioElemento = document.getElementById("usuario");
if (usuarioElemento) {
  usuarioElemento.textContent = "Usuário: " + usuario;
}

const panquecasElemento = document.getElementById("panquecas");
const input = document.getElementById("valor");
const botao = document.getElementById("apostar");
const resultado = document.getElementById("resultado");

// Referência ao usuário no Firebase
const ref = db.ref("usuarios/" + usuario);

// Função para atualizar o número de panquecas na tela
function atualizarPanquecas(dados) {
  panquecasElemento.textContent = "Panquecas: " + (dados.panquecas || 0);
}

// Busca os dados iniciais e mostra na tela
ref.once("value").then(snap => {
  let dados = snap.val() || { panquecas: 0 };
  atualizarPanquecas(dados);
}).catch(err => {
  console.error("Erro ao acessar Firebase:", err);
  panquecasElemento.textContent = "Erro ao carregar panquecas";
});

botao.onclick = () => {
  const aposta = Number(input.value);

  if (!aposta || aposta <= 0) {
    resultado.textContent = "Valor inválido.";
    return;
  }

  ref.once("value").then(snap => {
    let dados = snap.val() || { panquecas: 0 };

    if (aposta > dados.panquecas) {
      resultado.textContent = "Panquecas insuficientes.";
      return;
    }

    const ganhou = Math.random() < 0.5;

    if (ganhou) {
      dados.panquecas += aposta;
      resultado.textContent = "Você ganhou! 🥞🥞";
    } else {
      dados.panquecas -= aposta;
      resultado.textContent = "Você perdeu 😭";
    }

    // Atualiza no Firebase e na tela
    ref.update({ panquecas: dados.panquecas });
    atualizarPanquecas(dados);

  }).catch(err => {
    console.error("Erro ao acessar Firebase:", err);
    resultado.textContent = "Erro ao acessar os dados. Verifique as permissões.";
  });
};

