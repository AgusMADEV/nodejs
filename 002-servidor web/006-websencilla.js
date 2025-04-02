const http = require('http');

const servidor = http.createServer((peticion, respuesta) => {
	respuesta.writeHead(200, { 'Content-Type': 'text/html' });
	const url = peticion.url;
  	if (url === '/') {
  		respuesta.end("Pagina de inicio")
  	}else if(url === '/contacto'){
  		respuesta.end("Pagina de contacto")
  	}else if(url === '/sobremi'){
  		respuesta.end("Pagina de sobre mi")
  	}else{
  		respuesta.end("Pagina no encontrada")
  	}
});
servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});
