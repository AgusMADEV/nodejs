const http = require('http');

let agenda = [
	{
		"nombre":"Jose Vicente",
		"apellidos":"Carratalá Sanchis",
		"email":"info@josevicentecarratala.com",
		"telefono":123456
	},
	{
		"nombre":"Juan",
		"apellidos":"Garcia Lopez",
		"email":"juan@garcia.com",
		"telefono":123456
	},
];

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/json' });
  respuesta.write("Te doy el json");
  respuesta.end(JSON.stringify(agenda));
});
servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});
