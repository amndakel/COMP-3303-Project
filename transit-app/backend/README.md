# Transit App Backend Setup Guide

## Cloud Database Setup

### Option 1: Amazon RDS MySQL
1. Go to AWS Console and create an RDS MySQL instance
2. Note down the endpoint URL, username, and password
3. Update `backend/index.php` with your RDS credentials:
   ```php
   $host = 'your-rds-endpoint.region.rds.amazonaws.com';
   $username = 'your-admin-username';
   $password = 'your-password';
   ```

### Option 2: Google Cloud SQL
1. Create a Cloud SQL MySQL instance in Google Cloud Console
2. Get the public IP address and create a database user
3. Update the credentials in `backend/index.php`

### Option 3: PlanetScale (MySQL-compatible)
1. Sign up at https://planetscale.com
2. Create a database and get the connection string
3. Update credentials accordingly

### Option 4: Railway PostgreSQL (if switching to PostgreSQL)
1. Create a PostgreSQL database on Railway
2. Update the PDO connection string to use PostgreSQL

## Database Schema Setup
1. Connect to your cloud database using a MySQL client (MySQL Workbench, phpMyAdmin, or command line)
2. Run the SQL script from `database/schema.sql` to create tables and insert sample data

## Deployment Options

### Option 1: Vercel (Serverless Functions)
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`
3. Update frontend to use the Vercel API URL

### Option 2: Heroku
1. Create a Heroku app
2. Add ClearDB MySQL add-on
3. Deploy using Git or Heroku CLI

### Option 3: DigitalOcean App Platform
1. Connect your repository
2. Add environment variables for database credentials
3. Deploy automatically

## Environment Variables
For production, use environment variables instead of hardcoding credentials:
```php
$host = getenv('DB_HOST');
$username = getenv('DB_USER');
$password = getenv('DB_PASS');
```

## API Endpoints
- GET `/routes` - Get all routes
- GET `/schedule?route_id=X` - Get schedule for route X
- GET `/search?q=query` - Search stops and routes
- GET `/updates` - Get service updates
- POST `/updates` - Add new service update

## Testing
Test your API endpoints using tools like Postman or curl:
```bash
curl https://your-api-url.com/routes
curl "https://your-api-url.com/schedule?route_id=1"
