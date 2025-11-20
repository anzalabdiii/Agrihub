from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.models.activity_log import ActivityLog
from app.utils.decorators import buyer_required
from app.utils.helpers import get_client_ip
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/confirm', methods=['POST'])
@buyer_required
def confirm_order():
    """
    Buyer confirms cart and creates pending order
    Order is sent to admin for approval
    """
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json() or {}

    if not user.buyer_profile or not user.buyer_profile.cart:
        return jsonify({'message': 'Cart not found'}), 404

    cart = user.buyer_profile.cart
    cart_items = cart.items.all()

    if not cart_items:
        return jsonify({'message': 'Cart is empty'}), 400

    try:
        # Calculate total
        total_amount = sum(
            item.quantity * float(item.product.price)
            for item in cart_items
            if item.product
        )

        # Generate temporary order number (will be updated after flush)
        temp_order_number = f'ORD-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}-TEMP'

        # Create order
        order = Order(
            buyer_id=user.buyer_profile.id,
            order_number=temp_order_number,
            status='pending',
            total_amount=total_amount,
            delivery_address=data.get('delivery_address') or user.buyer_profile.delivery_address,
            delivery_city=data.get('delivery_city') or user.buyer_profile.city,
            delivery_state=data.get('delivery_state') or user.buyer_profile.state,
            delivery_zip=data.get('delivery_zip') or user.buyer_profile.zip_code,
            delivery_phone=data.get('delivery_phone') or user.buyer_profile.phone,
            buyer_notes=data.get('buyer_notes')
        )
        db.session.add(order)
        db.session.flush()  # Get order.id

        # Generate final order number with actual ID
        order.order_number = order.generate_order_number()

        # Create order items from cart items
        for cart_item in cart_items:
            if not cart_item.product:
                continue

            # Verify product is still available
            if not cart_item.product.is_approved or not cart_item.product.is_active:
                return jsonify({
                    'message': f'Product {cart_item.product.name} is no longer available'
                }), 400

            if cart_item.product.quantity < cart_item.quantity:
                return jsonify({
                    'message': f'Insufficient stock for {cart_item.product.name}'
                }), 400

            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                farmer_id=cart_item.product.farmer_id,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                quantity=cart_item.quantity,
                unit=cart_item.product.unit,
                subtotal=cart_item.quantity * cart_item.product.price
            )
            db.session.add(order_item)

        # Clear cart after order creation
        cart.clear()

        # Log activity
        ActivityLog.log_activity(
            user_id=user_id,
            action='create_order',
            description=f'Buyer created order #{order.order_number} (pending admin approval)',
            entity_type='order',
            entity_id=order.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Order created successfully. Awaiting admin approval.',
            'order': order.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[ORDER ERROR] Failed to create order: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error creating order', 'error': str(e)}), 500
