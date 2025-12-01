-- Bus App Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS bus_app;
USE bus_app;

-- Routes table
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#ed7d2b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules table
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    times JSON NOT NULL,
    stops JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Stops table
CREATE TABLE stops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    sequence INT NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Service updates table
CREATE TABLE service_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO routes (name, description, color) VALUES
('Route 1: Downtown - Valley', 'Connects downtown area with valley stations', '#233962'),
('Route 2: Valley - Campus', 'Serves valley and university campus', '#dc3545'),
('Route 3: Campus - Harbor', 'Links campus with harbor district', '#1a7f64'),
('Route 4: Harbor - Suburban', 'Connects harbor to suburban areas', '#d63384'),
('Route 5: Suburban - Downtown', 'Direct route from suburbs to downtown', '#ffc107');

INSERT INTO schedules (route_id, times, stops) VALUES
(1, '["6:00 AM", "7:30 AM", "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM", "6:00 PM", "7:30 PM"]', '["Downtown Terminal", "Main Street", "Central Park", "Valley Station"]'),
(2, '["6:15 AM", "7:45 AM", "9:15 AM", "10:45 AM", "12:15 PM", "1:45 PM", "3:15 PM", "4:45 PM", "6:15 PM", "7:45 PM"]', '["Valley Station", "University Ave", "Campus Entrance", "Library Stop"]'),
(3, '["6:30 AM", "8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM", "8:00 PM"]', '["Campus Entrance", "Harbor View", "Marina District", "Harbor Terminal"]'),
(4, '["6:45 AM", "8:15 AM", "9:45 AM", "11:15 AM", "12:45 PM", "2:15 PM", "3:45 PM", "5:15 PM", "6:45 PM", "8:15 PM"]', '["Harbor Terminal", "Suburban Mall", "Residential Area", "Suburban Station"]'),
(5, '["7:00 AM", "8:30 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"]', '["Suburban Station", "City Center", "Business District", "Downtown Terminal"]');

INSERT INTO stops (route_id, name, sequence) VALUES
(1, 'Downtown Terminal', 1),
(1, 'Main Street', 2),
(1, 'Central Park', 3),
(1, 'Valley Station', 4),
(2, 'Valley Station', 1),
(2, 'University Ave', 2),
(2, 'Campus Entrance', 3),
(2, 'Library Stop', 4),
(3, 'Campus Entrance', 1),
(3, 'Harbor View', 2),
(3, 'Marina District', 3),
(3, 'Harbor Terminal', 4),
(4, 'Harbor Terminal', 1),
(4, 'Suburban Mall', 2),
(4, 'Residential Area', 3),
(4, 'Suburban Station', 4),
(5, 'Suburban Station', 1),
(5, 'City Center', 2),
(5, 'Business District', 3),
(5, 'Downtown Terminal', 4);

INSERT INTO service_updates (title, message) VALUES
('Route 1 Delay', 'Route 1 is experiencing a 15-minute delay due to traffic congestion.'),
('New Schedule', 'Updated schedules are now available for all routes starting next week.'),
('Maintenance Notice', 'Route 3 will be temporarily rerouted for bridge maintenance this weekend.');
