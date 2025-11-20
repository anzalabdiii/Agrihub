# AgriLink Hub - Complete Setup Instructions

## Prerequisites

Ensure you have these installed:
```bash
python3 --version  # Need 3.8+
node --version     # Need 16+
psql --version     # Need 12+
```

## Quick Setup (5 Steps)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Agrilink_Hub
```

### 2. Setup PostgreSQL
```bash
sudo -u postgres psql
```

Then run these SQL commands:
```sql
CREATE DATABASE myproject_db;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myuser;
\q
```

### 3. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python3 init_db.py
```

Expected output:
```
✓ All tables created successfully
✓ Categories seeded
✓ Users seeded
✓ Products seeded
✓ Database initialization completed successfully!
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

### 5. Start Application

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python3 run.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Access Application

Open browser: **http://localhost:5173**

## Test Accounts

### Admin
- Email: `admin@agrilink.com`
- Password: `admin123`
- URL: http://localhost:5173/admin

### Farmer
- Email: `john.farmer@gmail.com`
- Password: `farmer123`
- URL: http://localhost:5173/farmer

### Buyer
- Email: `buyer1@gmail.com`
- Password: `buyer123`
- URL: http://localhost:5173/buyer

## What's Included

- ✅ 8 Product Categories
- ✅ 5 Sample Products (all approved)
- ✅ 5 User Accounts (1 admin, 2 farmers, 2 buyers)
- ✅ Complete database schema
- ✅ All API endpoints functional

## Features Working

- ✅ User Authentication (JWT)
- ✅ Product Management (CRUD)
- ✅ Shopping Cart (auto-created on first use)
- ✅ Order System
- ✅ Messaging System
- ✅ Admin Approval Workflows
- ✅ Profile Management
- ✅ Image Uploads
- ✅ Stock Management

## Troubleshooting

### PostgreSQL Not Running
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Port Conflicts
```bash
# Backend (5000)
lsof -i :5000
kill -9 <PID>

# Frontend (5173)
npx kill-port 5173
```

### Reset Database
```bash
cd backend
source venv/bin/activate
python3 init_db.py
```

## Success Checklist

You're ready when:
- [ ] Backend runs on http://localhost:5000
- [ ] Frontend runs on http://localhost:5173
- [ ] Can login with test accounts
- [ ] Products display on buyer dashboard
- [ ] Cart works (auto-created on first access)
- [ ] All 3 dashboards load correctly

---

**Your AgriLink Hub is ready!** 🎉

For detailed documentation, see `README_POSTGRESQL.md`
