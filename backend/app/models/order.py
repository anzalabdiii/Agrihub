from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyer_profiles.id'), nullable=False, index=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)

    # Order status: 'pending', 'approved', 'rejected', 'completed', 'cancelled'
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)

    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    # Delivery information
    delivery_address = db.Column(db.Text)
    delivery_city = db.Column(db.String(100))
    delivery_state = db.Column(db.String(100))
    delivery_zip = db.Column(db.String(20))
    delivery_phone = db.Column(db.String(20))

    # Notes
    buyer_notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    approved_at = db.Column(db.DateTime)
    rejected_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_items=True):
        """Serialize order to dictionary"""
        data = {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'buyer_name': self.buyer.full_name if self.buyer else None,
            'order_number': self.order_number,
            'status': self.status,
            'total_amount': float(self.total_amount),
            'delivery_address': self.delivery_address,
            'delivery_city': self.delivery_city,
            'delivery_state': self.delivery_state,
            'delivery_zip': self.delivery_zip,
            'delivery_phone': self.delivery_phone,
            'buyer_notes': self.buyer_notes,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

        if include_items:
            data['items'] = [item.to_dict() for item in self.items.all()]
            data['item_count'] = self.items.count()

        return data

    def generate_order_number(self):
        """Generate unique order number"""
        from datetime import datetime
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        return f'ORD-{timestamp}-{self.id}'

    def __repr__(self):
        return f'<Order {self.order_number}>'
