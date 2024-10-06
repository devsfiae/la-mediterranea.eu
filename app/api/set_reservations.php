<?php
// set_reservations.php

header('Content-Type: application/json');

// Datenbankverbindung herstellen
$servername = "localhost";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Verbindung erstellen
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Verbindung überprüfen
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

// JSON-Daten aus der POST-Anfrage erhalten
$data = json_decode(file_get_contents('php://input'), true);

// Daten validieren
if (!isset($data['name'], $data['email'], $data['date'], $data['time'], $data['table'], $data['persons'])) {
    echo json_encode(["success" => false, "message" => "Ungültige Daten bereitgestellt."]);
    exit;
}

// Vorbereitung und Bindung
$stmt = $conn->prepare("INSERT INTO reservations (name, email, date_field, time_field, table_id, persons, state_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
$state_id = 1; // Angenommen, 1 bedeutet 'Reserviert' oder ähnlich
$stmt->bind_param("ssssiii", $data['name'], $data['email'], $data['date'], $data['time'], $data['table'], $data['persons'], $state_id);

// Ausführen der Anweisung
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Reservierung gespeichert."]);
} else {
    echo json_encode(["success" => false, "message" => "Fehler: " . $stmt->error]);
}

// Schließen von Statement und Verbindung
$stmt->close();
$conn->close();
?>