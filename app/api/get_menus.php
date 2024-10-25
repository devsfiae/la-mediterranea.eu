<?php
header('Content-Type: application/json');

// Establish database connection
$servername = "81.169.190.112";
// $servername = “localhost”;
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
        // Format price
        $row['menu_price'] = number_format(round($row['menu_price'], 2), 2, ',', '.');

        // Generieren des Musters für den Bilddateinamen
        $category_id_padded = str_pad($row['category_id'], 2, '0', STR_PAD_LEFT); // 2-stellig
        $menu_id_padded = str_pad($row['menu_id'], 3, '0', STR_PAD_LEFT); // 3-stellig

        // Pfad zum Bildverzeichnis
        $image_directory = '../../images/food/'; // Passen Sie den Pfad entsprechend an

        // Muster für die Bildsuche
        $image_pattern = $image_directory . "{$category_id_padded}_{$menu_id_padded}_*";

        // Verwenden von glob(), um Dateien zu finden, die dem Muster entsprechen
        $images = glob($image_pattern);

        if (!empty($images)) {
            // Nehmen Sie das erste gefundene Bild
            $image_filename = basename($images[0]);
        } else {
            // Verwenden Sie ein Platzhalterbild, falls kein Bild gefunden wurde
            $image_filename = 'placeholder.jpg';
        }

        // Fügen Sie den Bilddateinamen zur API-Antwort hinzu
        $row['image_filename'] = $image_filename;

        $menu_items[] = $row;
    }
    echo json_encode($menu_items, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>