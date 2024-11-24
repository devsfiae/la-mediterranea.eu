<?php

// booking_items.php
header('Access-Control-Allow-Origin: *'); // Allow all origins for dev; restrict as needed in production
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json; charset=UTF-8'); // Ensure UTF-8 encoding for JSON
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Establish database connection
$servername = "localhost";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4"); // Ensure the connection uses UTF-8 encoding

// Check the connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Initialize empty array for booking items
$booking_items = [];

// Check if filters are provided (day_id, table_id, state_id, booking_date)
$day_id = isset($_GET['day_id']) && is_numeric($_GET['day_id']) ? intval($_GET['day_id']) : 0;
$table_id = isset($_GET['table_id']) && is_numeric($_GET['table_id']) ? intval($_GET['table_id']) : 0;
$state_id = isset($_GET['state_id']) && is_numeric($_GET['state_id']) ? intval($_GET['state_id']) : 0;

// Booking date filters (supports a single date or range)
$booking_date = isset($_GET['booking_date']) ? $_GET['booking_date'] : null;
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;

// Build the SQL query
$sql = "SELECT 
            booking_items.*,
            day_items.item_name AS day_item_name,
            person_items.first_name AS person_first_name,
            table_items.item_name AS table_item_name,
            image_items.item_name AS image_item_name
        FROM booking_items
        LEFT JOIN day_items ON booking_items.day_id = day_items.day_item_id
        LEFT JOIN person_items ON booking_items.person_id = person_items.person_item_id
        LEFT JOIN table_items ON booking_items.table_id = table_items.table_item_id
        LEFT JOIN image_items ON table_items.image_id = image_items.image_item_id";

$conditions = [];

// Add filters for day_id, table_id, state_id
if ($day_id > 0) {
    $conditions[] = "booking_items.day_id = " . $day_id;
}
if ($table_id > 0) {
    $conditions[] = "booking_items.table_id = " . $table_id;
}
if ($state_id > 0) {
    $conditions[] = "booking_items.state_id = " . $state_id;
}

// Add filters for booking_date (single date or range)
if ($booking_date) {
    $conditions[] = "booking_items.booking_date = '" . $conn->real_escape_string($booking_date) . "'";
} elseif ($start_date && $end_date) {
    $conditions[] = "booking_items.booking_date BETWEEN '" . $conn->real_escape_string($start_date) . "' AND '" . $conn->real_escape_string($end_date) . "'";
} elseif ($start_date) {
    $conditions[] = "booking_items.booking_date >= '" . $conn->real_escape_string($start_date) . "'";
} elseif ($end_date) {
    $conditions[] = "booking_items.booking_date <= '" . $conn->real_escape_string($end_date) . "'";
}

// Add conditions to the query
if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

// Execute the query
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert necessary fields to proper data types
        $row['booking_item_id'] = intval($row['booking_item_id']);
        $row['day_id'] = intval($row['day_id']);
        $row['table_id'] = intval($row['table_id']);
        $row['state_id'] = intval($row['state_id']);
        $row['person_id'] = intval($row['person_id']);
        $row['booking_persons'] = intval($row['booking_persons']);

        // Format booking_date as DD.MM.YYYY
        $row['booking_date'] = date('d.m.Y', strtotime($row['booking_date']));
        
        // Add the row to the booking_items array
        $booking_items[] = $row;
    }
}

// Output result as JSON with `results` array wrapper
echo json_encode(['results' => $booking_items], JSON_UNESCAPED_UNICODE);

$conn->close();
?>