// server.js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Store users and chat rooms
let users = []; // Array of { username, id }
let chatRooms = {
  global: [] // Array of messages in the global room
};

// Function to generate unique user IDs
const generateUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;

// Function to find user by ID
const findUserById = (id) => users.find(u => u.id === id);

// Function to find user by username
const findUserByUsername = (username) => users.find(u => u.username === username);

const servidor = http.createServer((peticion, respuesta) => {
  const urlcompleta = url.parse(peticion.url, true);
  const ruta = urlcompleta.pathname;
  const query = urlcompleta.query;

  // Configure CORS
  respuesta.setHeader('Access-Control-Allow-Origin', '*');
  respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (peticion.method === 'OPTIONS') {
    respuesta.writeHead(204);
    respuesta.end();
    return;
  }

  if (ruta === '/register') {
    // Register or reconnect a user
    const username = query.username;
    const userId = query.userId;

    if (userId) {
      // Attempt to reconnect using userId
      const existingUser = findUserById(userId);
      if (existingUser) {
        // User exists, ensure the username matches
        if (existingUser.username === username) {
          respuesta.writeHead(200, { 'Content-Type': 'application/json' });
          respuesta.end(JSON.stringify(existingUser));
        } else {
          // Username mismatch
          respuesta.writeHead(400, { 'Content-Type': 'application/json' });
          respuesta.end(JSON.stringify({ error: 'Username does not match the existing user ID.' }));
        }
      } else {
        // Invalid userId
        respuesta.writeHead(400, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify({ error: 'Invalid user ID provided.' }));
      }
    } else {
      // New registration
      if (username && !findUserByUsername(username)) {
        const newUser = { username, id: generateUserId() };
        users.push(newUser);
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify(newUser));
      } else {
        respuesta.writeHead(400, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify({ error: 'Username already taken or invalid.' }));
      }
    }
  } else if (ruta === '/users') {
    // Return the list of users
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(users));
  } else if (ruta === '/envia') {
    // Send a message to a specific room
    const { mensaje, usuario, room } = query;
    const fecha = new Date();

    if (mensaje && usuario && room) {
      if (!chatRooms[room]) {
        chatRooms[room] = [];
      }
      chatRooms[room].push({
        mensaje,
        usuario,
        fecha: fecha.toISOString(),
      });
      // Limit messages to last 25
      if (chatRooms[room].length > 25) {
        chatRooms[room] = chatRooms[room].slice(-25);
      }
      console.log(`Message received in room ${room} from ${usuario}: ${mensaje}`);
      respuesta.writeHead(200, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify({ status: "Mensaje recibido" }));
    } else {
      respuesta.writeHead(400, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify({ error: "Invalid parameters." }));
    }
  } else if (ruta === '/recibe') {
    // Receive messages from a specific room
    const { room } = query;
    if (room && chatRooms[room]) {
      respuesta.writeHead(200, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify(chatRooms[room]));
    } else {
      respuesta.writeHead(200, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify([]));
    }
  } else {
    // Serve static files
    let filePath = path.join(__dirname, ruta === '/' ? 'index.html' : ruta);
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      // Add more content types as needed
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        respuesta.writeHead(404, { 'Content-Type': 'text/plain' });
        respuesta.end("Archivo no encontrado", 'utf-8');
      } else {
        respuesta.writeHead(200, { 'Content-Type': contentType });
        respuesta.end(content, 'utf-8');
      }
    });
  }
});

servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});

