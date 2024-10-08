<?php
// get_drinks.php
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
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

// Initialize empty array for drinks items
$drinks_items = [];

// Check if a category parameter is provided
$category = isset($_GET['category']) ? intval($_GET['category']) : null;

if ($category) {
    // Query filtered by category
    $sql = "SELECT cocktails.*, degrees.degree_name, categories.category_name FROM cocktails 
            LEFT JOIN degrees ON cocktails.degree_id = degrees.degree_id
            LEFT JOIN categories ON cocktails.category_id = categories.category_id
            WHERE cocktails.category_id = $category";
} else {
    // Default query (all drinks)
    $sql = "SELECT cocktails.*, degrees.degree_name, categories.category_name FROM cocktails 
            LEFT JOIN degrees ON cocktails.degree_id = degrees.degree_id
            LEFT JOIN categories ON cocktails.category_id = categories.category_id";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Collect data
    while ($row = $result->fetch_assoc()) {
        $row['price'] = number_format(round($row['price'], 2), 2, ',', '.'); // Format price
        $drinks_items[] = $row;
    }
    echo json_encode($drinks_items, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>