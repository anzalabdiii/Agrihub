from flask import Flask, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS to prevent preflight redirect issues
    CORS(app,
         resources={r"/api/*": {
             "origins": app.config['CORS_ORIGINS'],
             "methods": ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
             "allow_headers": ['Content-Type', 'Authorization'],
             "expose_headers": ['Content-Type', 'Authorization'],
             "supports_credentials": True,
             "max_age": 3600
         }})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.farmer import farmer_bp
    from app.routes.buyer import buyer_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.upload import upload_bp
    from app.routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(farmer_bp, url_prefix='/api/farmer')
    app.register_blueprint(buyer_bp, url_prefix='/api/buyer')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')

    # Serve uploaded files (images)
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        """Serve uploaded files"""
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Handle CORS preflight requests explicitly
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            response = app.make_response('')
            response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Max-Age'] = '3600'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response, 200

    # JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        print(f"[JWT DEBUG] Unauthorized callback triggered: {callback}")
        return {'message': 'Missing or invalid token'}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"[JWT DEBUG] Expired token - Header: {jwt_header}, Payload: {jwt_payload}")
        return {'message': 'Token has expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"[JWT DEBUG] Invalid token - Error: {error}")
        return {'message': 'Invalid token'}, 401

    return app
