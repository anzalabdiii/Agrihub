from app import db
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    action = db.Column(db.String(100), nullable=False, index=True)
    entity_type = db.Column(db.String(50))  # 'product', 'order', 'user', etc.
    entity_id = db.Column(db.Integer)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        """Serialize activity log to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.user.email if self.user else None,
            'user_role': self.user.role if self.user else None,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'description': self.description,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }

    @staticmethod
    def log_activity(user_id, action, description, entity_type=None, entity_id=None, ip_address=None, user_agent=None):
        """Helper method to create activity log"""
        log = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log)
        return log

    def __repr__(self):
        return f'<ActivityLog {self.action} by User {self.user_id}>'
