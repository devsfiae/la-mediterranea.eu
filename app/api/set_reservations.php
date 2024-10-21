<?php
// set_reservations.php

ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Set correct content type

// Establish database connection
$servername = "81.169.190.112";
// $servername = "localhost";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Receive JSON data from the POST request
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['name'], $data['email'], $data['date'], $data['time'], $data['table'], $data['persons'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
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
    echo json_encode(["success" => false, "message" => "Invalid reservation data."]);
    exit;
}

// Prepare the update query
$stmt = $conn->prepare("
    UPDATE reservations 
    SET name = ?, email = ?, persons = ?, state_id = 2 
    WHERE date_field = ? AND time_field = ? AND table_id = ? AND state_id = 1
");

// Bind parameters
$stmt->bind_param("ssissi", $name, $email, $persons, $date, $time, $table);

// Execute the query
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Reservation successfully updated."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update reservation."]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>