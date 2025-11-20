"""Add profile_image column to buyer_profiles table"""
from app import create_app, db
from sqlalchemy import text

def add_profile_image_column():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text(
                "SELECT COUNT(*) FROM pragma_table_info('buyer_profiles') WHERE name='profile_image'"
            ))
            exists = result.scalar() > 0
            
            if not exists:
                # Add the column
                db.session.execute(text(
                    "ALTER TABLE buyer_profiles ADD COLUMN profile_image VARCHAR(500)"
                ))
                db.session.commit()
                print("✅ Successfully added profile_image column to buyer_profiles table")
            else:
                print("ℹ️  profile_image column already exists in buyer_profiles table")
                
        except Exception as e:
            print(f"❌ Error adding column: {e}")
            db.session.rollback()

if __name__ == '__main__':
    add_profile_image_column()
