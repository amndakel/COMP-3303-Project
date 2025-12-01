<?php
// Bus App Backend API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$config = [
    'host' => 'localhost',
    'dbname' => 'bus_app',
    'username' => 'bus_user',
    'password' => 'bus123'
];

// Database connection
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['dbname']}", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()]);
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$endpoint = $request[0] ?? '';
$id = isset($request[1]) && is_numeric($request[1]) ? (int)$request[1] : null;

// Route request
match($endpoint) {
    'routes' => handleRoutes($method, $pdo),
    'schedule' => handleSchedule($method, $pdo),
    'search' => handleSearch($method, $pdo),
    'updates' => handleUpdates($method, $pdo, $id),
    'admin' => handleAdmin($method, $request),
    default => jsonResponse(['error' => 'Invalid endpoint'])
};

// JSON response helper
function jsonResponse($data, $exit = true) {
    echo json_encode($data);
    if ($exit) exit;
}

// Get JSON input helper
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Routes endpoint
function handleRoutes($method, $pdo) {
    if ($method !== 'GET') {
        jsonResponse(['error' => 'Method not allowed']);
    }
    jsonResponse($pdo->query("SELECT * FROM routes")->fetchAll());
}

// Schedule endpoint
function handleSchedule($method, $pdo) {
    if ($method !== 'GET') {
        jsonResponse(['error' => 'Method not allowed']);
    }
    
    $routeId = $_GET['route_id'] ?? null;
    if (!$routeId) {
        jsonResponse(['error' => 'Route ID required']);
    }

    $stmt = $pdo->prepare("SELECT s.*, r.name, r.description, r.color 
                           FROM schedules s 
                           JOIN routes r ON s.route_id = r.id 
                           WHERE s.route_id = ?");
    $stmt->execute([$routeId]);
    $schedule = $stmt->fetch();

    if (!$schedule) {
        jsonResponse(['error' => 'Schedule not found']);
    }

    $schedule['times'] = json_decode($schedule['times'], true);
    $schedule['stops'] = json_decode($schedule['stops'], true);
    jsonResponse($schedule);
}

// Search endpoint
function handleSearch($method, $pdo) {
    if ($method !== 'GET') {
        jsonResponse(['error' => 'Method not allowed']);
    }
    
    $query = $_GET['q'] ?? '';
    if (empty($query)) {
        jsonResponse(['error' => 'Search query required']);
    }

    $stmt = $pdo->prepare("SELECT DISTINCT r.name as route_name, s.name as stop_name, r.id as route_id
                           FROM routes r
                           JOIN stops s ON r.id = s.route_id
                           WHERE s.name LIKE ? OR r.name LIKE ?");
    $searchTerm = "%$query%";
    $stmt->execute([$searchTerm, $searchTerm]);
    jsonResponse($stmt->fetchAll());
}

// Updates endpoint
function handleUpdates($method, $pdo, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM service_updates WHERE id = ?");
                $stmt->execute([$id]);
                $update = $stmt->fetch();
                jsonResponse($update ?: ['error' => 'Update not found']);
            }
            jsonResponse($pdo->query("SELECT * FROM service_updates ORDER BY created_at DESC")->fetchAll());
            break;
            
        case 'POST':
            $data = getJsonInput();
            if (empty($data['title']) || empty($data['message'])) {
                jsonResponse(['error' => 'Title and message required']);
            }
            $stmt = $pdo->prepare("INSERT INTO service_updates (title, message, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$data['title'], $data['message']]);
            jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
            
        case 'DELETE':
            if (!$id) {
                jsonResponse(['error' => 'Update ID required']);
            }
            $stmt = $pdo->prepare("DELETE FROM service_updates WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse($stmt->rowCount() ? ['success' => true] : ['error' => 'Update not found']);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed']);
    }
}

// Admin endpoint
function handleAdmin($method, $request) {
    $action = $request[1] ?? '';
    
    if ($action === 'login' && $method === 'POST') {
        $data = getJsonInput();
        $valid = ($data['password'] ?? '') === 'admin123';
        jsonResponse($valid ? ['success' => true] : ['success' => false, 'error' => 'Invalid password']);
    }
    
    jsonResponse(['error' => 'Invalid admin action']);
}
