const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

var mensajes = [];

const servidor = http.createServer((peticion, respuesta) => {
    const urlcompleta = url.parse(peticion.url, true);
    const ruta = urlcompleta.pathname;
    
    // Configurar CORS
    respuesta.setHeader('Access-Control-Allow-Origin', '*'); 
    respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    let filePath = path.join(__dirname, ruta);
    
    if (ruta === '/') {
        filePath = path.join(__dirname, 'index.html');
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
    }
    
    if (ruta === '/envia') {
        console.log("Servidor ha recibido un mensaje");
        let fecha = new Date();
        if (urlcompleta.query.mensaje) {
            mensajes.push({
                "mensaje": urlcompleta.query.mensaje,
                "usuario": urlcompleta.query.usuario,
                "fecha": fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate()
            });
            if (mensajes.length > 5) {
                mensajes = mensajes.slice(-5); // Keep only the last 5 messages
            }
        }
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify({ status: "Mensaje recibido" }));
    } else if (ruta === '/recibe') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify(mensajes));
    } else {
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
