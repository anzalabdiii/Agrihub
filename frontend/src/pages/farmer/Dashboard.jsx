import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  DollarSign,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import Messages from '../../components/Messages';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_BASE_URL.replace('/api', '');

    let fullUrl;
    if (imageUrl.startsWith('/api/')) {
      fullUrl = `${baseUrl}${imageUrl}`;
    } else if (imageUrl.startsWith('/uploads/')) {
      fullUrl = `${baseUrl}${imageUrl}`;
    } else if (imageUrl.startsWith('/')) {
      fullUrl = `${baseUrl}${imageUrl}`;
    } else {
      fullUrl = `${baseUrl}/uploads/${imageUrl}`;
    }

    console.log('Image URL:', imageUrl, '→ Full URL:', fullUrl);
    return fullUrl;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  useEffect(() => {
    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-green-600">AgriLink Hub</h2>
            <p className="text-sm text-gray-500">Farmer Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab getImageUrl={getImageUrl} />}
          {activeTab === 'add-product' && <AddProductTab setActiveTab={setActiveTab} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/farmer/products'),
        api.get('/farmer/orders')
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];

      const approved = products.filter(p => p.is_approved);
      const pending = products.filter(p => !p.is_approved);
      const totalViews = products.reduce((sum, p) => sum + (p.view_count || 0), 0);
      const revenue = orders
        .filter(o => o.status === 'approved' || o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      setStats({
        totalProducts: products.length,
        approvedProducts: approved.length,
        pendingProducts: pending.length,
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalViews: totalViews
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load stats');
      setStats({
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue' },
    { label: 'Approved Products', value: stats.approvedProducts, icon: CheckCircle, color: 'green' },
    { label: 'Pending Approval', value: stats.pendingProducts, icon: Clock, color: 'yellow' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'purple' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'green' },
    { label: 'Product Views', value: stats.totalViews, icon: Eye, color: 'indigo' }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <span className="text-gray-700">Add high-quality images to attract more buyers</span>
          </li>
          <li className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <span className="text-gray-700">Keep your product stock updated to avoid overselling</span>
          </li>
          <li className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <span className="text-gray-700">Products need admin approval before appearing to buyers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Products Tab Component
function ProductsTab({ getImageUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/farmer/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/farmer/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdate = async (productId, updates) => {
    try {
      await api.put(`/farmer/products/${productId}`, updates);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No products yet. Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-48 bg-gray-200">
            {product.images && product.images.length > 0 ? (
              <img src={getImageUrl(product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              {product.is_approved ? (
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Approved</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Pending</span>
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">${parseFloat(product.price).toFixed(2)}/{product.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stock:</span>
                <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.quantity} {product.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Views:</span>
                <span>{product.view_count || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

// Edit Product Modal Component
function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Edit Product</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows="6"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="units">Units</option>
              <option value="dozens">Dozens</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-lg border-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Product Tab Component
function AddProductTab({ setActiveTab }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category_id: '',
    product_type: 'produce'
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload image if exists
      let imageUrl = null;
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        const uploadRes = await api.post('/upload/image', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      // Then create product
      await api.post('/farmer/products', {
        ...formData,
        images: imageUrl ? [imageUrl] : []
      });

      toast.success('Product added successfully! Awaiting admin approval.');
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'kg',
        category_id: '',
        product_type: 'produce'
      });
      setImageFile(null);
      setActiveTab('products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 lg:relative lg:z-auto">
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl p-8 md:p-12 lg:p-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-3">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="6"
                placeholder="Describe your product in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold mb-3">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-3">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold mb-3">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="units">Units</option>
                  <option value="dozens">Dozens</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold mb-3">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-6 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {imageFile && (
                <p className="text-lg text-green-700 font-medium">✓ Selected: {imageFile.name}</p>
              )}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <p className="text-lg text-blue-800">
                <strong>Note:</strong> Your product will be submitted for admin approval before it appears to buyers.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-5 text-xl font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Orders Tab Component
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/farmer/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No orders yet.</p>
      </div>
    );
  }

  const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'completed');

  return (
    <div className="space-y-4">
      {approvedOrders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
              <p className="text-sm text-gray-600">
                Placed: {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'approved' ? 'bg-green-100 text-green-800' :
              order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="border-t pt-4">
            <p className="text-lg font-semibold mb-3">Order Items:</p>
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm mb-2">
                <span>{item.product_name} - {item.quantity} {item.unit}</span>
                <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              ${parseFloat(order.total_price).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Profile Tab Component
function ProfileTab() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/farmer/profile');
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-6">Farmer Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <p className="text-lg">{user?.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>

          {profile && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600">Farm Name</label>
                <p className="text-lg">{profile.farm_name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Location</label>
                <p className="text-lg">{profile.location || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="text-lg">{profile.phone || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Bio</label>
                <p className="text-lg">{profile.bio || 'No bio added yet'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
