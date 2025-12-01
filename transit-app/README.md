# Regional Bus Transit Web Application

## Team Members
- Amanda Kelly (131231k)
- Sadman Islam Aaraf (0306120a)
- Eshaan Prakash (030320p)

## Project Summary
This project is a full-stack web application that simulates a regional bus transit scheduling system, inspired by Kings Transit (https://www.kbus.ca/). Users can browse bus routes, stops, and schedules, search by route or stop, view route details on interactive maps, and track buses in real-time. Admin users can manage service updates through a protected dashboard.

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.1.3, Leaflet.js
- **Backend**: PHP 8.0+
- **Database**: MySQL/MariaDB

---

## Setup & Installation

### Prerequisites

Ensure you have the following installed:
- **PHP 8.0+** with PDO extension
- **MySQL 8.0+** or **MariaDB 10.5+**
- **Web browser** (Chrome, Firefox, Edge recommended)

#### Check PHP Installation
```bash
php --version
# Should show PHP 8.0 or higher
```

#### Check MySQL Installation
```bash
mysql --version
# or
mariadb --version
```

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd transit-app
```

### Step 2: Database Setup

1. **Start MySQL/MariaDB service**:
   ```bash
   # Linux (systemd)
   sudo systemctl start mysql
   # or for MariaDB
   sudo systemctl start mariadb
   
   # macOS (Homebrew)
   brew services start mysql
   ```

2. **Create database user and database**:
   ```bash
   sudo mysql
   ```
   
   Then run the following SQL commands:
   ```sql
   -- Create user
   CREATE USER 'bus_user'@'localhost' IDENTIFIED BY 'bus123';
   
   -- Create database
   CREATE DATABASE bus_app;
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON bus_app.* TO 'bus_user'@'localhost';
   FLUSH PRIVILEGES;
   
   -- Exit MySQL
   exit;
   ```

3. **Import the database schema**:
   ```bash
   mysql -u bus_user -pbus123 bus_app < database/schema.sql
   ```

### Step 3: Run the Application

1. **Make the run script executable** (Linux/macOS):
   ```bash
   chmod +x run.sh
   ```

2. **Start the servers**:
   ```bash
   ./run.sh
   ```

   This starts:
   - Frontend server on **http://localhost:8000**
   - Backend API server on **http://localhost:8001**

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

### Step 4: Access Admin Dashboard

1. Navigate to **http://localhost:8000/admin.html**
2. Enter password: `admin123`
3. Manage routes and service updates

---

## Manual Server Start (Alternative)

If the run script doesn't work, start servers manually:

```bash
# Terminal 1 - Backend API
cd backend
php -S localhost:8001 router.php

# Terminal 2 - Frontend
cd frontend
php -S localhost:8000
```

---

## Project Structure

```
transit-app/
├── backend/
│   ├── index.php        # API endpoints
│   └── router.php       # URL routing
├── database/
│   └── schema.sql       # Database schema & seed data
├── frontend/
│   ├── index.html       # Home page
│   ├── schedule.html    # Route schedules
│   ├── fares-passes.html
│   ├── routes-stops.html
│   ├── bus-tracking.html
│   ├── contact.html
│   ├── admin.html       # Admin login
│   ├── admin-dashboard.html
│   ├── script.js        # Main JavaScript
│   ├── admin.js         # Admin functionality
│   ├── components.js    # Shared header/footer
│   └── style.css        # All styles
├── run.sh               # Server startup script
├── README.md            # This file
├── ARCH_LINUX_SETUP.md  # Arch Linux specific setup
└── projectDetails.md    # Full documentation
```

---

## Features

### User Features
- 📅 **Schedule Viewer** - Browse departure times for all routes
- 🔍 **Search** - Find routes and stops quickly
- 🗺️ **Interactive Maps** - View routes and bus stops on Leaflet maps
- 🚌 **Bus Tracking** - Real-time bus location tracking (demo)
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 💳 **Fare Information** - View pricing and pass options

### Admin Features
- 🔐 **Protected Dashboard** - Password-protected admin access
- 📊 **Statistics** - View route and update counts
- ⚡ **Route Management** - Enable/disable routes (demo)
- 📢 **Service Updates** - Create and delete service alerts

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | Get all routes |
| GET | `/schedule?route_id=1` | Get schedule for a route |
| GET | `/search?q=downtown` | Search routes/stops |
| GET | `/updates` | Get all service updates |
| POST | `/updates` | Create service update |
| DELETE | `/updates/{id}` | Delete service update |
| POST | `/admin/login` | Admin authentication |

---

## Troubleshooting

### Database Connection Failed
- Ensure MySQL/MariaDB is running
- Verify credentials in `backend/index.php` match your database user
- Check that `bus_app` database exists

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill it if needed
kill -9 <PID>
```

### Permission Denied on run.sh
```bash
chmod +x run.sh
```

---

## Documentation

For comprehensive documentation including:
- Architecture diagrams
- Database schema details
- Complete API documentation
- Test cases
- Code review

See **[projectDetails.md](projectDetails.md)**

---

## License

COMP-3303 Project - Acadia University © 2025
