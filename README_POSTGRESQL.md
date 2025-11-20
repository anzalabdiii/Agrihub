# AgriLink Hub - PostgreSQL Setup Guide

A comprehensive agricultural marketplace connecting farmers directly with buyers.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads/)

### Verify Installations

```bash
python3 --version
node --version
npm --version
psql --version
```

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Agrilink_Hub

# Run the setup script
./setup.sh
```

The setup script will:
- ✅ Check all prerequisites
- ✅ Create PostgreSQL database and user
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Initialize database with schema
- ✅ Seed initial data (categories, users, products)
- ✅ Configure environment variables

### Option 2: Manual Setup

See [Manual Setup](#manual-setup) section below.

## Manual Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Agrilink_Hub
```

### 2. PostgreSQL Database Setup

#### Create Database and User

```bash
# Login to PostgreSQL as postgres user
sudo -u postgres psql

# Create database user
CREATE USER myuser WITH PASSWORD 'mypassword';

# Create database
CREATE DATABASE myproject_db OWNER myuser;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myuser;

# Exit
\q
```

#### Verify Database Connection

```bash
psql -U myuser -d myproject_db -h localhost -W
# Enter password: mypassword
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate  # On Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env if needed (default values should work)
# DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/myproject_db

# Initialize database and seed data
python3 init_db.py

# The database will be populated with:
# - All necessary tables
# - 8 product categories
# - Admin user
# - 2 farmer users with profiles
# - 2 buyer users with profiles
# - 5 sample products
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default configuration points to http://localhost:5000/api
```

## Database Configuration

### Environment Variables

The application uses the following PostgreSQL configuration:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/myproject_db
```

### To Use Different Credentials

1. Update `backend/.env`:
```env
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database
```

2. Update the `setup.sh` script variables if using automated setup:
```bash
DB_NAME="your_database"
DB_USER="your_user"
DB_PASSWORD="your_password"
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate
python3 run.py
```

The backend will run on: `http://localhost:5000`

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on: `http://localhost:5173`

### Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Default Credentials

The database is seeded with the following test accounts:

### Administrator Account
```
Email: admin@agrilink.com
Password: admin123
```
**Capabilities:**
- Approve/reject farmer products
- Approve/reject orders
- Manage users (farmers and buyers)
- View analytics and activity logs
- Send messages to farmers and buyers

### Farmer Accounts

**Farmer 1 - John Farmer (Green Valley Farm)**
```
Email: john.farmer@gmail.com
Password: farmer123
Farm: Green Valley Farm (50 acres)
Location: California, USA
```

**Farmer 2 - Jane Smith (Sunshine Organic Farm)**
```
Email: jane.farmer@gmail.com
Password: farmer123
Farm: Sunshine Organic Farm (75 acres)
Location: Texas, USA
```

**Farmer Capabilities:**
- Add/edit/delete products
- View product inventory
- Receive and respond to messages
- View orders for their products
- Update farm profile

### Buyer Accounts

**Buyer 1 - Michael Johnson**
```
Email: buyer1@gmail.com
Password: buyer123
Location: Los Angeles, CA
```

**Buyer 2 - Sarah Williams**
```
Email: buyer2@gmail.com
Password: buyer123
Location: Houston, TX
```

**Buyer Capabilities:**
- Browse products and categories
- Add products to cart
- Place orders
- Send messages to farmers
- Update delivery address and profile
- View order history

## Project Structure

```
Agrilink_Hub/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Helper functions
│   ├── migrations/          # Alembic migrations
│   ├── uploads/             # Uploaded files
│   ├── init_db.py          # Database initialization script
│   ├── run.py              # Application entry point
│   ├── config.py           # Configuration
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables
│   └── .env.example        # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── package.json        # Node dependencies
│   ├── .env                # Frontend environment variables
│   └── .env.example        # Environment template
├── setup.sh                # Automated setup script
└── README_POSTGRESQL.md    # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all approved products
- `GET /api/products/:id` - Get product details
- `POST /api/farmer/products` - Create product (farmer only)
- `PUT /api/farmer/products/:id` - Update product (farmer only)
- `DELETE /api/farmer/products/:id` - Delete product (farmer only)

### Categories
- `GET /api/products/categories` - Get all categories
- `POST /api/admin/categories` - Create category (admin only)

### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user's orders

### Messages
- `GET /api/messages/conversations` - Get message conversations
- `POST /api/messages/send` - Send message
- `GET /api/messages/thread/:threadId` - Get message thread

### Admin
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/buyers` - Get all buyers
- `GET /api/admin/products/pending` - Get pending products
- `PATCH /api/admin/products/:id/approve` - Approve product
- `PATCH /api/admin/orders/:id/approve` - Approve order

## Seeded Data

The database comes pre-populated with:

### Categories (8)
1. Vegetables
2. Fruits
3. Grains
4. Legumes
5. Dairy
6. Poultry
7. Herbs & Spices
8. Organic Produce

### Products (5)
1. **Organic Tomatoes** - $3.99/kg (500 kg available)
2. **Fresh Lettuce** - $2.49/head (300 heads available)
3. **Sweet Strawberries** - $5.99/kg (200 kg available)
4. **Organic Brown Rice** - $4.50/kg (1000 kg available)
5. **Whole Wheat Flour** - $3.75/kg (800 kg available)

All products are pre-approved and ready for buyers to purchase.

## Troubleshooting

### PostgreSQL Connection Issues

**Error: `psql: error: connection to server failed`**

Solution:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql
```

**Error: `FATAL: password authentication failed for user "myuser"`**

Solution:
```bash
# Reset user password
sudo -u postgres psql
ALTER USER myuser WITH PASSWORD 'mypassword';
\q
```

**Error: `FATAL: database "myproject_db" does not exist`**

Solution:
```bash
# Create the database
sudo -u postgres psql
CREATE DATABASE myproject_db OWNER myuser;
\q
```

### Backend Issues

**Error: `ModuleNotFoundError: No module named 'psycopg2'`**

Solution:
```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary
```

**Error: `Address already in use` (Port 5000)**

Solution:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
FLASK_RUN_PORT=5001 python3 run.py
```

### Frontend Issues

**Error: `EADDRINUSE: address already in use :::5173`**

Solution:
```bash
# Kill process on port 5173
npx kill-port 5173

# Or let Vite choose a different port
npm run dev -- --port 3000
```

**Error: API requests failing with CORS error**

Solution:
- Ensure backend is running on `http://localhost:5000`
- Check `frontend/.env` has correct `VITE_API_URL`
- Verify `backend/.env` includes frontend URL in `CORS_ORIGINS`

### Database Reset

If you need to completely reset the database:

```bash
cd backend
source venv/bin/activate
python3 init_db.py
```

This will drop all tables, recreate them, and reseed all data.

## Additional Commands

### View Database Tables

```bash
psql -U myuser -d myproject_db -h localhost
\dt  # List all tables
\d table_name  # Describe table structure
```

### Backup Database

```bash
pg_dump -U myuser -d myproject_db > backup.sql
```

### Restore Database

```bash
psql -U myuser -d myproject_db < backup.sql
```

### Run Migrations (if schema changes)

```bash
cd backend
source venv/bin/activate
flask db upgrade
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use tools like Postman or curl to test API endpoints
3. **Database GUI**: Use tools like pgAdmin or DBeaver to visualize the database
4. **Logging**: Check terminal output for detailed error messages

## Production Deployment

For production deployment:

1. Change all default passwords and secrets
2. Set `FLASK_ENV=production` in backend/.env
3. Use a production-grade WSGI server (gunicorn)
4. Build frontend: `npm run build`
5. Use nginx as reverse proxy
6. Enable HTTPS/SSL
7. Set up proper database backups
8. Configure firewall rules

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review error logs in terminal output
- Ensure all prerequisites are properly installed

## License

[Your License Here]
