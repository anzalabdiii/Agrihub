from app import db
from datetime import datetime

class FarmerProduct(db.Model):
    __tablename__ = 'farmer_products'

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer_profiles.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)

    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(20), nullable=False)  # e.g., 'kg', 'piece', 'liter'

    # Product type (livestock or farm produce)
    product_type = db.Column(db.String(50), nullable=False)  # 'livestock', 'produce', 'dairy', etc.

    # Location
    location = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))

    # Status
    is_approved = db.Column(db.Boolean, default=False, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_out_of_stock = db.Column(db.Boolean, default=False, nullable=False, index=True)

    # Analytics
    view_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    approved_at = db.Column(db.DateTime)

    # Relationships
    images = db.relationship('ProductImage', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')

    def to_dict(self, include_farmer=False):
        """Serialize product to dictionary"""
        data = {
            'id': self.id,
            'farmer_id': self.farmer_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'quantity': self.quantity,
            'unit': self.unit,
            'product_type': self.product_type,
            'location': self.location,
            'city': self.city,
            'state': self.state,
            'is_approved': self.is_approved,
            'is_active': self.is_active,
            'is_out_of_stock': self.is_out_of_stock,
            'view_count': self.view_count,
            'images': [img.to_dict() for img in self.images.all()],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }

        if include_farmer and self.farmer:
            data['farmer'] = {
                'id': self.farmer.id,
                'full_name': self.farmer.full_name,
                'farm_name': self.farmer.farm_name,
                'farm_location': self.farmer.farm_location
            }

        return data

    def update_stock(self, quantity_change):
        """Update stock quantity and set out of stock flag if needed"""
        self.quantity += quantity_change
        if self.quantity <= 0:
            self.quantity = 0
            self.is_out_of_stock = True
        else:
            self.is_out_of_stock = False

    def __repr__(self):
        return f'<FarmerProduct {self.name}>'
