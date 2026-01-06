const logIn = document.getElementById("login");
const senh4 = document.getElementById("senha");
const botao = document.getElementById("entrar");
const resultado = document.getElementById("resultado");

botao.onclick = () => {
  const loginInserido = logIn.value.trim();
  const senhaInserida = senh4.value.trim();

 if ((loginInserido === "Polites" && senhaInserida === "1234") || (loginInserido === "Bianca" && senhaInserida === "7512")){

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


} else {
  resultado.textContent = "Login ou senha incorretos";
}

};



