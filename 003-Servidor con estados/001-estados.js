const http = require('http');

var contador = 1;

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/plain' });
  
  contador++;
  respuesta.end('El valor de la variable es: '+contador+'\n');
});
servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});
