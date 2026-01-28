<?php
// Clear Cache Script for Shared Hosting
// Upload this file to your public_html/bukukira.uitmappx.com/ folder
// Then visit: https://bukukira.uitmappx.com/clear-cache.php

echo "<h1>Clearing Laravel Caches...</h1>";

$basePath = __DIR__ . '/../../bukukira-app';

// Clear bootstrap/cache files
$files = [
    $basePath . '/bootstrap/cache/services.php',
    $basePath . '/bootstrap/cache/packages.php',
    $basePath . '/bootstrap/cache/config.php',
    $basePath . '/bootstrap/cache/routes-v7.php',
    $basePath . '/bootstrap/cache/events.php',
];

foreach ($files as $file) {
    if (file_exists($file)) {
        unlink($file);
        echo "✓ Deleted: " . basename($file) . "<br>";
    } else {
        echo "- Not found: " . basename($file) . "<br>";
    }
}

// Clear storage framework cache
$cacheFiles = glob($basePath . '/storage/framework/cache/data/*/*');
if ($cacheFiles) {
    foreach ($cacheFiles as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    echo "✓ Cleared storage cache files<br>";
}

// Clear storage framework views
$viewFiles = glob($basePath . '/storage/framework/views/*');
if ($viewFiles) {
    foreach ($viewFiles as $file) {
        if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
            unlink($file);
        }
    }
    echo "✓ Cleared compiled views<br>";
}

echo "<br><h2>Cache cleared successfully!</h2>";
echo "<p>Now try visiting your site: <a href='/'>Go to Home</a></p>";
echo "<p style='color: red;'><strong>IMPORTANT:</strong> Delete this file (clear-cache.php) after use for security!</p>";
?>
