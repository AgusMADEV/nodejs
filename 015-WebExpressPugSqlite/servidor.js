const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('web.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

app.set('view engine', 'pug');
app.set('views', './vistas');

app.use(express.static('public'));

const titulo = "La web";
const sobremi = "Este es un texto sobre mi"


app.get('/', (req, res) => {
	const sql = `SELECT * FROM blog;`;
	let articulos = [];
    db.all(sql, [], (err, articulos) => {
      res.render('index',{"titulo":titulo,articulos});
    });
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

