<?php
// get_reservations.php

// Fehlerberichterstattung aktivieren
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Ausgabe-Pufferung starten
ob_start();

// Datenbankverbindung herstellen
// $servername = "localhost";
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!"; // Ersetzen Sie durch Ihr tatsächliches Passwort
$dbname = "la_mediterranea";

// Verbindung erstellen
$conn = new mysqli($servername, $username, $password, $dbname);

// Überprüfen Sie die Verbindung
if ($conn->connect_error) {
    $error = ["error" => "Connection failed: " . $conn->connect_error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Zeichensatz setzen
$conn->set_charset("utf8mb4");

// Reservierungen initialisieren
$reservations = [];

// SQL-Abfrage vorbereiten
if (isset($_GET['date']) && !empty($_GET['date'])) {
    $date = $_GET['date'];
    $sql = "SELECT reservations.*, states.state_name
            FROM reservations 
            INNER JOIN states ON reservations.state_id = states.state_id 
            WHERE reservations.date_field = ?
            ORDER BY reservations.time_field, reservations.table_id";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
} else {
    $sql = "SELECT reservations.*, states.state_name
            FROM reservations 
            INNER JOIN states ON reservations.state_id = states.state_id 
            ORDER BY reservations.date_field, reservations.time_field";
    $stmt = $conn->prepare($sql);
}

// Überprüfen Sie, ob die Abfrage vorbereitet wurde
if (!$stmt) {
    $error = ["error" => "Failed to prepare SQL statement: " . $conn->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Abfrage ausführen
$stmt->execute();

// Überprüfen Sie auf Ausführungsfehler
if ($stmt->errno) {
    $error = ["error" => "Failed to execute SQL statement: " . $stmt->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Ergebnis abrufen
$result = $stmt->get_result();

// Überprüfen Sie, ob das Ergebnis gültig ist
if ($result === false) {
    $error = ["error" => "Failed to get result set: " . $stmt->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Daten sammeln
while ($row = $result->fetch_assoc()) {
    // Überprüfen Sie auf mögliche Null-Werte und setzen Sie Standardwerte
    $available = ($row['state_id'] == 1);

    $reservation = [
        'name' => isset($row['name']) ? $row['name'] : '',
        'date' => isset($row['date_field']) ? $row['date_field'] : '',
        'time' => isset($row['time_field']) ? $row['time_field'] : '',
        'table' => isset($row['table_id']) ? $row['table_id'] : '',
        'state' => isset($row['state_name']) ? $row['state_name'] : '',
        'persons' => isset($row['persons']) ? $row['persons'] : 0,
        'email' => isset($row['email']) ? $row['email'] : '',
        'available' => $available
    ];

    $reservations[] = $reservation;
}

// Schließen Sie die Verbindung
$stmt->close();
$conn->close();

// JSON-Encoding
$output = json_encode($reservations, JSON_UNESCAPED_UNICODE);

// Überprüfen Sie auf JSON-Fehler
if (json_last_error() !== JSON_ERROR_NONE) {
    $error = [
        "error" => "JSON Encoding Error: " . json_last_error_msg(),
        "data" => $reservations
    ];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Ausgabe-Puffer leeren und JSON ausgeben
ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
echo $output;

// Kein schließendes PHP-Tag