from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.buyer_profile import BuyerProfile
from app.models.cart import Cart
from app.models.activity_log import ActivityLog
from app.utils.helpers import get_client_ip

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def buyer_signup():
    """Buyer self-registration endpoint"""
    data = request.get_json()

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
            role='buyer',
            is_active=True
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()  # Get user.id before committing

        # Create buyer profile
        buyer_profile = BuyerProfile(
            user_id=user.id,
            full_name=data['full_name'],
            phone=data['phone'],
            delivery_address=data.get('delivery_address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code')
        )
        db.session.add(buyer_profile)
        db.session.flush()

        # Create cart for buyer
        cart = Cart(buyer_id=buyer_profile.id)
        db.session.add(cart)

        # Log activity
        ActivityLog.log_activity(
            user_id=user.id,
            action='buyer_signup',
            description=f'Buyer {data["full_name"]} registered',
            entity_type='user',
            entity_id=user.id,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )

        db.session.commit()

        # Generate tokens (identity must be a string)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            'message': 'Buyer account created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating account', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Universal login endpoint for all roles"""
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400

    # Find user
    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is deactivated. Contact admin.'}), 403

    # Generate tokens (identity must be a string)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    print(f"[AUTH DEBUG] Login successful for user_id={user.id}, role={user.role}")
    print(f"[AUTH DEBUG] Access token created: {access_token[:50]}...")
    print(f"[AUTH DEBUG] Refresh token created: {refresh_token[:50]}...")

    # Log activity
    ActivityLog.log_activity(
        user_id=user.id,
        action='login',
        description=f'{user.role.capitalize()} logged in',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    user_id = get_jwt_identity()  # Already a string, keep it as-is for token creation
    access_token = create_access_token(identity=user_id)

    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    user_id = int(get_jwt_identity())  # Convert string to int
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint (client should discard tokens)"""
    user_id = int(get_jwt_identity())  # Convert string to int

    # Log activity
    ActivityLog.log_activity(
        user_id=user_id,
        action='logout',
        description='User logged out',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()

    return jsonify({'message': 'Logged out successfully'}), 200
