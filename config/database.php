<<?php
// config/database.php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Lade die .env-Datei
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Zugangsdaten aus .env-Datei lesen
$servername = $_ENV['DB_HOST'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];
$dbname = $_ENV['DB_NAME'];

// Verbindung zur Datenbank herstellen
$conn = new mysqli($servername, $username, $password, $dbname);

// Überprüfen der Verbindung
if ($conn->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

return $conn;
?>