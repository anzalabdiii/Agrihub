from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.farmer_product import FarmerProduct
from app.models.activity_log import ActivityLog
from app.utils.decorators import buyer_required
from app.utils.helpers import get_client_ip

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@buyer_required
def get_cart():
    """Get buyer's cart"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    return jsonify({'cart': user.buyer_profile.cart.to_dict()}), 200


@cart_bp.route('/items', methods=['POST'])
@buyer_required
def add_to_cart():
    """Add item to cart"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    if not data.get('product_id') or not data.get('quantity'):
        return jsonify({'message': 'Product ID and quantity required'}), 400

    # Verify product exists and is available
    product = FarmerProduct.query.filter_by(
        id=data['product_id'],
        is_approved=True,
        is_active=True
    ).first()

    if not product:
        return jsonify({'message': 'Product not found or not available'}), 404

    if product.is_out_of_stock:
        return jsonify({'message': 'Product is out of stock'}), 400

    if product.quantity < data['quantity']:
        return jsonify({
            'message': f'Insufficient stock. Only {product.quantity} {product.unit} available'
        }), 400

    cart = user.buyer_profile.cart

    try:
        # Check if product already in cart
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=data['product_id']
        ).first()

        if cart_item:
            # Update quantity
            new_quantity = cart_item.quantity + data['quantity']

            if new_quantity > product.quantity:
                return jsonify({
                    'message': f'Cannot add more. Only {product.quantity} {product.unit} available'
                }), 400

            cart_item.quantity = new_quantity
        else:
            # Create new cart item
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=data['product_id'],
                quantity=data['quantity']
            )
            db.session.add(cart_item)

        # Log activity
        ActivityLog.log_activity(
            user_id=user_id,
            action='add_to_cart',
            description=f'Added {data["quantity"]} {product.unit} of {product.name} to cart',
            entity_type='cart',
            entity_id=cart.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Item added to cart successfully',
            'cart': cart.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error adding item to cart', 'error': str(e)}), 500


@cart_bp.route('/items/<int:cart_item_id>', methods=['PATCH'])
@buyer_required
def update_cart_item(cart_item_id):
    """Update cart item quantity"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    cart_item = CartItem.query.get_or_404(cart_item_id)

    # Verify ownership
    if cart_item.cart_id != user.buyer_profile.cart.id:
        return jsonify({'message': 'Access denied'}), 403

    if 'quantity' not in data:
        return jsonify({'message': 'Quantity required'}), 400

    # Validate quantity
    if data['quantity'] <= 0:
        return jsonify({'message': 'Quantity must be greater than 0'}), 400

    if cart_item.product.quantity < data['quantity']:
        return jsonify({
            'message': f'Insufficient stock. Only {cart_item.product.quantity} {cart_item.product.unit} available'
        }), 400

    cart_item.quantity = data['quantity']
    db.session.commit()

    return jsonify({
        'message': 'Cart item updated successfully',
        'cart': user.buyer_profile.cart.to_dict()
    }), 200


@cart_bp.route('/items/<int:cart_item_id>', methods=['DELETE'])
@buyer_required
def remove_from_cart(cart_item_id):
    """Remove item from cart"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    cart_item = CartItem.query.get_or_404(cart_item_id)

    # Verify ownership
    if cart_item.cart_id != user.buyer_profile.cart.id:
        return jsonify({'message': 'Access denied'}), 403

    product_name = cart_item.product.name if cart_item.product else 'Unknown'

    db.session.delete(cart_item)

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='remove_from_cart',
        description=f'Removed {product_name} from cart',
        entity_type='cart',
        entity_id=user.buyer_profile.cart.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Item removed from cart successfully',
        'cart': user.buyer_profile.cart.to_dict()
    }), 200


@cart_bp.route('/clear', methods=['DELETE'])
@buyer_required
def clear_cart():
    """Clear all items from cart"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    cart = user.buyer_profile.cart
    cart.clear()

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='clear_cart',
        description='Cleared cart',
        entity_type='cart',
        entity_id=cart.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({'message': 'Cart cleared successfully'}), 200
