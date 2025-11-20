#!/usr/bin/env python3
"""
Setup script to create the messages table
Run from backend directory: python setup_messages.py
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def create_messages_table():
    """Create the messages table using Flask-SQLAlchemy"""
    try:
        from app import create_app, db
        from app.models.message import Message

        print("Creating Flask app...")
        app = create_app()

        with app.app_context():
            print("Creating messages table...")

            # Create only the messages table
            Message.__table__.create(db.engine, checkfirst=True)

            print("✅ Messages table created successfully!")
            print("\nYou can now:")
            print("1. Restart your Flask backend server")
            print("2. Navigate to the Messages tab in any dashboard")
            print("3. Start sending messages!")

            return True

    except Exception as e:
        print(f"❌ Error creating messages table: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = create_messages_table()
    sys.exit(0 if success else 1)
