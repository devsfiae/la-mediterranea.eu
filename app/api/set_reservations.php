<?php
// set_reservations.php

header('Content-Type: application/json');

// Establish database connection
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Receive JSON data from the POST request
$data = json_decode(file_get_contents('php://input'), true);

// Validation of data
if (!isset($data['name'], $data['email'], $data['date'], $data['time'], $data['table'], $data['persons'])) {
    echo json_encode(["success" => false, "message" => "Invalid data provided."]);
    exit;
}

// Sanitize input
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$date = $data['date'];
$time = $data['time'];
$table = intval($data['table']);
$persons = intval($data['persons']);

if (!$name || !$email || !$date || !$time || !$table || !$persons) {
    echo json_encode(["success" => false, "message" => "Invalid data."]);
    exit;
}

// Preparation and binding
$stmt = $conn->prepare("INSERT INTO reservations (name, email, date_field, time_field, table_id, persons, state_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
$state_id = 2; // Assuming 2 means 'Reserved' or similar
$stmt->bind_param("ssssiii", $name, $email, $date, $time, $table, $persons, $state_id);

// Executing the instruction
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Reservation saved."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

// Closing statement and connection
$stmt->close();
$conn->close();
?>