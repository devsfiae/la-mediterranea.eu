<?php
// get_reservations.php

header('Content-Type: application/json');

// Datenbankverbindung herstellen
$servername = "localhost";
$username = "DB_USERNAME";
$password = "DB_PASSWORD";
$dbname = "reservations_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Überprüfen der Verbindung
if ($conn->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

// Datum aus der Anfrage abrufen
$date = $_GET['date'] ?? '';

if (empty($date)) {
    die(json_encode(["error" => "Kein Datum angegeben."]));
}

// SQL-Abfrage vorbereiten
$stmt = $conn->prepare("SELECT * FROM reservations WHERE date_field = ?");
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

// Ergebnisse abrufen
$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($reservations);
?>
