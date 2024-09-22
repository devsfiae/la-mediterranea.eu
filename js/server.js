const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// MySQL Datenbankverbindung
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Verbindung herstellen
db.connect((err) => {
    if (err) {
        console.error('Fehler bei der Verbindung zur Datenbank:', err.message);
        return; // Verhindern, dass das Programm abstürzt
    }
    console.log('MySQL verbunden...');
});

// Route um die Speisekarte abzurufen
app.get('/menu', (req, res) => {
    const sql = 'SELECT name, description, price, category FROM menu_items';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Fehler bei der Abfrage:', err.message);
            return res.status(500).json({ error: 'Datenbankabfrage fehlgeschlagen' });
        }
        res.json(results); // Gibt die Daten als JSON zurück
    });
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server gestartet auf Port ${PORT}`);
});