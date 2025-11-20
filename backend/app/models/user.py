from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'farmer', 'buyer'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer_profile = db.relationship('FarmerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    buyer_profile = db.relationship('BuyerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    activity_logs = db.relationship('ActivityLog', backref='user', lazy='dynamic')

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_profile=True):
        """Serialize user to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

        if include_profile:
            if self.role == 'farmer' and self.farmer_profile:
                data['profile'] = self.farmer_profile.to_dict()
            elif self.role == 'buyer' and self.buyer_profile:
                data['profile'] = self.buyer_profile.to_dict()

        return data

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
