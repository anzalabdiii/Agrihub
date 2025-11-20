from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.farmer_product import FarmerProduct
from app.models.category import Category
from app.models.activity_log import ActivityLog
from app.utils.helpers import get_client_ip

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_public_products():
    """
    Get all approved and active products (public endpoint)
    Supports filtering and search
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    product_type = request.args.get('product_type')
    city = request.args.get('city')
    state = request.args.get('state')
    search = request.args.get('search', '')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort_by = request.args.get('sort_by', 'created_at')  # 'created_at', 'price_asc', 'price_desc', 'views'

    # Base query: only approved and active products
    query = FarmerProduct.query.filter_by(
        is_approved=True,
        is_active=True
    )

    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)

    if product_type:
        query = query.filter_by(product_type=product_type)

    if city:
        query = query.filter(FarmerProduct.city.ilike(f'%{city}%'))

    if state:
        query = query.filter(FarmerProduct.state.ilike(f'%{state}%'))

    if search:
        query = query.filter(
            db.or_(
                FarmerProduct.name.ilike(f'%{search}%'),
                FarmerProduct.description.ilike(f'%{search}%')
            )
        )

    if min_price is not None:
        query = query.filter(FarmerProduct.price >= min_price)

    if max_price is not None:
        query = query.filter(FarmerProduct.price <= max_price)

    # Apply sorting
    if sort_by == 'price_asc':
        query = query.order_by(FarmerProduct.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(FarmerProduct.price.desc())
    elif sort_by == 'views':
        query = query.order_by(FarmerProduct.view_count.desc())
    else:  # default to created_at
        query = query.order_by(FarmerProduct.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': [product.to_dict(include_farmer=True) for product in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID and increment view count"""
    product = FarmerProduct.query.filter_by(
        id=product_id,
        is_approved=True,
        is_active=True
    ).first_or_404()

    # Increment view count
    product.view_count += 1
    db.session.commit()

    return jsonify({'product': product.to_dict(include_farmer=True)}), 200


@products_bp.route('/categories', methods=['GET'])
def get_active_categories():
    """Get all active categories (public endpoint)"""
    categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()

    return jsonify({
        'categories': [cat.to_dict() for cat in categories]
    }), 200


@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Get featured products (most viewed)"""
    limit = request.args.get('limit', 10, type=int)

    products = FarmerProduct.query.filter_by(
        is_approved=True,
        is_active=True,
        is_out_of_stock=False
    ).order_by(FarmerProduct.view_count.desc()).limit(limit).all()

    return jsonify({
        'products': [product.to_dict(include_farmer=True) for product in products]
    }), 200


@products_bp.route('/latest', methods=['GET'])
def get_latest_products():
    """Get latest products"""
    limit = request.args.get('limit', 10, type=int)

    products = FarmerProduct.query.filter_by(
        is_approved=True,
        is_active=True,
        is_out_of_stock=False
    ).order_by(FarmerProduct.created_at.desc()).limit(limit).all()

    return jsonify({
        'products': [product.to_dict(include_farmer=True) for product in products]
    }), 200


@products_bp.route('/search-filters', methods=['GET'])
def get_search_filters():
    """Get available filter options for search"""
    # Get distinct product types
    product_types = db.session.query(FarmerProduct.product_type).filter_by(
        is_approved=True,
        is_active=True
    ).distinct().all()

    # Get distinct cities
    cities = db.session.query(FarmerProduct.city).filter(
        FarmerProduct.is_approved == True,
        FarmerProduct.is_active == True,
        FarmerProduct.city.isnot(None)
    ).distinct().all()

    # Get distinct states
    states = db.session.query(FarmerProduct.state).filter(
        FarmerProduct.is_approved == True,
        FarmerProduct.is_active == True,
        FarmerProduct.state.isnot(None)
    ).distinct().all()

    # Get price range
    price_stats = db.session.query(
        db.func.min(FarmerProduct.price),
        db.func.max(FarmerProduct.price)
    ).filter_by(is_approved=True, is_active=True).first()

    return jsonify({
        'product_types': [pt[0] for pt in product_types if pt[0]],
        'cities': [c[0] for c in cities if c[0]],
        'states': [s[0] for s in states if s[0]],
        'price_range': {
            'min': float(price_stats[0]) if price_stats[0] else 0,
            'max': float(price_stats[1]) if price_stats[1] else 0
        }
    }), 200
