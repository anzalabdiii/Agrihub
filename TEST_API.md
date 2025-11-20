# API Testing Guide

Quick reference for testing API endpoints with curl or Postman.

## Authentication Endpoints

### 1. Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agrilink.com",
    "password": "admin123"
  }'
```

**Response**: Returns `access_token`, `refresh_token`, and user data.

### 2. Buyer Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "buyer123",
    "full_name": "Jane Buyer",
    "phone": "555-5678",
    "delivery_address": "123 Main St"
  }'
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

---

## Admin Endpoints

**Note**: All admin endpoints require admin access token in header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Dashboard Stats
```bash
curl http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Farmer
```bash
curl -X POST http://localhost:5000/api/admin/farmers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "farmer@test.com",
    "password": "farmer123",
    "full_name": "John Farmer",
    "phone": "555-1234",
    "farm_name": "Green Valley Farm",
    "farm_location": "Rural County"
  }'
```

### Get All Farmers
```bash
curl http://localhost:5000/api/admin/farmers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Pending Products
```bash
curl http://localhost:5000/api/admin/products/pending \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Approve Product
```bash
curl -X PATCH http://localhost:5000/api/admin/products/1/approve \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Pending Orders
```bash
curl http://localhost:5000/api/admin/orders/pending \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Approve Order (with stock deduction)
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/1/approve \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Category
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Vegetables",
    "description": "Fresh vegetables"
  }'
```

---

## Farmer Endpoints

### Add Product
```bash
curl -X POST http://localhost:5000/api/farmer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FARMER_ACCESS_TOKEN" \
  -d '{
    "name": "Fresh Tomatoes",
    "description": "Organic vine-ripened tomatoes",
    "price": 3.99,
    "quantity": 100,
    "unit": "kg",
    "category_id": 1
  }'
```

### Get My Products
```bash
curl http://localhost:5000/api/farmer/products \
  -H "Authorization: Bearer YOUR_FARMER_ACCESS_TOKEN"
```

### Update Product
```bash
curl -X PUT http://localhost:5000/api/farmer/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FARMER_ACCESS_TOKEN" \
  -d '{
    "name": "Fresh Organic Tomatoes",
    "price": 4.99,
    "quantity": 150
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:5000/api/farmer/products/1 \
  -H "Authorization: Bearer YOUR_FARMER_ACCESS_TOKEN"
```

### Get My Orders
```bash
curl http://localhost:5000/api/farmer/orders \
  -H "Authorization: Bearer YOUR_FARMER_ACCESS_TOKEN"
```

---

## Buyer Endpoints

### Browse All Products (approved only)
```bash
curl http://localhost:5000/api/products
```

### Get Product Categories
```bash
curl http://localhost:5000/api/products/categories
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 5
  }'
```

### View Cart
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN"
```

### Update Cart Item
```bash
curl -X PUT http://localhost:5000/api/cart/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN" \
  -d '{
    "quantity": 10
  }'
```

### Remove from Cart
```bash
curl -X DELETE http://localhost:5000/api/cart/items/1 \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN"
```

### Place Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN"
```

### Get My Orders
```bash
curl http://localhost:5000/api/buyer/orders \
  -H "Authorization: Bearer YOUR_BUYER_ACCESS_TOKEN"
```

---

## Testing Workflow with curl

### Complete Flow:

1. **Login as Admin**
```bash
# Save the access_token from response
ADMIN_TOKEN="paste_token_here"
```

2. **Create Categories**
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Vegetables", "description": "Fresh vegetables"}'
```

3. **Create Farmer**
```bash
curl -X POST http://localhost:5000/api/admin/farmers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "farmer@test.com",
    "password": "farmer123",
    "full_name": "John Farmer",
    "phone": "555-1234",
    "farm_name": "Green Valley Farm"
  }'
```

4. **Login as Farmer**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "farmer@test.com", "password": "farmer123"}'

# Save the farmer token
FARMER_TOKEN="paste_farmer_token_here"
```

5. **Add Product as Farmer**
```bash
curl -X POST http://localhost:5000/api/farmer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "name": "Fresh Tomatoes",
    "description": "Organic",
    "price": 3.99,
    "quantity": 100,
    "unit": "kg",
    "category_id": 1
  }'
```

6. **Approve Product as Admin**
```bash
curl -X PATCH http://localhost:5000/api/admin/products/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

7. **Signup as Buyer**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "buyer123",
    "full_name": "Jane Buyer",
    "phone": "555-5678"
  }'

# Save the buyer token
BUYER_TOKEN="paste_buyer_token_here"
```

8. **Add to Cart as Buyer**
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"product_id": 1, "quantity": 10}'
```

9. **Place Order as Buyer**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

10. **Approve Order as Admin (Stock Deduction)**
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

11. **Verify Stock Deducted**
```bash
curl http://localhost:5000/api/products
# Check that tomato quantity is now 90 (was 100, deducted 10)
```

---

## Using Postman

1. Import these endpoints into Postman
2. Create environment variables:
   - `BASE_URL`: `http://localhost:5000`
   - `ADMIN_TOKEN`: (set after login)
   - `FARMER_TOKEN`: (set after login)
   - `BUYER_TOKEN`: (set after login)

3. Use `{{BASE_URL}}/api/auth/login` format
4. Set Authorization header: `Bearer {{ADMIN_TOKEN}}`

---

## Response Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

---

Happy testing! 🚀
