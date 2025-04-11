const express = require('express');
const app = express();

app.set('view engine', 'pug');
app.set('views', './vistas');

app.use(express.static('public'));

const titulo = "La web";
const sobremi = "Este es un texto sobre mi"
const articulos = [
	{
		"titulo":"Título del artículo 1",
		"texto":"Texto del artículo 1"
	},
	{
		"titulo":"Título del artículo 2",
		"texto":"Texto del artículo 2"
	},
	{
		"titulo":"Título del artículo 3",
		"texto":"Texto del artículo 3"
	},
	{
		"titulo":"Título del artículo 4",
		"texto":"Texto del artículo 4"
	}
]

app.get('/', (req, res) => {
    res.render('index',{"titulo":titulo,articulos});
});

app.get('/sobremi', (req, res) => {
    res.render('sobremi',{"titulo":titulo,"sobremi":sobremi});
});

app.get('/contacto', (req, res) => {
    res.render('contacto',{"titulo":titulo});
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});

