from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.message import Message
from app.models.activity_log import ActivityLog
from app.utils.helpers import get_client_ip
from sqlalchemy import or_, and_

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/users/buyers', methods=['GET'])
@jwt_required()
def get_buyers():
    """Get list of all buyers (for admin to message)"""
    from app.models.buyer_profile import BuyerProfile
    from app.utils.decorators import admin_required

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    buyers = BuyerProfile.query.join(User).filter(User.is_active == True).all()

    return jsonify({
        'buyers': [{
            'id': buyer.user_id,
            'name': buyer.full_name,
            'email': buyer.user.email,
            'city': buyer.city,
            'state': buyer.state
        } for buyer in buyers]
    }), 200


@messages_bp.route('/users/farmers', methods=['GET'])
@jwt_required()
def get_farmers():
    """Get list of all farmers (for admin to message)"""
    from app.models.farmer_profile import FarmerProfile

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    farmers = FarmerProfile.query.join(User).filter(User.is_active == True).all()

    return jsonify({
        'farmers': [{
            'id': farmer.user_id,
            'name': farmer.full_name,
            'email': farmer.user.email,
            'farm_name': farmer.farm_name,
            'farm_location': farmer.farm_location
        } for farmer in farmers]
    }), 200

@messages_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to another user"""
    sender_id = int(get_jwt_identity())
    sender = User.query.get(sender_id)
    data = request.get_json()

    if not data.get('receiver_id') or not data.get('message'):
        return jsonify({'message': 'Receiver ID and message are required'}), 400

    receiver_id = int(data['receiver_id'])
    receiver = User.query.get(receiver_id)

    if not receiver:
        return jsonify({'message': 'Receiver not found'}), 404

    # Verify sender has permission to message this receiver
    # Admin can message anyone, buyers/farmers can only message admin
    if sender.role != 'admin' and receiver.role != 'admin':
        return jsonify({'message': 'You can only send messages to admin'}), 403

    try:
        # Generate thread ID
        thread_id = Message.generate_thread_id(sender_id, receiver_id)

        # Create message
        message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            subject=data.get('subject', 'No Subject'),
            message=data['message'],
            thread_id=thread_id,
            parent_message_id=data.get('parent_message_id')
        )
        db.session.add(message)

        # Log activity
        ActivityLog.log_activity(
            user_id=sender_id,
            action='send_message',
            description=f'Sent message to {receiver.role}',
            entity_type='message',
            entity_id=message.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Message sent successfully',
            'data': message.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[MESSAGE ERROR] Failed to send message: {str(e)}")
        return jsonify({'message': 'Error sending message', 'error': str(e)}), 500


@messages_bp.route('/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    """Get all messages received by the current user"""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Message.query.filter_by(receiver_id=user_id)

    if unread_only:
        query = query.filter_by(is_read=False)

    # Only get top-level messages (not replies)
    query = query.filter_by(parent_message_id=None)

    pagination = query.order_by(Message.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'messages': [msg.to_dict(include_thread=True) for msg in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'unread_count': Message.query.filter_by(receiver_id=user_id, is_read=False).count()
    }), 200


@messages_bp.route('/sent', methods=['GET'])
@jwt_required()
def get_sent():
    """Get all messages sent by the current user"""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # Only get top-level messages (not replies)
    query = Message.query.filter_by(sender_id=user_id, parent_message_id=None)

    pagination = query.order_by(Message.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'messages': [msg.to_dict(include_thread=True) for msg in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all unique conversations (threads) for the current user"""
    user_id = int(get_jwt_identity())

    # Get all messages where user is sender or receiver
    messages = Message.query.filter(
        or_(
            Message.sender_id == user_id,
            Message.receiver_id == user_id
        )
    ).order_by(Message.created_at.desc()).all()

    # Group by thread_id and get the latest message for each thread
    threads = {}
    for msg in messages:
        if msg.thread_id not in threads:
            # Get the other user in the conversation
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            other_user = User.query.get(other_user_id)

            # Count unread messages in this thread
            unread_count = Message.query.filter_by(
                thread_id=msg.thread_id,
                receiver_id=user_id,
                is_read=False
            ).count()

            threads[msg.thread_id] = {
                'thread_id': msg.thread_id,
                'other_user_id': other_user_id,
                'other_user_name': other_user.buyer_profile.full_name if other_user.role == 'buyer' and other_user.buyer_profile
                                  else other_user.farmer_profile.full_name if other_user.role == 'farmer' and other_user.farmer_profile
                                  else 'Admin',
                'other_user_role': other_user.role,
                'last_message': msg.to_dict(),
                'unread_count': unread_count
            }

    return jsonify({
        'conversations': list(threads.values())
    }), 200


@messages_bp.route('/thread/<thread_id>', methods=['GET'])
@jwt_required()
def get_thread(thread_id):
    """Get all messages in a specific thread"""
    user_id = int(get_jwt_identity())

    # Verify user is part of this thread
    messages = Message.query.filter(
        and_(
            Message.thread_id == thread_id,
            or_(
                Message.sender_id == user_id,
                Message.receiver_id == user_id
            )
        )
    ).order_by(Message.created_at.asc()).all()

    if not messages:
        return jsonify({'message': 'Thread not found or access denied'}), 404

    # Mark all received messages in this thread as read
    for msg in messages:
        if msg.receiver_id == user_id and not msg.is_read:
            msg.mark_as_read()

    return jsonify({
        'messages': [msg.to_dict() for msg in messages]
    }), 200


@messages_bp.route('/<int:message_id>', methods=['GET'])
@jwt_required()
def get_message(message_id):
    """Get a specific message"""
    user_id = int(get_jwt_identity())
    message = Message.query.get_or_404(message_id)

    # Verify user is sender or receiver
    if message.sender_id != user_id and message.receiver_id != user_id:
        return jsonify({'message': 'Access denied'}), 403

    # Mark as read if user is receiver
    if message.receiver_id == user_id:
        message.mark_as_read()

    return jsonify({'message': message.to_dict(include_thread=True)}), 200


@messages_bp.route('/<int:message_id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(message_id):
    """Mark a message as read"""
    user_id = int(get_jwt_identity())
    message = Message.query.get_or_404(message_id)

    # Verify user is the receiver
    if message.receiver_id != user_id:
        return jsonify({'message': 'Access denied'}), 403

    message.mark_as_read()

    return jsonify({'message': 'Message marked as read'}), 200


@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread messages"""
    user_id = int(get_jwt_identity())

    unread_count = Message.query.filter_by(
        receiver_id=user_id,
        is_read=False
    ).count()

    return jsonify({'unread_count': unread_count}), 200


@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Delete a message (soft delete - only for sender)"""
    user_id = int(get_jwt_identity())
    message = Message.query.get_or_404(message_id)

    # Only sender or admin can delete
    if message.sender_id != user_id:
        user = User.query.get(user_id)
        if user.role != 'admin':
            return jsonify({'message': 'Access denied'}), 403

    try:
        db.session.delete(message)
        db.session.commit()
        return jsonify({'message': 'Message deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting message', 'error': str(e)}), 500
