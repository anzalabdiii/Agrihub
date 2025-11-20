import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'agrilink.db')

print(f"Connecting to database: {db_path}")

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(buyer_profiles)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]

    if 'profile_image' in column_names:
        print("Column 'profile_image' already exists in buyer_profiles table")
    else:
        # Add the profile_image column
        cursor.execute("ALTER TABLE buyer_profiles ADD COLUMN profile_image VARCHAR(500)")
        conn.commit()
        print("Successfully added 'profile_image' column to buyer_profiles table")

    # Verify the column was added
    cursor.execute("PRAGMA table_info(buyer_profiles)")
    columns = cursor.fetchall()
    print("\nCurrent buyer_profiles columns:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")

except sqlite3.Error as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
