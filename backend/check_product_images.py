"""Check product images in database"""
from app import create_app, db
from app.models.farmer_product import FarmerProduct
from app.models.product_image import ProductImage

def check_images():
    app = create_app()
    
    with app.app_context():
        # Get approved products
        products = FarmerProduct.query.filter_by(is_approved=True).limit(3).all()
        
        print("=== Approved Products with Images ===\n")
        for product in products:
            print(f"Product: {product.name}")
            print(f"  ID: {product.id}")
            images = product.images.all()
            print(f"  Images: {len(images)}")
            for img in images:
                print(f"    - {img.image_url} (Primary: {img.is_primary})")
            print()

if __name__ == '__main__':
    check_images()
