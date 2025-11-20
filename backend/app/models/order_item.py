from app import db
from datetime import datetime

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('farmer_products.id'), nullable=False, index=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer_profiles.id'), nullable=False, index=True)

    # Product details at time of order (snapshot)
    product_name = db.Column(db.String(150), nullable=False)
    product_price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to farmer
    farmer = db.relationship('FarmerProfile', backref='order_items')

    def to_dict(self):
        """Serialize order item to dictionary"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'farmer_id': self.farmer_id,
            'farmer_name': self.farmer.full_name if self.farmer else None,
            'farm_name': self.farmer.farm_name if self.farmer else None,
            'product_name': self.product_name,
            'product_price': float(self.product_price),
            'quantity': self.quantity,
            'unit': self.unit,
            'subtotal': float(self.subtotal),
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<OrderItem {self.id} - {self.product_name}>'
