const express = require('express');
const mysql = require('mysql2');

const app = express();

// MySQL Datenbankverbindung
const db = mysql.createConnection({
    host: 'localhost',
    user: 'v078803',
    password: 'HibaIrinaPuyaHeiko2024_',
    database: 'v078803'
});

// Verbindung herstellen
db.connect((err) => {
    if (err) {
    throw err;
    }
    console.log('MySQL Connected...');
});

// Route um die Speisekarte abzurufen
app.get('/menu', (req, res) => {
    let sql = 'SELECT name, description, price, category FROM menu_items';
    db.query(sql, (err, results) => {
    if (err) {
        throw err;
    }
    res.json(results);  // Gibt die Daten als JSON zurück
    });
});

// Server starten
app.listen(3000, () => {
    console.log('Server started on port 3000');
});