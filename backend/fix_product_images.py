#!/usr/bin/env python3
"""
Script to fix product images in the database.
Associates existing uploaded images with the product.
"""
from app import create_app, db
from app.models import FarmerProduct, ProductImage
import os

app = create_app()

with app.app_context():
    # Get the product that has no images
    product = FarmerProduct.query.filter_by(id=1).first()
    
    if not product:
        print("Product ID 1 not found")
        exit(1)
    
    print(f"Found product: {product.name}")
    print(f"Current images: {[img.image_url for img in product.images]}")
    
    # List files in uploads directory
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    if os.path.exists(uploads_dir):
        files = [f for f in os.listdir(uploads_dir) if f.endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif'))]
        print(f"\nFound {len(files)} image files in uploads directory")
        
        if files and not product.images.count():
            # Add the first image as the product image
            image_url = f'/api/upload/images/{files[0]}'
            product_image = ProductImage(
                product_id=product.id,
                image_url=image_url,
                is_primary=True
            )
            db.session.add(product_image)
            db.session.commit()
            print(f"\nAdded image to product: {image_url}")
        elif product.images.count():
            print("\nProduct already has images")
        else:
            print("\nNo image files found to add")
    else:
        print(f"\nUploads directory not found: {uploads_dir}")

print("\nDone!")
