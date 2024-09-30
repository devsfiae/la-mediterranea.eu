<?php
// save_reservation.php

header('Content-Type: application/json');

// Die Datenbankverbindung aus der config/database.php-Datei laden
$conn = require_once __DIR__ . '/../config/database.php';

// Eingabedaten abrufen und validieren
$data = json_decode(file_get_contents('php://input'), true);

$date_field = $data['date_field'] ?? '';
$time_field = $data['time_field'] ?? '';
$table_id = $data['table_id'] ?? '';
$state_id = $data['state_id'] ?? '';
$persons = $data['persons'] ?? '';
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';

// Eingabedaten validieren
if (empty($date_field) || empty($time_field) || empty($table_id) || empty($name) || empty($email)) {
    die(json_encode(["error" => "Erforderliche Felder fehlen."]));
}

// SQL-Abfrage vorbereiten
$stmt = $conn->prepare("INSERT INTO reservations (date_field, time_field, table_id, state_id, persons, name, email) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiiss", $date_field, $time_field, $table_id, $state_id, $persons, $name, $email);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Fehler beim Speichern der Reservierung."]);
}

$stmt->close();
$conn->close();
?>