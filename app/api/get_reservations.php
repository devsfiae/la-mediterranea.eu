<?php
// get_reservations.php

header('Content-Type: application/json');

// Die Datenbankverbindung aus der config/database.php-Datei laden
$conn = require_once __DIR__ . '/../config/database.php';

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
