from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def role_required(*allowed_roles):
    """
    Decorator to restrict access to specific roles
    Usage: @role_required('admin', 'farmer')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())  # Convert string to int
            user = User.query.get(user_id)

            if not user:
                return jsonify({'message': 'User not found'}), 404

            if not user.is_active:
                return jsonify({'message': 'Account is deactivated'}), 403

            if user.role not in allowed_roles:
                return jsonify({'message': 'Access denied. Insufficient permissions.'}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """Decorator to restrict access to admin only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', 'No auth header')
        print(f"[DECORATOR DEBUG] Admin endpoint called: {request.path}")
        print(f"[DECORATOR DEBUG] Authorization header: {auth_header[:80] if auth_header != 'No auth header' else auth_header}...")

        verify_jwt_in_request()
        user_id = int(get_jwt_identity())  # Convert string to int
        print(f"[DECORATOR DEBUG] JWT verified, user_id={user_id}")

        user = User.query.get(user_id)

        if not user or user.role != 'admin':
            print(f"[DECORATOR DEBUG] Access denied - user={user}, role={user.role if user else 'N/A'}")
            return jsonify({'message': 'Admin access required'}), 403

        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 403

        print(f"[DECORATOR DEBUG] Admin access granted for user_id={user_id}")
        return fn(*args, **kwargs)
    return wrapper

def farmer_required(fn):
    """Decorator to restrict access to farmer only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())  # Convert string to int
        user = User.query.get(user_id)

        if not user or user.role != 'farmer':
            return jsonify({'message': 'Farmer access required'}), 403

        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 403

        return fn(*args, **kwargs)
    return wrapper

def buyer_required(fn):
    """Decorator to restrict access to buyer only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())  # Convert string to int
        user = User.query.get(user_id)

        if not user or user.role != 'buyer':
            return jsonify({'message': 'Buyer access required'}), 403

        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 403

        return fn(*args, **kwargs)
    return wrapper
