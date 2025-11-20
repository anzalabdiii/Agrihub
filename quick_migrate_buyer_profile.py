#!/usr/bin/env python3
"""
Quick migration script to add profile_image column to buyer_profiles table.
This script can run while the Flask app is running.
"""
import sqlite3
import os
import sys

# Get the database path
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'backend', 'instance', 'agrilink.db')

print(f"Database path: {db_path}")

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    sys.exit(1)

# Try to connect with a short timeout to avoid long locks
try:
    conn = sqlite3.connect(db_path, timeout=2.0)
    cursor = conn.cursor()

    # Check if column already exists
    cursor.execute("PRAGMA table_info(buyer_profiles)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]

    print(f"\nCurrent buyer_profiles columns: {', '.join(column_names)}")

    if 'profile_image' in column_names:
        print("\n[OK] Column 'profile_image' already exists in buyer_profiles table")
        print("No migration needed!")
    else:
        print("\n[INFO] Adding 'profile_image' column to buyer_profiles table...")
        # Add the profile_image column
        cursor.execute("ALTER TABLE buyer_profiles ADD COLUMN profile_image VARCHAR(500)")
        conn.commit()
        print("[OK] Successfully added 'profile_image' column!")

        # Verify the column was added
        cursor.execute("PRAGMA table_info(buyer_profiles)")
        columns = cursor.fetchall()
        print("\nUpdated buyer_profiles columns:")
        for col in columns:
            marker = " (NEW)" if col[1] == 'profile_image' else ""
            print(f"  - {col[1]} ({col[2]}){marker}")

    conn.close()
    print("\n[OK] Migration complete!")

except sqlite3.OperationalError as e:
    if "locked" in str(e).lower():
        print("\n[WARNING] Database is currently locked (Flask backend is running).")
        print("\nTo run this migration, you have two options:")
        print("1. Stop the Flask backend, run this script, then restart the backend")
        print("2. Restart the Flask backend (it will auto-detect and create missing columns)")
        print("\nNote: The new migration endpoint is available after restarting the backend:")
        print("   POST /api/admin/migrate/buyer-profile-image")
    else:
        print(f"\n[ERROR] Database error: {e}")
    sys.exit(1)

except Exception as e:
    print(f"\n[ERROR] Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
