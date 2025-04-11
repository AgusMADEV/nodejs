const express = require('express');
const app = express();

app.set('view engine', 'pug');
app.set('views', './vistas');

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});

