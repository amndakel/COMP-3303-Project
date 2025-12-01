<?php
// Router for PHP built-in server
// This file handles routing for PATH_INFO requests

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If the request is for index.php with PATH_INFO, serve it
if (strpos($requestUri, '/index.php/') === 0) {
    // Extract PATH_INFO from the URI
    $pathInfo = substr($requestUri, strlen('/index.php'));
    $_SERVER['PATH_INFO'] = $pathInfo;
    require __DIR__ . '/index.php';
    return true;
}

// If the request is directly for an endpoint (e.g., /schedule, /routes, /updates/123, /admin/login)
if (preg_match('#^/(routes|schedule|search|updates|admin)(/.*)?$#', $requestUri, $matches)) {
    $_SERVER['PATH_INFO'] = '/' . $matches[1] . ($matches[2] ?? '');
    require __DIR__ . '/index.php';
    return true;
}

// If the request is for index.php without PATH_INFO, serve it
if ($requestUri === '/index.php' || $requestUri === '/') {
    require __DIR__ . '/index.php';
    return true;
}

// For other files, let PHP handle them normally
return false;

