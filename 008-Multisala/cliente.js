// cliente.js

// Global Variables
let usuario = "";            // Current user's username
let userId = "";             // Current user's unique ID
let currentRoom = "global";  // Default chat room
let temporizador;            // Timer for fetching messages
let lastMessageCount = {}; // Ej.: { "global": 10, "private_user1_user2": 5 }


// Utility Function: Convert a string to a color hue (0-360)
function stringToMod360(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Function: Register or Reconnect the user
function registerOrReconnectUser() {
  // Check if userId is stored in localStorage
  const storedUserId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');

  if (storedUserId && storedUsername) {
    // Attempt to reconnect using stored userId and username
    console.log('Attempting to reconnect with stored userId and username...');
    fetch(`http://localhost:3000/register?username=${encodeURIComponent(storedUsername)}&userId=${encodeURIComponent(storedUserId)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Reconnection failed:', data.error);
          // If reconnection fails, proceed to register a new user
          promptForUsername();
        } else {
          // Successful reconnection
          usuario = data.username;
          userId = data.id;
          console.log(`Reconnected as ${usuario} with ID ${userId}`);
          loadUserList();
          startReceiving();
        }
      })
      .catch(err => {
        console.error('Error during reconnection:', err);
        // If an error occurs, proceed to register a new user
        promptForUsername();
      });
  } else {
    // No stored userId, proceed to register a new user
    promptForUsername();
  }
}

// Function: Prompt the user to enter a username
function promptForUsername() {
  usuario = prompt("Por favor, ingresa tu nombre de usuario:");

  if (usuario) {
    // Send registration request to the server
    fetch(`http://localhost:3000/register?username=${encodeURIComponent(usuario)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          // Username is taken or invalid, retry registration
          alert(data.error);
          promptForUsername();
        } else {
          // Successful registration
          usuario = data.username;
          userId = data.id;
          // Store userId and username in localStorage
          localStorage.setItem('userId', userId);
          localStorage.setItem('username', usuario);
          console.log(`Registered as ${usuario} with ID ${userId}`);
          loadUserList();
          startReceiving();
        }
      })
      .catch(err => {
        console.error('Error registering user:', err);
        alert("Error al registrar el usuario. Inténtalo de nuevo.");
        promptForUsername();
      });
  } else {
    // No username provided, retry registration
    promptForUsername();
  }
}

// Function: Load and display the user list
function loadUserList() {
  fetch('http://localhost:3000/users')
    .then(response => response.json())
    .then(data => {
      const usuariosUl = document.getElementById('usuarios');
      // Limpiar la lista
      usuariosUl.innerHTML = '';

      // Agregar la sala global
      const liGlobal = document.createElement('li');
const aGlobal = document.createElement('a');
aGlobal.href = "#";
aGlobal.textContent = "Sala Global";
aGlobal.dataset.room = "global";
liGlobal.appendChild(aGlobal);

if (currentRoom === 'global') {
  liGlobal.classList.add('selected');
  // Actualizar la cuenta de mensajes leídos para sala global
  fetch(`http://localhost:3000/recibe?room=global`)
    .then(res => res.json())
    .then(mensajes => {
      lastMessageCount['global'] = mensajes.length;
    });
} else {
  // Si la sala global no está seleccionada, calcular los mensajes no leídos
  fetch(`http://localhost:3000/recibe?room=global`)
    .then(res => res.json())
    .then(mensajes => {
      if (lastMessageCount['global'] === undefined) {
        lastMessageCount['global'] = mensajes.length;
      }
      let totalMensajes = mensajes.length;
      let leidos = lastMessageCount['global'] || 0;
      let unread = totalMensajes - leidos;
      if (unread > 0) {
        let indicator = document.createElement('span');
        indicator.classList.add('unread-indicator');
        indicator.textContent = unread;
        liGlobal.appendChild(indicator);
      }
    });
}
      usuariosUl.appendChild(liGlobal);

      // Agregar las salas privadas
      data.forEach(user => {
        if (user.username !== usuario) { // Excluir al usuario actual
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = "#";
          a.textContent = user.username;
          a.dataset.room = `private_${sortedRoomId(userId, user.id)}`; // ID única para la sala privada
          li.appendChild(a);

          // Si la sala actual coincide, marcarla como seleccionada y actualizar la cuenta de mensajes
          if (a.dataset.room === currentRoom) {
            li.classList.add('selected');
            fetch(`http://localhost:3000/recibe?room=${encodeURIComponent(a.dataset.room)}`)
              .then(res => res.json())
              .then(mensajes => {
                lastMessageCount[a.dataset.room] = mensajes.length;
              });
          } else {
            // Para las salas no activas, se consulta la cantidad total de mensajes
            fetch(`http://localhost:3000/recibe?room=${encodeURIComponent(a.dataset.room)}`)
              .then(res => res.json())
              .then(mensajes => {
                // Si no se había registrado una cuenta previa, se inicializa
                if (lastMessageCount[a.dataset.room] === undefined) {
                  lastMessageCount[a.dataset.room] = mensajes.length;
                }
                let totalMensajes = mensajes.length;
                let leidos = lastMessageCount[a.dataset.room] || 0;
                let unread = totalMensajes - leidos;
                if (unread > 0) {
                  // Crear un span para el indicador y agregarlo al li
                  let indicator = document.createElement('span');
                  indicator.classList.add('unread-indicator');
                  indicator.textContent = unread;
                  li.appendChild(indicator);
                }
              });
          }
          usuariosUl.appendChild(li);
        }
      });
    })
    .catch(err => {
      console.error('Error fetching user list:', err);
    });
}



// Function: Generate a sorted room ID for private chats
function sortedRoomId(id1, id2) {
  // Ensure consistent ordering by sorting the IDs alphabetically
  return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
}

// Event Listener: Handle clicks on the user list to switch rooms
document.getElementById('usuarios').addEventListener('click', function(event) {
  event.preventDefault();
  if (event.target.tagName === 'A') {
    // Quitar la clase 'selected' a todos los li y agregarla al clickeado
    document.querySelectorAll('#usuarios li').forEach(li => {
      li.classList.remove('selected');
    });
    event.target.parentElement.classList.add('selected');

    const clickedUsername = event.target.textContent;
    const room = event.target.dataset.room;
    currentRoom = room;

    if (room === 'global') {
      document.getElementById('current-room').textContent = 'Sala Global';
    } else {
      document.getElementById('current-room').textContent = `Chat Privado con ${clickedUsername}`;
    }

    // Limpiar mensajes y cargar los de la sala seleccionada
    document.getElementById('mensajes').innerHTML = "";
    recibe();

    // Actualizar la cuenta de mensajes leídos para esta sala
    fetch(`http://localhost:3000/recibe?room=${encodeURIComponent(room)}`)
      .then(response => response.json())
      .then(mensajes => {
        lastMessageCount[room] = mensajes.length;
        // Actualiza la lista para quitar el indicador
        loadUserList();
      });
  }
});



// Function: Send a message
function enviarMensaje() {
  let mensajeInput = document.querySelector("#mensaje");
  let mensaje = mensajeInput.value.trim();

  if (!mensaje) return; // No enviar mensajes vacíos

  // Ocultar el desplegable de emojis
  hideEmojis();

  mensajeInput.value = ""; // Limpiar el input

  // Determinar la sala destino
  let room = currentRoom;

  // Enviar el mensaje al servidor
  fetch(
    `http://localhost:3000/envia?mensaje=${encodeURIComponent(mensaje)}&usuario=${encodeURIComponent(usuario)}&room=${encodeURIComponent(room)}`
  )
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error sending message:', data.error);
        alert("Error al enviar el mensaje.");
      }
    })
    .catch(err => {
      console.error('Error sending message:', err);
      alert("Error al enviar el mensaje.");
    });
}


// Event Listener: Handle click on the send button
document.querySelector("#enviar").onclick = enviarMensaje;

// Event Listener: Handle "Enter" key press in the message input
document.querySelector("#mensaje").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    hideEmojis();
    enviarMensaje();
  }
});

// Function: Fetch and display messages for the current room
function recibe() {
  console.log(`Fetching messages from room: ${currentRoom}`);

  fetch(`http://localhost:3000/recibe?room=${encodeURIComponent(currentRoom)}`)
    .then((response) => response.json())
    .then((datos) => {
      let mensajesDiv = document.querySelector("#mensajes");
      mensajesDiv.innerHTML = ""; // Clear existing messages

      datos.forEach((dato) => {
        let articulo = document.createElement("article");
        let cabecera = document.createElement("h6");

        // Format the date
        const fecha = new Date(dato.fecha);
        cabecera.textContent = `${fecha.toLocaleString()} - ${dato.usuario}:`;
        articulo.appendChild(cabecera);

        let parrafo = document.createElement("p");
        parrafo.textContent = dato.mensaje;
        articulo.appendChild(parrafo);

        // Set a background color based on the user's name
        if (dato.usuario === usuario) {
          // Mensaje propio: fondo blanco (puedes ajustar otros estilos si es necesario)
          articulo.style.background = "white";
          articulo.style.color = "black"; // Aseguramos buena legibilidad
        } else {
          // Mensajes de otros: fondo basado en el hash del nombre
          articulo.style.background = `hsl(${stringToMod360(dato.usuario)}deg, 50%, 90%)`;
        }
        

        mensajesDiv.appendChild(articulo);
      });

      // Scroll to the bottom of the messages
      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    })
    .catch(err => {
      console.error('Error fetching messages:', err);
    });

  // Reset the timer for the next fetch
  clearTimeout(temporizador);
  temporizador = setTimeout(recibe, 1000);
}

// Function: Start receiving messages
function startReceiving() {
  temporizador = setTimeout(recibe, 1000);
}

// Emoji Selector Functionality

// Toggle the visibility of the emoji container
document.querySelector("#emoji").onclick = function () {
  let emojiContainer = document.querySelector("#emojis");
  emojiContainer.style.display =
    emojiContainer.style.display === "block" ? "none" : "block";
};

document.addEventListener('click', function(event) {
  let emojiContainer = document.getElementById("emojis");
  let emojiButton = document.getElementById("emoji");

  // Si el clic no es en el contenedor de emojis ni en el botón de emojis, ocultamos el desplegable
  if (!emojiContainer.contains(event.target) && event.target !== emojiButton) {
    hideEmojis();
  }
});

// Handle emoji selection
document.getElementById("emojis").addEventListener("click", function (event) {
  if (event.target.tagName === "SPAN") {
    document.querySelector("#mensaje").value += event.target.textContent;
  }
});

// Lista de emojis a mostrar
const emojisPorCategoria = {
  "😄": "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙 😚 😋 😛 😝 😜 🤪 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿".split(" "),
  "🐻": "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🐌 🐞 🐜 🦟 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐖 🐏 🐑 🦙 🐐 🐓 🦃 🕊️ 🐇 🐁 🐀 🐿️ 🦔".split(" "),
  "🎉": "🎉 🎊 🎈 🎁 🎂 🎆 🎇 🎃 🧨 ✨".split(" "),
  "❤️": "💋 💘 💝 💖 💗 💓 💞 💕 💌 ❣️ ❤️ 🩷 🧡 💛 💚 💙 💜 🖤 🤍 💔 ❤️‍🔥 ❤️‍🩹".split(" ")
};

// Renderiza los emojis dentro del div
function renderEmojis() {
  const emojisDiv = document.getElementById("emojis");
  emojisDiv.innerHTML = "";

  const tabsContainer = document.createElement("div");
  tabsContainer.classList.add("emoji-tabs"); // Aquí va el sticky

  // Crear botones de categoría con íconos
  Object.keys(emojisPorCategoria).forEach((icono, index) => {
    const btn = document.createElement("button");
    btn.textContent = icono;
    btn.classList.add("emoji-tab");
    if (index === 0) btn.classList.add("active");

    btn.addEventListener("click", () => {
      tabsContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      mostrarEmojisCategoria(icono);
    });

    tabsContainer.appendChild(btn);
  });

  emojisDiv.appendChild(tabsContainer);

  // Contenedor de emojis desplazable
  const emojiGrid = document.createElement("div");
  emojiGrid.id = "emojiGrid";
  emojiGrid.classList.add("emoji-grid");
  emojisDiv.appendChild(emojiGrid);

  // Mostrar la primera categoría por defecto
  mostrarEmojisCategoria(Object.keys(emojisPorCategoria)[0]);
}

function mostrarEmojisCategoria(categoria) {
  const emojiGrid = document.getElementById("emojiGrid");
  emojiGrid.innerHTML = "";
  emojisPorCategoria[categoria].forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.cursor = "pointer";
    span.style.fontSize = "20px";
    span.style.padding = "5px";
    emojiGrid.appendChild(span);
  });
}

// Periodically update the user list (optional)
setInterval(loadUserList, 5000); // Refresh user list every 5 seconds

// Initialize the chat application when the page loads
window.onload = function() {
  registerOrReconnectUser();
  renderEmojis(); // Renderiza emojis al cargar
};

