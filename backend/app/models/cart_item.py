from app import db
from datetime import datetime

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('farmer_products.id'), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Unique constraint to prevent duplicate products in same cart
    __table_args__ = (db.UniqueConstraint('cart_id', 'product_id', name='_cart_product_uc'),)

    def to_dict(self):
        """Serialize cart item to dictionary"""
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'product': self.product.to_dict(include_farmer=True) if self.product else None,
            'quantity': self.quantity,
            'subtotal': self.quantity * float(self.product.price) if self.product else 0,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<CartItem {self.id} - Product {self.product_id}>'
