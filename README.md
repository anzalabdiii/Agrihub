# AgriLink Hub - Digital Marketplace for Farmers & Buyers

A comprehensive digital marketplace connecting farmers and buyers, with full admin oversight and approval workflows.

## System Architecture

### Technology Stack

**Backend:**
- Python Flask (REST API)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- JWT Authentication
- Flask-Migrate (Database migrations)

**Frontend:**
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Zustand (State management)
- React Router (Navigation)
- Axios (HTTP client)

## Features

### Admin Dashboard
- Create farmer accounts manually
- View and manage all farmers and buyers
- Approve/reject farmer product posts
- Approve/decline buyer orders
- **Automatic stock deduction** when orders are approved
- Deactivate/activate users
- Manage product categories
- View activity logs
- Analytics dashboard with key metrics

### Farmer Dashboard
- View profile and products
- Post livestock or farm products with images
- Edit and delete products
- Set price, quantity, location, and description
- View approved orders (only visible after admin approval)
- Product analytics (views, sales, revenue)
- **Stock automatically updates** when admin approves orders

### Buyer Dashboard
- Self-registration
- Browse approved products
- Advanced search and filters (category, location, price, type)
- Add items to cart
- Manage cart (update quantity, remove items)
- Confirm orders
- View order history and status
- Order tracking timeline

## System Workflows

### 1. Farmer Product Flow
```
Admin → Creates Farmer Account → Farmer Posts Product → Admin Approves Post → Product Becomes Public
```

### 2. Buyer Order Flow
```
Buyer Adds to Cart → Buyer Confirms Cart → Admin Approves Order →
  ✅ Stock Quantity Deducted
  ✅ Farmer Sees Order
  ✅ Buyer Sees Order Status
```

### 3. Stock Deduction Logic
When admin approves an order:
1. Loop through each order item
2. Verify product quantity >= ordered quantity
3. Deduct ordered quantity from product stock
4. Update product in database
5. If stock reaches 0, mark product as "Out of Stock"
6. Log activity in ActivityLog table

## Project Structure

```
Agrilink_Hub/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── farmer_profile.py
│   │   │   ├── buyer_profile.py
│   │   │   ├── category.py
│   │   │   ├── farmer_product.py
│   │   │   ├── product_image.py
│   │   │   ├── cart.py
│   │   │   ├── cart_item.py
│   │   │   ├── order.py
│   │   │   ├── order_item.py
│   │   │   └── activity_log.py
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.py          # Login, signup, logout
│   │   │   ├── admin.py         # Admin operations
│   │   │   ├── farmer.py        # Farmer operations
│   │   │   ├── buyer.py         # Buyer operations
│   │   │   ├── products.py      # Public product listing
│   │   │   ├── cart.py          # Cart operations
│   │   │   ├── orders.py        # Order confirmation
│   │   │   └── upload.py        # Image upload
│   │   └── utils/
│   │       ├── decorators.py    # Role-based access control
│   │       └── helpers.py       # Utility functions
│   ├── config.py                # Configuration
│   ├── run.py                   # Application entry point
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Signup
│   │   │   ├── admin/          # Admin dashboard & pages
│   │   │   ├── farmer/         # Farmer dashboard & pages
│   │   │   └── buyer/          # Buyer dashboard & pages
│   │   ├── components/         # Reusable components
│   │   ├── store/              # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── productStore.js
│   │   │   ├── cartStore.js
│   │   │   └── notificationStore.js
│   │   ├── services/
│   │   │   └── api.js          # API service layer
│   │   ├── App.jsx             # Main app with routing
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## Database Models

### Core Models:
1. **User** - All users (admin, farmer, buyer)
2. **FarmerProfile** - Farmer-specific data
3. **BuyerProfile** - Buyer-specific data
4. **Category** - Product categories
5. **FarmerProduct** - Products posted by farmers
6. **ProductImage** - Product images
7. **Cart** - Buyer shopping cart
8. **CartItem** - Items in cart
9. **Order** - Buyer orders
10. **OrderItem** - Items in orders
11. **ActivityLog** - System activity tracking

## Setup Instructions

### Backend Setup

1. **Create and activate virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure PostgreSQL:**
Create a PostgreSQL database named `agrilink_db`

4. **Set environment variables:**
```bash
export FLASK_ENV=development
export DATABASE_URL=postgresql://agrilink_user:password@localhost/agrilink_db
export SECRET_KEY=your-secret-key
export JWT_SECRET_KEY=your-jwt-secret-key
```

5. **Initialize database:**
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. **Seed initial data:**
```bash
# Create admin user
flask seed_admin

# Create categories
flask seed_categories
```

7. **Run backend server:**
```bash
python run.py
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Create .env file:**
```
VITE_API_URL=http://localhost:5000/api
```

3. **Run development server:**
```bash
npm run dev
# Server runs on http://localhost:5173
```

## Default Admin Credentials

After running `flask seed_admin`:
- **Email:** admin@agrilink.com
- **Password:** admin123

**⚠️ Change these credentials in production!**

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Buyer self-registration
- `POST /api/auth/login` - Universal login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Admin
- `POST /api/admin/farmers/create` - Create farmer account
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/buyers` - Get all buyers
- `PATCH /api/admin/users/:id/toggle-status` - Activate/deactivate user
- `GET /api/admin/products/pending` - Get pending products
- `PATCH /api/admin/products/:id/approve` - Approve product
- `DELETE /api/admin/products/:id/reject` - Reject product
- `GET /api/admin/orders/pending` - Get pending orders
- `PATCH /api/admin/orders/:id/approve` - Approve order (deducts stock)
- `PATCH /api/admin/orders/:id/reject` - Reject order
- `GET/POST/PATCH /api/admin/categories` - Manage categories
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/activity-logs` - Activity logs

### Farmer
- `GET/PATCH /api/farmer/profile` - Farmer profile
- `GET /api/farmer/products` - Get farmer's products
- `POST /api/farmer/products` - Create product
- `GET/PATCH/DELETE /api/farmer/products/:id` - Manage product
- `GET /api/farmer/orders` - Get approved orders
- `GET /api/farmer/analytics` - Farmer analytics

### Buyer
- `GET/PATCH /api/buyer/profile` - Buyer profile
- `GET /api/buyer/orders` - Order history
- `GET /api/buyer/orders/:id` - Order details

### Products (Public)
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Product details
- `GET /api/products/categories` - Categories
- `GET /api/products/featured` - Featured products
- `GET /api/products/latest` - Latest products
- `GET /api/products/search-filters` - Available filters

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PATCH /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders/confirm` - Confirm order from cart

### Upload
- `POST /api/upload/image` - Upload product image
- `GET /api/upload/images/:filename` - Get image
- `DELETE /api/upload/images/:filename` - Delete image

## Key Features Implementation

### Role-Based Access Control
Using decorators:
- `@admin_required`
- `@farmer_required`
- `@buyer_required`
- `@role_required('admin', 'farmer')`

### Stock Deduction on Order Approval
Located in: `backend/app/routes/admin.py:approve_order()`

The logic:
1. Validates all products have sufficient stock
2. Deducts quantity from each product
3. Updates `is_out_of_stock` flag if needed
4. Logs all stock deductions
5. Commits transaction atomically

### Activity Logging
All important actions are logged with:
- User ID
- Action type
- Description
- Entity type and ID
- IP address
- Timestamp

### Image Upload
- Supports: PNG, JPG, JPEG, GIF, WEBP
- Max file size: 16MB
- Unique filename generation
- Secure file handling

## Security Features

- Password hashing with Werkzeug
- JWT access and refresh tokens
- Role-based access control
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- File upload validation
- Activity logging

## Additional Features to Implement

1. **Real-time Notifications**
   - Server-Sent Events (SSE) or WebSockets
   - Notify farmers when orders are approved
   - Notify buyers on order status changes

2. **Email Notifications**
   - Order confirmations
   - Account creation notifications
   - Stock alerts

3. **Advanced Analytics**
   - Sales trends
   - Popular products
   - Revenue charts

4. **Payment Integration**
   - Stripe/PayPal integration
   - Payment status tracking

5. **Product Reviews**
   - Buyer reviews and ratings
   - Farmer response to reviews

## License

MIT License

## Support

For issues and questions, contact the development team.
