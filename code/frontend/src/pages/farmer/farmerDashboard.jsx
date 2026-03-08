import { useState } from 'react';
import { 
  Menu,
  X,
  Sprout,
  LogOut,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { RoleSwitcher } from "../RoleSwitcher.jsx"; 
import './farmerDashboard.css';

import tomatoImg from "./images/products/tomato.png";
import riceImg from "./images/products/rice.png";
import beansImg from "./images/products/beans.jpg";
import carrotsImg from "./images/products/carrots.png";
import cornImg from "./images/products/corn.png";
import cucumberImg from "./images/products/cucumber.png";

export function FarmerDashboard({ onNavigate }) {
  // State for navigation and sidebar
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- NEW IN STEP 3: State for Products ---
  const [products, setProducts] = useState([
    { id: 1, image: tomatoImg, name: 'Fresh Tomatoes', quantity: '50', price: '150', status: 'In Stock' },
    { id: 2, image: riceImg, name: 'Organic Rice', quantity: '200', price: '180', status: 'In Stock' },
    { id: 3, image: beansImg, name: 'Green Beans', quantity: '30', price: '120', status: 'Low Stock' },
    { id: 4, image: carrotsImg, name: 'Carrots', quantity: '180', price: '100', status: 'In Stock' },
    { id: 5, image: cornImg, name: 'Sweet Corn', quantity: '60', price: '90', status: 'In Stock' },
    { id: 6, image: cucumberImg, name: 'Cucumber', quantity: '25', price: '80', status: 'Low Stock' },
  ]);

  // State for modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    image: null,
    name: '',
    quantity: '',
    price: '',
    status: 'In Stock'
  });

  // Handlers for products
  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = () => {
    setProducts(products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity && newProduct.price) {
      const product = {
        id: Date.now(),
        ...newProduct
      };
      setProducts([...products, product]);
      setNewProduct({ image: null, name: '', quantity: '', price: '', status: 'In Stock' });
      setShowAddProduct(false);
    }
  };
  // ------------------------------------------

  // Render different content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <div className="p-8 text-center text-2xl text-gray-500">Dashboard Content Area</div>;
      case 'products':
        return <MyProductsContent 
          products={products}
          onAddClick={() => setShowAddProduct(true)}
          onEdit={handleEditProduct}
          onDelete={(id) => setDeleteConfirm(id)}
        />;
      case 'sales':
        return <div className="p-8 text-center text-2xl text-gray-500">Sales & Income Content Area</div>;
      case 'expenses':
        return <div className="p-8 text-center text-2xl text-gray-500">Expenses Content Area</div>;
      case 'orders':
        return <div className="p-8 text-center text-2xl text-gray-500">Orders Content Area</div>;
      case 'contacts':
        return <div className="p-8 text-center text-2xl text-gray-500">Contacts Content Area</div>;
      case 'loans':
        return <div className="p-8 text-center text-2xl text-gray-500">Bank Loans Content Area</div>;
      case 'equipment':
        return <div className="p-8 text-center text-2xl text-gray-500">Equipment Content Area</div>;
      case 'weather':
        return <div className="p-8 text-center text-2xl text-gray-500">Weather Forecast Content Area</div>;
      case 'inventory':
        return <div className="p-8 text-center text-2xl text-gray-500">Inventory Content Area</div>;
      case 'chatbot':
        return <div className="p-8 text-center text-2xl text-gray-500">Chatbot Assistant Area</div>;
      case 'settings':
        return <div className="p-8 text-center text-2xl text-gray-500">Settings & Profile Area</div>;
      default:
        return <div className="p-8 text-center text-2xl text-gray-500">Content Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Menu Button - Always Visible */}
      <div className="bg-white border-b border-green-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-primary font-semibold">NagroMS</span>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher currentRole="farmer" onNavigate={onNavigate} />
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:bg-green-50 p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Overlay - Click to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden by default on mobile, always accessible via menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Details in Sidebar */}
          <div className="flex items-center gap-2 p-6 border-b border-green-200">
            <div className="bg-primary rounded-lg p-2">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-primary font-semibold">NagroMS</h2>
              <p className="text-xs text-muted-foreground">Farmer Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton
              icon="🏠"
              label="Dashboard"
              active={activeNav === 'dashboard'}
              onClick={() => {
                setActiveNav('dashboard');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="🌾"
              label="My Products"
              active={activeNav === 'products'}
              onClick={() => {
                setActiveNav('products');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💰"
              label="Sales & Income"
              active={activeNav === 'sales'}
              onClick={() => {
                setActiveNav('sales');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📉"
              label="Expenses"
              active={activeNav === 'expenses'}
              onClick={() => {
                setActiveNav('expenses');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📦"
              label="Orders"
              active={activeNav === 'orders'}
              onClick={() => {
                setActiveNav('orders');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📞"
              label="Contacts"
              active={activeNav === 'contacts'}
              onClick={() => {
                setActiveNav('contacts');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💳"
              label="Bank Loans"
              active={activeNav === 'loans'}
              onClick={() => {
                setActiveNav('loans');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="🚜"
              label="Equipment"
              active={activeNav === 'equipment'}
              onClick={() => {
                setActiveNav('equipment');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="🌦️"
              label="Weather"
              active={activeNav === 'weather'}
              onClick={() => {
                setActiveNav('weather');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📦"
              label="Inventory"
              active={activeNav === 'inventory'}
              onClick={() => {
                setActiveNav('inventory');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💬"
              label="Chatbot"
              active={activeNav === 'chatbot'}
              onClick={() => {
                setActiveNav('chatbot');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
          </nav>

          {/* User Info & Logout at bottom of sidebar */}
          <div className="p-4 border-t border-green-200">
            <button
              onClick={() => {
                setActiveNav('settings');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="w-full bg-green-50 rounded-lg p-3 mb-3 hover:bg-green-100 transition-colors text-left"
            >
              <p className="text-sm text-foreground">👨‍🌾 Sunil Perera</p>
              <p className="text-xs text-muted-foreground">farmer@example.com</p>
              <p className="text-xs text-primary mt-1">⚙️ Click to view settings</p>
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* --- NEW IN STEP 3: Modals for Products --- */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Product?"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => handleDeleteProduct(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onChange={(field, value) => setEditingProduct({ ...editingProduct, [field]: value })}
          onSave={handleSaveProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          product={newProduct}
          onChange={(field, value) => setNewProduct({ ...newProduct, [field]: value })}
          onSave={handleAddProduct}
          onCancel={() => setShowAddProduct(false)}
        />
      )}
      {/* ------------------------------------------- */}

    </div>
  );
}

// Navigation Button Component
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${active 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-green-50 hover:text-primary border border-gray-100 hover:border-green-200'
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

// --- NEW IN STEP 3: My Products Sub-Components ---

function MyProductsContent({ products, onAddClick, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">🌾 My Products</h1>
        <p className="text-green-100 text-lg">Manage your farm products</p>
      </div>

      <button className="w-full lg:w-auto px-8 py-4 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg text-lg flex items-center gap-3" onClick={onAddClick}>
        <Plus className="w-6 h-6" />
        Add New Product
      </button>

      {/* Product Grid - Visual */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const qty = parseInt(product.quantity) || 0;
          const stockStatus = qty > 150 ? 'In Stock' : 'Low Stock';
          const statusColor = stockStatus === 'Low Stock' ? 'yellow' : 'green';
          
          return (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              quantity={qty}
              price={`LKR ${product.price}/kg`}
              status={stockStatus}
              statusColor={statusColor}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProductCard({ image, name, quantity, price, status, statusColor, onEdit, onDelete }) {
  const statusColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Rectangular Image Header */}
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-2xl text-foreground mb-2">{name}</p>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusColors[statusColor]}`}>
              {status}
            </span>
            <span className="text-lg text-foreground font-bold">{quantity} kg</span>
          </div>
        </div>
      
      {/* Stock Visual Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">Stock Level:</p>
          <p className="text-sm text-foreground font-bold">{quantity > 150 ? '✅ Good' : '⚠️ Low'}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${quantity > 150 ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${Math.min((quantity / 300) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {quantity > 150 
            ? `${quantity} kg available` 
            : `Only ${quantity} kg left - Need ${150 - quantity} kg more`}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-green-100 mb-4">
        <div>
          <p className="text-lg text-muted-foreground">Price</p>
          <p className="text-xl text-primary font-bold">{price}</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-muted-foreground">Total Value</p>
          <p className="text-xl text-green-600 font-bold">
            LKR {(quantity * parseInt(price.split(' ')[1])).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2" onClick={onEdit}>
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2" onClick={onDelete}>
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-96">
        <h2 className="text-xl text-primary mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({ product, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-[500px]">
        <h2 className="text-2xl text-primary mb-6">Edit Product</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name</label>
            <input type="text" value={product.name} onChange={e => onChange('name', e.target.value)} className="w-full p-3 border rounded-lg text-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Quantity (kg)</label>
              <input type="number" value={product.quantity} onChange={e => onChange('quantity', e.target.value)} className="w-full p-3 border rounded-lg text-lg" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Price (LKR/kg)</label>
              <input type="number" value={product.price} onChange={e => onChange('price', e.target.value)} className="w-full p-3 border rounded-lg text-lg" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl" onClick={onCancel}>Cancel</button>
          <button className="flex-1 py-3 bg-primary text-white rounded-xl" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ product, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-[500px]">
        <h2 className="text-2xl text-primary mb-6">Add New Product</h2>
        <div className="space-y-4">

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file); // convert to local preview
                  onChange('image', imageUrl);
                }
              }}
              className="w-full p-3 border rounded-lg text-sm"
            />
            {product.image && (
              <img src={product.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Fresh Tomatoes"
              value={product.name}
              onChange={e => onChange('name', e.target.value)}
              className="w-full p-3 border rounded-lg text-lg"
            />
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Quantity (kg)</label>
              <input
                type="number"
                placeholder="50"
                value={product.quantity}
                onChange={e => onChange('quantity', e.target.value)}
                className="w-full p-3 border rounded-lg text-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Price (LKR/kg)</label>
              <input
                type="number"
                placeholder="200"
                value={product.price}
                onChange={e => onChange('price', e.target.value)}
                className="w-full p-3 border rounded-lg text-lg"
              />
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-green-700"
            onClick={onSave}
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
