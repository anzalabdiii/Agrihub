#!/usr/bin/env python3
"""
Script to create an admin user for AgriLink Hub
Run this to create your first admin account
"""

from app import create_app, db
from app.models.user import User
from app.models.activity_log import ActivityLog

def create_admin():
    app = create_app()

    with app.app_context():
        # Create tables if they don't exist
        db.create_all()

        # Check if admin already exists
        admin_email = 'admin@agrilink.com'
        existing_admin = User.query.filter_by(email=admin_email).first()

        if existing_admin:
            print(f"Admin user already exists: {admin_email}")
            print(f"Password: admin123")
            return

        # Create admin user
        admin = User(
            email=admin_email,
            role='admin',
            is_active=True
        )
        admin.set_password('admin123')

        db.session.add(admin)

        # Log activity
        ActivityLog.log_activity(
            user_id=None,
            action='admin_created',
            description='Initial admin user created',
            entity_type='user',
            entity_id=None
        )

        db.session.commit()

        print("=" * 50)
        print("Admin user created successfully!")
        print("=" * 50)
        print(f"Email: {admin_email}")
        print(f"Password: admin123")
        print("=" * 50)
        print("\nYou can now login with these credentials.")
        print("IMPORTANT: Change the password after first login!")
        print("=" * 50)

if __name__ == '__main__':
    create_admin()
