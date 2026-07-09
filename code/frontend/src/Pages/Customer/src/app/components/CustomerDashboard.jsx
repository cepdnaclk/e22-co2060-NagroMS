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
  Trash2,
  Plus,
  Minus,
  Check,
  FileText,
  MessageCircle,
  Send,
  ChevronDown,
  PlusCircle,
  Settings,
  AlertCircle
} 
from 'lucide-react';

import { auth, db } from '../../../../../utils/firebase.js';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import '../../styles/index.css';
import { 
  loadCustomerProfile,
  saveCustomerProfile,
  saveCart, 
  loadCart,
  subscribeToProducts,
  subscribeToCustomerOrders,
  loadFollowedFarmers,
  createProductRequest,
  subscribeToCustomerRequests
} from '../services/firestoreService';

import { useLanguage } from '../../../../../i18n/LanguageContext';

import { ImageWithFallback } from './figma/ImageWithFallback';
// RoleSwitcher import removed as it is no longer used
import { NotificationCenter } from './NotificationCenter';
import { EnhancedCheckoutSection } from './EnhancedCheckout';
import { EnhancedOrdersSection } from './EnhancedOrders';
import CommunityNetwork from '../../../../../components/Network/CommunityNetwork';



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



export function CustomerDashboard({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // ├ö├╢├ç├ö├╢├ç CART: start empty, loaded from Firestore ├ö├╢├ç├ö├╢├ç
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [activeSection, setActiveSection] = useState('browse');
  const { lang, setLang, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRequestProductModal, setShowRequestProductModal] = useState(false);
  const [showMessageFarmerModal, setShowMessageFarmerModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  // ├ö├╢├ç├ö├╢├ç FIREBASE STATE ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [firestoreOrders, setFirestoreOrders] = useState([]);

  // ├ö├╢├ç├ö├╢├ç PROFILE: default values, overwritten by Firestore ├ö├╢├ç├ö├╢├ç
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

  // ├ö├╢├ç├ö├╢├ç LOAD DATA FROM FIREBASE ON LOGIN ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
  useEffect(() => {
    console.log("CustomerDashboard useEffect mounted, calling onAuthStateChanged...");
    let unsubProducts;
    let unsubOrders;
    
    // Safety timeout: force loading to false after 3 seconds no matter what
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Safety timeout triggered: Forcing loading to false.");
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged fired! User:", user ? user.uid : "null");
      try {
        if (user) {
          setUid(user.uid);

          console.log("Loading profile...");
          const firestoreProfile = await loadCustomerProfile(user.uid);
          if (firestoreProfile) setProfile(firestoreProfile);

          console.log("Loading cart...");
          try {
            const savedCart = await loadCart(user.uid);
            if (savedCart && savedCart.length > 0) setCart(savedCart);
          } catch (e) {
            console.error("Error loading cart:", e);
          } finally {
            setCartLoaded(true);
          }

          console.log("Subscribing to products...");
          unsubProducts = subscribeToProducts((realtimeProducts) => {
            if (realtimeProducts) setProducts(realtimeProducts);
          });

          console.log("Subscribing to orders...");
          unsubOrders = subscribeToCustomerOrders(user.uid, (realtimeOrders) => {
            if (realtimeOrders) setFirestoreOrders(realtimeOrders);
          });
          
          console.log("Finished loading data!");
        }
      } catch (err) {
        console.error("Error during data loading:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ├ö├╢├ç├ö├╢├ç AUTO-SAVE CART TO FIRESTORE WHEN IT CHANGES ├ö├╢├ç├ö├╢├ç
  useEffect(() => {
    if (uid && cartLoaded) {
      saveCart(uid, cart);
    }
  }, [cart, uid, cartLoaded]);

  // ├ö├╢├ç├ö├╢├ç DEMO NOTIFICATIONS ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
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

  // ├ö├╢├ç├ö├╢├ç SHOW LOADING SCREEN WHILE FIREBASE LOADS ├ö├╢├ç├ö├╢├ç
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

  // Use Firestore orders (realtime)
  const ordersToShow = firestoreOrders;

  const uniqueLocations = ['all', ...new Set(products.map(p => p.location))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || product.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  console.log("CustomerDashboard Render - Products loaded:", products.length, "Filtered:", filteredProducts.length);

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
      let price = Number(product.price || 0);
      if (product.availableUnits && item.unit) {
        const unitInfo = product.availableUnits.find(u => u.unit === item.unit);
        if (unitInfo) price = Number(unitInfo.price || 0);
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

  // ├ö├╢├ç├ö├╢├ç SAVE PROFILE TO FIRESTORE ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
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
          setProfile={handleSaveProfile}  // ├ö├Ñ├ë saves to Firestore
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
          uid={uid}                        // ├ö├Ñ├ë Firebase uid for saving orders
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
      case 'community':
        return <CommunityNetwork currentUserRole="customer" products={products} currentUserId={uid} />;
      case 'requests':
        return <CustomerRequestsSection uid={uid} />;
      case 'settings':
        return <CustomerSettingsSection uid={uid} />;
      default:
        return null;
    }
  };

  return (
    <div className="farmer-dashboard-container" style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className="farmer-sidebar" 
        style={{ 
          width: '260px', 
          backgroundColor: 'var(--sidebar)', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          position: isSidebarOpen ? 'relative' : 'absolute',
          height: '100%',
          zIndex: 40
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', color: 'var(--sidebar)', padding: '8px', borderRadius: '50%' }}>
              <Sprout size={24} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>NagroMS</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <SidebarButton icon={<Home size={20} />} label={t('customer.sidebar.browse') || "Browse Products"} active={activeSection === 'browse'} onClick={() => setActiveSection('browse')} />
          <SidebarButton icon={<ShoppingCart size={20} />} label={t('customer.sidebar.cart') || "My Cart"} active={activeSection === 'cart'} onClick={() => setActiveSection('cart')} badge={getCartItemsCount()} />
          <SidebarButton icon={<FileText size={20} />} label={t('customer.sidebar.orders') || "Order History"} active={activeSection === 'orders'} onClick={() => setActiveSection('orders')} />
          <SidebarButton icon={<FileText size={20} />} label={t('customer.sidebar.requests') || "Product Requests"} active={activeSection === 'requests'} onClick={() => setActiveSection('requests')} />
          <SidebarButton icon={<UserCircle size={20} />} label={t('customer.sidebar.profile') || "My Profile"} active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
          <SidebarButton icon={<User size={20} />} label={t('customer.sidebar.community') || "Community"} active={activeSection === 'community'} onClick={() => setActiveSection('community')} />
        </nav>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarButton
            icon={<Settings size={20} />}
            label={t('customer.sidebar.settings') || "Settings"}
            active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          />
          <SidebarButton
            icon={<LogOut size={20} />}
            label={t('customer.sidebar.logout') || "Logout"}
            active={false}
            onClick={() => onNavigate('landing')}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="farmer-main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px', paddingTop: !isSidebarOpen ? '64px' : '32px', transition: 'padding 0.3s' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          
          {/* Top Header Matching Farmer Dashboard */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0, textTransform: 'capitalize' }}>
              {activeSection === 'browse' ? (t('customer.browse.title') || 'Marketplace') : (t(`customer.sidebar.${activeSection}`) || activeSection)}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Language Selector */}
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="en">English</option>
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
              </select>

              {/* Active Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)' }}></div>
                <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>{t('customer.header.activeCustomer') || "Active Customer"}</span>
              </div>

              {/* Role Switcher Removed as per user request */}
              
              <button 
                onClick={() => setActiveSection('cart')} 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="View Cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {getCartItemsCount() > 0 && (
                  <span 
                    className="absolute w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    style={{ top: '-4px', right: '-4px' }}
                  >
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              <NotificationCenter />
            </div>
          </div>

          <div style={{ paddingTop: '16px' }}>
             {renderContent()}
          </div>
        </div>
      </div>

      {showRequestProductModal && (
        <RequestProductModal uid={uid} customerName={profile.name} onClose={() => setShowRequestProductModal(false)} />
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

// ΓöÇΓöÇΓöÇ SIDEBAR BUTTON ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function SidebarButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 16px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: active ? 600 : 400,
        textAlign: 'left'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = 'white';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '15px' }}>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}



// ├ö├╢├ç├ö├╢├ç├ö├╢├ç BROWSE PRODUCTS ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
function BrowseProducts({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, selectedLocation, setSelectedLocation, uniqueLocations, filteredProducts, cart, addToCart, updateQuantity, changeUnit, removeFromCart, onMessageFarmer, onRequestProduct }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 text-white mb-6 animate-fadeIn" style={{ background: 'var(--theme-browse-gradient)' }}>
        <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
          <Sprout className="w-8 h-8" /> {t('customer.browse.title') || "Marketplace"}
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>{t('customer.browse.subtitle') || "Fresh products directly from local farmers"}</p>
      </div>

      <div className="mb-6">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-green-100 p-6 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 border-r pr-4 border-gray-200">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground m-0">{t('customer.browse.filters') || "Filters"}</h3>
            </div>
            
            <div className="flex flex-1 items-center gap-4 w-full">
              {/* Category */}
              <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <CategoryButton label={t('customer.categories.all') || "All"} active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                <CategoryButton label={t('customer.categories.vegetables') || "Vegetables"} active={selectedCategory === 'vegetables'} onClick={() => setSelectedCategory('vegetables')} />
                <CategoryButton label={t('customer.categories.fruits') || "Fruits"} active={selectedCategory === 'fruits'} onClick={() => setSelectedCategory('fruits')} />
                <CategoryButton label={t('customer.categories.grains') || "Grains"} active={selectedCategory === 'grains'} onClick={() => setSelectedCategory('grains')} />
              </div>

              {/* Search integrated into Filters */}
              <div className="relative w-64 shrink-0 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('customer.browse.searchPlaceholder') || "Search products..."}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-foreground"
                />
              </div>

              {/* Location */}
              <div className="relative w-48 shrink-0">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-foreground appearance-none cursor-pointer"
                >
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? (t('customer.browse.allLocations') || 'All Locations') : location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl text-primary mb-4">{t('customer.browse.availableProducts') || "Available Products"} ({filteredProducts.length})</h3>
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-green-100 mb-6">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl text-foreground mb-2">{t('customer.browse.noProducts') || "No products found"}</h3>
            <p className="text-muted-foreground mb-4">{t('customer.browse.noProductsDesc') || "There are currently no products available. Farmers have not added any yet!"}</p>
          </div>
        )}
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
    </div>
  );
}

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç PROFILE SECTION ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
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
      <div className="rounded-2xl p-8 text-white" style={{ background: 'var(--theme-profile-gradient)' }}>
        <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
          <UserCircle className="w-8 h-8" /> My Profile
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Manage your personal information and delivery address</p>
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

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç CART SECTION ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
function CartSection({ cart, updateQuantity, removeFromCart, getCartTotal, getTotalDeliveryFee, setActiveSection, customerDistrict, products }) {
  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-8 text-white" style={{ background: 'var(--theme-cart-gradient)' }}>
          <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
            <ShoppingCart className="w-8 h-8" /> Shopping Cart
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Review your items and proceed to checkout</p>
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
      <div className="rounded-2xl p-8 text-white" style={{ background: 'var(--theme-cart-gradient)' }}>
        <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
          <ShoppingCart className="w-8 h-8" /> Shopping Cart
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">Cart Items</h2>
        <div className="space-y-4">
          {cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return null;
            const itemDeliveryFee = calculateDeliveryFee(customerDistrict, product.district);
            let itemPrice = Number(product.price || 0);
            if (product.availableUnits && item.unit) {
              const unitInfo = product.availableUnits.find(u => u.unit === item.unit);
              if (unitInfo) itemPrice = Number(unitInfo.price || 0);
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
                    <p className="text-sm text-muted-foreground mb-2">{product.farmer} ├ö├ç├│ {product.location}</p>
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
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç REQUEST PRODUCT MODAL ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
function RequestProductModal({ uid, customerName, onClose }) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [followedFarmers, setFollowedFarmers] = useState([]);
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [selectedFarmerIds, setSelectedFarmerIds] = useState([]); // Array of selected IDs
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchFarmers = async () => {
      if (uid) {
        const farmers = await loadFollowedFarmers(uid);
        setFollowedFarmers(farmers);
      }
    };
    fetchFarmers();
  }, [uid]);

  const handleCheckboxChange = (farmerId) => {
    setSelectedFarmerIds(prev => 
      prev.includes(farmerId) 
        ? prev.filter(id => id !== farmerId) 
        : [...prev, farmerId]
    );
  };

  const handleSubmit = async () => {
    if (!productName.trim() || followedFarmers.length === 0) return;
    setSubmitted(true);

    const targetFarmers = targetType === 'all' 
      ? followedFarmers.map(f => f.id)
      : selectedFarmerIds;

    const targetFarmerNames = targetType === 'all' 
      ? 'All Followed Farmers' 
      : followedFarmers.filter(f => selectedFarmerIds.includes(f.id)).map(f => f.name).join(', ');

    await createProductRequest({
      customerId: uid,
      customerName: customerName || 'Unknown Customer',
      productName,
      description,
      quantity,
      targetFarmers,
      targetFarmerNames,
    });

    setTimeout(() => { onClose(); }, 2000);
  };

  const isSubmitDisabled = !productName.trim() || 
                           followedFarmers.length === 0 || 
                           (targetType === 'specific' && selectedFarmerIds.length === 0);

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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Send Request To:</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="radio" name="targetType" checked={targetType === 'all'} onChange={() => setTargetType('all')} disabled={followedFarmers.length === 0} />
                    All Followed Farmers
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="radio" name="targetType" checked={targetType === 'specific'} onChange={() => setTargetType('specific')} disabled={followedFarmers.length === 0} />
                    Specific Farmers
                  </label>
                </div>
                
                {followedFarmers.length === 0 ? (
                  <p className="text-xs text-red-500 italic mt-2">You aren't following any farmers yet. Follow farmers from the Community tab first!</p>
                ) : targetType === 'specific' ? (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    {followedFarmers.map(f => (
                      <label key={f.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:bg-gray-155 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedFarmerIds.includes(f.id)} 
                          onChange={() => handleCheckboxChange(f.id)} 
                        />
                        <span>{f.name} ({f.district || 'No District'})</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-2">This request will be sent to all {followedFarmers.length} farmers you follow.</p>
                )}
              </div>

              <button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
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

function CustomerRequestsSection({ uid }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToCustomerRequests(uid, (data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  if (loading) {
    return <div className="text-center py-12 text-primary">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 text-white" style={{ background: 'var(--theme-community-gradient)' }}>
        <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
          <FileText className="w-8 h-8" /> Requested Products
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Track the products you've requested from farmers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">Request History</h2>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">You haven't requested any products yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(req => (
              <div key={req.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{req.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Requested on {new Date(req.createdAt).toLocaleDateString()} to: <strong className="text-primary">{req.targetFarmerNames}</strong>
                    </p>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase ${
                      req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      req.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p><strong>Quantity Needed:</strong> {req.quantity || 'N/A'}</p>
                    <p className="mt-1"><strong>Description:</strong> {req.description || 'No description provided.'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Farmer Responses:</h4>
                    {Object.keys(req.responses || {}).length === 0 ? (
                      <p className="text-muted-foreground italic">Waiting for responses...</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(req.responses).map(([farmerId, resp]) => (
                          <div key={farmerId} className="border-t border-gray-200 pt-2 first:border-0 first:pt-0">
                            <p className="flex justify-between">
                              <span className="font-medium text-foreground">{resp.farmerName}:</span>
                              <span className={`font-semibold capitalize ${
                                resp.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                              }`}>{resp.status}</span>
                            </p>
                            {resp.message && <p className="text-xs text-gray-500 italic mt-0.5">"{resp.message}"</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç MESSAGE FARMER MODAL ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
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

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç CATEGORY BUTTON ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
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

// ├ö├╢├ç├ö├╢├ç├ö├╢├ç PRODUCT CARD ├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç├ö├╢├ç
function ProductCard({ product, onAddToCart, onMessageFarmer, inCart, cart, onUpdateQuantity, onChangeUnit, onRemoveFromCart }) {
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 1;
  const selectedUnit = cartItem ? cartItem.unit : product.unit;
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempUnit, setTempUnit] = useState(product.unit);

  const getCurrentPrice = () => {
    const currentUnit = inCart ? selectedUnit : tempUnit;
    if (!product.availableUnits) return Number(product.price || 0).toFixed(2);
    const unitInfo = product.availableUnits.find(u => u.unit === currentUnit);
    return unitInfo ? Number(unitInfo.price || 0).toFixed(2) : Number(product.price || 0).toFixed(2);
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
                  {unitOption.label} - LKR {Number(unitOption.price || 0).toFixed(2)}
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

// ─── CUSTOMER SETTINGS SECTION ───
function CustomerSettingsSection({ uid }) {
  const { setLang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  
  const [settings, setSettings] = useState({
    languagePreference: 'en',
    notifications: {
      orderStatusUpdates: true,
      promotions: false,
      communityFeed: true,
      chatbotAlerts: false
    }
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          languagePreference: data.languagePreference || 'en',
          notifications: {
            orderStatusUpdates: true,
            promotions: false,
            communityFeed: true,
            chatbotAlerts: false,
            ...(data.notifications || {})
          }
        });
      }
    });
    return () => unsub();
  }, [uid]);

  const handleLanguageChange = async (newLang) => {
    setLang(newLang);
    setSettings(prev => ({ ...prev, languagePreference: newLang }));
    try {
      await updateDoc(doc(db, 'users', uid), {
        languagePreference: newLang
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotifChange = async (key, checked) => {
    const updatedNotifs = { ...settings.notifications, [key]: checked };
    setSettings(prev => ({ ...prev, notifications: updatedNotifs }));
    try {
      await updateDoc(doc(db, 'users', uid), {
        notifications: updatedNotifs
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      setMsg({ type: 'error', text: 'Please enter your current password for security verification.' });
      return;
    }
    if (!passwords.newPassword || !passwords.confirmPassword) {
      setMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (user) {
        // Reauthenticate the user first before updating the password
        const credential = EmailAuthProvider.credential(user.email, passwords.currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        await updatePassword(user, passwords.newPassword);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsPasswordEditable(false);
        setMsg({ type: 'success', text: 'Password updated successfully!' });
      } else {
        throw new Error('No authenticated user found.');
      }
    } catch (error) {
      console.error('Password update failed:', error);
      let errMsg = 'Failed to update password.';
      if (error.code === 'auth/wrong-password') {
        errMsg = 'Incorrect current password.';
      } else if (error.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters.';
      } else {
        errMsg = error.message || errMsg;
      }
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() === '1234') { // Mock verification logic matching farmer's verification OTP
      setIsPasswordEditable(true);
      setShowOtpModal(false);
      setOtpInput('');
      setMsg({ type: 'success', text: 'OTP verification successful. You can now edit your password.' });
    } else {
      alert('Invalid OTP. Please enter the verification code 1234.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 text-white animate-fadeIn" style={{ background: 'var(--theme-profile-gradient)' }}>
        <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: '#ffffff', margin: 0 }}>
          <Settings className="w-8 h-8" /> Settings
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>Manage your preferences and security settings</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl border ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Language Preferences Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <h2 className="text-xl text-primary font-bold mb-4">🌐 Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Language Preference</label>
              <select
                value={settings.languagePreference}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="en">English</option>
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Preference Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <h2 className="text-xl text-primary font-bold mb-4">🔔 Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { key: 'orderStatusUpdates', label: 'Order Status Updates' },
              { key: 'promotions', label: 'Promotions and Special Deals' },
              { key: 'communityFeed', label: 'Community Feed Activity Alerts' },
              { key: 'chatbotAlerts', label: 'Smart Assistant Notifications' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => handleNotifChange(item.key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Security / Password Change Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-primary font-bold">🔒 Security & Password</h2>
            {!isPasswordEditable && (
              <button
                type="button"
                onClick={() => setShowOtpModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {isPasswordEditable ? (
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Password *</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Your current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password *</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Retype new password"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordEditable(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Click the change password button to set up a new password for your account security.</p>
          )}
        </div>

        {/* Account Deactivation Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-primary font-bold">
              🚨 Account Deactivation
            </h2>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-5">
                Deleting your account is <span className="font-semibold text-red-600">permanent</span> and cannot be undone.
                All your order history, connections, requests, and personal data will be
                permanently removed from our database.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-primary mb-2">Security Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">We\'ve sent a mock verification code. Please enter <strong>1234</strong> to authenticate password changes.</p>
            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl font-bold tracking-widest text-foreground mb-4"
              placeholder="••••"
            />
            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Verify Code
              </button>
              <button
                onClick={() => { setShowOtpModal(false); setOtpInput(''); }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Warning Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. Account deletion will be handled later with backend security protocols.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { alert('Account deletion will be processed later.'); setShowDeleteModal(false); }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
