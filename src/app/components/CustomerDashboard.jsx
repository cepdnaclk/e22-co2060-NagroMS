import { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  MapPin, 
  Star,
  Phone,
  Filter,
  Sprout,
  LogOut,
  Heart,
  Package,
  CreditCard,
  Menu,
  X,
  Home,
  UserCircle,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Check,
  FileText,
  Calendar,
  Download,
  MessageCircle,
  Send,
  Bot,
  ChevronDown,
  PlusCircle,
  Bell
} 
from 'lucide-react';

import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  loadCustomerProfile, 
  saveCustomerProfile,
  fetchProducts,
  saveOrder,
  loadCustomerOrders,
  saveCart,
  loadCart
} from '../services/firestoreService';

import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { RoleSwitcher } from './RoleSwitcher';
import { Chatbot } from './Chatbot';
import { NotificationCenter } from './NotificationCenter';
import { EnhancedCheckoutSection } from './EnhancedCheckout';
import { EnhancedOrdersSection } from './EnhancedOrders';

// ─── FALLBACK PRODUCTS (shown if Firestore has no products yet) ───────────────
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Tomatoes',
    farmer: 'Sunil Farm',
    location: 'Kandy',
    district: 'Kandy',
    price: 150,
    unit: 'kg',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1560433802-62c9db426a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHRvbWF0b2VzJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc2OTUwOTA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'vegetables',
    available: '50 kg',
    farmerPhone: '+94 77 234 5678',
    availableUnits: [
      { unit: 'kg', price: 150, label: 'Kilogram' },
      { unit: 'g', price: 0.15, label: 'Gram' }
    ]
  },
  {
    id: 2,
    name: 'Organic Rice',
    farmer: 'Perera Agriculture',
    location: 'Anuradhapura',
    district: 'Anuradhapura',
    price: 180,
    unit: 'kg',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1763537351442-f377a4878d9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW4lMjBoYXJ2ZXN0fGVufDF8fHx8MTc2OTUwOTA3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'grains',
    available: '200 kg',
    farmerPhone: '+94 77 345 6789',
    availableUnits: [
      { unit: 'kg', price: 180, label: 'Kilogram' },
      { unit: 'g', price: 0.18, label: 'Gram' }
    ]
  },
  {
    id: 3,
    name: 'Fresh Carrots',
    farmer: 'Silva Farm',
    location: 'Nuwara Eliya',
    district: 'Nuwara Eliya',
    price: 120,
    unit: 'kg',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1717959159782-98c42b1d4f37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNhcnJvdHMlMjB2ZWdldGFibGVzfGVufDF8fHx8MTc2OTUwMjAwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'vegetables',
    available: '40 kg',
    farmerPhone: '+94 77 456 7890',
    availableUnits: [
      { unit: 'kg', price: 120, label: 'Kilogram' },
      { unit: 'g', price: 0.12, label: 'Gram' }
    ]
  },
  {
    id: 4,
    name: 'Green Beans',
    farmer: 'Fernando Organic',
    location: 'Matale',
    district: 'Matale',
    price: 120,
    unit: 'kg',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1574963835594-61eede2070dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGJlYW5zJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc2OTUwMjYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'vegetables',
    available: '30 kg',
    farmerPhone: '+94 77 567 8901',
    availableUnits: [
      { unit: 'kg', price: 120, label: 'Kilogram' },
      { unit: 'g', price: 0.12, label: 'Gram' }
    ]
  },
  {
    id: 5,
    name: 'Fresh Bananas',
    farmer: 'Rathnayake Farm',
    location: 'Kegalle',
    district: 'Kegalle',
    price: 100,
    unit: 'kg',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1643188626775-05290d1b6acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJhbmFuYXMlMjB0cm9waWNhbCUyMGZydWl0fGVufDF8fHx8MTc2OTUwOTA3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'fruits',
    available: '80 kg',
    farmerPhone: '+94 77 678 9012',
    availableUnits: [
      { unit: 'bunch', price: 100, label: 'Bunch' },
      { unit: 'kg', price: 100, label: 'Kilogram' },
      { unit: 'g', price: 0.10, label: 'Gram' }
    ]
  },
  {
    id: 6,
    name: 'Papaya',
    farmer: 'Wijesinghe Gardens',
    location: 'Gampaha',
    district: 'Gampaha',
    price: 90,
    unit: 'kg',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1651821322744-73ee50bf4046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBheWElMjB0cm9waWNhbCUyMGZydWl0fGVufDF8fHx8MTc2OTUwMjc5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'fruits',
    available: '60 kg',
    farmerPhone: '+94 77 789 0123',
    availableUnits: [
      { unit: 'unit', price: 90, label: 'Each' },
      { unit: 'kg', price: 90, label: 'Kilogram' },
      { unit: 'g', price: 0.09, label: 'Gram' }
    ]
  },
  {
    id: 7,
    name: 'Fresh Coconuts',
    farmer: 'De Silva Estate',
    location: 'Colombo',
    district: 'Colombo',
    price: 80,
    unit: 'unit',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1589823635451-0c3e1760dc19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwZnJlc2h8ZW58MXx8fHwxNzY5NTAyNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'fruits',
    available: '100 units',
    farmerPhone: '+94 77 890 1234',
    availableUnits: [
      { unit: 'unit', price: 80, label: 'Each' }
    ]
  }
];

// Delivery fee calculation based on district distance
const DISTRICT_DELIVERY_FEES = {
  'Colombo-Colombo': 0,
  'Colombo-Gampaha': 150,
  'Colombo-Kandy': 300,
  'Colombo-Anuradhapura': 500,
  'Colombo-Nuwara Eliya': 400,
  'Colombo-Matale': 350,
  'Colombo-Kegalle': 250,
  'default': 200
};

function calculateDeliveryFee(customerDistrict, farmerDistrict) {
  if (!customerDistrict || !farmerDistrict) return 200;
  if (customerDistrict === farmerDistrict) return 0;
  const key1 = `${customerDistrict}-${farmerDistrict}`;
  const key2 = `${farmerDistrict}-${customerDistrict}`;
  return DISTRICT_DELIVERY_FEES[key1] || DISTRICT_DELIVERY_FEES[key2] || 200;
}

// Mock past orders - will be replaced by Firestore orders
const PAST_ORDERS = [
  {
    id: 'ORD-001',
    date: '2026-03-01',
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    items: [
      { productId: 1, name: 'Fresh Tomatoes', quantity: 5, price: 150, unit: 'kg' },
      { productId: 5, name: 'Fresh Bananas', quantity: 3, price: 100, unit: 'kg' }
    ],
    deliveryAddress: '123 Main Street, Colombo, Western Province, 00100',
    total: 1050,
    deliveryFee: 0,
    estimatedDelivery: '2026-03-05',
    trackingHistory: [
      { status: 'Order Placed', date: 'Mar 1, 2026 10:30 AM', completed: true },
      { status: 'Order Confirmed', date: 'Mar 1, 2026 11:00 AM', completed: true },
      { status: 'Order Packed', date: 'Mar 2, 2026 9:00 AM', completed: true },
      { status: 'In Transit', date: 'Mar 2, 2026 2:00 PM', completed: true },
      { status: 'Delivered', date: 'Mar 3, 2026 11:30 AM', completed: true }
    ]
  },
  {
    id: 'ORD-002',
    date: '2026-02-28',
    status: 'In Transit',
    paymentMethod: 'Bank Transfer',
    items: [
      { productId: 2, name: 'Organic Rice', quantity: 10, price: 180, unit: 'kg' },
      { productId: 3, name: 'Fresh Carrots', quantity: 2, price: 120, unit: 'kg' }
    ],
    deliveryAddress: '123 Main Street, Colombo, Western Province, 00100',
    total: 2040,
    deliveryFee: 200,
    estimatedDelivery: '2026-03-10',
    trackingHistory: [
      { status: 'Order Placed', date: 'Feb 28, 2026 2:30 PM', completed: true },
      { status: 'Payment Verified', date: 'Feb 28, 2026 3:00 PM', completed: true },
      { status: 'Order Confirmed', date: 'Feb 28, 2026 3:15 PM', completed: true },
      { status: 'Order Packed', date: 'Mar 7, 2026 10:00 AM', completed: true },
      { status: 'Out for Delivery', date: 'Mar 8, 2026 8:00 AM', completed: true },
      { status: 'Delivered', date: 'Estimated: Mar 10', completed: false }
    ]
  }
];

export function CustomerDashboard({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // ── CART: start empty, loaded from Firestore ──
  const [cart, setCart] = useState([]);

  const [activeSection, setActiveSection] = useState('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRequestProductModal, setShowRequestProductModal] = useState(false);
  const [showMessageFarmerModal, setShowMessageFarmerModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  // ── FIREBASE STATE ────────────────────────────
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [firestoreOrders, setFirestoreOrders] = useState([]);

  // ── PROFILE: default values, overwritten by Firestore ──
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: ''
  });

  // ── LOAD DATA FROM FIREBASE ON LOGIN ─────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        // Load profile from Firestore
        const firestoreProfile = await loadCustomerProfile(user.uid);
        if (firestoreProfile) setProfile(firestoreProfile);

        // Load cart from Firestore
        const savedCart = await loadCart(user.uid);
        if (savedCart && savedCart.length > 0) setCart(savedCart);

        // Load products from Firestore (fallback to FALLBACK_PRODUCTS if empty)
        const firestoreProducts = await fetchProducts();
        if (firestoreProducts && firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
        }

        // Load orders from Firestore
        const orders = await loadCustomerOrders(user.uid);
        if (orders && orders.length > 0) setFirestoreOrders(orders);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── AUTO-SAVE CART TO FIRESTORE WHEN IT CHANGES ──
  useEffect(() => {
    if (uid) {
      saveCart(uid, cart);
    }
  }, [cart, uid]);

  // ── DEMO NOTIFICATIONS ────────────────────────
  useEffect(() => {
    const demoNotifications = [
      {
        id: Date.now() + 1,
        type: 'product-available',
        title: '✅ Your Requested Product is Now Available!',
        message: 'Fresh Mangoes (Organic) that you requested is now available from Farmer Pradeep in Anuradhapura',
        productName: 'Fresh Mangoes (Organic)',
        farmerName: 'Farmer Pradeep',
        location: 'Anuradhapura',
        read: false,
        timestamp: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        type: 'product-available',
        title: '✅ Product Available',
        message: 'Organic Carrots that you requested is now available from Farmer Nimal in Kandy',
        productName: 'Organic Carrots',
        farmerName: 'Farmer Nimal',
        location: 'Kandy',
        read: false,
        timestamp: new Date().toISOString()
      }
    ];
    const existing = localStorage.getItem('customerNotifications');
    if (!existing) {
      localStorage.setItem('customerNotifications', JSON.stringify(demoNotifications));
    }
  }, []);

  // ── SHOW LOADING SCREEN WHILE FIREBASE LOADS ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-primary rounded-lg p-4 inline-block mb-4">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <p className="text-primary text-xl font-semibold">Loading NagroMS...</p>
          <p className="text-muted-foreground text-sm mt-2">Fetching your data</p>
        </div>
      </div>
    );
  }

  // Use Firestore orders if available, otherwise fallback to mock
  const ordersToShow = firestoreOrders.length > 0 ? firestoreOrders : PAST_ORDERS;

  const uniqueLocations = ['all', ...new Set(products.map(p => p.location))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || product.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const defaultUnit = product.unit;
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: productId, quantity: 1, unit: defaultUnit }];
    });
  };

  const changeUnit = (productId, newUnit) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, unit: newUnit } : item
    ));
  };

  const updateQuantity = (productId, changeOrNewQuantity) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;
    const newQuantity = Math.abs(changeOrNewQuantity) <= 10 
      ? cartItem.quantity + changeOrNewQuantity 
      : changeOrNewQuantity;
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product) return sum;
      let price = product.price;
      if (product.availableUnits && item.unit) {
        const unitInfo = product.availableUnits.find(u => u.unit === item.unit);
        if (unitInfo) price = unitInfo.price;
      }
      return sum + price * item.quantity;
    }, 0);
  };

  const getTotalDeliveryFee = () => {
    let maxFee = 0;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const fee = calculateDeliveryFee(profile.district, product.district);
        maxFee = Math.max(maxFee, fee);
      }
    });
    return maxFee;
  };

  const getCartItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleMessageFarmer = (product) => {
    setSelectedFarmer(product);
    setShowMessageFarmerModal(true);
  };

  // ── SAVE PROFILE TO FIRESTORE ─────────────────
  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    if (uid) {
      await saveCustomerProfile(uid, updatedProfile);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'browse':
        return <BrowseProducts 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          uniqueLocations={uniqueLocations}
          filteredProducts={filteredProducts}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          changeUnit={changeUnit}
          removeFromCart={removeFromCart}
          onMessageFarmer={handleMessageFarmer}
          onRequestProduct={() => setShowRequestProductModal(true)}
        />;
      case 'profile':
        return <ProfileSection 
          profile={profile} 
          setProfile={handleSaveProfile}  // ← saves to Firestore
        />;
      case 'cart':
        return <CartSection 
          cart={cart} 
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getCartTotal={getCartTotal}
          getTotalDeliveryFee={getTotalDeliveryFee}
          setActiveSection={setActiveSection}
          customerDistrict={profile.district}
          products={products}
        />;
      case 'checkout':
        return <EnhancedCheckoutSection 
          uid={uid}                        // ← Firebase uid for saving orders
          cart={cart}
          profile={profile}
          getCartTotal={getCartTotal}
          getTotalDeliveryFee={getTotalDeliveryFee}
          setActiveSection={setActiveSection}
          setCart={setCart}
          PRODUCTS={products}
        />;
      case 'orders':
        return <EnhancedOrdersSection pastOrders={ordersToShow} uid={uid} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-primary font-semibold">NagroMS</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <RoleSwitcher currentRole="customer" onNavigate={onNavigate} />
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
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

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 p-6 border-b border-green-200">
            <div className="bg-primary rounded-lg p-2">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-primary font-semibold">NagroMS</h2>
              <p className="text-xs text-muted-foreground">Customer Portal</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton
              icon={<Home className="w-5 h-5" />}
              label="Browse Products"
              active={activeSection === 'browse'}
              onClick={() => { setActiveSection('browse'); setSidebarOpen(false); }}
            />
            <NavButton
              icon={<UserCircle className="w-5 h-5" />}
              label="My Profile"
              active={activeSection === 'profile'}
              onClick={() => { setActiveSection('profile'); setSidebarOpen(false); }}
            />
            <NavButton
              icon={<ShoppingCart className="w-5 h-5" />}
              label={`Cart (${getCartItemsCount()})`}
              active={activeSection === 'cart'}
              onClick={() => { setActiveSection('cart'); setSidebarOpen(false); }}
              badge={getCartItemsCount() > 0 ? getCartItemsCount() : null}
            />
            <NavButton
              icon={<FileText className="w-5 h-5" />}
              label="Past Orders"
              active={activeSection === 'orders'}
              onClick={() => { setActiveSection('orders'); setSidebarOpen(false); }}
            />
          </nav>

          <div className="p-4 border-t border-green-200 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <UserCircle className="w-10 h-10 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{profile.name || 'Customer'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pb-20">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>

      <Chatbot />

      {showRequestProductModal && (
        <RequestProductModal onClose={() => setShowRequestProductModal(false)} />
      )}

      {showMessageFarmerModal && selectedFarmer && (
        <MessageFarmerModal 
          farmer={selectedFarmer} 
          onClose={() => {
            setShowMessageFarmerModal(false);
            setSelectedFarmer(null);
          }} 
        />
      )}
    </div>
  );
}

// ─── NAV BUTTON ──────────────────────────────────────────────────────────────
function NavButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
        active
          ? 'bg-primary text-white'
          : 'text-muted-foreground hover:bg-green-50 hover:text-primary'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {badge && !active && (
        <span className="ml-auto bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── BROWSE PRODUCTS ─────────────────────────────────────────────────────────
function BrowseProducts({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, selectedLocation, setSelectedLocation, uniqueLocations, filteredProducts, cart, addToCart, updateQuantity, changeUnit, removeFromCart, onMessageFarmer, onRequestProduct }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8" style={{color: '#ffffff'}}>
        <h1 className="text-3xl mb-2" style={{color: '#ffffff'}}>🛒 Browse Products</h1>
        <p className="text-lg" style={{color: '#ffffff', opacity: 0.95}}>Fresh products directly from local farmers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products or farmers..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg text-foreground">Filters</h3>
        </div>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">Category</p>
          <div className="flex flex-wrap gap-3">
            <CategoryButton label="All Products" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
            <CategoryButton label="Vegetables" active={selectedCategory === 'vegetables'} onClick={() => setSelectedCategory('vegetables')} />
            <CategoryButton label="Fruits" active={selectedCategory === 'fruits'} onClick={() => setSelectedCategory('fruits')} />
            <CategoryButton label="Grains" active={selectedCategory === 'grains'} onClick={() => setSelectedCategory('grains')} />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-3">Location</p>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none cursor-pointer"
            >
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        onClick={onRequestProduct}
        className="request-product-btn w-full bg-white rounded-2xl shadow-sm border-2 border-dashed border-green-300 p-6 hover:border-primary hover:bg-green-50 transition-all"
      >
        <div className="flex items-center justify-center gap-3">
          <PlusCircle className="w-6 h-6" />
          <span className="text-lg font-medium">Can't find what you're looking for? Request a Product</span>
        </div>
      </button>

      <div>
        <h3 className="text-2xl text-primary mb-4">Available Products ({filteredProducts.length})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product.id)}
              onMessageFarmer={() => onMessageFarmer(product)}
              inCart={cart.some(item => item.id === product.id)}
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onChangeUnit={changeUnit}
              onRemoveFromCart={removeFromCart}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-green-100">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <button
              onClick={onRequestProduct}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Request a Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE SECTION ─────────────────────────────────────────────────────────
function ProfileSection({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await setProfile(editedProfile); // this calls handleSaveProfile which saves to Firestore
    setIsEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8" style={{color: '#ffffff'}}>
        <h1 className="text-3xl mb-2" style={{color: '#ffffff'}}>👤 My Profile</h1>
        <p className="text-lg" style={{color: '#ffffff', opacity: 0.95}}>Manage your personal information and delivery address</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-primary">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+94 77 123 4567' },
            { label: 'Address Line 1', key: 'addressLine1', type: 'text', placeholder: 'House number and street name' },
            { label: 'Address Line 2 (Optional)', key: 'addressLine2', type: 'text', placeholder: 'Apartment, suite, etc.' },
            { label: 'City', key: 'city', type: 'text', placeholder: 'e.g., Colombo' },
            { label: 'District', key: 'district', type: 'text', placeholder: 'e.g., Colombo' },
            { label: 'Postal Code', key: 'postalCode', type: 'text', placeholder: 'e.g., 00100' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
              <input
                type={field.type}
                value={isEditing ? editedProfile[field.key] : profile[field.key]}
                onChange={(e) => setEditedProfile({ ...editedProfile, [field.key]: e.target.value })}
                disabled={!isEditing}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-60"
              />
            </div>
          ))}

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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

// ─── CART SECTION ─────────────────────────────────────────────────────────────
function CartSection({ cart, updateQuantity, removeFromCart, getCartTotal, getTotalDeliveryFee, setActiveSection, customerDistrict, products }) {
  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white">
          <h1 className="text-3xl mb-2">🛒 Shopping Cart</h1>
          <p className="text-orange-100 text-lg">Review your items and proceed to checkout</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-16 text-center">
          <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl text-foreground mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">Add some fresh products from local farmers</p>
          <button
            onClick={() => setActiveSection('browse')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const deliveryFee = getTotalDeliveryFee();
  const totalAmount = getCartTotal() + deliveryFee;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">🛒 Shopping Cart</h1>
        <p className="text-orange-100 text-lg">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">Cart Items</h2>
        <div className="space-y-4">
          {cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return null;
            const itemDeliveryFee = calculateDeliveryFee(customerDistrict, product.district);
            let itemPrice = product.price;
            if (product.availableUnits && item.unit) {
              const unitInfo = product.availableUnits.find(u => u.unit === item.unit);
              if (unitInfo) itemPrice = unitInfo.price;
            }
            const itemUnit = item.unit || product.unit;

            return (
              <div key={item.id} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-foreground font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.farmer} • {product.location}</p>
                    <p className="text-lg text-primary font-semibold">LKR {itemPrice} / {itemUnit}</p>
                    <p className="text-xs text-muted-foreground mt-1">Delivery: {itemDeliveryFee === 0 ? 'FREE' : `LKR ${itemDeliveryFee}`}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-12 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg text-foreground font-semibold">LKR {(itemPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground font-medium">LKR {getCartTotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Delivery Fee:</span>
            <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-foreground'}`}>
              {deliveryFee === 0 ? 'FREE' : `LKR ${deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-2xl">
              <span className="text-foreground font-bold">Total:</span>
              <span className="text-primary font-bold">LKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setActiveSection('checkout')}
            className="w-full px-8 py-6 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all text-2xl font-bold flex items-center justify-center gap-3 shadow-2xl border-4 border-green-300 transform hover:scale-105"
          >
            <CreditCard className="w-8 h-8" />
            🎯 PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST PRODUCT MODAL ────────────────────────────────────────────────────
function RequestProductModal({ onClose }) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    const requests = JSON.parse(localStorage.getItem('productRequests') || '[]');
    requests.push({
      id: Date.now(),
      productName,
      description,
      quantity,
      dateRequested: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('productRequests', JSON.stringify(requests));
    setTimeout(() => { onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl text-primary font-bold">Request a Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">Can't find what you're looking for? Tell us what product you need!</p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Organic Strawberries" className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any specific requirements..." rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity Needed</label>
                <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 10 kg" className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <button onClick={handleSubmit} disabled={!productName.trim()} className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Request
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl text-foreground font-bold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground">We'll connect you with farmers who can provide this product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MESSAGE FARMER MODAL ─────────────────────────────────────────────────────
function MessageFarmerModal({ farmer, onClose }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl text-primary font-bold">Message Farmer</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {!sent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
                  <ImageWithFallback src={farmer.image} alt={farmer.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-foreground font-medium">{farmer.farmer}</p>
                  <p className="text-sm text-muted-foreground">{farmer.location}</p>
                  <p className="text-sm text-muted-foreground">{farmer.farmerPhone}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">Product: <strong>{farmer.name}</strong></p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message to the farmer..." rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSend} disabled={!message.trim()} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
                <button onClick={() => window.open(`tel:${farmer.farmerPhone}`)} className="px-6 py-3 bg-green-50 text-primary rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl text-foreground font-bold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">The farmer will contact you soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY BUTTON ──────────────────────────────────────────────────────────
function CategoryButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary text-white shadow-md'
          : 'bg-white text-muted-foreground border border-green-100 hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onMessageFarmer, inCart, cart, onUpdateQuantity, onChangeUnit, onRemoveFromCart }) {
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 1;
  const selectedUnit = cartItem ? cartItem.unit : product.unit;
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempUnit, setTempUnit] = useState(product.unit);

  const getCurrentPrice = () => {
    const currentUnit = inCart ? selectedUnit : tempUnit;
    if (!product.availableUnits) return product.price.toFixed(2);
    const unitInfo = product.availableUnits.find(u => u.unit === currentUnit);
    return unitInfo ? unitInfo.price.toFixed(2) : product.price.toFixed(2);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id);
    setTimeout(() => {
      onChangeUnit(product.id, tempUnit);
      onUpdateQuantity(product.id, tempQuantity);
    }, 0);
  };

  const handleIncrease = () => {
    if (inCart) { onUpdateQuantity(product.id, 1); }
    else { setTempQuantity(prev => prev + 1); }
  };

  const handleDecrease = () => {
    if (inCart) { if (quantity > 1) onUpdateQuantity(product.id, -1); }
    else { if (tempQuantity > 1) setTempQuantity(prev => prev - 1); }
  };

  const handleUnitChange = (newUnit) => {
    if (inCart) { onChangeUnit(product.id, newUnit); }
    else { setTempUnit(newUnit); }
  };

  const currentQuantity = inCart ? quantity : tempQuantity;
  const currentUnit = inCart ? selectedUnit : tempUnit;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500" />
        </button>
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded">Fresh</div>
      </div>
      <div className="p-4">
        <h4 className="text-lg text-foreground mb-1 font-medium">{product.name}</h4>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm text-muted-foreground">{product.rating}</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" /><span>{product.farmer}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /><span>{product.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" /><span>{product.available} available</span>
          </div>
        </div>
        <div className="mb-3">
          <p className="text-2xl text-primary font-bold">LKR {getCurrentPrice()}</p>
          <p className="text-sm text-muted-foreground">per {currentUnit}</p>
        </div>
        {product.availableUnits && product.availableUnits.length > 1 && (
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">Select Unit:</label>
            <select value={currentUnit} onChange={(e) => handleUnitChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              {product.availableUnits.map(unitOption => (
                <option key={unitOption.unit} value={unitOption.unit}>
                  {unitOption.label} - LKR {unitOption.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block">Quantity:</label>
          <div className="flex items-center gap-2">
            <button onClick={handleDecrease} disabled={currentQuantity <= 1} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center bg-gray-50 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{currentQuantity}</p>
              <p className="text-xs text-muted-foreground">{currentUnit}</p>
            </div>
            <button onClick={handleIncrease} className="p-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onMessageFarmer} className="px-3 py-2 border border-primary text-primary rounded-lg hover:bg-green-50 transition-colors" title="Message Farmer">
            <MessageCircle className="w-5 h-5" />
          </button>
          {!inCart ? (
            <button onClick={handleAddToCart} className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium bg-primary text-white hover:bg-green-700 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          ) : (
            <div className="flex-1 flex gap-2">
              <button onClick={() => onRemoveFromCart(product.id)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex items-center justify-center px-3 bg-green-50 text-primary rounded-lg border border-green-200">
                <Check className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
