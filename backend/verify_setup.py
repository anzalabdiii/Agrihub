#!/usr/bin/env python3
"""
Verification script to check messaging system setup
Run from backend directory: python verify_setup.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def verify_setup():
    """Verify that messaging system is properly set up"""
    print("=" * 60)
    print("MESSAGING SYSTEM VERIFICATION")
    print("=" * 60)
    print()

    try:
        from app import create_app, db
        from app.models.message import Message
        from app.models.user import User

        app = create_app()

        with app.app_context():
            # Check 1: Messages table exists
            print("✓ Checking if messages table exists...")
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()

            if 'messages' in tables:
                print("  ✅ Messages table exists")
            else:
                print("  ❌ Messages table NOT found")
                print("  → Run: python setup_messages.py")
                return False

            # Check 2: Messages blueprint registered
            print("\n✓ Checking Flask blueprints...")
            blueprint_names = [bp.name for bp in app.blueprints.values()]
            if 'messages' in blueprint_names:
                print("  ✅ Messages blueprint registered")
            else:
                print("  ❌ Messages blueprint NOT registered")
                return False

            # Check 3: Count users
            print("\n✓ Checking users...")
            admin_count = User.query.filter_by(role='admin').count()
            buyer_count = User.query.filter_by(role='buyer').count()
            farmer_count = User.query.filter_by(role='farmer').count()

            print(f"  ℹ️  Admins: {admin_count}")
            print(f"  ℹ️  Buyers: {buyer_count}")
            print(f"  ℹ️  Farmers: {farmer_count}")

            if admin_count == 0:
                print("  ⚠️  No admin users found - create at least one admin")
            if buyer_count == 0:
                print("  ⚠️  No buyer users found - admins won't have anyone to message")
            if farmer_count == 0:
                print("  ⚠️  No farmer users found - admins won't have anyone to message")

            # Check 4: Count messages
            print("\n✓ Checking messages...")
            message_count = Message.query.count()
            print(f"  ℹ️  Total messages: {message_count}")

            if message_count == 0:
                print("  ℹ️  No messages yet - system ready for first message!")

            # Check 5: API routes
            print("\n✓ Checking API routes...")
            message_routes = [
                rule.rule for rule in app.url_map.iter_rules()
                if 'messages' in rule.rule
            ]

            if len(message_routes) > 0:
                print(f"  ✅ Found {len(message_routes)} message routes:")
                for route in sorted(message_routes)[:5]:  # Show first 5
                    print(f"     • {route}")
                if len(message_routes) > 5:
                    print(f"     ... and {len(message_routes) - 5} more")
            else:
                print("  ❌ No message routes found")
                return False

            print("\n" + "=" * 60)
            print("✅ MESSAGING SYSTEM IS READY!")
            print("=" * 60)
            print()
            print("Next steps:")
            print("1. Start your Flask backend: python -m flask run")
            print("2. Open the app in your browser")
            print("3. Navigate to Messages tab in any dashboard")
            print("4. Start sending messages!")
            print()

            return True

    except ImportError as e:
        print(f"\n❌ Import Error: {str(e)}")
        print("Make sure you're in the backend directory and Flask is installed")
        return False

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = verify_setup()
    sys.exit(0 if success else 1)
