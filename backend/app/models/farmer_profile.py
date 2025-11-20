from app import db
from datetime import datetime

class FarmerProfile(db.Model):
    __tablename__ = 'farmer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    farm_name = db.Column(db.String(150))
    farm_location = db.Column(db.String(200))
    farm_size = db.Column(db.String(50))  # e.g., "5 acres"
    farm_description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    products = db.relationship('FarmerProduct', backref='farmer', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize farmer profile to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'farm_name': self.farm_name,
            'farm_location': self.farm_location,
            'farm_size': self.farm_size,
            'farm_description': self.farm_description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<FarmerProfile {self.full_name}>'
