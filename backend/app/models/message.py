from app import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)

    # Sender and receiver (user IDs, not profile IDs)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Message content
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)

    # Thread management (for grouping conversations)
    thread_id = db.Column(db.String(100), nullable=False, index=True)
    parent_message_id = db.Column(db.Integer, db.ForeignKey('messages.id'), nullable=True)

    # Status tracking
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
    replies = db.relationship('Message', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

    def to_dict(self, include_thread=False):
        """Serialize message to dictionary"""
        data = {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.buyer_profile.full_name if self.sender.role == 'buyer' and self.sender.buyer_profile
                          else self.sender.farmer_profile.full_name if self.sender.role == 'farmer' and self.sender.farmer_profile
                          else 'Admin',
            'sender_role': self.sender.role,
            'receiver_id': self.receiver_id,
            'receiver_name': self.receiver.buyer_profile.full_name if self.receiver.role == 'buyer' and self.receiver.buyer_profile
                            else self.receiver.farmer_profile.full_name if self.receiver.role == 'farmer' and self.receiver.farmer_profile
                            else 'Admin',
            'receiver_role': self.receiver.role,
            'subject': self.subject,
            'message': self.message,
            'thread_id': self.thread_id,
            'parent_message_id': self.parent_message_id,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat()
        }

        if include_thread:
            data['replies'] = [reply.to_dict() for reply in self.replies.order_by(Message.created_at.asc()).all()]
            data['reply_count'] = self.replies.count()

        return data

    @staticmethod
    def generate_thread_id(user1_id, user2_id):
        """Generate a consistent thread ID for two users"""
        # Always use smaller ID first for consistency
        ids = sorted([user1_id, user2_id])
        return f'thread-{ids[0]}-{ids[1]}'

    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            db.session.commit()

    def __repr__(self):
        return f'<Message {self.id} from User {self.sender_id} to User {self.receiver_id}>'
