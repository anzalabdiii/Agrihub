# AgriLink Hub - System Architecture

## Overview
AgriLink Hub is a three-tier web application with role-based access control connecting farmers, buyers, and administrators in a digital marketplace.

## System Roles

### 1. Admin
**Capabilities:**
- Create farmer accounts (farmers cannot self-register)
- Manage all users (view, activate/deactivate)
- Approve or reject farmer product posts
- Approve or decline buyer orders
- Automatically deduct stock when approving orders
- Manage product categories
- View system analytics and activity logs

**Workflow:**
- Admin has full system oversight
- Must approve products before they become public
- Order approval triggers automatic stock deduction
- Can deactivate problematic accounts

### 2. Farmer
**Capabilities:**
- Manage profile (farm details, contact info)
- Post products with images (requires admin approval)
- Edit and delete products
- View approved orders (only after admin approval)
- Track sales analytics and product views

**Constraints:**
- Cannot self-register (admin creates account)
- Products not public until admin approves
- Cannot see pending orders (admin must approve first)

**Workflow:**
1. Admin creates farmer account
2. Farmer logs in and posts products
3. Products remain pending until admin approval
4. After approval, products visible to buyers
5. Farmer sees orders only after admin approves them
6. Stock auto-deducts when admin approves orders

### 3. Buyer
**Capabilities:**
- Self-registration
- Browse approved products
- Advanced search and filtering
- Add/remove items from cart
- Place orders
- View order history and status

**Workflow:**
1. Buyer signs up (self-registration)
2. Browse approved products
3. Add products to cart
4. Confirm order (goes to admin for approval)
5. Wait for admin approval
6. View order status after approval

## Data Flow Diagrams

### Product Posting Flow
```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  Admin  │────────▶│ Farmer  │────────▶│  Admin  │────────▶│ Buyers  │
└─────────┘         └─────────┘         └─────────┘         └─────────┘
  Creates            Posts               Approves            Can view &
  Account            Product             Product             purchase

Status:              Status:             Status:
is_active=True       is_approved=False   is_approved=True
```

### Order Processing Flow
```
┌─────────┐         ┌─────────┐         ┌──────────────────────┐
│  Buyer  │────────▶│  Admin  │────────▶│  System Actions      │
└─────────┘         └─────────┘         └──────────────────────┘
  Confirms            Approves             1. Deduct stock
  Cart                Order                2. Update order status
                                          3. Notify farmer
                                          4. Log activity

Order Status Flow:
pending → approved/rejected
         ↓
    [Stock Deduction]
         ↓
    Farmer can view
```

### Stock Deduction Algorithm
```python
def approve_order(order_id):
    order = get_order(order_id)

    # Validation phase
    for item in order.items:
        product = get_product(item.product_id)
        if product.quantity < item.quantity:
            raise InsufficientStockError

    # Deduction phase (atomic transaction)
    for item in order.items:
        product = get_product(item.product_id)
        product.quantity -= item.quantity

        if product.quantity <= 0:
            product.is_out_of_stock = True

        log_activity(
            action='stock_deduction',
            description=f'Deducted {item.quantity} from {product.name}'
        )

    order.status = 'approved'
    commit_transaction()
```

## Database Schema

### Entity Relationship Diagram
```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ email        │
│ password_hash│
│ role         │◀────┐
│ is_active    │     │
└──────────────┘     │
       │             │
       ├─────────────┼──────────────┐
       │             │              │
       ▼             ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│FarmerProfile│ │BuyerProfile│ │ActivityLog │
├────────────┤ ├────────────┤ ├────────────┤
│ user_id(FK)│ │ user_id(FK)│ │ user_id(FK)│
│ farm_name  │ │ full_name  │ │ action     │
│ location   │ │ address    │ │ description│
└────────────┘ └────────────┘ └────────────┘
       │             │
       │             ▼
       │      ┌──────────┐
       │      │   Cart   │
       │      ├──────────┤
       │      │buyer_id  │
       │      └──────────┘
       │             │
       ▼             ▼
┌──────────────┐ ┌──────────┐
│FarmerProduct │ │ CartItem │
├──────────────┤ ├──────────┤
│farmer_id (FK)│ │cart_id   │
│category_id   │ │product_id│
│name, price   │ │quantity  │
│quantity      │ └──────────┘
│is_approved   │
│is_out_of_stock│
└──────────────┘
       │
       ▼
┌──────────────┐
│ProductImage  │
├──────────────┤
│product_id(FK)│
│image_url     │
│is_primary    │
└──────────────┘

Order Structure:
┌──────────┐       ┌───────────┐
│  Order   │──────▶│ OrderItem │
├──────────┤       ├───────────┤
│buyer_id  │       │order_id   │
│status    │       │product_id │
│total_amt │       │farmer_id  │
└──────────┘       │quantity   │
                   │subtotal   │
                   └───────────┘
```

## API Architecture

### RESTful Design Principles
- Resource-based URLs
- HTTP methods (GET, POST, PATCH, DELETE)
- JSON request/response format
- JWT authentication
- Stateless communication

### Authentication Flow
```
1. Login Request
   POST /api/auth/login
   { email, password }
   ↓
2. Server validates
   ↓
3. Generate tokens
   - Access token (1 hour)
   - Refresh token (30 days)
   ↓
4. Return tokens + user data
   ↓
5. Client stores tokens
   - localStorage: access_token, refresh_token
   ↓
6. Subsequent requests
   Headers: { Authorization: Bearer <access_token> }
   ↓
7. Token refresh (when access expires)
   POST /api/auth/refresh
   Headers: { Authorization: Bearer <refresh_token> }
```

### Authorization Middleware
```python
@role_required('admin')
def admin_endpoint():
    # Only accessible by admin
    pass

@role_required('farmer', 'admin')
def shared_endpoint():
    # Accessible by farmer or admin
    pass

Flow:
Request → JWT Validation → Role Check → Endpoint Handler
```

## Frontend Architecture

### State Management (Zustand)
```javascript
Stores:
├── authStore (user, login, logout)
├── productStore (products, filters, pagination)
├── cartStore (cart items, add/remove)
└── notificationStore (alerts, messages)

Benefits:
- Simple, no boilerplate
- React hooks integration
- Automatic re-renders
- Devtools support
```

### Component Hierarchy
```
App
├── PublicRoute (redirects if authenticated)
│   ├── Login
│   └── Signup
├── ProtectedRoute (requires authentication)
│   ├── AdminLayout
│   │   ├── Dashboard (stats, charts)
│   │   ├── CreateFarmer
│   │   ├── ManageFarmers
│   │   ├── PendingProducts (approve/reject)
│   │   ├── PendingOrders (approve/decline)
│   │   └── ActivityLogs
│   ├── FarmerLayout
│   │   ├── Dashboard (analytics)
│   │   ├── MyProducts (CRUD)
│   │   ├── CreateProduct
│   │   └── Orders (approved only)
│   └── BuyerLayout
│       ├── Dashboard
│       ├── ProductListing (search, filter)
│       ├── ProductDetail
│       ├── Cart
│       └── Orders (history, status)
```

### Routing Strategy
```javascript
Role-based routing:
- Login/Signup: Public routes
- After login, redirect based on role:
  - admin → /admin/dashboard
  - farmer → /farmer/dashboard
  - buyer → /buyer/dashboard

Protection:
- All dashboard routes require authentication
- Role verification on every protected route
- Unauthorized access → 403 page
```

## Security Measures

### Backend Security
1. **Password Security**
   - Werkzeug password hashing
   - No plain text storage
   - Strong password requirements

2. **JWT Security**
   - Short-lived access tokens (1 hour)
   - Long-lived refresh tokens (30 days)
   - Secure token storage
   - Token blacklisting on logout

3. **Input Validation**
   - SQLAlchemy ORM (prevents SQL injection)
   - File upload validation
   - Size limits on uploads
   - Allowed file extensions

4. **Access Control**
   - Role-based decorators
   - Endpoint-level protection
   - User ownership verification

5. **Activity Logging**
   - All critical actions logged
   - IP address tracking
   - User agent logging
   - Audit trail

### Frontend Security
1. **Token Management**
   - Tokens in localStorage
   - Auto-refresh mechanism
   - Logout on token expiry

2. **Route Protection**
   - Authentication check
   - Role verification
   - Redirect on unauthorized

3. **API Security**
   - HTTPS in production
   - CORS configuration
   - Request validation

## Scalability Considerations

### Backend Scaling
1. **Database**
   - PostgreSQL indexing on foreign keys
   - Query optimization
   - Connection pooling
   - Read replicas for heavy queries

2. **Application**
   - Stateless design (supports horizontal scaling)
   - Flask app factory pattern
   - Modular blueprints

3. **File Storage**
   - Currently: local filesystem
   - Production: AWS S3 or similar
   - CDN for image delivery

### Frontend Scaling
1. **Performance**
   - Code splitting (Vite)
   - Lazy loading routes
   - Image optimization
   - Pagination for large lists

2. **Caching**
   - Browser caching
   - Service workers (future)
   - API response caching

## Deployment Architecture

### Development Environment
```
localhost:5173 (Frontend - Vite dev server)
     ↓
localhost:5000 (Backend - Flask)
     ↓
localhost:5432 (PostgreSQL)
```

### Production Environment (Recommended)
```
CloudFlare/CDN
     ↓
Nginx (Reverse proxy + Static files)
     ↓
     ├── Frontend (Static React build)
     └── Backend (Gunicorn + Flask)
           ↓
     PostgreSQL (Managed service)
           ↓
     AWS S3 (File storage)
```

## Performance Optimizations

### Database
- Indexes on frequently queried fields
- Eager loading for relationships
- Pagination for large datasets
- Database query caching

### API
- Response compression
- Rate limiting (future)
- API response pagination
- Efficient serialization

### Frontend
- Component memoization
- Virtual scrolling for long lists
- Debounced search inputs
- Optimistic UI updates

## Monitoring & Logging

### Activity Logs
- User actions
- Stock changes
- Order approvals
- Product approvals
- Login/logout events

### Future Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- User analytics (Google Analytics)
- Server metrics (Prometheus)

## Extension Points

### Potential Features
1. **Notifications**
   - SSE or WebSockets
   - Email notifications
   - SMS alerts

2. **Payments**
   - Stripe integration
   - Payment tracking
   - Refund handling

3. **Reviews**
   - Product ratings
   - Buyer feedback
   - Farmer responses

4. **Advanced Search**
   - Elasticsearch integration
   - Autocomplete
   - Faceted search

5. **Mobile App**
   - React Native
   - Share API backend
   - Push notifications
