# AgriLink Hub - Quick Start with PostgreSQL

Get up and running with AgriLink Hub in minutes!

## Prerequisites Check

```bash
python3 --version  # Should be 3.8+
node --version     # Should be 16+
psql --version     # Should be 12+
```

## One-Command Setup

```bash
./setup.sh
```

That's it! The script will:
- ✅ Create PostgreSQL database (`myproject_db`)
- ✅ Create database user (`myuser` / `mypassword`)
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Create database tables
- ✅ Seed sample data
- ✅ Configure environment variables

## Start the Application

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python3 run.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Or use the start script (both servers):
```bash
./start.sh
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Login Credentials

### Admin
```
Email: admin@agrilink.com
Password: admin123
```

### Farmer
```
Email: john.farmer@gmail.com
Password: farmer123
```

### Buyer
```
Email: buyer1@gmail.com
Password: buyer123
```

## What's Pre-loaded

The database comes with:
- ✅ 8 product categories
- ✅ 1 admin account
- ✅ 2 farmer accounts with farm profiles
- ✅ 2 buyer accounts with delivery addresses
- ✅ 5 sample products (all approved)

## Test the Features

1. **As a Buyer** (buyer1@gmail.com):
   - Browse products by category
   - Add items to cart
   - Place an order
   - Send messages to farmers
   - Update profile and delivery address

2. **As a Farmer** (john.farmer@gmail.com):
   - Add new products
   - View and manage inventory
   - Respond to buyer messages
   - Update farm profile

3. **As Admin** (admin@agrilink.com):
   - Approve/reject products
   - Approve/reject orders
   - Manage users
   - View system analytics
   - Send messages to farmers and buyers

## Database Configuration

Default PostgreSQL settings:
```
Host: localhost
Port: 5432
Database: myproject_db
User: myuser
Password: mypassword
```

To change these, edit `backend/.env`:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
```

## Troubleshooting

### PostgreSQL not running?
```bash
sudo systemctl start postgresql
```

### Database connection failed?
```bash
# Create database manually
sudo -u postgres psql
CREATE DATABASE myproject_db;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myuser;
\q
```

### Port already in use?
```bash
# Backend (port 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (port 5173)
npx kill-port 5173
```

### Need to reset database?
```bash
cd backend
source venv/bin/activate
python3 init_db.py
```

## Next Steps

- Explore all features with different user roles
- Add your own products as a farmer
- Place test orders as a buyer
- Try the messaging system
- Customize categories and products

## Full Documentation

For detailed setup and configuration, see [README_POSTGRESQL.md](README_POSTGRESQL.md)

## Support

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify PostgreSQL is running
3. Check terminal logs for errors
4. Ensure ports 5000 and 5173 are available
5. Run `./setup.sh` again if needed

Happy farming! 🌾
