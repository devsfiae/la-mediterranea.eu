<?php
// get_reservations.php

header('Content-Type: application/json');

// Establish database connection
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Check the connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Initialize an array for reservations
$reservations = [];

// Prepare the SQL query with an optional date parameter
if (isset($_GET['date']) && !empty($_GET['date'])) {
    $date = $_GET['date'];
    // Query with a specific date
    $sql = "SELECT reservations.*, states.state_name
            FROM reservations 
            INNER JOIN states ON reservations.state_id = states.state_id 
            WHERE reservations.date_field = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
} else {
    // Query for all reservations (no specific date)
    $sql = "SELECT reservations.*, states.state_name
            FROM reservations 
            INNER JOIN states ON reservations.state_id = states.state_id 
            ORDER BY reservations.date_field, reservations.time_field";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

// Collect data
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Determine whether the reservation is available
        $available = ($row['state_id'] == 1); // Assuming state_id == 1 means available

        // Format the reservation data
        $reservation = [
            'name' => $row['name'],
            'date' => $row['date_field'],
            'time' => $row['time_field'],
            'table' => $row['table_id'],
            'state' => $row['state_name'],
            'persons' => $row['persons'],
            'email' => $row['email'],
            'available' => $available
        ];

        $reservations[] = $reservation;
    }

    echo json_encode($reservations, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}
// Close statement and connection
$stmt->close();
$conn->close();
?>