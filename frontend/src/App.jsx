import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import CreateFarmer from './pages/admin/CreateFarmer';
import ManageFarmers from './pages/admin/ManageFarmers';
import ManageBuyers from './pages/admin/ManageBuyers';
import PendingProducts from './pages/admin/PendingProducts';
import PendingOrders from './pages/admin/PendingOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ActivityLogs from './pages/admin/ActivityLogs';

// Farmer pages
import FarmerDashboard from './pages/farmer/Dashboard';
import MyProducts from './pages/farmer/MyProducts';
import CreateProduct from './pages/farmer/CreateProduct';
import EditProduct from './pages/farmer/EditProduct';
import FarmerOrders from './pages/farmer/Orders';

// Buyer pages
import BuyerDashboard from './pages/buyer/Dashboard';
import ProductListing from './pages/buyer/ProductListing';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import BuyerOrders from './pages/buyer/Orders';
import OrderDetail from './pages/buyer/OrderDetail';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user?.role === 'buyer') return <Navigate to="/buyer/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateFarmer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageFarmers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/buyers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageBuyers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/pending"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PendingProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/pending"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PendingOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ActivityLogs />
          </ProtectedRoute>
        }
      />

      {/* Farmer Routes */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <MyProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products/create"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CreateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <EditProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerOrders />
          </ProtectedRoute>
        }
      />

      {/* Buyer Routes */}
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/products"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <ProductListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/products/:id"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <ProductDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/cart"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl font-bold">Unauthorized Access</h1></div>} />
      <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

export default App;
