<?php
// GitHub Webhook Secret
$secret = '1909190923081970';

// Read the content of the webhook request
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify the signature
$hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($hash, $signature)) {
    http_response_code(403);
    exit('Invalid signature');
}

// Decode the webhook payload into an associative array
$data = json_decode($payload, true);

// Check if decoding was successful
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    exit('Invalid JSON payload');
}

// Format the data into a clean JSON file
$jsonFile = 'project_items.json';
$existingData = [];

if (file_exists($jsonFile)) {
    $existingContent = file_get_contents($jsonFile);
    if ($existingContent) {
        $existingData = json_decode($existingContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $existingData = []; // Fallback if existing JSON is invalid
        }
    }
}

// Append new data to the existing array
$existingData[] = $data;

// Save the updated array as JSON
file_put_contents($jsonFile, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// Reply to GitHub
http_response_code(200);
echo 'Webhook received successfully';
?>