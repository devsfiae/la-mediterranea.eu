<?php
header('Content-Type: application/json');

// Datenbankverbindung herstellen
$servername = "localhost";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Erstellen Sie eine Verbindung
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Überprüfen Sie die Verbindung
if ($conn->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

// Initialize empty array for menu items
$menu_items = [];

// Check if a category parameter is provided
$category = isset($_GET['category']) ? intval($_GET['category']) : null;

if ($category) {
    // Query filtered by category
    $sql = "SELECT menues.*, categories.category_name FROM menues 
            LEFT JOIN categories ON menues.category_id = categories.category_id
            WHERE menues.category_id = $category";
} else {
    // Default query (all menus)
    $sql = "SELECT menues.*, categories.category_name FROM menues 
            LEFT JOIN categories ON menues.category_id = categories.category_id";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Collect data
    while ($row = $result->fetch_assoc()) {
        $row['menu_price'] = number_format(round($row['menu_price'], 2), 2, ',', '.'); // Format price
        $menu_items[] = $row;
    }
    echo json_encode($menu_items, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>