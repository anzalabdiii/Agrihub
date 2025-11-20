import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerAPI, productsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Package, ShoppingCart, User, LogOut, Menu, X,
  Plus, Edit, Trash2, TrendingUp, Eye, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerCompleteDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h2 className="text-xl font-bold text-primary-600">Farmer Portal</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500">Farmer</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await farmerAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={analytics?.products?.total || 0}
          subtitle={`${analytics?.products?.approved || 0} approved`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={analytics?.products?.pending || 0}
          subtitle="Awaiting admin review"
          icon={Package}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`$${analytics?.orders?.total_revenue?.toFixed(2) || '0.00'}`}
          subtitle={`${analytics?.orders?.total_items_sold || 0} items sold`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Product Views"
          value={analytics?.engagement?.total_views || 0}
          subtitle="Total product views"
          icon={Eye}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{analytics?.products?.out_of_stock || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-primary-600">{analytics?.orders?.total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Items Sold</p>
            <p className="text-2xl font-bold text-primary-600">{analytics?.orders?.total_items_sold || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// ============ PRODUCTS TAB ============
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    quantity: '',
    unit: 'kg',
    product_type: 'produce',
    description: '',
    location: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await farmerAPI.getMyProducts();
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await farmerAPI.updateProduct(editingProduct.id, formData);
        toast.success('Product updated!');
      } else {
        await farmerAPI.createProduct(formData);
        toast.success('Product created! Awaiting admin approval.');
      }
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      quantity: product.quantity,
      unit: product.unit,
      product_type: product.product_type,
      description: product.description || '',
      location: product.location || '',
      city: product.city || '',
      state: product.state || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await farmerAPI.deleteProduct(productId);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      price: '',
      quantity: '',
      unit: 'kg',
      product_type: 'produce',
      description: '',
      location: '',
      city: '',
      state: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input"
                >
                  <option value="kg">Kilogram</option>
                  <option value="piece">Piece</option>
                  <option value="liter">Liter</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <span className={`badge ${product.is_approved ? 'badge-success' : 'badge-warning'}`}>
                  {product.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-2xl font-bold text-primary-600 mb-2">${product.price}</p>
              <p className="text-sm text-gray-600 mb-2">
                Stock: {product.quantity} {product.unit}
                {product.is_out_of_stock && <span className="text-red-600 ml-2">(Out of Stock)</span>}
              </p>
              <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
              <p className="text-xs text-gray-400 mb-4">{product.view_count} views</p>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="btn btn-secondary flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="btn btn-danger flex-1">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No products yet. Click "Add Product" to get started!</p>
        </div>
      )}
    </div>
  );
}

// ============ ORDERS TAB ============
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await farmerAPI.getOrders({ status: 'approved' });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (orders.length === 0) {
    return <div className="text-center py-12 text-gray-500">No approved orders yet</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.order_number}</h3>
                <p className="text-sm text-gray-600">Buyer: {order.buyer_name}</p>
                <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className="badge badge-success">{order.status}</span>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Your Items:</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} ({item.quantity} {item.unit})</span>
                    <span className="font-semibold">${item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PROFILE TAB ============
function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await farmerAPI.getProfile();
      setProfile(response.data.profile);
      setFormData(response.data.profile);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await farmerAPI.updateProfile(formData);
      toast.success('Profile updated!');
      setEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Farm Name</label>
              <input
                type="text"
                value={formData.farm_name || ''}
                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Farm Location</label>
              <input
                type="text"
                value={formData.farm_location || ''}
                onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Farm Size</label>
              <input
                type="text"
                value={formData.farm_size || ''}
                onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
                className="input"
                placeholder="e.g., 5 acres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Farm Description</label>
              <textarea
                value={formData.farm_description || ''}
                onChange={(e) => setFormData({ ...formData, farm_description: e.target.value })}
                className="input"
                rows="4"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <p className="text-lg font-medium">{profile.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="text-lg font-medium">{profile.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Farm Name</label>
              <p className="text-lg font-medium">{profile.farm_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Farm Location</label>
              <p className="text-lg font-medium">{profile.farm_location || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Farm Size</label>
              <p className="text-lg font-medium">{profile.farm_size || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Farm Description</label>
              <p className="text-lg font-medium">{profile.farm_description || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
