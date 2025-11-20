# AgriLink Hub - Complete Setup Guide for New Machine

This guide will help you set up and run AgriLink Hub on a brand new machine from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Default Credentials](#default-credentials)
6. [Complete Workflow Test](#complete-workflow-test)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

1. **Python 3.8+**
   - Download from: https://www.python.org/downloads/
   - Verify installation:
     ```bash
     python --version
     # or
     python3 --version
     ```

2. **Node.js 16+ and npm**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

3. **PostgreSQL 12+** (or SQLite for development)
   - **PostgreSQL** (recommended): https://www.postgresql.org/download/
   - **SQLite** (simpler): No installation needed, comes with Python

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/downloads

---

## Installation Steps

### 1. Get the Code

Clone the repository or copy the project folder to your machine:

```bash
# If using Git
git clone <repository-url>
cd Agrilink_Hub

# Or simply copy the entire Agrilink_Hub folder to your machine
```

### 2. Backend Setup

#### Step 2.1: Navigate to backend directory
```bash
cd backend
```

#### Step 2.2: Create Python virtual environment
```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows (Command Prompt)
python -m venv venv
venv\Scripts\activate

# On Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1
```

You should see `(venv)` prefix in your terminal after activation.

#### Step 2.3: Install Python dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install all required packages including Flask, SQLAlchemy, JWT, etc.

#### Step 2.4: Create environment configuration
```bash
# Copy the example environment file
cp .env.example .env

# On Windows (if cp doesn't work)
copy .env.example .env
```

#### Step 2.5: Edit the `.env` file

Open the `.env` file with any text editor and configure:

**For SQLite (Easier - Recommended for Development):**
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production

# SQLite Database (creates a file in backend directory)
DATABASE_URL=sqlite:///agrilink.db

# File Upload Settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# CORS Settings (allows frontend to access API)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**For PostgreSQL (Recommended for Production):**
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/agrilink_db

# File Upload Settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Frontend Setup

#### Step 3.1: Open a new terminal and navigate to frontend directory
```bash
cd frontend
```

#### Step 3.2: Install Node.js dependencies
```bash
npm install
```

This will install React, Vite, Tailwind CSS, and all other dependencies.

#### Step 3.3: Create frontend environment configuration
```bash
# Copy the example environment file
cp .env.example .env

# On Windows (if cp doesn't work)
copy .env.example .env
```

#### Step 3.4: Edit the frontend `.env` file

Open `frontend/.env` and configure:

```env
VITE_API_URL=http://localhost:5000/api
```

This tells the frontend where to find the backend API.

---

## Database Setup

### Option 1: SQLite (Easiest - Recommended for Getting Started)

SQLite is simpler and requires no additional setup. The database file will be created automatically.

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Initialize database migrations
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations to create all tables
flask db upgrade

# Create admin user
flask seed_admin

# Create default categories
flask seed_categories

# Setup messaging system
python setup_messages.py
```

**Expected Output:**
```
✅ Migrations initialized!
✅ Migration created!
✅ Database upgraded!
✅ Admin user created successfully!
✅ Categories created successfully!
✅ Messages table created successfully!
```

### Option 2: PostgreSQL (For Production-like Setup)

If you want to use PostgreSQL:

#### Step 1: Create PostgreSQL database
```bash
# Login to PostgreSQL (password: postgres by default)
psql -U postgres

# Inside PostgreSQL shell, create database
CREATE DATABASE agrilink_db;

# Exit PostgreSQL shell
\q
```

#### Step 2: Update `.env` file
Make sure `DATABASE_URL` in backend `.env` points to your PostgreSQL database:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/agrilink_db
```

#### Step 3: Run migrations
```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Initialize database migrations (skip if migrations folder exists)
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade

# Seed initial data
flask seed_admin
flask seed_categories
python setup_messages.py
```

---

## Running the Application

You need to run both backend and frontend servers **simultaneously** in separate terminals.

### Terminal 1: Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Run Flask server
python run.py

# Alternative: Use Flask CLI
flask run
```

**Expected Output:**
```
 * Serving Flask app 'run.py'
 * Running on http://127.0.0.1:5000
 * Debug mode: on
 * Restarting with stat
 * Debugger is active!
```

✅ Backend is now running at: **http://localhost:5000**

### Terminal 2: Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Run Vite development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

✅ Frontend is now running at: **http://localhost:5173**

### Access the Application

Open your web browser and navigate to:
- **Frontend Application**: http://localhost:5173
- **Backend API** (for testing): http://localhost:5000/api

---

## Default Credentials

### Admin Account (Created by seed_admin command)
- **Email**: `admin@agrilink.com`
- **Password**: `admin123`
- **Role**: Administrator

⚠️ **Important**: Change this password after first login in production!

---

## Complete Workflow Test

Test the entire system to make sure everything works:

### Step 1: Login as Admin
1. Open http://localhost:5173
2. Click "Login"
3. Enter:
   - Email: `admin@agrilink.com`
   - Password: `admin123`
4. Click "Login"
5. You should see the Admin Dashboard

### Step 2: Create a Farmer Account
1. In Admin Dashboard, click on **"Create Farmer"** tab
2. Fill in the form:
   - **Full Name**: John Farmer
   - **Email**: farmer@test.com
   - **Password**: farmer123
   - **Phone**: 555-1234
   - **Farm Name**: Green Valley Farm
   - **Farm Location**: Rural County, State
   - **Farm Size**: 50 acres
3. Click **"Create Farmer Account"**
4. You should see a success message

### Step 3: Add Product Categories (Optional - already seeded)
Categories should already exist from `flask seed_categories`. To add more:
1. Go to **"Categories"** tab
2. Click "Add Category"
3. Add categories like: Vegetables, Fruits, Grains, Dairy, Livestock

### Step 4: Test as Farmer - Post a Product
1. Click "Logout"
2. Click "Login" again
3. Login as farmer:
   - Email: `farmer@test.com`
   - Password: `farmer123`
4. You should see Farmer Dashboard
5. Go to **"Add Product"** tab
6. Fill in product details:
   - **Name**: Fresh Tomatoes
   - **Description**: Organic vine-ripened tomatoes
   - **Price**: 3.99
   - **Quantity**: 100
   - **Unit**: kg
   - **Category**: Select "Vegetables"
   - **Location**: Farm Location
   - **Upload Image** (optional)
7. Click **"Post Product"**
8. Product status will be **"Pending"** (requires admin approval)

### Step 5: Approve Product as Admin
1. Logout from farmer account
2. Login as admin again
3. Go to **"Pending Products"** tab
4. You should see "Fresh Tomatoes" in the list
5. Click **"Approve"** button
6. Product is now **approved** and visible to buyers!

### Step 6: Create a Buyer Account
1. Logout from admin
2. On the login page, click **"Sign Up"**
3. Fill in buyer registration:
   - **Full Name**: Jane Buyer
   - **Email**: buyer@test.com
   - **Password**: buyer123
   - **Phone**: 555-5678
   - **Address**: 123 Main St
   - **City**: Springfield
   - **State**: IL
   - **Zip Code**: 62701
4. Click **"Sign Up"**
5. You'll be automatically logged in as buyer

### Step 7: Place an Order as Buyer
1. In Buyer Dashboard, you start on **"Browse Products"** tab
2. You should see "Fresh Tomatoes" (approved product)
3. Click on the product to view details
4. Click **"Add to Cart"**
5. Go to **"My Cart"** tab
6. You should see tomatoes in your cart
7. Adjust quantity if needed
8. Click **"Confirm Order"** or **"Place Order"**
9. Order is now **pending admin approval**

### Step 8: Approve Order as Admin (with Stock Deduction)
1. Logout and login as admin
2. Go to **"Pending Orders"** tab
3. You should see the buyer's order
4. Review order details
5. Click **"Approve Order"** or **"Approve & Deduct Stock"**
6. ✅ **Stock is automatically deducted** from the product!
7. Order status changes to **"Approved"**

### Step 9: Verify Stock Deduction
1. Still logged in as admin
2. Go to **"Pending Products"** tab
3. Find "Fresh Tomatoes"
4. Check the quantity - it should be reduced
   - Example: If buyer ordered 10kg, quantity should now be 90kg (100 - 10)
5. If quantity reaches 0, product is marked as "Out of Stock"

### Step 10: Farmer Sees Approved Order
1. Logout and login as farmer
2. Go to **"Orders"** tab
3. You should see the approved order!
4. Farmer can see order details and prepare for delivery

### Step 11: Test Messaging System
1. **As Admin**:
   - Go to **"Messages"** tab
   - Click **"New Message"**
   - Select **"Buyer"** or **"Farmer"**
   - Choose user from dropdown
   - Enter subject and message
   - Click **"Send Message"**

2. **As Buyer/Farmer**:
   - Go to **"Messages"** tab
   - See unread message badge (red number)
   - Click on conversation to open
   - Read message (badge updates)
   - Type reply and send

3. **Unread Notifications**:
   - Notice red badge on Messages tab showing unread count
   - Badge updates automatically every 30 seconds

---

## Project Structure

```
Agrilink_Hub/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models/              # Database models (11 models)
│   │   │   ├── user.py          # User authentication
│   │   │   ├── farmer_profile.py
│   │   │   ├── buyer_profile.py
│   │   │   ├── farmer_product.py
│   │   │   ├── order.py
│   │   │   ├── order_item.py
│   │   │   ├── message.py       # Messaging system
│   │   │   ├── cart.py
│   │   │   ├── cart_item.py
│   │   │   ├── category.py
│   │   │   └── activity_log.py
│   │   ├── routes/              # API endpoints (8 blueprints)
│   │   │   ├── auth.py          # Login, signup, refresh token
│   │   │   ├── admin.py         # Admin operations
│   │   │   ├── farmer.py        # Farmer operations
│   │   │   ├── buyer.py         # Buyer operations
│   │   │   ├── products.py      # Product listing (public)
│   │   │   ├── cart.py          # Cart operations
│   │   │   ├── orders.py        # Order operations
│   │   │   └── messages.py      # Messaging endpoints
│   │   └── utils/
│   │       ├── decorators.py    # Auth decorators
│   │       └── helpers.py       # Helper functions
│   ├── migrations/              # Database migrations
│   ├── uploads/                 # Product images
│   ├── config.py                # Configuration
│   ├── run.py                   # Entry point
│   ├── requirements.txt         # Python dependencies
│   ├── setup_messages.py        # Messaging setup script
│   ├── .env.example             # Example environment variables
│   └── .env                     # Your environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/           # Admin dashboard & pages
│   │   │   ├── farmer/          # Farmer dashboard & pages
│   │   │   ├── buyer/           # Buyer dashboard & pages
│   │   │   └── auth/            # Login & Signup
│   │   ├── components/
│   │   │   └── Messages.jsx     # Messaging component
│   │   ├── store/               # Zustand state management
│   │   │   ├── authStore.js
│   │   │   ├── productStore.js
│   │   │   ├── cartStore.js
│   │   │   └── notificationStore.js
│   │   ├── services/
│   │   │   └── api.js           # Axios API configuration
│   │   ├── App.jsx              # Main app with routing
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static files
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── .env.example             # Example environment variables
│   └── .env                     # Your environment variables (create this)
├── README.md                    # Project overview
├── QUICK_START.md              # Quick reference guide
├── MESSAGING_SETUP.md          # Messaging system guide
├── ARCHITECTURE.md             # System architecture
├── COMPONENT_GUIDE.md          # Frontend component examples
├── DEPLOYMENT.md               # Production deployment guide
└── SETUP_GUIDE.md              # This file
```

---

## Key Features

### ✅ Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control (Admin, Farmer, Buyer)
- Protected routes and API endpoints
- Automatic token refresh

### ✅ Admin Capabilities
- Create farmer accounts manually
- Approve/reject farmer product posts
- Approve/decline buyer orders
- **Automatic stock deduction** when approving orders
- Manage users (activate/deactivate)
- Category management
- Activity logs for audit trail
- Dashboard with analytics
- **Messaging**: Send messages to buyers and farmers

### ✅ Farmer Capabilities
- Post products with images (requires admin approval)
- Manage product listings (edit/delete)
- View approved orders only
- Product analytics (views, sales, revenue)
- **Stock automatically updated** when orders are approved
- **Messaging**: Reply to admin messages

### ✅ Buyer Capabilities
- Self-registration (no admin approval needed)
- Browse approved products
- Advanced search and filters (category, location, price)
- Cart management
- Place orders (requires admin approval)
- Order history
- **Messaging**: Contact admin for support

### ✅ Messaging System
- **Bidirectional messaging**: Admin ↔ Buyer, Admin ↔ Farmer
- Threaded conversations
- Unread message count badges
- Real-time notifications (auto-refresh every 30 seconds)
- Read receipts (✓✓ for read, 🕐 for unread)
- Admin can select specific buyers/farmers to message

### ✅ Stock Management
- Automatic stock deduction when admin approves orders
- Out-of-stock marking when quantity reaches 0
- Stock validation before order approval
- Activity logging for all stock changes
- Prevents over-ordering

---

## Troubleshooting

### Backend Issues

#### 1. **"Module not found" or "ImportError"**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. **Database connection errors**

**For SQLite:**
```bash
# Delete old database and recreate
rm agrilink.db
flask db upgrade
flask seed_admin
flask seed_categories
python setup_messages.py
```

**For PostgreSQL:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status  # Linux
brew services list | grep postgresql  # Mac
# Windows: Check Services app

# Verify database exists
psql -U postgres -l

# Check DATABASE_URL in .env file
```

#### 3. **"no such table: messages" error**
```bash
cd backend
source venv/bin/activate
python setup_messages.py
```

#### 4. **Port 5000 already in use**
```bash
# Find and kill process using port 5000

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows (Command Prompt as Admin)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

#### 5. **Flask command not found**
```bash
# Make sure venv is activated and Flask is installed
source venv/bin/activate
pip install Flask
```

### Frontend Issues

#### 1. **"npm install" fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. **CORS errors in browser console**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Make sure backend is running
- Check `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Restart backend server after changing `.env`

#### 3. **401 Unauthorized errors**
- Clear browser localStorage
- Logout and login again
- Check if backend is running
- Verify JWT tokens are being sent in requests

#### 4. **Port 5173 already in use**
```bash
# Vite will automatically suggest another port (like 5174)
# Or kill the process:

# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

#### 5. **Images not loading**
- Check `UPLOAD_FOLDER` exists in backend directory
- Verify image paths in database
- Check browser console for errors

### General Issues

#### **Cannot login / "Invalid credentials"**
- Make sure you ran `flask seed_admin`
- Verify database has users table
- Check backend logs for errors
- Try creating a new user

#### **Changes not reflecting**
- **Backend**: Restart Flask server (Ctrl+C, then `python run.py`)
- **Frontend**: Vite has hot-reload, but try refreshing browser
- Clear browser cache (Ctrl+Shift+Delete)

---

## Quick Command Reference

### Backend Commands
```bash
# Activate virtual environment
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Database commands
flask db init                   # Initialize migrations
flask db migrate -m "message"   # Create migration
flask db upgrade                # Apply migrations
flask db downgrade              # Rollback migration

# Seed data
flask seed_admin                # Create admin user
flask seed_categories           # Create categories
python setup_messages.py        # Setup messaging

# Run server
python run.py                   # Start Flask server
flask run                       # Alternative way to start
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Development
npm run dev                     # Start dev server

# Production
npm run build                   # Build for production
npm run preview                 # Preview production build
npm run lint                    # Run linter
```

### Common Task Sequences

**Fresh Database Setup:**
```bash
cd backend
source venv/bin/activate
rm agrilink.db  # if exists
flask db upgrade
flask seed_admin
flask seed_categories
python setup_messages.py
```

**Reset Everything:**
```bash
# Backend
cd backend
rm -rf migrations/ agrilink.db
flask db init
flask db migrate -m "Initial"
flask db upgrade
flask seed_admin
flask seed_categories
python setup_messages.py

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md) which includes:
- Using PostgreSQL instead of SQLite
- Nginx configuration
- Gunicorn setup
- SSL certificates with Let's Encrypt
- Environment security best practices
- Database backup strategies
- Performance optimization

### Quick Production Checklist:
- [ ] Change `SECRET_KEY` and `JWT_SECRET_KEY` to strong random values
- [ ] Set `FLASK_ENV=production`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Change default admin password
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS with SSL certificates
- [ ] Use Gunicorn or uWSGI instead of Flask dev server
- [ ] Build frontend with `npm run build`
- [ ] Set up automated database backups
- [ ] Configure firewall and security groups

---

## Support & Documentation

- **Project README**: [README.md](README.md) - Full project overview
- **Quick Start**: [QUICK_START.md](QUICK_START.md) - 5-minute quick start
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - System design and workflows
- **Components**: [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) - UI component examples
- **Messaging**: [MESSAGING_SETUP.md](MESSAGING_SETUP.md) - Messaging system details
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change default credentials** - Never use admin123 in production!
2. **Generate strong secret keys** - Use random strings for SECRET_KEY and JWT_SECRET_KEY
3. **Use PostgreSQL** - SQLite is for development only
4. **Enable HTTPS** - Get SSL certificates from Let's Encrypt
5. **Set FLASK_ENV=production** - Disable debug mode
6. **Configure CORS properly** - Only allow your domain
7. **Implement rate limiting** - Prevent API abuse
8. **Regular backups** - Set up automated database backups
9. **Update dependencies** - Keep packages up to date
10. **Monitor logs** - Set up logging and monitoring

---

## License

MIT License - Feel free to customize for your needs!

---

## Need Help?

If you encounter issues:

1. **Check the logs**:
   - Backend: Look at the terminal where Flask is running
   - Frontend: Open browser DevTools (F12) and check Console tab

2. **Verify environment**:
   - Backend `.env` file is configured correctly
   - Frontend `.env` file has correct API URL
   - Both servers are running

3. **Check database**:
   - Run `flask db upgrade` to ensure latest schema
   - Verify seed data was created

4. **Clear and restart**:
   - Clear browser cache and localStorage
   - Restart both backend and frontend servers

---

**🎉 Your AgriLink Hub is now ready!**

Access the application at: **http://localhost:5173**

Login with:
- Email: `admin@agrilink.com`
- Password: `admin123`

Happy farming! 🌾
