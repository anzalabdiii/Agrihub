import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { adminAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Users, UserPlus, Package, ShoppingCart,
  FolderTree, Activity, LogOut, Menu, X, Check, XCircle,
  UserMinus, UserCheck, Plus, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import Messages from '../../components/Messages';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/messages/unread-count');
        setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'create-farmer', label: 'Create Farmer', icon: UserPlus },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'products', label: 'Pending Products', icon: Package },
    { id: 'orders', label: 'Pending Orders', icon: ShoppingCart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h2 className="text-xl font-bold text-primary-600">AgriLink Admin</h2>
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
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
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
              <p className="text-xs text-gray-500">Administrator</p>
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
          {activeTab === 'create-farmer' && <CreateFarmerTab />}
          {activeTab === 'users' && <ManageUsersTab />}
          {activeTab === 'products' && <PendingProductsTab />}
          {activeTab === 'orders' && <PendingOrdersTab />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'logs' && <ActivityLogsTab />}
        </main>
      </div>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Farmers" value={stats?.total_farmers || 0} subtitle={`${stats?.active_farmers || 0} active`} color="blue" />
        <StatCard title="Total Buyers" value={stats?.total_buyers || 0} subtitle={`${stats?.active_buyers || 0} active`} color="green" />
        <StatCard title="Pending Products" value={stats?.pending_products || 0} subtitle={`${stats?.approved_products || 0} approved`} color="yellow" />
        <StatCard title="Pending Orders" value={stats?.pending_orders || 0} subtitle={`${stats?.approved_orders || 0} approved`} color="purple" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
        <p className="text-4xl font-bold text-primary-600">${stats?.total_revenue?.toFixed(2) || '0.00'}</p>
        <p className="text-sm text-gray-600 mt-2">From {stats?.approved_orders || 0} approved orders</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// ============ CREATE FARMER TAB ============
function CreateFarmerTab() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', phone: '',
    farm_name: '', farm_location: '', farm_size: '', farm_description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createFarmer(formData);
      toast.success('Farmer account created successfully!');
      setFormData({ email: '', password: '', full_name: '', phone: '', farm_name: '', farm_location: '', farm_size: '', farm_description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create farmer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Create Farmer Account</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" required minLength={6} />
          </div>
          <hr />
          <h3 className="text-lg font-semibold">Farm Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Farm Name</label>
              <input type="text" name="farm_name" value={formData.farm_name} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Farm Size</label>
              <input type="text" name="farm_size" value={formData.farm_size} onChange={handleChange} className="input" placeholder="e.g., 5 acres" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Farm Location</label>
            <input type="text" name="farm_location" value={formData.farm_location} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Farm Description</label>
            <textarea name="farm_description" value={formData.farm_description} onChange={handleChange} className="input" rows="4" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Farmer Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============ MANAGE USERS TAB ============
function ManageUsersTab() {
  const [farmers, setFarmers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('farmers');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [farmersRes, buyersRes] = await Promise.all([
        adminAPI.getAllFarmers(),
        adminAPI.getAllBuyers(),
      ]);
      setFarmers(farmersRes.data.farmers);
      setBuyers(buyersRes.data.buyers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const users = view === 'farmers' ? farmers : buyers;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setView('farmers')} className={`btn ${view === 'farmers' ? 'btn-primary' : 'btn-secondary'}`}>
          Farmers ({farmers.length})
        </button>
        <button onClick={() => setView('buyers')} className={`btn ${view === 'buyers' ? 'btn-primary' : 'btn-secondary'}`}>
          Buyers ({buyers.length})
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.profile?.full_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.profile?.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleUserStatus(user.id)} className="btn btn-sm btn-secondary">
                    {user.is_active ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ PENDING PRODUCTS TAB ============
function PendingProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await adminAPI.getPendingProducts();
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (productId) => {
    try {
      await adminAPI.approveProduct(productId);
      toast.success('Product approved!');
      loadProducts();
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  const rejectProduct = async (productId) => {
    if (!confirm('Reject this product?')) return;
    try {
      await adminAPI.rejectProduct(productId);
      toast.success('Product rejected');
      loadProducts();
    } catch (error) {
      toast.error('Failed to reject product');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (products.length === 0) return <div className="text-center py-8 text-gray-500">No pending products</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pending Products ({products.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img src={product.images[0]?.image_url || '/placeholder.jpg'} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">${product.price}</p>
              <p className="text-sm text-gray-600 mb-2">Qty: {product.quantity} {product.unit}</p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
              <p className="text-xs text-gray-500 mb-4">By: {product.farmer?.full_name}</p>
              <div className="flex gap-2">
                <button onClick={() => approveProduct(product.id)} className="btn btn-primary flex-1">
                  <Check className="w-4 h-4 mr-1" />Approve
                </button>
                <button onClick={() => rejectProduct(product.id)} className="btn btn-danger flex-1">
                  <XCircle className="w-4 h-4 mr-1" />Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PENDING ORDERS TAB ============
function PendingOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getPendingOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (orderId) => {
    try {
      await adminAPI.approveOrder(orderId);
      toast.success('Order approved! Stock deducted.');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve order');
    }
  };

  const rejectOrder = async (orderId) => {
    const notes = prompt('Reason for rejection:');
    try {
      await adminAPI.rejectOrder(orderId, { admin_notes: notes });
      toast.success('Order rejected');
      loadOrders();
    } catch (error) {
      toast.error('Failed to reject order');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (orders.length === 0) return <div className="text-center py-8 text-gray-500">No pending orders</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pending Orders ({orders.length})</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.order_number}</h3>
                <p className="text-sm text-gray-600">Buyer: {order.buyer_name}</p>
                <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">${order.total_amount}</p>
                <span className="badge badge-warning">{order.status}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} ({item.quantity} {item.unit})</span>
                    <span className="font-semibold">${item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveOrder(order.id)} className="btn btn-primary">
                <Check className="w-4 h-4 mr-1" />Approve & Deduct Stock
              </button>
              <button onClick={() => rejectOrder(order.id)} className="btn btn-danger">
                <XCircle className="w-4 h-4 mr-1" />Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ CATEGORIES TAB ============
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCategory(formData);
      toast.success('Category created!');
      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />Add Category
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" rows="3" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            <p className="text-xs text-gray-500">{category.product_count} products</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ ACTIVITY LOGS TAB ============
function ActivityLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getActivityLogs({ per_page: 50 });
      setLogs(response.data.logs);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Activity Logs</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user_email} <span className="text-gray-500">({log.user_role})</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="badge badge-info">{log.action}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
