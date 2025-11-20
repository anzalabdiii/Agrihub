"""Add image to existing product"""
from app import create_app, db
from app.models.product_image import ProductImage
from app.models.farmer_product import FarmerProduct
import os

def add_image():
    app = create_app()
    
    with app.app_context():
        # Get the mango product (ID 1)
        product = FarmerProduct.query.get(1)
        
        if not product:
            print("❌ Product not found")
            return
        
        print(f"Found product: {product.name}")
        print(f"Current images: {product.images.count()}")
        
        # Get the first image file from uploads folder
        upload_folder = app.config['UPLOAD_FOLDER']
        files = os.listdir(upload_folder)
        
        if not files:
            print("❌ No images found in uploads folder")
            return
        
        # Use the first image
        image_filename = files[0]
        image_url = f'/api/upload/images/{image_filename}'
        
        print(f"\nAdding image: {image_url}")
        
        # Check if image already exists
        existing = ProductImage.query.filter_by(
            product_id=product.id,
            image_url=image_url
        ).first()
        
        if existing:
            print("ℹ️  Image already exists")
        else:
            # Add the image
            image = ProductImage(
                product_id=product.id,
                image_url=image_url,
                is_primary=True
            )
            db.session.add(image)
            db.session.commit()
            print("✅ Image added successfully!")
        
        print(f"\nProduct now has {product.images.count()} image(s)")

if __name__ == '__main__':
    add_image()
