import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import {
  ShoppingCart,
  Package,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  Plus,
  Minus,
  Trash2,
  Eye,
  Heart,
  Star,
  MessageSquare,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import Messages from '../../components/Messages';

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If the URL is already absolute, return it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Handle different image URL formats
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = API_BASE_URL.replace('/api', ''); // Get base URL without /api

  let fullUrl;
  if (imageUrl.startsWith('/api/')) {
    // If URL already starts with /api/, use base URL + imageUrl
    fullUrl = `${baseUrl}${imageUrl}`;
  } else if (imageUrl.startsWith('/uploads/')) {
    // If URL starts with /uploads/, use base URL + imageUrl
    fullUrl = `${baseUrl}${imageUrl}`;
  } else if (imageUrl.startsWith('/')) {
    // If URL starts with /, use base URL + imageUrl
    fullUrl = `${baseUrl}${imageUrl}`;
  } else {
    // If no leading slash, assume it's just the filename and add /uploads/
    fullUrl = `${baseUrl}/uploads/${imageUrl}`;
  }

  console.log('Image URL:', imageUrl, '→ Full URL:', fullUrl);
  return fullUrl;
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const tabs = [
    { id: 'browse', label: 'Browse Products', icon: Package },
    { id: 'cart', label: 'My Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  useEffect(() => {
    fetchCartCount();
    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      setCartCount(response.data.cart?.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  };

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
            <p className="text-sm text-gray-500">Buyer Portal</p>
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
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
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
          {activeTab === 'browse' && <BrowseProductsTab fetchCartCount={fetchCartCount} />}
          {activeTab === 'cart' && <CartTab setActiveTab={setActiveTab} fetchCartCount={fetchCartCount} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}

// Browse Products Tab Component
function BrowseProductsTab({ fetchCartCount }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Backend already filters for approved products
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart/items', {
        product_id: productId,
        quantity: 1
      });
      toast.success('Added to cart!');
      fetchCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {product.quantity <= 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">per {product.unit}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Stock: {product.quantity} {product.unit}</span>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{product.view_count || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.quantity <= 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Cart Tab Component
function CartTab({ setActiveTab, fetchCartCount }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.cart || null);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.patch(`/cart/items/${itemId}`, { quantity: newQuantity });
      fetchCart();
      fetchCartCount();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
      fetchCartCount();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!cart?.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      await api.post('/orders/confirm', {});
      toast.success('Order placed successfully! Awaiting admin approval.');
      fetchCart();
      fetchCartCount();
      setActiveTab('orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => setActiveTab('browse')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Cart Items */}
        <div className="p-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="h-20 w-20 bg-gray-200 rounded flex-shrink-0">
                {item.product?.images && item.product.images.length > 0 ? (
                  <img
                    src={getImageUrl(item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0].image_url)}
                    alt={item.product.name}
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name}</h3>
                <p className="text-sm text-gray-600">
                  ${parseFloat(item.product?.price || 0).toFixed(2)} per {item.product?.unit}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  ${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              ${cart.items.reduce((sum, item) => sum + (parseFloat(item.product?.price || 0) * item.quantity), 0).toFixed(2)}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Note: Your order will be submitted for admin approval before processing.
            </p>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Place Order
          </button>
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
      const response = await api.get('/buyer/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
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
        <p className="text-gray-600">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
              <p className="text-sm text-gray-600">
                Placed: {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'approved' ? 'bg-green-100 text-green-800' :
              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
              order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Order Items:</p>
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm mb-2">
                <span>{item.product_name} - {item.quantity} {item.unit}</span>
                <span className="font-medium">${parseFloat(item.product_price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>

          {order.status === 'pending' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">Awaiting admin approval</p>
            </div>
          )}
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    delivery_address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/buyer/profile');
      const profileData = response.data.profile || response.data;
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        delivery_address: profileData.delivery_address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zip_code: profileData.zip_code || ''
      });
      if (profileData.profile_image) {
        setImagePreview(getImageUrl(profileData.profile_image));
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload image if selected
      let imageUrl = profile?.profile_image;
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        const uploadRes = await api.post('/upload/image', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      // Update profile
      const response = await api.patch('/buyer/profile', {
        ...formData,
        profile_image: imageUrl
      });

      setProfile(response.data.profile);
      setIsEditing(false);
      setImageFile(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        delivery_address: profile.delivery_address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || ''
      });
      if (profile.profile_image) {
        setImagePreview(getImageUrl(profile.profile_image));
      } else {
        setImagePreview(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Buyer Profile</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Plus className="h-4 w-4" />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{user?.email}</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.full_name || 'Not set'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.phone || 'Not set'}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
            {isEditing ? (
              <textarea
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Enter your delivery address"
              />
            ) : (
              <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.delivery_address || 'Not set'}</p>
            )}
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="City"
                />
              ) : (
                <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.city || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="State"
                />
              ) : (
                <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.state || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Zip Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Zip"
                />
              ) : (
                <p className="text-lg px-4 py-2 bg-gray-50 rounded-lg">{profile?.zip_code || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
