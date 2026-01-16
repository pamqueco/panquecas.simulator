const logIn = document.getElementById("login");
const senh4 = document.getElementById("senha");
const botao = document.getElementById("entrar");
const resultado = document.getElementById("resultado");

botao.onclick = () => {
  const loginInserido = logIn.value.trim();
  const senhaInserida = senh4.value.trim();

  // 1️⃣ ADMIN
if (
  (loginInserido === "Hermes" && senhaInserida === "Mystical") ||
  (loginInserido === "Polites" && senhaInserida === "sixseven67")
) {
  sessionStorage.setItem("usuario", loginInserido);
  window.location.href = "admin.html";
  return;
}

  // 2️⃣ USUÁRIOS NORMAIS (SUBSTITUÍDO)
  if (
    (loginInserido === "Bianca" && senhaInserida === "7512") || 
    (loginInserido === "Aeolus" && senhaInserida === "12345sixseven89") ||
    (loginInserido === "Ártemis" && senhaInserida === "senhaforte") ||
    (loginInserido === "Ganimedes" && senhaInserida === "gaynimedes++") ||
    (loginInserido === "Leo" && senhaInserida === "leovaldezreidelas123") ||
    (loginInserido === "Tiresias" && senhaInserida === "Pompompurinpanquecudo") ||
    (loginInserido === "Thalia" && senhaInserida === "910787") ||
    (loginInserido === "Clarisse" && senhaInserida === "123cu123") ||
    (loginInserido === "Dionísio" && senhaInserida === "03032011") ||
    (loginInserido === "Hécate" && senhaInserida === "Magia") ||
    (loginInserido === "Nico" && senhaInserida === "NãoBiancaVcNVaiEntrar") ||
    (loginInserido === "Afrodite" && senhaInserida === "Fogonabianca") ||
    (loginInserido === "Selene" && senhaInserida === "qualqueruma") ||
    (loginInserido === "Luke" && senhaInserida === "AmoKronos") ||
    (loginInserido === "Ares" && senhaInserida === "12344321") ||
    (loginInserido === "Apolo" && senhaInserida === "5236778")
  ) {
    db.ref("usuarios/" + loginInserido).get().then(snap => {
      if (!snap.exists()) {
        db.ref("usuarios/" + loginInserido).set({
          panquecas: 100,
          girosHoje: 0,
          ultimoDia: ""
        });
      }

      sessionStorage.setItem("usuario", loginInserido);
      window.location.href = "principal.html";
    });

    return;
  }

  // 3️⃣ ERRO
  resultado.textContent = "Login ou senha incorretos";
};











