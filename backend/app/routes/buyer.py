from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.models.buyer_profile import BuyerProfile
from app.models.order import Order
from app.models.activity_log import ActivityLog
from app.utils.decorators import buyer_required
from app.utils.helpers import get_client_ip

buyer_bp = Blueprint('buyer', __name__)

@buyer_bp.route('/profile', methods=['GET'])
@buyer_required
def get_profile():
    """Get buyer profile"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.buyer_profile:
        return jsonify({'message': 'Buyer profile not found'}), 404

    return jsonify({'profile': user.buyer_profile.to_dict()}), 200


@buyer_bp.route('/profile', methods=['PATCH'])
@buyer_required
def update_profile():
    """Update buyer profile"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.buyer_profile:
        return jsonify({'message': 'Buyer profile not found'}), 404

    profile = user.buyer_profile

    # Update fields
    if 'full_name' in data:
        profile.full_name = data['full_name']
    if 'phone' in data:
        profile.phone = data['phone']
    if 'profile_image' in data:
        profile.profile_image = data['profile_image']
    if 'delivery_address' in data:
        profile.delivery_address = data['delivery_address']
    if 'city' in data:
        profile.city = data['city']
    if 'state' in data:
        profile.state = data['state']
    if 'zip_code' in data:
        profile.zip_code = data['zip_code']

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='update_profile',
        description='Buyer updated profile',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200


@buyer_bp.route('/orders', methods=['GET'])
@buyer_required
def get_my_orders():
    """Get buyer's order history"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.buyer_profile:
        return jsonify({'message': 'Buyer profile not found'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')  # 'pending', 'approved', 'rejected', etc.

    query = Order.query.filter_by(buyer_id=user.buyer_profile.id)

    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'orders': [order.to_dict() for order in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@buyer_bp.route('/orders/<int:order_id>', methods=['GET'])
@buyer_required
def get_order(order_id):
    """Get specific order (buyer can only view own orders)"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    order = Order.query.get_or_404(order_id)

    # Verify ownership
    if order.buyer_id != user.buyer_profile.id:
        return jsonify({'message': 'Access denied'}), 403

    return jsonify({'order': order.to_dict()}), 200
