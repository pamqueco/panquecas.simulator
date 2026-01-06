const usuario = sessionStorage.getItem("usuario");
if (!usuario) {
location.href = "index.html";
}

document.getElementById("usuario").textContent = usuario;

const panSpan = document.getElementById("panquecas");
const msg = document.getElementById("msg");
const botao = document.getElementById("girar");

const ref = db.ref("usuarios/" + usuario);

ref.on("value", snap => {
  panSpan.textContent = snap.val().panquecas;
});

botao.onclick = () => {
  ref.once("value").then(snap => {
    let d = snap.val();
    const hoje = new Date().toDateString();

    if (d.ultimoDia !== hoje) {
      d.girosHoje = 0;
      d.ultimoDia = hoje;
    }

    if (d.girosHoje >= 3) {
      msg.textContent = "Limite diário atingido!";
      return;
    }

    const ganho = Math.floor(Math.random() * 25) + 1;

    ref.update({
      panquecas: d.panquecas + ganho,
      girosHoje: d.girosHoje + 1,
      ultimoDia: hoje
    });

    msg.textContent = `+${ganho} 🥞`;
  });
};
