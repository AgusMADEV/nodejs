const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('clientes.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create 'clientes' table if it does not exist
db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table "clientes" is ready.');
    }
});

// Function to insert a new client
function insertClient(nombre, apellidos, email) {
    const sql = `INSERT INTO clientes (nombre, apellidos, email) VALUES (?, ?, ?)`;
    db.run(sql, [nombre, apellidos, email], function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
        } else {
            console.log(`Inserted client with ID: ${this.lastID}`);
        }
    });
}

// Function to display all clients
function showClients() {
    const sql = `SELECT * FROM clientes`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
            return;
        }
        console.log('Client List:');
        rows.forEach((row) => {
            console.log(`${row.id} - ${row.nombre} ${row.apellidos} (${row.email})`);
        });
    });
}

// Insert sample clients
insertClient('Carlos', 'García', 'carlos@example.com');
insertClient('Ana', 'López', 'ana@example.com');

// Wait a bit before showing the data
setTimeout(() => {
    showClients();
    db.close();
}, 1000);

