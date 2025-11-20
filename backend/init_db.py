#!/usr/bin/env python3
"""
Database Initialization and Seeding Script for AgriLink Hub
Creates the database, runs migrations, and seeds initial data
"""
import os
import sys
from app import create_app, db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.buyer_profile import BuyerProfile
from app.models.category import Category
from app.models.farmer_product import FarmerProduct
from app.models.product_image import ProductImage
from werkzeug.security import generate_password_hash

def init_database():
    """Initialize database and create all tables"""
    print("="*60)
    print("AgriLink Hub - Database Initialization")
    print("="*60)

    app = create_app()

    with app.app_context():
        try:
            # Drop all existing tables (for fresh start)
            print("\n[1/5] Dropping existing tables...")
            db.drop_all()
            print("✓ Existing tables dropped")

            # Create all tables
            print("\n[2/5] Creating database tables...")
            db.create_all()
            print("✓ All tables created successfully")

            # Seed categories
            print("\n[3/5] Seeding categories...")
            seed_categories()
            print("✓ Categories seeded")

            # Seed users (admin, farmers, buyers)
            print("\n[4/5] Seeding users...")
            seed_users()
            print("✓ Users seeded")

            # Seed products
            print("\n[5/5] Seeding products...")
            seed_products()
            print("✓ Products seeded")

            print("\n" + "="*60)
            print("✓ Database initialization completed successfully!")
            print("="*60)
            print("\nDefault Login Credentials:")
            print("-" * 60)
            print("ADMIN:")
            print("  Email: admin@agrilink.com")
            print("  Password: admin123")
            print("\nFARMER 1:")
            print("  Email: john.farmer@gmail.com")
            print("  Password: farmer123")
            print("\nFARMER 2:")
            print("  Email: jane.farmer@gmail.com")
            print("  Password: farmer123")
            print("\nBUYER 1:")
            print("  Email: buyer1@gmail.com")
            print("  Password: buyer123")
            print("\nBUYER 2:")
            print("  Email: buyer2@gmail.com")
            print("  Password: buyer123")
            print("="*60)

        except Exception as e:
            print(f"\n✗ Error initializing database: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

def seed_categories():
    """Seed initial categories"""
    categories_data = [
        {"name": "Vegetables", "description": "Fresh vegetables including leafy greens, root vegetables, and more"},
        {"name": "Fruits", "description": "Fresh seasonal and tropical fruits"},
        {"name": "Grains", "description": "Rice, wheat, corn, and other grain products"},
        {"name": "Legumes", "description": "Beans, lentils, peas, and other legumes"},
        {"name": "Dairy", "description": "Milk, cheese, yogurt, and dairy products"},
        {"name": "Poultry", "description": "Chicken, eggs, and poultry products"},
        {"name": "Herbs & Spices", "description": "Fresh herbs and spices"},
        {"name": "Organic Produce", "description": "Certified organic agricultural products"}
    ]

    for cat_data in categories_data:
        category = Category(**cat_data, is_active=True)
        db.session.add(category)

    db.session.commit()

def seed_users():
    """Seed initial users (admin, farmers, buyers)"""

    # Create Admin
    admin = User(
        email='admin@agrilink.com',
        role='admin',
        is_active=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.flush()

    # Create Farmer 1 - John
    farmer1 = User(
        email='john.farmer@gmail.com',
        role='farmer',
        is_active=True
    )
    farmer1.set_password('farmer123')
    db.session.add(farmer1)
    db.session.flush()

    farmer1_profile = FarmerProfile(
        user_id=farmer1.id,
        full_name='John Farmer',
        phone='+1234567890',
        farm_name='Green Valley Farm',
        farm_location='California, USA',
        farm_size='50 acres',
        farm_description='Family-owned organic farm specializing in vegetables and fruits'
    )
    db.session.add(farmer1_profile)

    # Create Farmer 2 - Jane
    farmer2 = User(
        email='jane.farmer@gmail.com',
        role='farmer',
        is_active=True
    )
    farmer2.set_password('farmer123')
    db.session.add(farmer2)
    db.session.flush()

    farmer2_profile = FarmerProfile(
        user_id=farmer2.id,
        full_name='Jane Smith',
        phone='+1234567891',
        farm_name='Sunshine Organic Farm',
        farm_location='Texas, USA',
        farm_size='75 acres',
        farm_description='Certified organic farm producing grains and legumes'
    )
    db.session.add(farmer2_profile)

    # Create Buyer 1
    buyer1 = User(
        email='buyer1@gmail.com',
        role='buyer',
        is_active=True
    )
    buyer1.set_password('buyer123')
    db.session.add(buyer1)
    db.session.flush()

    buyer1_profile = BuyerProfile(
        user_id=buyer1.id,
        full_name='Michael Johnson',
        phone='+1234567892',
        delivery_address='123 Main Street',
        city='Los Angeles',
        state='CA',
        zip_code='90001'
    )
    db.session.add(buyer1_profile)

    # Create Buyer 2
    buyer2 = User(
        email='buyer2@gmail.com',
        role='buyer',
        is_active=True
    )
    buyer2.set_password('buyer123')
    db.session.add(buyer2)
    db.session.flush()

    buyer2_profile = BuyerProfile(
        user_id=buyer2.id,
        full_name='Sarah Williams',
        phone='+1234567893',
        delivery_address='456 Oak Avenue',
        city='Houston',
        state='TX',
        zip_code='77001'
    )
    db.session.add(buyer2_profile)

    db.session.commit()

def seed_products():
    """Seed initial products"""

    # Get farmer profiles
    farmer1_user = User.query.filter_by(email='john.farmer@gmail.com').first()
    farmer2_user = User.query.filter_by(email='jane.farmer@gmail.com').first()

    farmer1 = FarmerProfile.query.filter_by(user_id=farmer1_user.id).first()
    farmer2 = FarmerProfile.query.filter_by(user_id=farmer2_user.id).first()

    # Get categories
    vegetables = Category.query.filter_by(name='Vegetables').first()
    fruits = Category.query.filter_by(name='Fruits').first()
    grains = Category.query.filter_by(name='Grains').first()

    products_data = [
        {
            'farmer_id': farmer1.id,
            'category_id': vegetables.id,
            'name': 'Organic Tomatoes',
            'description': 'Fresh organic vine-ripened tomatoes. Perfect for salads, cooking, and sauces. Grown without pesticides.',
            'price': 3.99,
            'quantity': 500,
            'unit': 'kg',
            'product_type': 'produce',
            'is_approved': True
        },
        {
            'farmer_id': farmer1.id,
            'category_id': vegetables.id,
            'name': 'Fresh Lettuce',
            'description': 'Crisp romaine lettuce, harvested daily. Great for salads and sandwiches.',
            'price': 2.49,
            'quantity': 300,
            'unit': 'head',
            'product_type': 'produce',
            'is_approved': True
        },
        {
            'farmer_id': farmer1.id,
            'category_id': fruits.id,
            'name': 'Sweet Strawberries',
            'description': 'Juicy, sweet strawberries picked at peak ripeness. No artificial chemicals used.',
            'price': 5.99,
            'quantity': 200,
            'unit': 'kg',
            'product_type': 'produce',
            'is_approved': True
        },
        {
            'farmer_id': farmer2.id,
            'category_id': grains.id,
            'name': 'Organic Brown Rice',
            'description': 'Premium quality organic brown rice. Rich in fiber and nutrients.',
            'price': 4.50,
            'quantity': 1000,
            'unit': 'kg',
            'product_type': 'produce',
            'is_approved': True
        },
        {
            'farmer_id': farmer2.id,
            'category_id': grains.id,
            'name': 'Whole Wheat Flour',
            'description': 'Stone-ground whole wheat flour from organic wheat. Perfect for baking.',
            'price': 3.75,
            'quantity': 800,
            'unit': 'kg',
            'product_type': 'produce',
            'is_approved': True
        }
    ]

    for product_data in products_data:
        product = FarmerProduct(**product_data)
        db.session.add(product)

    db.session.commit()

if __name__ == '__main__':
    init_database()
