const http = require('http');
const fs = require('fs');
const path = require('path');

const servidor = http.createServer((peticion, respuesta) => {
  const url = peticion.url;
  
  if (url === '/') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        respuesta.writeHead(500, { 'Content-Type': 'text/html' });
        return respuesta.end('Error interno del servidor');
      }
      respuesta.writeHead(200, { 'Content-Type': 'text/html' });
      respuesta.end(content, 'utf-8');
    });
  } else if (url === '/contacto') {
    const filePath = path.join(__dirname, 'public', 'contacto.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        respuesta.writeHead(500, { 'Content-Type': 'text/html' });
        return respuesta.end('Error interno del servidor');
      }
      respuesta.writeHead(200, { 'Content-Type': 'text/html' });
      respuesta.end(content, 'utf-8');
    });
  } else if (url === '/sobremi') {
    const filePath = path.join(__dirname, 'public', 'sobremi.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        respuesta.writeHead(500, { 'Content-Type': 'text/html' });
        return respuesta.end('Error interno del servidor');
      }
      respuesta.writeHead(200, { 'Content-Type': 'text/html' });
      respuesta.end(content, 'utf-8');
    });
  } else {
    const filePath = path.join(__dirname, 'public', '404.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        respuesta.writeHead(500, { 'Content-Type': 'text/html' });
        return respuesta.end('Error interno del servidor');
      }
      respuesta.writeHead(404, { 'Content-Type': 'text/html' });
      respuesta.end(content, 'utf-8');
    });
  }
});

servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});
