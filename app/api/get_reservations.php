<?php
// get_reservations.php

// Activate error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering
ob_start();

// Error handling function
function handleError($errno, $errstr, $errfile, $errline) {
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => "$errstr in $errfile on line $errline"]);
    exit();
}
set_error_handler('handleError');

// Exception handling function
function handleException($exception) {
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $exception->getMessage()]);
    exit();
}
set_exception_handler('handleException');

// Establish database connection
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    $error = ["error" => "Connection failed: " . $conn->connect_error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Set character set
$conn->set_charset("utf8mb4");

// Initialize reservations
$reservations = [];

// Prepare SQL query
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

// Check whether the query has been prepared
if (!$stmt) {
    $error = ["error" => "Failed to prepare SQL statement: " . $conn->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Execute query
$stmt->execute();

// Check for execution errors
if ($stmt->errno) {
    $error = ["error" => "Failed to execute SQL statement: " . $stmt->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Retrieve result
$result = $stmt->get_result();

// Check whether the result is valid
if ($result === false) {
    $error = ["error" => "Failed to get result set: " . $stmt->error];
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($error);
    exit();
}

// Collect data
while ($row = $result->fetch_assoc()) {
    $available = ($row['state_id'] == 1);

    $reservation = [
        'table' => $row['table_id'] ?? '',
        'time' => $row['time_field'] ?? '',
        'persons' => $row['persons'] ?? 0,
        'state' => $row['state_name'] ?? '',
        'available' => $available
    ];

    $reservations[] = $reservation;
}

// Close the connection
$stmt->close();
$conn->close();

// JSON-Encoding
$output = json_encode($reservations, JSON_UNESCAPED_UNICODE);

// Check for JSON errors
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

// Empty output buffer and output JSON
ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
echo $output;