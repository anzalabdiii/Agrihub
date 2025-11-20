# Frontend Component Guide

## Reusable Components

### Layout Components

#### DashboardLayout.jsx
```jsx
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children, role, navigation }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h2 className="text-xl font-bold text-primary-600">AgriLink Hub</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
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

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

### UI Components

#### Card.jsx
```jsx
export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
```

#### Badge.jsx
```jsx
export default function Badge({ children, variant = 'info' }) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  return (
    <span className={`badge ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

#### Table.jsx
```jsx
export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Modal.jsx
```jsx
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
```

#### SearchInput.jsx
```jsx
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchInput({ placeholder, onSearch, delay = 500 }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  );
}
```

#### Pagination.jsx
```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === page
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
```

#### ImageUpload.jsx
```jsx
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ImageUpload({ onUpload, multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);

      // Upload file
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await uploadAPI.uploadImage(formData);
        onUpload(response.data.url);
        toast.success('Image uploaded!');
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Images
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img src={preview} alt="" className="w-full h-32 object-cover rounded-lg" />
            <button
              onClick={() => removePreview(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Click to upload images</p>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
```

## Dashboard Examples

### Admin Dashboard Snippet
```jsx
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getDashboardStats().then((res) => setStats(res.data));
  }, []);

  const navigation = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/admin/farmers/create', label: 'Create Farmer', icon: Users },
    { path: '/admin/products/pending', label: 'Pending Products', icon: Package },
    { path: '/admin/orders/pending', label: 'Pending Orders', icon: ShoppingCart },
  ];

  return (
    <DashboardLayout role="admin" navigation={navigation}>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farmers</p>
              <p className="text-3xl font-bold">{stats?.total_farmers}</p>
            </div>
            <Users className="w-12 h-12 text-primary-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Buyers</p>
              <p className="text-3xl font-bold">{stats?.total_buyers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Products</p>
              <p className="text-3xl font-bold">{stats?.pending_products}</p>
            </div>
            <Package className="w-12 h-12 text-yellow-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold">{stats?.pending_orders}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-600" />
          </div>
        </Card>
      </div>

      <Card title="Revenue Overview">
        <p className="text-4xl font-bold text-primary-600">
          ${stats?.total_revenue?.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mt-2">Total Revenue from Approved Orders</p>
      </Card>
    </DashboardLayout>
  );
}
```

### Product Card Component
```jsx
import { ShoppingCart, Eye } from 'lucide-react';
import Badge from './Badge';

export default function ProductCard({ product, onAddToCart, onView }) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={onView}>
        <img
          src={product.images[0]?.image_url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />

        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary-600">
            ${product.price}
          </span>
          <Badge variant={product.is_out_of_stock ? 'danger' : 'success'}>
            {product.is_out_of_stock ? 'Out of Stock' : 'In Stock'}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {product.quantity} {product.unit} available
        </p>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Eye className="w-4 h-4" />
          <span>{product.view_count} views</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        disabled={product.is_out_of_stock}
        className="w-full btn btn-primary mt-4"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  );
}
```

## Form Examples

### Product Form
```jsx
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';

export default function ProductForm({ initialData, onSubmit }) {
  const [categories, setCategories] = useState([]);
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
    images: [],
    ...initialData,
  });

  useEffect(() => {
    productsAPI.getCategories().then((res) => setCategories(res.data.categories));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url) => {
    setFormData({ ...formData, images: [...formData.images, url] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="input"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit *</label>
          <select name="unit" value={formData.unit} onChange={handleChange} className="input">
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
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="4"
        />
      </div>

      <ImageUpload onUpload={handleImageUpload} multiple />

      <button type="submit" className="btn btn-primary">
        Submit Product
      </button>
    </form>
  );
}
```

## Styling Guide

### Tailwind Classes Used

**Layout:**
- `container mx-auto` - Centered container
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` - Responsive grid
- `flex items-center justify-between` - Flexbox alignment

**Colors:**
- `bg-primary-600` - Primary green color
- `text-gray-900` - Dark text
- `border-gray-200` - Light borders

**Spacing:**
- `p-4, p-6, p-8` - Padding
- `mb-4, mt-6` - Margins
- `space-y-6` - Vertical spacing

**Effects:**
- `hover:bg-gray-50` - Hover effects
- `transition-colors duration-200` - Smooth transitions
- `shadow-lg` - Drop shadows

**Responsive:**
- `md:grid-cols-2` - Medium screens
- `lg:translate-x-0` - Large screens
- `hidden md:block` - Responsive visibility
