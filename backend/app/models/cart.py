from app import db
from datetime import datetime

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyer_profiles.id'), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize cart to dictionary"""
        items = self.items.all()
        total = sum(item.quantity * float(item.product.price) for item in items if item.product)

        return {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'items': [item.to_dict() for item in items],
            'item_count': len(items),
            'total': total,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def clear(self):
        """Clear all items from cart"""
        # Use the relationship to delete all items
        for item in self.items.all():
            db.session.delete(item)

    def __repr__(self):
        return f'<Cart {self.id} for Buyer {self.buyer_id}>'
