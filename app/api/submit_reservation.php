<?php
// submit_reservation.php

// Set up error reporting
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header
header('Content-Type: application/json');

// Database connection credentials
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create a new connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// Receive and decode JSON data from the POST request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required input fields
$required_fields = ['name', 'email', 'date', 'time', 'table', 'persons'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "error" => "Invalid input: '$field' is required."]);
        exit;
    }
}

// Sanitize and validate inputs
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$date = $data['date'];
$time = $data['time'];
$table = intval($data['table']);
$persons = intval($data['persons']);

// Verify data post-sanitization
if (!$name || !$email || !$date || !$time || !$table || !$persons) {
    echo json_encode(["success" => false, "error" => "Invalid reservation data."]);
    exit;
}

// Prepare the SQL update query
$stmt = $conn->prepare("
    UPDATE reservations 
    SET name = ?, email = ?, persons = ?, state_id = 2 
    WHERE date_field = ? AND time_field = ? AND table_id = ? AND state_id = 1
");

// Check if statement preparation was successful
if (!$stmt) {
    error_log("Failed to prepare SQL statement: " . $conn->error);
    echo json_encode(["success" => false, "error" => "Server error: failed to prepare reservation update."]);
    $conn->close();
    exit;
}

// Bind parameters and execute the query
$stmt->bind_param("ssissi", $name, $email, $persons, $date, $time, $table);
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        // Reservation was successful
        echo json_encode(["success" => true, "message" => "Reservation successfully updated."]);
    } else {
        // No rows affected, likely due to mismatched conditions (e.g., table already reserved)
        error_log("No matching reservation found or table already reserved.");
        echo json_encode(["success" => false, "error" => "Reservation not available or already reserved."]);
    }
} else {
    // Log query execution error
    error_log("Failed to execute reservation update: " . $stmt->error);
    echo json_encode(["success" => false, "error" => "Failed to update reservation."]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>