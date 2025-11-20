from app import create_app, db
from app.models import User, FarmerProfile, BuyerProfile, Category, FarmerProduct, \
    ProductImage, Cart, CartItem, Order, OrderItem, ActivityLog
import os

app = create_app()

@app.shell_context_processor
def make_shell_context():
    """Add database models to shell context"""
    return {
        'db': db,
        'User': User,
        'FarmerProfile': FarmerProfile,
        'BuyerProfile': BuyerProfile,
        'Category': Category,
        'FarmerProduct': FarmerProduct,
        'ProductImage': ProductImage,
        'Cart': Cart,
        'CartItem': CartItem,
        'Order': Order,
        'OrderItem': OrderItem,
        'ActivityLog': ActivityLog
    }

@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print('Database initialized!')

@app.cli.command()
def seed_admin():
    """Create initial admin user"""
    admin = User.query.filter_by(email='admin@agrilink.com').first()

    if admin:
        print('Admin user already exists!')
        return

    admin = User(
        email='admin@agrilink.com',
        role='admin',
        is_active=True
    )
    admin.set_password('admin123')  # Change this in production!

    db.session.add(admin)
    db.session.commit()

    print('Admin user created!')
    print('Email: admin@agrilink.com')
    print('Password: admin123')

@app.cli.command()
def seed_categories():
    """Seed initial categories"""
    categories = [
        {'name': 'Livestock', 'description': 'Farm animals including cattle, goats, sheep, pigs, chickens'},
        {'name': 'Grains', 'description': 'Wheat, rice, corn, barley, oats, millet'},
        {'name': 'Vegetables', 'description': 'Fresh vegetables and greens'},
        {'name': 'Fruits', 'description': 'Fresh fruits and berries'},
        {'name': 'Dairy', 'description': 'Milk, cheese, butter, yogurt'},
        {'name': 'Poultry Products', 'description': 'Eggs, chicken meat, duck'},
        {'name': 'Organic Produce', 'description': 'Certified organic products'},
        {'name': 'Seeds & Seedlings', 'description': 'Seeds and young plants for farming'},
    ]

    for cat_data in categories:
        if not Category.query.filter_by(name=cat_data['name']).first():
            category = Category(**cat_data)
            db.session.add(category)

    db.session.commit()
    print(f'{len(categories)} categories created!')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
