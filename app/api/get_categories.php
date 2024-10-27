<?php
// get_categories.php
header('Content-Type: application/json');

// Database connection parameters
$servername = "81.169.190.112";
$username = "la_mediterranea";
$password = "theycantforceus!";
$dbname = "la_mediterranea";

// Establish database connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->query("SET NAMES 'utf8'");

// Check for connection errors
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Determine content type from query string
$contentType = isset($_GET['content']) ? $_GET['content'] : null;
$validContentTypes = ['menu', 'drink'];  // Add more types as needed

// Validate content type
if (!in_array($contentType, $validContentTypes)) {
    echo json_encode(["error" => "Invalid content type"]);
    exit;
}

// Query to fetch categories based on content type
$sql = "SELECT DISTINCT categories.category_id, categories.category_name 
        FROM categories
        LEFT JOIN $contentType ON $contentType.category_id = categories.category_id
        WHERE $contentType.category_id IS NOT NULL";

$result = $conn->query($sql);

$categories = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
}

echo json_encode($categories, JSON_UNESCAPED_UNICODE);
$conn->close();
?>