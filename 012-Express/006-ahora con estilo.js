const express = require('express');
const app = express();

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './vistas');

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.render('index');
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});

