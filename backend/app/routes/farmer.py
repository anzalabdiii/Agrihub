from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.farmer_product import FarmerProduct
from app.models.product_image import ProductImage
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.activity_log import ActivityLog
from app.utils.decorators import farmer_required
from app.utils.helpers import get_client_ip

farmer_bp = Blueprint('farmer', __name__)

@farmer_bp.route('/profile', methods=['GET'])
@farmer_required
def get_profile():
    """Get farmer profile"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    return jsonify({'profile': user.farmer_profile.to_dict()}), 200


@farmer_bp.route('/profile', methods=['PATCH'])
@farmer_required
def update_profile():
    """Update farmer profile"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    profile = user.farmer_profile

    # Update fields
    if 'full_name' in data:
        profile.full_name = data['full_name']
    if 'phone' in data:
        profile.phone = data['phone']
    if 'farm_name' in data:
        profile.farm_name = data['farm_name']
    if 'farm_location' in data:
        profile.farm_location = data['farm_location']
    if 'farm_size' in data:
        profile.farm_size = data['farm_size']
    if 'farm_description' in data:
        profile.farm_description = data['farm_description']

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='update_profile',
        description='Farmer updated profile',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200


@farmer_bp.route('/products', methods=['GET'])
@farmer_required
def get_my_products():
    """Get farmer's own products"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')  # 'approved', 'pending', 'all'

    query = FarmerProduct.query.filter_by(
        farmer_id=user.farmer_profile.id,
        is_active=True
    )

    if status == 'approved':
        query = query.filter_by(is_approved=True)
    elif status == 'pending':
        query = query.filter_by(is_approved=False)

    pagination = query.order_by(FarmerProduct.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'products': [product.to_dict() for product in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@farmer_bp.route('/products', methods=['POST'])
@farmer_required
def create_product():
    """Create new product (pending admin approval)"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    # Validate required fields
    required_fields = ['name', 'category_id', 'price', 'quantity', 'unit', 'product_type']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        product = FarmerProduct(
            farmer_id=user.farmer_profile.id,
            category_id=data['category_id'],
            name=data['name'],
            description=data.get('description'),
            price=data['price'],
            quantity=data['quantity'],
            unit=data['unit'],
            product_type=data['product_type'],
            location=data.get('location'),
            city=data.get('city'),
            state=data.get('state'),
            is_approved=False,  # Requires admin approval
            is_active=True
        )
        db.session.add(product)
        db.session.flush()

        # Add product images if provided
        if 'images' in data and isinstance(data['images'], list):
            for idx, image_url in enumerate(data['images']):
                image = ProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    is_primary=(idx == 0)  # First image is primary
                )
                db.session.add(image)

        # Log activity
        ActivityLog.log_activity(
            user_id=user_id,
            action='create_product',
            description=f'Farmer created product: {data["name"]} (pending approval)',
            entity_type='product',
            entity_id=product.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Product created successfully. Awaiting admin approval.',
            'product': product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating product', 'error': str(e)}), 500


@farmer_bp.route('/products/<int:product_id>', methods=['GET'])
@farmer_required
def get_product(product_id):
    """Get specific product (farmer can only view own products)"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    product = FarmerProduct.query.get_or_404(product_id)

    # Verify ownership
    if product.farmer_id != user.farmer_profile.id:
        return jsonify({'message': 'Access denied'}), 403

    return jsonify({'product': product.to_dict()}), 200


@farmer_bp.route('/products/<int:product_id>', methods=['PATCH'])
@farmer_required
def update_product(product_id):
    """Update product (farmer can only update own products)"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    product = FarmerProduct.query.get_or_404(product_id)
    data = request.get_json()

    # Verify ownership
    if product.farmer_id != user.farmer_profile.id:
        return jsonify({'message': 'Access denied'}), 403

    # Update fields
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'quantity' in data:
        product.quantity = data['quantity']
        product.is_out_of_stock = (data['quantity'] <= 0)
    if 'unit' in data:
        product.unit = data['unit']
    if 'product_type' in data:
        product.product_type = data['product_type']
    if 'location' in data:
        product.location = data['location']
    if 'city' in data:
        product.city = data['city']
    if 'state' in data:
        product.state = data['state']
    if 'category_id' in data:
        product.category_id = data['category_id']

    # Handle image updates
    if 'images' in data and isinstance(data['images'], list):
        # Remove old images
        ProductImage.query.filter_by(product_id=product.id).delete()

        # Add new images
        for idx, image_url in enumerate(data['images']):
            image = ProductImage(
                product_id=product.id,
                image_url=image_url,
                is_primary=(idx == 0)
            )
            db.session.add(image)

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='update_product',
        description=f'Farmer updated product: {product.name}',
        entity_type='product',
        entity_id=product.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200


@farmer_bp.route('/products/<int:product_id>', methods=['DELETE'])
@farmer_required
def delete_product(product_id):
    """Soft delete product (mark as inactive)"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)
    product = FarmerProduct.query.get_or_404(product_id)

    # Verify ownership
    if product.farmer_id != user.farmer_profile.id:
        return jsonify({'message': 'Access denied'}), 403

    product.is_active = False

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='delete_product',
        description=f'Farmer deleted product: {product.name}',
        entity_type='product',
        entity_id=product.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({'message': 'Product deleted successfully'}), 200


@farmer_bp.route('/orders', methods=['GET'])
@farmer_required
def get_farmer_orders():
    """
    Get orders for farmer's products
    Farmers can only see approved orders (after admin approval)
    """
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', 'approved')

    # Get orders containing farmer's products
    query = db.session.query(Order).join(OrderItem).filter(
        OrderItem.farmer_id == user.farmer_profile.id,
        Order.status == status
    ).distinct()

    pagination = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    # Filter order items to show only this farmer's items
    orders_data = []
    for order in pagination.items:
        order_dict = order.to_dict()
        # Filter items to only show this farmer's products
        order_dict['items'] = [
            item.to_dict() for item in order.items
            if item.farmer_id == user.farmer_profile.id
        ]
        orders_data.append(order_dict)

    return jsonify({
        'orders': orders_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@farmer_bp.route('/analytics', methods=['GET'])
@farmer_required
def get_analytics():
    """Get farmer analytics"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user.farmer_profile:
        return jsonify({'message': 'Farmer profile not found'}), 404

    farmer_id = user.farmer_profile.id

    # Product statistics
    total_products = FarmerProduct.query.filter_by(
        farmer_id=farmer_id,
        is_active=True
    ).count()

    approved_products = FarmerProduct.query.filter_by(
        farmer_id=farmer_id,
        is_active=True,
        is_approved=True
    ).count()

    pending_products = FarmerProduct.query.filter_by(
        farmer_id=farmer_id,
        is_active=True,
        is_approved=False
    ).count()

    out_of_stock = FarmerProduct.query.filter_by(
        farmer_id=farmer_id,
        is_active=True,
        is_out_of_stock=True
    ).count()

    # Order statistics
    total_orders = OrderItem.query.filter_by(farmer_id=farmer_id).count()

    approved_order_items = OrderItem.query.join(Order).filter(
        OrderItem.farmer_id == farmer_id,
        Order.status == 'approved'
    ).all()

    total_revenue = sum(float(item.subtotal) for item in approved_order_items)
    total_items_sold = sum(item.quantity for item in approved_order_items)

    # Product views
    products = FarmerProduct.query.filter_by(farmer_id=farmer_id, is_active=True).all()
    total_views = sum(product.view_count for product in products)

    return jsonify({
        'products': {
            'total': total_products,
            'approved': approved_products,
            'pending': pending_products,
            'out_of_stock': out_of_stock
        },
        'orders': {
            'total': total_orders,
            'total_revenue': total_revenue,
            'total_items_sold': total_items_sold
        },
        'engagement': {
            'total_views': total_views
        }
    }), 200
