<?php
// slide_items.php
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

// Initialize empty array for slide items
$slide_items = [];

// Check if category and subcategory parameters are provided
$category = isset($_GET['category']) && is_numeric($_GET['category']) ? intval($_GET['category']) : 0;
$subcategory = isset($_GET['subcategory']) && is_numeric($_GET['subcategory']) ? intval($_GET['subcategory']) : 0;

// Build the SQL query with optional filters for category and subcategory
$sql = "SELECT slide_items.*, image_items.item_name AS image_item_name, subcategory_items.item_name AS subcategory_item_name
        FROM slide_items 
        LEFT JOIN image_items ON slide_items.image_id = image_items.image_item_id
        LEFT JOIN subcategory_items ON slide_items.subcategory_id = subcategory_items.subcategory_item_id";

$conditions = ["slide_items.slide_item_id != 999"]; // Exclude person_item_id = 999

if ($category > 0) {
    $conditions[] = "slide_items.category_id = " . $category;
}
if ($subcategory > 0) {
    $conditions[] = "slide_items.subcategory_id = " . $subcategory;
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

// Execute the query
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert necessary fields to proper data types
        $row['slide_item_id'] = intval($row['slide_item_id']);
        $row['category_id'] = intval($row['category_id']);
        $row['subcategory_id'] = intval($row['subcategory_id']);
        $row['subcategory_item_name'] = mb_convert_encoding($row['subcategory_item_name'] ?? '', 'UTF-8', 'auto');
        $row['image_id'] = intval($row['image_id']);
        
        // Convert degree_item_name and image_item_name to UTF-8 if necessary
        $row['image_item_name'] = mb_convert_encoding($row['image_item_name'] ?? '', 'UTF-8', 'auto');
        
        $slide_items[] = $row;
    }
}

// Output result as JSON with `results` array wrapper
echo json_encode(['results' => $slide_items], JSON_UNESCAPED_UNICODE);

$conn->close();
?>