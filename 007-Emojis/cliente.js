let usuario = "";

document.querySelector("#persona").onchange = function () {
  usuario = this.value;
};

document.querySelector("#emoji").onclick = function () {
  let emojiContainer = document.querySelector("#emojis");
  emojiContainer.style.display =
    emojiContainer.style.display === "block" ? "none" : "block";
};

document.getElementById("emojis").addEventListener("click", function (event) {
  const textElement = event.target;
  const textContent = [...textElement.textContent];
  const range = document.createRange();
  const rects = [];

  for (let i = 0; i < textContent.length; i++) {
    range.setStart(textElement.firstChild, i);
    range.setEnd(textElement.firstChild, i + 1);
    const rect = range.getBoundingClientRect();
    rects.push({ rect, char: textContent[i], index: i });
  }

  const clickX = event.clientX;
  let clickedEmoji = null;

  for (const { rect, char } of rects) {
    if (clickX >= rect.left && clickX <= rect.right) {
      clickedEmoji = char;
      document.querySelector("#mensaje").value += char;
      break;
    }
  }
});

function enviarMensaje() {
  let mensajeInput = document.querySelector("#mensaje");
  let mensaje = mensajeInput.value.trim();
  if (!mensaje) return;
  mensajeInput.value = "";

  fetch(
    "http://localhost:3000/envia?mensaje=" +
      encodeURIComponent(mensaje) +
      "&usuario=" +
      encodeURIComponent(usuario)
  );
}

document.querySelector("#enviar").onclick = enviarMensaje;

document.querySelector("#mensaje").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    enviarMensaje();
  }
});

var temporizador = setTimeout(recibe, 1000);

function recibe() {
  fetch("http://localhost:3000/recibe")
    .then((response) => response.json())
    .then((datos) => {
      let mensajes = document.querySelector("#mensajes");
      mensajes.textContent = "";
      datos.forEach((dato) => {
        let articulo = document.createElement("article");
        let cabecera = document.createElement("h6");
        cabecera.textContent = dato.fecha + " - " + dato.usuario + ":";
        articulo.appendChild(cabecera);
        let parrafo = document.createElement("p");
        parrafo.textContent = dato.mensaje;
        articulo.appendChild(parrafo);
        mensajes.appendChild(articulo);
        articulo.style.background =
          "hsl(" + stringToMod360(dato.usuario) + "deg,50%,90%)";
      });
      mensajes.scrollTop = mensajes.scrollHeight;
    });
  clearTimeout(temporizador);
  temporizador = setTimeout(recibe, 1000);
}

