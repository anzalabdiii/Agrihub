from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.buyer_profile import BuyerProfile
from app.models.farmer_product import FarmerProduct
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.category import Category
from app.models.activity_log import ActivityLog
from app.utils.decorators import admin_required
from app.utils.helpers import get_client_ip
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/farmers/create', methods=['POST'])
@admin_required
def create_farmer():
    """Admin creates a farmer account"""
    data = request.get_json()
    admin_id = int(get_jwt_identity())  # Convert string to int

    # Validate required fields
    required_fields = ['email', 'password', 'full_name', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409

    try:
        # Create user account
        user = User(
            email=data['email'],
            role='farmer',
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()

        # Create farmer profile
        farmer_profile = FarmerProfile(
            user_id=user.id,
            full_name=data['full_name'],
            phone=data['phone'],
            farm_name=data.get('farm_name'),
            farm_location=data.get('farm_location'),
            farm_size=data.get('farm_size'),
            farm_description=data.get('farm_description')
        )
        db.session.add(farmer_profile)

        # Log activity
        ActivityLog.log_activity(
            user_id=admin_id,
            action='create_farmer',
            description=f'Admin created farmer account for {data["full_name"]}',
            entity_type='user',
            entity_id=user.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Farmer account created successfully',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating farmer account', 'error': str(e)}), 500


@admin_bp.route('/farmers', methods=['GET'])
@admin_required
def get_all_farmers():
    """Get all farmers"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    query = User.query.filter_by(role='farmer')

    if search:
        query = query.join(FarmerProfile).filter(
            db.or_(
                FarmerProfile.full_name.ilike(f'%{search}%'),
                FarmerProfile.farm_name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'farmers': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/buyers', methods=['GET'])
@admin_required
def get_all_buyers():
    """Get all buyers"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    query = User.query.filter_by(role='buyer')

    if search:
        query = query.join(BuyerProfile).filter(
            db.or_(
                BuyerProfile.full_name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'buyers': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PATCH'])
@admin_required
def toggle_user_status(user_id):
    """Activate or deactivate user"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get_or_404(user_id)

    if user.role == 'admin':
        return jsonify({'message': 'Cannot modify admin accounts'}), 403

    user.is_active = not user.is_active
    status = 'activated' if user.is_active else 'deactivated'

    # Log activity
    ActivityLog.log_activity(
        user_id=admin_id,
        action='toggle_user_status',
        description=f'Admin {status} {user.role} account: {user.email}',
        entity_type='user',
        entity_id=user.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': f'User {status} successfully',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/products/pending', methods=['GET'])
@admin_required
def get_pending_products():
    """Get all pending products awaiting approval"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = FarmerProduct.query.filter_by(
        is_approved=False,
        is_active=True
    ).order_by(FarmerProduct.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'products': [product.to_dict(include_farmer=True) for product in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/products/<int:product_id>/approve', methods=['PATCH'])
@admin_required
def approve_product(product_id):
    """Approve a farmer product"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    product = FarmerProduct.query.get_or_404(product_id)

    if product.is_approved:
        return jsonify({'message': 'Product already approved'}), 400

    product.is_approved = True
    product.approved_at = datetime.utcnow()

    # Log activity
    ActivityLog.log_activity(
        user_id=admin_id,
        action='approve_product',
        description=f'Admin approved product: {product.name}',
        entity_type='product',
        entity_id=product.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Product approved successfully',
        'product': product.to_dict()
    }), 200


@admin_bp.route('/products/<int:product_id>/reject', methods=['DELETE'])
@admin_required
def reject_product(product_id):
    """Reject and delete a farmer product"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    product = FarmerProduct.query.get_or_404(product_id)

    product_name = product.name

    # Log activity before deletion
    ActivityLog.log_activity(
        user_id=admin_id,
        action='reject_product',
        description=f'Admin rejected and deleted product: {product_name}',
        entity_type='product',
        entity_id=product.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product rejected and deleted successfully'}), 200


@admin_bp.route('/orders/pending', methods=['GET'])
@admin_required
def get_pending_orders():
    """Get all pending orders awaiting approval"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = Order.query.filter_by(status='pending').order_by(
        Order.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'orders': [order.to_dict() for order in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/orders/<int:order_id>/approve', methods=['PATCH'])
@admin_required
def approve_order(order_id):
    """
    Approve order and deduct stock from farmer products
    CRITICAL: This is where stock deduction happens
    """
    admin_id = int(get_jwt_identity())  # Convert string to int
    order = Order.query.get_or_404(order_id)

    if order.status != 'pending':
        return jsonify({'message': f'Order is already {order.status}'}), 400

    try:
        # Get all order items
        order_items = order.items.all()

        # Validate stock availability and deduct stock
        for item in order_items:
            product = FarmerProduct.query.get(item.product_id)

            if not product:
                return jsonify({
                    'message': f'Product {item.product_name} not found'
                }), 404

            # Check if enough stock is available
            if product.quantity < item.quantity:
                return jsonify({
                    'message': f'Insufficient stock for {product.name}. Available: {product.quantity}, Requested: {item.quantity}'
                }), 400

            # Deduct stock quantity
            product.update_stock(-item.quantity)

            # Log stock deduction
            ActivityLog.log_activity(
                user_id=admin_id,
                action='stock_deduction',
                description=f'Stock deducted: {item.quantity} {product.unit} of {product.name} (Order #{order.order_number})',
                entity_type='product',
                entity_id=product.id,
                ip_address=get_client_ip(),
                user_agent=request.headers.get('User-Agent')
            )

        # Update order status
        order.status = 'approved'
        order.approved_at = datetime.utcnow()

        # Log order approval
        ActivityLog.log_activity(
            user_id=admin_id,
            action='approve_order',
            description=f'Admin approved order #{order.order_number} for buyer {order.buyer.full_name}',
            entity_type='order',
            entity_id=order.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Order approved and stock deducted successfully',
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error approving order', 'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>/reject', methods=['PATCH'])
@admin_required
def reject_order(order_id):
    """Reject an order"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    data = request.get_json() or {}
    order = Order.query.get_or_404(order_id)

    if order.status != 'pending':
        return jsonify({'message': f'Order is already {order.status}'}), 400

    order.status = 'rejected'
    order.rejected_at = datetime.utcnow()
    order.admin_notes = data.get('admin_notes', '')

    # Log activity
    ActivityLog.log_activity(
        user_id=admin_id,
        action='reject_order',
        description=f'Admin rejected order #{order.order_number}',
        entity_type='order',
        entity_id=order.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Order rejected successfully',
        'order': order.to_dict()
    }), 200


@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    """Get all categories"""
    categories = Category.query.order_by(Category.name).all()
    return jsonify({
        'categories': [cat.to_dict() for cat in categories]
    }), 200


@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    """Create new category"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'message': 'Category name required'}), 400

    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Category already exists'}), 409

    try:
        category = Category(
            name=data['name'],
            description=data.get('description'),
            is_active=data.get('is_active', True)
        )
        db.session.add(category)

        # Log activity
        ActivityLog.log_activity(
            user_id=admin_id,
            action='create_category',
            description=f'Admin created category: {data["name"]}',
            entity_type='category',
            entity_id=category.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating category', 'error': str(e)}), 500


@admin_bp.route('/categories/<int:category_id>', methods=['PATCH'])
@admin_required
def update_category(category_id):
    """Update category"""
    admin_id = int(get_jwt_identity())  # Convert string to int
    category = Category.query.get_or_404(category_id)
    data = request.get_json()

    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    if 'is_active' in data:
        category.is_active = data['is_active']

    # Log activity
    ActivityLog.log_activity(
        user_id=admin_id,
        action='update_category',
        description=f'Admin updated category: {category.name}',
        entity_type='category',
        entity_id=category.id,
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )

    db.session.commit()

    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200


@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    stats = {
        'total_farmers': User.query.filter_by(role='farmer').count(),
        'active_farmers': User.query.filter_by(role='farmer', is_active=True).count(),
        'total_buyers': User.query.filter_by(role='buyer').count(),
        'active_buyers': User.query.filter_by(role='buyer', is_active=True).count(),
        'total_products': FarmerProduct.query.count(),
        'approved_products': FarmerProduct.query.filter_by(is_approved=True).count(),
        'pending_products': FarmerProduct.query.filter_by(is_approved=False, is_active=True).count(),
        'total_orders': Order.query.count(),
        'pending_orders': Order.query.filter_by(status='pending').count(),
        'approved_orders': Order.query.filter_by(status='approved').count(),
        'rejected_orders': Order.query.filter_by(status='rejected').count(),
        'total_categories': Category.query.count()
    }

    # Calculate total revenue from approved orders
    approved_orders = Order.query.filter_by(status='approved').all()
    stats['total_revenue'] = sum(float(order.total_amount) for order in approved_orders)

    return jsonify(stats), 200


@admin_bp.route('/activity-logs', methods=['GET'])
@admin_required
def get_activity_logs():
    """Get activity logs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action = request.args.get('action')

    query = ActivityLog.query

    if action:
        query = query.filter_by(action=action)

    pagination = query.order_by(ActivityLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'logs': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/migrate/buyer-profile-image', methods=['POST'])
@admin_required
def migrate_buyer_profile_image():
    """Add profile_image column to buyer_profiles table if it doesn't exist"""
    from sqlalchemy import text, inspect

    try:
        # Check if column already exists
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('buyer_profiles')]

        if 'profile_image' in columns:
            return jsonify({
                'message': 'Column profile_image already exists in buyer_profiles table',
                'status': 'already_exists'
            }), 200

        # Add the column
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE buyer_profiles ADD COLUMN profile_image VARCHAR(500)"))
            conn.commit()

        return jsonify({
            'message': 'Successfully added profile_image column to buyer_profiles table',
            'status': 'success'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error adding column',
            'error': str(e),
            'status': 'error'
        }), 500
