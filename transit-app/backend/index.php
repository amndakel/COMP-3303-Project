<?php
// Transit App Backend API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration (AMPPS default settings)
$host = 'localhost';
$dbname = 'transit_app';
$username = 'root';
$password = 'mysql'; // Default AMPPS MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$endpoint = $request[0] ?? '';

// Route the request
switch ($endpoint) {
    case 'routes':
        handleRoutes($method, $pdo);
        break;
    case 'schedule':
        handleSchedule($method, $pdo);
        break;
    case 'search':
        handleSearch($method, $pdo);
        break;
    case 'updates':
        handleUpdates($method, $pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid endpoint']);
        break;
}

// Handle routes endpoint
function handleRoutes($method, $pdo) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM routes");
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($routes);
    } else {
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Handle schedule endpoint
function handleSchedule($method, $pdo) {
    if ($method === 'GET') {
        $routeId = $_GET['route_id'] ?? null;
        if (!$routeId) {
            echo json_encode(['error' => 'Route ID required']);
            return;
        }

        $stmt = $pdo->prepare("SELECT * FROM schedules WHERE route_id = ?");
        $stmt->execute([$routeId]);
        $schedule = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($schedule) {
            // Parse times and stops from JSON
            $schedule['times'] = json_decode($schedule['times'], true);
            $schedule['stops'] = json_decode($schedule['stops'], true);
            echo json_encode($schedule);
        } else {
            echo json_encode(['error' => 'Schedule not found']);
        }
    } else {
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Handle search endpoint
function handleSearch($method, $pdo) {
    if ($method === 'GET') {
        $query = $_GET['q'] ?? '';
        if (empty($query)) {
            echo json_encode(['error' => 'Search query required']);
            return;
        }

        // Search in stops table
        $stmt = $pdo->prepare("SELECT DISTINCT r.name as route_name, s.name as stop_name, r.id as route_id
                               FROM routes r
                               JOIN stops s ON r.id = s.route_id
                               WHERE s.name LIKE ? OR r.name LIKE ?");
        $stmt->execute(["%$query%", "%$query%"]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($results);
    } else {
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Handle updates endpoint
function handleUpdates($method, $pdo) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM service_updates ORDER BY created_at DESC LIMIT 10");
        $updates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($updates);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title']) || !isset($data['message'])) {
            echo json_encode(['error' => 'Title and message required']);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO service_updates (title, message, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$data['title'], $data['message']]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['error' => 'Method not allowed']);
    }
}
?>
