const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

var mensajes = [];

const servidor = http.createServer((peticion, respuesta) => {
    const urlcompleta = url.parse(peticion.url, true);
    const ruta = urlcompleta.pathname;
    
    // Configurar CORS
    respuesta.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas las conexiones
    respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos permitidos
    respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Permitir encabezados

    if (ruta === '/envia') {
        console.log("El servidor ha recibido un mensaje");
        if (urlcompleta.query.mensaje) {
            mensajes.push(urlcompleta.query.mensaje);  // Guardar el mensaje recibido
        }
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify({ status: "Mensaje recibido" }));
    } else if (ruta === '/recibe') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify(mensajes));  // Devolver los mensajes en formato JSON
    } else if (ruta === '/' || ruta === '/index.html') {
        // Leer y servir el archivo index.html
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                respuesta.writeHead(500, { 'Content-Type': 'text/plain' });
                respuesta.end('Error al cargar el archivo');
            } else {
                respuesta.writeHead(200, { 'Content-Type': 'text/html' });
                respuesta.end(data);
            }
        });
    } else {
        respuesta.writeHead(404, { 'Content-Type': 'text/plain' });
        respuesta.end('No encontrado');
    }
});

servidor.listen(3000, () => {
    console.log(`Server running at http://localhost:3000/`);
});
