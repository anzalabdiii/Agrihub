# Database Migration Instructions

## Overview
This document explains how to apply the latest database migrations for your AgriLink Hub application.

## Pending Migrations

### 1. Buyer Profile Image Column
**What it does:** Adds a `profile_image` column to the `buyer_profiles` table, allowing buyers to upload and display profile images.

**Required for:** Buyer profile editing functionality with image upload

## Migration Options

### Option 1: Run Migration Script (Recommended if backend is stopped)

1. **Stop the Flask backend** (if running):
   - Press `Ctrl+C` in the terminal where the backend is running

2. **Run the migration script:**
   ```bash
   python3 quick_migrate_buyer_profile.py
   ```

3. **Restart the Flask backend:**
   ```bash
   cd backend
   python run.py
   ```

### Option 2: Restart Backend (Auto-migration)

Simply restart your Flask backend. On startup, it will detect missing columns and create them automatically.

1. Stop the backend (`Ctrl+C`)
2. Start it again:
   ```bash
   cd backend
   python run.py
   ```

### Option 3: Use the Migration API Endpoint

After restarting the backend to load the new admin endpoint:

1. **Get an admin access token:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@agrilink.com","password":"admin123"}'
   ```

2. **Run the migration endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/migrate/buyer-profile-image \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```

## Verification

After running the migration, you can verify it was successful by:

1. **Checking the database directly:**
   ```bash
   sqlite3 backend/instance/agrilink.db "PRAGMA table_info(buyer_profiles);"
   ```
   You should see `profile_image` in the column list.

2. **Testing in the UI:**
   - Log in as a buyer
   - Go to the Profile tab
   - Click "Edit Profile"
   - Try uploading a profile image
   - The image should upload and display successfully

## Troubleshooting

### Database is Locked Error
**Problem:** Getting "database is locked" error when running the migration script.

**Solution:** The Flask backend is currently running. Either:
- Stop the backend first, then run the script
- Or just restart the backend (it will auto-migrate)

### Column Already Exists Error
**Problem:** Getting "column already exists" error.

**Solution:** The migration has already been applied. No action needed!

### Permission Denied
**Problem:** Cannot write to the database file.

**Solution:** Ensure you have write permissions to the `backend/instance/` directory.

## Files Modified

- `backend/app/models/buyer_profile.py` - Added `profile_image` column
- `backend/app/routes/buyer.py` - Added profile image handling in update endpoint
- `backend/app/routes/admin.py` - Added migration API endpoint
- `frontend/src/pages/buyer/Dashboard.jsx` - Complete profile editing UI with image upload

## Next Steps

After running the migration:

1. ✅ Buyers can now edit their profiles
2. ✅ Buyers can upload profile images
3. ✅ Profile images display in the buyer dashboard
4. ✅ All profile fields are editable (name, phone, address, city, state, zip)

## Questions?

If you encounter any issues with the migration, check the backend logs for error messages and ensure:
- The backend has write access to the database
- No other processes are accessing the database
- You're using Python 3.6 or higher
