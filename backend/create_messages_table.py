"""
Quick script to create the messages table
Run this with: python create_messages_table.py
"""
from app import create_app, db
from app.models.message import Message

app = create_app()

with app.app_context():
    # Create the messages table
    db.create_all()
    print("✅ Messages table created successfully!")
