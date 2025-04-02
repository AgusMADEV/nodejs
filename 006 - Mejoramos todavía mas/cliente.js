let usuario = ""
document.querySelector("#persona").onchange = function(){
	usuario = this.value
}
let entrada = document.querySelector("#mensaje")
entrada.onchange = function(){
	let mensaje = this.value							// El mensaje es lo que contiene el campo
	this.value = ""										// Vacío el campo
	fetch("http://localhost:3000/envia?mensaje="+encodeURI(mensaje)+"&usuario="+encodeURI(usuario))	// Envío mensaje
}
var temporizador = setTimeout("recibe()",1000)
function recibe(){
	fetch("http://localhost:3000/recibe")
	.then(function(response){
		return response.json()
	})
	.then(function(datos){
	
	
		let mensajes = document.querySelector("#mensajes")
		mensajes.textContent = ""
		datos.forEach(function(dato){
			let articulo = document.createElement("article")
			let cabecera = document.createElement("h6")
			cabecera.textContent = dato.fecha + " - "+dato.usuario+":"
			articulo.appendChild(cabecera)
			let parrafo = document.createElement("p")
			parrafo.textContent = dato.mensaje
			articulo.appendChild(parrafo)
			mensajes.appendChild(articulo)
			articulo.style.background = 'hsl('+stringToMod360(dato.usuario)+'deg,50%,90%)'
		})
		mensajes.scrollTop = 1000000
		
	})
	clearTimeout(temporizador)
	temporizador = setTimeout("recibe()",1000)
}
