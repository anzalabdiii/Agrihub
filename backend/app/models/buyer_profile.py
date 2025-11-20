from app import db
from datetime import datetime

class BuyerProfile(db.Model):
    __tablename__ = 'buyer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(500))
    delivery_address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    cart = db.relationship('Cart', backref='buyer', uselist=False, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='buyer', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize buyer profile to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'profile_image': self.profile_image,
            'delivery_address': self.delivery_address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BuyerProfile {self.full_name}>'
