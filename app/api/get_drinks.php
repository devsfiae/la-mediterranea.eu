<?php
// get_drinks.php
header('Content-Type: application/json');

// Database connection details
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
    $sql = "SELECT drink.*, degrees.degree_name, categories.category_name FROM drink
            LEFT JOIN degrees ON drink.degree_id = degrees.degree_id
            LEFT JOIN categories ON drink.category_id = categories.category_id
            WHERE drink.category_id = $category";
} else {
    // Default query (all drinks)
    $sql = "SELECT drink.*, degrees.degree_name, categories.category_name FROM drink
            LEFT JOIN degrees ON drink.degree_id = degrees.degree_id
            LEFT JOIN categories ON drink.category_id = categories.category_id";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Collect data
    while ($row = $result->fetch_assoc()) {
        // Format price
        $row['price'] = number_format(round($row['price'], 2), 2, ',', '.');

        // Generate the image filename pattern based on category and drink ID
        $category_id_padded = str_pad($row['category_id'], 2, '0', STR_PAD_LEFT); // 2-digit category ID
        $drink_id_padded = str_pad($row['drink_id'], 3, '0', STR_PAD_LEFT); // 3-digit drink ID

        // Path to the image directory
        $image_directory = '../../images/drinks/'; // Adjust path as necessary

        // Pattern to search for images
        $image_pattern = $image_directory . "{$category_id_padded}_{$drink_id_padded}_*";

        // Find files matching the pattern using glob()
        $images = glob($image_pattern);

        if (!empty($images)) {
            // Use the first matched image
            $image_filename = basename($images[0]);
        } else {
            // Use a placeholder image if no image was found
            $image_filename = '../../images/icons/no_picture.png';
        }

        // Add the image filename to the API response
        $row['image_filename'] = $image_filename;

        $drinks_items[] = $row;
    }
    echo json_encode($drinks_items, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}

// Close the database connection
$conn->close();
?>