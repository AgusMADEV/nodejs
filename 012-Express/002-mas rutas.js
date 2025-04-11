const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hola peñita');
});

app.get('/contacto', (req, res) => {
    res.send('Esta es la página de contacto');
});

app.get('/sobremi', (req, res) => {
    res.send('Esta es la página de sobre mi');
});

app.listen(3000, () => {
    console.log(`Servidor corriendo`);
});
