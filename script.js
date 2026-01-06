const logIn = document.getElementById("login");
const senh4 = document.getElementById("senha");
const botao = document.getElementById("entrar");
const resultado = document.getElementById("resultado");

botao.onclick = () => {
  const loginInserido = logIn.value.trim();
  const senhaInserida = senh4.value.trim();

  if (loginInserido === "OS++" && senhaInserida === "moly") {
    sessionStorage.setItem("admin", "true");
    window.location.href = "admin.html";
    return;
  }
  
if ((loginInserido === "Polites" && senhaInserida === "sixseven") ||
     (loginInserido === "Bianca" && senhaInserida === "7512") || 
     (loginInserido === "Hermes" && senhaInserida === "Mystical") ||
     (loginInserido === "Medusa" && senhaInserida === "Cacetinho alemães") ||
     (loginInserido === "Aeolus" && senhaInserida === "12345sixseven89") ||
     (loginInserido === "Ártemis" && senhaInserida === "senhaforte") ||
     (loginInserido === "Ganimedes" && senhaInserida === "gaynimedes++") ||
     (loginInserido === "Leo" && senhaInserida === "leovaldezreidelas123") ||
     (loginInserido === "Tiresias" && senhaInserida === "bobão2346") ||
     (loginInserido === "Thalia" && senhaInserida === "910787") ||
     (loginInserido === "Clarisse" && senhaInserida === "123cu123") ||
     (loginInserido === "Dionísio" && senhaInserida === "03032011") ||
     (loginInserido === "Hécate" && senhaInserida === "Magia") ||
     (loginInserido === "Nico" && senhaInserida === "NãoBiancaVcNVaiEntrar")
   ) {
    db.ref("usuarios/" + loginInserido)
      .get()
      .then(snap => {
        if (!snap.exists()) {
          return db.ref("usuarios/" + loginInserido).set({
            panquecas: 100,
            girosHoje: 0,
            ultimoDia: ""
          });
        }
      })
      .then(() => {
        sessionStorage.setItem("usuario", loginInserido);
        window.location.href = "principal.html";
      })
      .catch(err => {
        console.error(err);
        resultado.textContent = "Erro ao conectar ao banco de dados";
      });

  } else {
    resultado.textContent = "Login ou senha incorretos";
  }
};


