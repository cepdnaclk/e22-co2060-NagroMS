import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tractor,
  CloudRain,
  Package,
  MessageCircle,
  Menu,
  X,
  Sprout,
  Sun,
  Droplets,
  Wind,
  TrendingUp,
  Calendar,
  LogOut,
  Phone,
  Users,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Mail,
  MapPin,
  Settings,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  CreditCard,
  Bot,
  Sparkles
} from 'lucide-react';
import { RoleSwitcher } from "../RoleSwitcher.jsx";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./InputOTP";
import './farmerDashboard.css';
import {
  fetchFarmerProfile,
  fetchProducts as apiFetchProducts,
  fetchOrders as apiFetchOrders,
  fetchSales as apiFetchSales,
  addProduct as apiAddProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  fetchEquipment as apiFetchEquipment,
  addEquipment as apiAddEquipment,
  updateEquipment as apiUpdateEquipment,
  deleteEquipment as apiDeleteEquipment,
  fetchInventory as apiFetchInventory,
  addInventory as apiAddInventory,
  updateInventory as apiUpdateInventory,
  deleteInventory as apiDeleteInventory,
} from '../../services/farmerApi';




import tomatoImg from "./images/products/tomato.png";
import riceImg from "./images/products/rice.png";
import beansImg from "./images/products/beans.jpg";
import carrotsImg from "./images/products/carrots.png";
import cornImg from "./images/products/corn.png";
import cucumberImg from "./images/products/cucumber.png";
import tractorImg from "./images/products/tractor.png";
import cultivatorImg from "./images/products/cultivator.png";
import harvestorImg from "./images/products/harvestor.png";
import seederImg from "./images/products/seeder.png";
import sprayerImg from "./images/products/sprayer.png";
import fertilizerImg from "./images/products/fertilizer.png";
import pesticideImg from "./images/products/pesticide.png";
import riceSeedsImg from "./images/products/riceseeds.png";
import dieselImg from "./images/products/diesel.png";
import storageBagImg from "./images/products/storagebag.png";
import handtoolImg from "./images/products/handtool.png";
import irrigationPumpImg from "./images/products/irrigation pump.png";
import hnbImg from "./images/products/HNB.png";
import bocImg from "./images/products/boc.png";
import peoplesImg from "./images/products/peoples.png";
import commercialImg from "./images/products/commercial.png";


import sampathImg from "./images/products/sampath.png";
import nsbImg from "./images/products/nsb.png";

import dashboardIcon from "./images/products/dashboard.png";
import moneyIcon from "./images/products/money.png";
import weatherIcon from "./images/products/weather.png";
import chatbotIcon from "./images/products/chatbot.png";
import settingsIcon from "./images/products/settings.png";
import trendingUpIcon from "./images/products/money.png";

export const getImageForName = (name) => {
  if (!name) return undefined;
  const n = name.toLowerCase();

  // Products
  if (n.includes('tomato')) return tomatoImg;
  if (n.includes('rice')) return riceImg;
  if (n.includes('bean')) return beansImg;
  if (n.includes('carrot')) return carrotsImg;
  if (n.includes('corn')) return cornImg;
  if (n.includes('cucumber')) return cucumberImg;

  // Equipment
  if (n.includes('tractor')) return tractorImg;
  if (n.includes('cultivator')) return cultivatorImg;
  if (n.includes('harvest')) return harvestorImg;
  if (n.includes('seed')) return seederImg;
  if (n.includes('spray')) return sprayerImg;
  if (n.includes('pump')) return irrigationPumpImg;

  // Inventory
  if (n.includes('fertilizer')) return fertilizerImg;
  if (n.includes('pesticid')) return pesticideImg;
  if (n.includes('diesel')) return dieselImg;
  if (n.includes('bag')) return storageBagImg;
  if (n.includes('tool')) return handtoolImg;
  if (n.includes('seed')) return riceSeedsImg;

  return undefined;
};
export function FarmerDashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Farmer');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '');
  const [userLocation, setUserLocation] = useState(localStorage.getItem('userLocation') || 'Anuradhapura');
  const [userNIC, setUserNIC] = useState(localStorage.getItem('userNIC') || '');
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture') || '👨‍🌾');
  const [loading, setLoading] = useState(true);

  // Fetch live data from backend on mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch profile
        const profileRes = await fetchFarmerProfile();
        if (profileRes.success && profileRes.data) {
          const p = profileRes.data;
          if (p.fullName)  { setUserName(p.fullName); localStorage.setItem('userName', p.fullName); }
          if (p.email)     { setUserEmail(p.email);   localStorage.setItem('userEmail', p.email); }
          if (p.phone)     { setUserPhone(p.phone);   localStorage.setItem('userPhone', p.phone); }
          if (p.district)  { setUserLocation(p.district); localStorage.setItem('userLocation', p.district); }
          if (p.nic)       { setUserNIC(p.nic);       localStorage.setItem('userNIC', p.nic); }
        }
        // Fetch products
        const productsRes = await apiFetchProducts();
        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
        }
        // Fetch orders
        const ordersRes = await apiFetchOrders();
        if (ordersRes.success && ordersRes.data && ordersRes.data.length > 0) {
          setOrders(ordersRes.data);
        }
        // Fetch sales
        const salesRes = await apiFetchSales();
        if (salesRes.success && salesRes.data && salesRes.data.length > 0) {
          setSales(salesRes.data);
        }

        // Fetch equipment
        const eqRes = await apiFetchEquipment();
        if (eqRes.success && eqRes.data && eqRes.data.length > 0) {
          setMyEquipment(eqRes.data);
        }

        // Fetch inventory
        const invRes = await apiFetchInventory();
        if (invRes.success && invRes.data && invRes.data.length > 0) {
          setInventory(invRes.data);
        }
      } catch (err) {
        console.warn('Backend not available, using demo data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // State for products
  const [products, setProducts] = useState([]);

  // State for equipment (farmer's own equipment for rent)
  const [myEquipment, setMyEquipment] = useState([]);

  // State for rented equipment from others
  const [rentedEquipment, setRentedEquipment] = useState([]);

  // State for rental income (money earned from renting out equipment)
  const [rentalIncome, setRentalIncome] = useState([]);

  // State for rental expenses (money spent renting equipment from others)
  const [rentalExpenses, setRentalExpenses] = useState([]);

  const [sales, setSales] = useState([]);

  // Sample data for NEW SalesContent structure
  const [customerPurchases] = useState([]);

  const [equipmentRentals] = useState([]);

  // State for orders
  const [orders, setOrders] = useState([]);

  // State for inventory
  const [inventory, setInventory] = useState([]);

  // State for available loans from banks
  const [availableLoans] = useState([
    {
      id: 1,
      bankName: 'Bank of Ceylon',
      bankLogo: bocImg,
      loanType: 'Agriculture Loan',
      amount: '500,000 - 5,000,000',
      interestRate: '8.5%',
      duration: '1-5 years',
      requirements: ['Land ownership proof', 'NIC', 'Income certificate'],
      phone: '011-244-6000',
      description: 'Low interest loan for farming activities'
    },
    {
      id: 2,
      bankName: 'People\'s Bank',
      bankLogo: peoplesImg,
      loanType: 'Crop Production Loan',
      amount: '100,000 - 2,000,000',
      interestRate: '7.5%',
      duration: '6 months - 2 years',
      requirements: ['Farmer registration', 'NIC', 'Guarantor'],
      phone: '011-221-3010',
      description: 'Special loan for crop cultivation'
    },
    {
      id: 3,
      bankName: 'Sampath Bank',
      bankLogo: sampathImg,
      loanType: 'Equipment Purchase Loan',
      amount: '1,000,000 - 10,000,000',
      interestRate: '9.0%',
      duration: '2-7 years',
      requirements: ['Business plan', 'NIC', 'Asset proof'],
      phone: '011-230-0260',
      description: 'Buy tractors and farming equipment'
    },
    {
      id: 4,
      bankName: 'Commercial Bank',
      bankLogo: commercialImg,
      loanType: 'Agro Micro Finance',
      amount: '50,000 - 500,000',
      interestRate: '10.0%',
      duration: '3 months - 1 year',
      requirements: ['NIC', 'Address proof'],
      phone: '011-523-5000',
      description: 'Quick small loans for immediate needs'
    },
    {
      id: 5,
      bankName: 'Hatton National Bank',
      bankLogo: hnbImg,
      loanType: 'Livestock Development Loan',
      amount: '300,000 - 3,000,000',
      interestRate: '8.0%',
      duration: '1-4 years',
      requirements: ['Veterinary certificate', 'NIC', 'Land proof'],
      phone: '011-266-0000',
      description: 'Special loan for livestock farming'
    },
    {
      id: 6,
      bankName: 'National Savings Bank',
      bankLogo: nsbImg,
      loanType: 'Organic Farming Loan',
      amount: '200,000 - 1,500,000',
      interestRate: '7.0%',
      duration: '1-3 years',
      requirements: ['Organic certification', 'NIC', 'Land documents'],
      phone: '011-244-2000',
      description: 'Lower rates for organic farmers'
    }
  ]);

  // State for active loans (loans farmer has taken)
  const [activeLoans] = useState([
    {
      id: 1,
      bankName: 'Bank of Ceylon',
      bankLogo: bocImg,
      loanType: 'Agriculture Loan',
      amount: 2000000,
      borrowed: 2000000,
      paid: 800000,
      remaining: 1200000,
      interestRate: '8.5%',
      monthlyPayment: 50000,
      nextPayment: '2026-03-05',
      startDate: '2025-06-01',
      endDate: '2028-06-01',
      status: 'Active'
    },
    {
      id: 2,
      bankName: 'People\'s Bank',
      bankLogo: peoplesImg,
      loanType: 'Crop Production Loan',
      amount: 500000,
      borrowed: 500000,
      paid: 400000,
      remaining: 100000,
      interestRate: '7.5%',
      monthlyPayment: 25000,
      nextPayment: '2026-03-10',
      startDate: '2025-01-15',
      endDate: '2026-07-15',
      status: 'Active'
    }
  ]);

  // State for modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteInventoryConfirm, setDeleteInventoryConfirm] = useState(null);
  const [deleteEquipmentConfirm, setDeleteEquipmentConfirm] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [rentConfirm, setRentConfirm] = useState(null);
  const [rentQuantity, setRentQuantity] = useState(1);
  const [rentDays, setRentDays] = useState(1);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: '',
    status: 'In Stock'
  });

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    image: tractorImg,
    name: '',
    price: ''
  });

  // New inventory form state
  const [newInventoryItem, setNewInventoryItem] = useState({
    image: storageBagImg,
    name: '',
    quantity: '',
    status: 'In Stock'
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be more than 8 characters');
    }

    const invalidChars = ['<', '>', '{', '}', '[', ']', '|', '\\', '^', '~', '`'];
    const foundInvalidChars = invalidChars.filter(char => password.includes(char));
    if (foundInvalidChars.length > 0) {
      errors.push(`Cannot use: ${foundInvalidChars.join(' ')}`);
    }

    if (!/\d/.test(password)) {
      errors.push('Must have at least one number (0-9)');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Must have at least one letter (a-z)');
    }

    return errors;
  };

  // Handle password change
  const handlePasswordChange = (password) => {
    setNewPassword(password);
    if (password.length > 0) {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  // Handle password update
  const handleUpdatePassword = () => {
    if (!currentPassword) {
      alert('❌ Please enter your current password');
      return;
    }

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      alert('❌ Please fix password errors:\n\n' + errors.join('\n'));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('❌ New passwords do not match');
      return;
    }

    // In real app, verify current password and update
    alert('✅ Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors([]);
  };

  // Handlers for products
  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = async () => {
    try {
      const res = await apiUpdateProduct(editingProduct.id, {
        name:     editingProduct.name,
        quantity: editingProduct.quantity,
        price:    editingProduct.price,
        status:   editingProduct.status,
      });
      if (res.success) {
        setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
      } else {
        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      }
    } catch (err) {
      console.warn('Backend unavailable, updating locally only:', err.message);
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiDeleteProduct(id);
    } catch (err) {
      console.warn('Backend unavailable, deleting locally only:', err.message);
    }
    setProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleAddProduct = async () => {
    // Show alert if fields are empty
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) {
      alert(`Please fill in all fields. Currently -> Name: "${newProduct.name}", Quantity: "${newProduct.quantity}", Price: "${newProduct.price}"`);
      return;
    }

    try {
      const res = await apiAddProduct({
        name:     newProduct.name,
        quantity: newProduct.quantity,
        price:    newProduct.price,
        status:   newProduct.status || 'In Stock',
      });
      if (res.success && res.data) {
        setProducts([...products, res.data]);
        alert('Product added successfully!');
      } else {
        alert('Backend error: ' + (res.message || 'Unknown error. Adding locally.'));
        setProducts([...products, { id: Date.now(), ...newProduct }]);
      }
    } catch (err) {
      alert('Network error. Adding locally. Error: ' + err.message);
      setProducts([...products, { id: Date.now(), ...newProduct }]);
    }
    setNewProduct({ name: '', quantity: '', price: '', status: 'In Stock' });
    setShowAddProduct(false);
  };


  // Handlers for equipment
  const handleDeleteEquipment = async (id) => {
    try {
      await apiDeleteEquipment(id);
    } catch (err) {
      console.warn('Backend unavailable, deleting locally only');
    }
    setMyEquipment(myEquipment.filter(eq => eq.id !== id));
    setDeleteEquipmentConfirm(null);
  };

  const handleAddEquipment = async () => {
    if (newEquipment.name && newEquipment.price) {
      const equipData = { ...newEquipment, available: true };
      try {
        const res = await apiAddEquipment(equipData);
        if (res.success && res.data) {
          setMyEquipment([...myEquipment, res.data]);
        } else {
          setMyEquipment([...myEquipment, { id: Date.now(), ...equipData }]);
        }
      } catch (err) {
        setMyEquipment([...myEquipment, { id: Date.now(), ...equipData }]);
      }
      setNewEquipment({ emoji: '🚜', name: '', price: '' });
      setShowAddEquipment(false);
    }
  };

  const handleRentConfirm = () => {
    if (!rentConfirm) return;
    const rental = {
      id: Date.now(),
      ...rentConfirm,
      quantity: rentQuantity,
      days: rentDays,
      total: rentConfirm.price * rentQuantity * rentDays,
      rentalDate: new Date().toISOString().split('T')[0]
    };
    setRentedEquipment([...rentedEquipment, rental]);
    setRentConfirm(null);
    setRentQuantity(1);
    setRentDays(1);
  };

  // Handlers for inventory
  const handleEditInventory = (item) => {
    setEditingInventory({ ...item });
  };

  const handleSaveInventory = async () => {
    try {
      const res = await apiUpdateInventory(editingInventory.id, editingInventory);
      if (res.success) {
        setInventory(inventory.map(i => i.id === editingInventory.id ? res.data : i));
      } else {
        setInventory(inventory.map(i => i.id === editingInventory.id ? editingInventory : i));
      }
    } catch (err) {
      setInventory(inventory.map(i => i.id === editingInventory.id ? editingInventory : i));
    }
    setEditingInventory(null);
  };

  const handleDeleteInventory = async (id) => {
    try {
      await apiDeleteInventory(id);
    } catch (err) {
      console.warn('Backend unavailable, deleting locally only');
    }
    setInventory(inventory.filter(i => i.id !== id));
    setDeleteInventoryConfirm(null);
  };

  const handleAddInventory = async () => {
    if (newInventoryItem.name && newInventoryItem.quantity) {
      const itemData = { ...newInventoryItem };
      try {
        const res = await apiAddInventory({
          resource: itemData.name,
          amount: itemData.quantity,
          ...itemData
        });
        if (res.success && res.data) {
          setInventory([...inventory, res.data]);
        } else {
          setInventory([...inventory, { id: Date.now(), ...itemData }]);
        }
      } catch (err) {
        setInventory([...inventory, { id: Date.now(), ...itemData }]);
      }
      setNewInventoryItem({ image: storageBagImg, name: '', quantity: '', status: 'In Stock' });
      setShowAddInventory(false);
    }
  };

  // Navigation handler for quick stats
  const handleQuickNavigation = (nav) => {
    setActiveNav(nav);
    setSidebarOpen(false);
  };

  // Render different content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardContent onNavigate={handleQuickNavigation} products={products} rentedEquipment={rentedEquipment} sales={sales} orders={orders} rentalIncome={rentalIncome} rentalExpenses={rentalExpenses} userName={userName} />;
      case 'products':
        return <MyProductsContent
          products={products}
          onAddClick={() => setShowAddProduct(true)}
          onEdit={handleEditProduct}
          onDelete={(id) => setDeleteConfirm(id)}
        />;
      case 'sales':
        return <SalesContent customerPurchases={customerPurchases} equipmentRentals={equipmentRentals} />;
      case 'expenses':
        return <ExpensesContent rentalExpenses={rentalExpenses} />;
      case 'loans':
        return <LoansContent availableLoans={availableLoans} activeLoans={activeLoans} />;
      case 'orders':
        return <OrdersContent orders={orders} />;
      case 'contacts':
        return <ContactsContent />;
      case 'equipment':
        return <EquipmentContent
          myEquipment={myEquipment}
          onAddClick={() => setShowAddEquipment(true)}
          onDeleteEquipment={(id) => setDeleteEquipmentConfirm(id)}
          onRentClick={(eq) => {
            setRentConfirm(eq);
            setRentQuantity(1);
            setRentDays(1);
          }}
        />;
      case 'weather':
        return <WeatherContent userLocation={userLocation} />;
      case 'inventory':
        return <InventoryContent
          inventory={inventory}
          onAddClick={() => setShowAddInventory(true)}
          onEdit={handleEditInventory}
          onDelete={(id) => setDeleteInventoryConfirm(id)}
        />;
      case 'chatbot':
        return <ChatbotContent userLocation={userLocation} />;
      case 'settings':
        return (
          <SettingsContent
            userName={userName}
            userEmail={userEmail}
            userPhone={userPhone}
            userLocation={userLocation}
            userNIC={userNIC}
            setUserName={setUserName}
            setUserEmail={setUserEmail}
            setUserPhone={setUserPhone}
            setUserLocation={setUserLocation}
            setUserNIC={setUserNIC}
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
          />
        );
      default:
        return <DashboardContent onNavigate={handleQuickNavigation} products={products} rentedEquipment={rentedEquipment} sales={sales} orders={orders} rentalIncome={rentalIncome} rentalExpenses={rentalExpenses} />;
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden by default, shows on menu click */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-green-200">
            <div className="bg-primary rounded-lg p-2">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-primary font-semibold">NagroMS</h2>
              <p className="text-xs text-muted-foreground">Farmer Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton
              icon="🏠"
              label="dashboard"
              active={activeNav === 'dashboard'}
              onClick={() => {
                setActiveNav('dashboard');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="🌾"
              label="My Products"
              active={activeNav === 'products'}
              onClick={() => {
                setActiveNav('products');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💰"
              label="Sales & Income"
              active={activeNav === 'sales'}
              onClick={() => {
                setActiveNav('sales');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📉"
              label="Expenses"
              active={activeNav === 'expenses'}
              onClick={() => {
                setActiveNav('expenses');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📦"
              label="Orders"
              active={activeNav === 'orders'}
              onClick={() => {
                setActiveNav('orders');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📞"
              label="Contacts"
              active={activeNav === 'contacts'}
              onClick={() => {
                setActiveNav('contacts');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💳"
              label="Bank Loans"
              active={activeNav === 'loans'}
              onClick={() => {
                setActiveNav('loans');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="🚜"
              label="Equipment"
              active={activeNav === 'equipment'}
              onClick={() => {
                setActiveNav('equipment');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="⛅"
              label="Weather"
              active={activeNav === 'weather'}
              onClick={() => {
                setActiveNav('weather');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="📦"
              label="Inventory"
              active={activeNav === 'inventory'}
              onClick={() => {
                setActiveNav('inventory');
                setSidebarOpen(false);
              }}
            />
            <NavButton
              icon="💬"
              label="Chatbot"
              active={activeNav === 'chatbot'}
              onClick={() => {
                setActiveNav('chatbot');
                setSidebarOpen(false);
              }}
            />
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-green-200">
            <button
              onClick={() => {
                setActiveNav('settings');
                setSidebarOpen(false);
              }}
              className="w-full bg-green-50 rounded-xl p-4 mb-3 hover:bg-green-100 transition-all text-left shadow-sm hover:shadow-md border border-green-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white text-2xl">
                  {profilePicture}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-primary font-bold bg-white/50 px-2 py-1 rounded-lg">
                <img src={settingsIcon} alt="" className="w-4 h-4 object-contain" />
                <span>Settings & Profile</span>
              </div>
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

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Delete Product Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Product?"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => handleDeleteProduct(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Delete Inventory Confirmation Dialog */}
      {deleteInventoryConfirm && (
        <ConfirmDialog
          title="Remove Item?"
          message="Are you sure you want to remove this item from inventory?"
          onConfirm={() => handleDeleteInventory(deleteInventoryConfirm)}
          onCancel={() => setDeleteInventoryConfirm(null)}
        />
      )}

      {/* Delete Equipment Confirmation Dialog */}
      {deleteEquipmentConfirm && (
        <ConfirmDialog
          title="Toggle Equipment Status?"
          message="Do you want to change the availability status of this equipment?"
          onConfirm={() => handleDeleteEquipment(deleteEquipmentConfirm)}
          onCancel={() => setDeleteEquipmentConfirm(null)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onChange={(field, value) => setEditingProduct({ ...editingProduct, [field]: value })}
          onSave={handleSaveProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* Edit Inventory Modal */}
      {editingInventory && (
        <EditInventoryModal
          item={editingInventory}
          onChange={(field, value) => setEditingInventory({ ...editingInventory, [field]: value })}
          onSave={handleSaveInventory}
          onCancel={() => setEditingInventory(null)}
        />
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          product={newProduct}
          onChange={(field, value) => setNewProduct(prev => ({ ...prev, [field]: value }))}
          onSave={handleAddProduct}
          onCancel={() => setShowAddProduct(false)}
        />
      )}

      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <AddEquipmentModal
          equipment={newEquipment}
          onChange={(field, value) => setNewEquipment(prev => ({ ...prev, [field]: value }))}
          onSave={handleAddEquipment}
          onCancel={() => setShowAddEquipment(false)}
        />
      )}

      {/* Add Inventory Modal */}
      {showAddInventory && (
        <AddInventoryModal
          item={newInventoryItem}
          onChange={(field, value) => setNewInventoryItem({ ...newInventoryItem, [field]: value })}
          onSave={handleAddInventory}
          onCancel={() => setShowAddInventory(false)}
        />
      )}

      {/* Rent Equipment Modal - NEW */}
      {rentConfirm && (
        <RentEquipmentModal
          equipment={rentConfirm}
          quantity={rentQuantity}
          days={rentDays}
          onQuantityChange={setRentQuantity}
          onDaysChange={setRentDays}
          onConfirm={handleRentConfirm}
          onCancel={() => setRentConfirm(null)}
        />
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${active
          ? 'bg-primary text-white'
          : 'bg-white text-gray-700 hover:bg-green-50 hover:text-primary border border-gray-200'
        }
      `}
    >
      {icon && (
        <span className="w-8 h-8 flex items-center justify-center">
          {typeof icon === 'string' && icon.length <= 4 ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <img src={icon} alt="" className="w-8 h-8 object-contain" />
          )}
        </span>
      )}
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

// Dashboard Content
function DashboardContent({ onNavigate, products, rentedEquipment, sales, orders, rentalIncome, rentalExpenses, userName }) {
  const [showMoneyModal, setShowMoneyModal] = useState(null); // 'in', 'out', or null

  // Calculate actual counts
  const productCount = products.length;
  const rentedEquipmentCount = rentedEquipment.length;
  const salesTotal = sales.reduce((total, sale) => total + sale.total, 0);
  const rentalIncomeTotal = rentalIncome.reduce((total, rental) => total + rental.total, 0);
  const rentalExpensesTotal = rentalExpenses.reduce((total, expense) => total + expense.total, 0);
  const totalIncome = salesTotal + rentalIncomeTotal;
  const netProfit = totalIncome - rentalExpensesTotal;
  // Correctly calculate total pending products across all orders
  const pendingOrdersCount = orders.reduce((sum, order) => 
    sum + order.products.filter(p => p.status === 'pending').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Image */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2 flex items-center gap-3">
          Welcome Back, {userName.split(' ')[0]}!
        </h1>
        <p className="text-green-100 text-lg">Your farm is growing well today</p>
      </div>

      {/* Quick Action Cards - Visual */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="My Products"
          subtitle={`${productCount} Items`}
          color="bg-green-100"
          onClick={() => onNavigate('products')}
        />
        <QuickActionCard
          title="Total Income"
          subtitle={`LKR ${totalIncome.toLocaleString()}`}
          color="bg-blue-100"
          onClick={() => onNavigate('sales')}
        />
        <QuickActionCard
          title="Expenses"
          subtitle={`LKR ${rentalExpensesTotal.toLocaleString()}`}
          color="bg-red-100"
          onClick={() => onNavigate('expenses')}
        />
        <QuickActionCard
          title="Orders"
          subtitle={`${pendingOrdersCount} Pending`}
          color="bg-purple-100"
          onClick={() => onNavigate('orders')}
        />
      </div>

      {/* Financial Summary - New Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl text-primary font-bold">Money Summary</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Total Income */}
          <div
            className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-md hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg text-muted-foreground">Money In</h3>
            </div>
            <p className="text-3xl text-green-600 font-bold mb-3">
              +LKR {totalIncome.toLocaleString()}
            </p>
            <div className="space-y-1 border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Product Sales:
                </span>
                <span className="text-foreground font-bold">LKR {salesTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Rental Income:
                </span>
                <span className="text-foreground font-bold">LKR {rentalIncomeTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div
            className="bg-white rounded-xl p-5 border-l-4 border-red-500 shadow-md hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg text-muted-foreground">Money Out</h3>
            </div>
            <p className="text-3xl text-red-600 font-bold mb-3">
              -LKR {rentalExpensesTotal.toLocaleString()}
            </p>
            <div className="space-y-1 border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Equipment Rental:
                </span>
                <span className="text-foreground font-bold">LKR {rentalExpensesTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg text-white font-bold underline">Net Profit Summary</h3>
            </div>
            <p className="text-4xl text-white font-bold mb-3">
              LKR {netProfit.toLocaleString()}
            </p>
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <p className="text-white text-sm">
                {netProfit > 0 ? '✅ Profit!' : '⚠️ Loss'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Product Overview & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Products Overview - Real-time */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl text-primary font-bold">My Products Overview</h2>
          </div>

          {/* Low Stock Alerts */}
          {products.filter(p => parseInt(p.quantity) <= 150).length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
              <p className="text-yellow-900 text-lg font-bold mb-2">
                ⚠️ Low Stock Alert!
              </p>
              {products.filter(p => parseInt(p.quantity) <= 150).map(p => (
                <p key={p.id} className="text-yellow-800 text-md">
                  {p.emoji} {p.name}: Only {p.quantity} kg left (Need {150 - parseInt(p.quantity)} kg more)
                </p>
              ))}
            </div>
          )}

          {/* Product Summary */}
          <div className="space-y-3">
            {products.slice(0, 4).map(product => {
              const qty = parseInt(product.quantity) || 0;
              const stockStatus = qty > 150 ? 'In Stock' : 'Low Stock';

              return (
                <div key={product.id} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{product.emoji}</span>
                    <div>
                      <p className="text-lg text-foreground">{product.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${stockStatus === 'Low Stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {stockStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-foreground font-bold">{product.quantity} kg</p>
                    <p className="text-sm text-primary">LKR {product.price}/kg</p>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length > 4 && (
            <button
              onClick={() => onNavigate('products')}
              className="mt-4 w-full py-2 text-primary hover:bg-green-50 rounded-lg transition-colors"
            >
              View All {products.length} Products →
            </button>
          )}
        </div>

        {/* Recent Sales & Orders - Real-time */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl text-primary font-bold">Recent Activity</h2>
          </div>

          {/* Latest Sales Summary - Visual Card */}
          <div className="mb-8">
            <h3 className="text-lg text-foreground font-bold mb-3">Income Summary</h3>
            <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate('sales')}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-blue-700 font-bold uppercase tracking-wider">Activity: High</p>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl text-blue-900 font-black">
                LKR {totalIncome.toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-blue-100 pt-3">
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">Products</p>
                  <p className="text-sm text-blue-900 font-bold">LKR {salesTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">Rentals</p>
                  <p className="text-sm text-blue-900 font-bold">LKR {rentalIncomeTotal.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-4 font-medium">View full sales & income report →</p>
            </div>
          </div>

          {/* Pending Orders Summary - Visual Card */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg text-foreground font-bold">Pending Orders Summary</h3>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500 hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate('orders')}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-purple-700 font-bold uppercase tracking-wider">Status: Action Required</p>
                <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">Priority</span>
              </div>
              <p className="text-3xl text-purple-900 font-black">
                {pendingOrdersCount} Total Items
              </p>
              <p className="text-sm text-purple-600 mt-1 font-medium">Click to manage all pending customer orders →</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather & Crop Suggestions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weather - Big Visual */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={weatherIcon} alt="" className="w-10 h-10 object-contain" />
            <h2 className="text-2xl text-primary font-bold">Today's Weather</h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <Sun className="w-16 h-16 text-yellow-500" />
              <div>
                <p className="text-4xl text-foreground">28°C</p>
                <p className="text-lg text-muted-foreground">Partly Cloudy</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-white rounded-lg p-3">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto" />
                <p className="text-lg mt-1 font-bold">75%</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3">
                <Wind className="w-6 h-6 text-gray-500 mx-auto" />
                <p className="text-lg mt-1 font-bold">12 km/h</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3">
                <CloudRain className="w-6 h-6 text-blue-400 mx-auto" />
                <p className="text-lg mt-1 font-bold">20%</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-900 text-lg">
              ⚠️ Rain tomorrow - harvest ready crops!
            </p>
          </div>
        </div>

        {/* Crop Suggestions - Visual */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl text-primary font-bold">Best Crops Now</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xl text-foreground font-bold">Paddy Rice</p>
              </div>
              <p className="text-lg text-muted-foreground ml-12">📅 Best: Feb-Apr</p>
              <span className="inline-block mt-2 ml-12 px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                ✅ Recommended
              </span>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xl text-foreground font-bold">Vegetables</p>
              </div>
              <p className="text-lg text-muted-foreground ml-12">📅 Good now</p>
              <span className="inline-block mt-2 ml-12 px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                ✅ Good Season
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Money Detail Modal */}
      {showMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowMoneyModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Money In Details */}
            {showMoneyModal === 'in' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-3xl text-primary font-bold">Money In - Detailed Calculation</h2>
                      <p className="text-muted-foreground">All the money you earned</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMoneyModal(null)}
                    className="text-3xl text-muted-foreground hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Sales Details */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl text-foreground font-bold">Product Sales</h3>
                  </div>

                  <div className="space-y-3">
                    {sales.map((sale) => (
                      <div key={sale.id} className="bg-green-50 rounded-xl p-5 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xl text-foreground font-bold">{sale.product}</p>
                            <p className="text-sm text-muted-foreground">Sold to: {sale.customer}</p>
                          </div>
                          <p className="text-2xl text-green-600 font-bold">LKR {sale.total.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 bg-white rounded-lg p-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <p className="text-lg text-foreground font-bold">{sale.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price Each</p>
                            <p className="text-lg text-foreground font-bold">LKR {sale.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-lg text-foreground font-bold">{sale.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-100 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg text-foreground font-bold">Total Product Sales:</p>
                      <p className="text-2xl text-green-600 font-bold">LKR {salesTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Rental Income Details */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl text-foreground font-bold">Equipment Rental Income</h3>
                  </div>

                  <div className="space-y-3">
                    {rentalIncome.map((rental) => (
                      <div key={rental.id} className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xl text-foreground font-bold">{rental.equipment}</p>
                            <p className="text-sm text-muted-foreground">Rented to: {rental.renter || rental.rentedTo}</p>
                          </div>
                          <p className="text-2xl text-blue-600 font-bold">LKR {rental.total.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 bg-white rounded-lg p-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Days</p>
                            <p className="text-lg text-foreground font-bold">{rental.days}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Rate/Day</p>
                            <p className="text-lg text-foreground font-bold">LKR {rental.pricePerDay.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-lg text-foreground font-bold">{rental.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-100 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg text-foreground font-bold">Total Rental Income:</p>
                      <p className="text-2xl text-blue-600 font-bold">LKR {rentalIncomeTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Final Calculation */}
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6 border-2 border-green-500">
                  <div className="text-center">
                    <p className="text-2xl text-foreground font-bold mb-4 flex items-center justify-center gap-2">
                      Total Money In Calculation
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="text-xl text-foreground flex items-center justify-center gap-2">
                        Product Sales = LKR {salesTotal.toLocaleString()}
                      </p>
                      <p className="text-xl text-foreground flex items-center justify-center gap-2">
                        Rental Income = LKR {rentalIncomeTotal.toLocaleString()}
                      </p>
                      <div className="border-t-2 border-green-500 pt-3 mt-3">
                        <p className="text-3xl text-green-600 font-bold">
                          Total Money In = LKR {totalIncome.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-lg text-foreground">
                        🎉 Great work! You earned a total of <span className="font-bold text-green-600">LKR {totalIncome.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Money Out Details */}
            {showMoneyModal === 'out' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-3xl text-primary font-bold">Money Out - Detailed Calculation</h2>
                      <p className="text-muted-foreground">All your expenses</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMoneyModal(null)}
                    className="text-3xl text-muted-foreground hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>

                {/* Expenses Details */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl text-foreground font-bold">Equipment Rental Expenses</h3>
                  </div>

                  <div className="space-y-3">
                    {rentalExpenses.map((expense) => (
                      <div key={expense.id} className="bg-red-50 rounded-xl p-5 border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xl text-foreground font-bold">{expense.equipment}</p>
                            <p className="text-sm text-muted-foreground">Rented from: {expense.owner || expense.rentedFrom}</p>
                          </div>
                          <p className="text-2xl text-red-600 font-bold">-LKR {expense.total.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 bg-white rounded-lg p-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Days</p>
                            <p className="text-lg text-foreground font-bold">{expense.days}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Rate/Day</p>
                            <p className="text-lg text-foreground font-bold">LKR {expense.pricePerDay.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-lg text-foreground font-bold">{expense.date}</p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-lg p-3">
                          <p className="text-sm text-muted-foreground mb-1">Calculation:</p>
                          <p className="text-lg text-foreground">
                            {expense.days} days × LKR {expense.pricePerDay.toLocaleString()} =
                            <span className="font-bold text-red-600"> LKR {expense.total.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-100 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg text-foreground font-bold">Total Expenses:</p>
                      <p className="text-2xl text-red-600 font-bold">LKR {rentalExpensesTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Final Calculation */}
                <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-6 border-2 border-red-500">
                  <div className="text-center">
                    <p className="text-2xl text-foreground font-bold mb-4">📝 Total Money Out Calculation</p>
                    <div className="space-y-2 mb-4">
                      {rentalExpenses.map((expense) => (
                        <div key={expense.id} className="bg-white rounded-lg p-3">
                          <p className="text-lg text-foreground">
                            {expense.equipment}: {expense.days} days × LKR {expense.pricePerDay.toLocaleString()} =
                            <span className="font-bold text-red-600"> LKR {expense.total.toLocaleString()}</span>
                          </p>
                        </div>
                      ))}
                      <div className="border-t-2 border-red-500 pt-3 mt-3">
                        <p className="text-3xl text-red-600 font-bold">
                          Total Money Out = LKR {rentalExpensesTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-lg text-foreground">
                        💰 You spent <span className="font-bold text-red-600">LKR {rentalExpensesTotal.toLocaleString()}</span> on equipment rentals
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => setShowMoneyModal(null)}
              className="w-full mt-6 bg-primary text-white rounded-xl py-4 text-xl font-bold hover:bg-green-700 transition-colors"
            >
              Close ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// My Products Content - Visual with Images
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
              image={product.image || getImageForName(product.name)}
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




// Sales Content - Customer-based Product & Equipment Sales
export function SalesContent({ customerPurchases = [], equipmentRentals = [] }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedProductCustomer, setSelectedProductCustomer] = useState(null);
  const [selectedRentalCustomer, setSelectedRentalCustomer] = useState(null);
  const [showProductSummaryModal, setShowProductSummaryModal] = useState(false);
  const [showRentalSummaryModal, setShowRentalSummaryModal] = useState(false);

  // Today's date for reference
  const today = new Date('2026-03-13');

  // Filter Helper
  const isWithinTimeRange = (dateStr) => {
    if (timeFilter === 'all') return true;
    const transDate = new Date(dateStr);
    const diffDays = (today - transDate) / (1000 * 60 * 60 * 24);
    if (timeFilter === '1month') return diffDays <= 30;
    if (timeFilter === '3months') return diffDays <= 90;
    return true;
  };

  // Filter Data
  const filteredPurchases = customerPurchases.map(customer => {
    const products = (customer.products || []).filter(p => isWithinTimeRange(p.date));
    return { ...customer, products };
  }).filter(c => c.products.length > 0);

  const filteredRentals = equipmentRentals.map(customer => {
    const rentals = (customer.rentals || []).filter(r => isWithinTimeRange(r.date));
    return { ...customer, rentals };
  }).filter(c => c.rentals.length > 0);

  // Calculate Totals based on Filtered data
  const totalProductRevenue = filteredPurchases.reduce((sum, customer) => {
    const customerTotal = customer.products.reduce((customerSum, product) =>
      customerSum + (product.quantity * product.pricePerUnit), 0);
    return sum + customerTotal;
  }, 0);

  const totalEquipmentRevenue = filteredRentals.reduce((sum, customer) => {
    const customerTotal = customer.rentals.reduce((customerSum, rental) =>
      customerSum + rental.totalCost, 0);
    return sum + customerTotal;
  }, 0);

  const grandTotalRevenue = totalProductRevenue + totalEquipmentRevenue;

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 pb-12">
      {/* Header & Filter Row */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            💰 Income & Sales
          </h1>
          <p className="text-green-100 italic">Detailed calculations by customer</p>
        </div>

        <div className="bg-white/20 p-2 rounded-xl flex items-center gap-3 backdrop-blur-md border border-white/30">
          <span className="text-sm font-bold">Filter By:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white text-gray-800 rounded-lg px-3 py-2 border-none ring-2 ring-transparent focus:ring-green-300 outline-none font-bold"
          >
            <option value="all">📅 All Time (All Records)</option>
            <option value="1month">📅 Last 30 Days (Recent)</option>
            <option value="3months">📅 Last 3 Months (Quarterly)</option>
          </select>
        </div>
      </div>

      {/* Grand Total Summary Section */}
      <div className="bg-white rounded-2xl shadow-xl border-t-8 border-green-500 p-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-bold mb-2 uppercase tracking-widest">
            {timeFilter === 'all' ? 'Total Lifetime Income' : timeFilter === '1month' ? 'Total Last 30 Days Income' : 'Total Last 3 Months Income'}
          </p>
          <p className="text-6xl text-green-600 font-extrabold mb-6 flex items-center justify-center gap-3">
            <span className="text-4xl text-gray-400">LKR</span> {grandTotalRevenue.toLocaleString()}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={() => setShowProductSummaryModal(true)}
              className="bg-green-50 rounded-2xl p-6 border-2 border-green-100 cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2 justify-center">
                <span className="text-3xl">🌾</span>
                <p className="text-muted-foreground font-bold">Product Revenue</p>
              </div>
              <p className="text-3xl text-green-700 font-bold">LKR {totalProductRevenue.toLocaleString()}</p>
            </div>
            <div
              onClick={() => setShowRentalSummaryModal(true)}
              className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2 justify-center">
                <span className="text-3xl">🚜</span>
                <p className="text-muted-foreground font-bold">Equipment Rental Revenue</p>
              </div>
              <p className="text-3xl text-blue-700 font-bold">LKR {totalEquipmentRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sales Breakdown */}
      <div className="space-y-4 mt-24 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 ml-2">
          🌾 Product Sales Summary
        </h2>
        {filteredPurchases.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">No product sales found for this period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((customer) => {
              const customerTotal = customer.products.reduce((sum, p) => sum + (p.quantity * p.pricePerUnit), 0);
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedProductCustomer(customer)}
                  className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                  <div className="bg-green-600 text-white p-5 flex items-center justify-between group-hover:bg-green-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">{customer.icon}</span>
                      <div>
                        <p className="font-bold text-xl leading-tight">{customer.customerName}</p>
                        <p className="text-sm text-green-100">{customer.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <p className="text-sm font-bold flex items-center gap-2">
                        📦 Products Count
                      </p>
                      <p className="text-lg font-black text-gray-800">{customer.products.length}</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                      <p className="text-2xl font-black text-green-700">LKR {customerTotal.toLocaleString()}</p>
                    </div>

                    <button className="w-full bg-green-600 group-hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Equipment Rental Breakdown */}
      <div className="space-y-4 mt-24 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 ml-2">
          🚜 Equipment Rental Summary
        </h2>
        {filteredRentals.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500 italic">No equipment rentals found for this period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map((customer) => {
              const customerTotal = customer.rentals.reduce((sum, r) => sum + r.totalCost, 0);
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedRentalCustomer(customer)}
                  className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                  <div className="bg-orange-600 text-white p-5 flex items-center justify-between group-hover:bg-orange-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">{customer.icon}</span>
                      <div>
                        <p className="font-bold text-xl leading-tight">{customer.customerName}</p>
                        <p className="text-sm text-orange-100">{customer.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <p className="text-sm font-bold flex items-center gap-2">
                        🚜 Rentals Count
                      </p>
                      <p className="text-lg font-black text-gray-800">{customer.rentals.length}</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                      <p className="text-2xl font-black text-orange-700">LKR {customerTotal.toLocaleString()}</p>
                    </div>

                    <button className="w-full bg-green-600 group-hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProductCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-fit max-px-4 max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="bg-green-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">{selectedProductCustomer.icon}</span>
                <div>
                  <h2 className="text-xl font-black">{selectedProductCustomer.customerName}</h2>
                  <p className="text-green-100 text-xs mt-0.5">{selectedProductCustomer.location} • {selectedProductCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductCustomer(null)}
                className="bg-white hover:bg-green-50 p-2 rounded-full transition-all shadow-md group"
              >
                <span className="text-xl font-bold text-green-600">✕</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex justify-center">
              <div className="flex flex-wrap justify-center gap-6">
                {selectedProductCustomer.products.map((product, idx) => {
                  const itemTotal = product.quantity * product.pricePerUnit;
                  return (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-2xl transition-all flex flex-col items-center text-center w-64">
                      <div className="w-28 h-28 bg-white rounded-2xl p-2 mb-3 flex items-center justify-center border-4 border-green-50 shadow-inner group transition-transform hover:scale-105">
                        {product.productImage ? (
                          <img src={product.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">🌾</span>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="font-black text-gray-800 text-base leading-tight">{product.productName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 bg-gray-200/50 px-2 py-0.5 rounded-full">{product.date}</p>
                      </div>

                      <div className="w-full pt-3 border-t-2 border-dashed border-gray-200">
                        <p className="text-[9px] text-green-600 font-extrabold mb-1.5 uppercase tracking-[0.2em]">Calculation</p>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-600 font-medium">
                            <span className="font-black text-gray-900">{product.quantity} kg</span> × LKR {product.pricePerUnit.toLocaleString()}
                          </p>
                          <div className="bg-green-600 text-white rounded-xl py-2 px-3 mt-1 inline-block shadow-lg shadow-green-100">
                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Total Price</p>
                            <p className="text-lg font-black">LKR {itemTotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-green-50 p-6 border-t-2 border-green-100 shrink-0">
              <div className="flex flex-row justify-between items-center gap-4">
                <p className="text-green-800 font-black text-lg">
                  📊 Transaction Grand Total
                </p>
                <p className="text-xl font-black text-green-600 bg-white px-6 py-2 rounded-xl shadow-sm border-2 border-green-100">
                  LKR {selectedProductCustomer.products.reduce((sum, p) => sum + (p.quantity * p.pricePerUnit), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rental Details Modal */}
      {selectedRentalCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-fit max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="bg-orange-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">{selectedRentalCustomer.icon}</span>
                <div>
                  <h2 className="text-xl font-black">{selectedRentalCustomer.customerName}</h2>
                  <p className="text-orange-100 text-xs mt-0.5">{selectedRentalCustomer.location} • {selectedRentalCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRentalCustomer(null)}
                className="bg-white hover:bg-green-50 p-2 rounded-full transition-all shadow-md group"
              >
                <span className="text-xl font-bold text-green-600">✕</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex justify-center">
              <div className="flex flex-wrap justify-center gap-6">
                {selectedRentalCustomer.rentals.map((rental, idx) => {
                  return (
                    <div key={idx} className="bg-orange-50/20 rounded-2xl p-5 border-2 border-orange-100 hover:border-orange-300 hover:bg-white hover:shadow-2xl transition-all flex flex-col items-center text-center w-64">
                      <div className="w-28 h-28 bg-white rounded-2xl p-2 mb-3 flex items-center justify-center border-4 border-orange-50 shadow-inner group transition-transform hover:scale-105">
                        {rental.equipmentImage ? (
                          <img src={rental.equipmentImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">🚜</span>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="font-black text-gray-800 text-base leading-tight">{rental.equipmentName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 bg-orange-100/50 px-2 py-0.5 rounded-full">{rental.date}</p>
                      </div>

                      <div className="w-full pt-3 border-t-2 border-dashed border-orange-200">
                        <p className="text-[9px] text-orange-600 font-extrabold mb-1.5 uppercase tracking-[0.2em]">Rental Breakdown</p>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-600 font-medium">
                            <span className="font-black text-gray-900">{rental.days} days</span> × LKR {rental.costPerDay.toLocaleString()}
                          </p>
                          <div className="bg-orange-600 text-white rounded-xl py-2 px-3 mt-1 inline-block shadow-lg shadow-orange-100">
                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Total Fee</p>
                            <p className="text-lg font-black">LKR {rental.totalCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-orange-50 p-6 border-t-2 border-orange-100 shrink-0">
              <div className="flex flex-row justify-between items-center gap-4">
                <p className="text-orange-800 font-black text-lg">
                  📊 Rental Grand Total
                </p>
                <p className="text-xl font-black text-orange-600 bg-white px-6 py-2 rounded-xl shadow-sm border-2 border-orange-100">
                  LKR {selectedRentalCustomer.rentals.reduce((sum, r) => sum + r.totalCost, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Revenue Summary Modal */}
      {showProductSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-fit min-w-[320px] max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="bg-green-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-white/20 p-2 rounded-xl">🌾</span>
                <h2 className="font-black text-lg">Product Revenue Breakdown</h2>
              </div>
              <button
                onClick={() => setShowProductSummaryModal(false)}
                className="bg-white p-2 rounded-full shadow-md group border-none"
              >
                <span className="text-green-600 font-bold">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {filteredPurchases.map((customer, idx) => {
                const customerTotal = customer.products.reduce((sum, p) => sum + (p.quantity * p.pricePerUnit), 0);
                return (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-700">{customer.customerName}</span>
                    <span className="font-black text-green-600 ml-8">LKR {customerTotal.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-green-50 p-6 border-t-2 border-green-100">
              <div className="flex justify-between items-center text-green-800">
                <span className="font-black">GRAND TOTAL</span>
                <span className="text-2xl font-black ml-8">LKR {totalProductRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Revenue Summary Modal */}
      {showRentalSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-fit min-w-[320px] max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-white/20 p-2 rounded-xl">🚜</span>
                <h2 className="font-black text-lg">Rental Revenue Breakdown</h2>
              </div>
              <button
                onClick={() => setShowRentalSummaryModal(false)}
                className="bg-white p-2 rounded-full shadow-md group border-none"
              >
                <span className="text-blue-600 font-bold">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {filteredRentals.map((customer, idx) => {
                const customerTotal = customer.rentals.reduce((sum, r) => sum + r.totalCost, 0);
                return (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-700">{customer.customerName}</span>
                    <span className="font-black text-blue-600 ml-8">LKR {customerTotal.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 p-6 border-t-2 border-blue-100">
              <div className="flex justify-between items-center text-blue-800">
                <span className="font-black">GRAND TOTAL</span>
                <span className="text-2xl font-black ml-8">LKR {totalEquipmentRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Tips */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">💡</span>
          <h3 className="text-xl text-primary font-bold">Income Tips for Farmers</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p className="text-lg text-foreground">Keep records of every sale - helps you understand your earnings</p>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p className="text-lg text-foreground">Build good relationships with regular customers for steady income</p>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p className="text-lg text-foreground">Diversify income - sell products AND rent equipment when not in use</p>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p className="text-lg text-foreground">Check market prices regularly to set fair and competitive rates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? 'https://via.placeholder.com/400?text=No+Image' : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
function OrdersContent({ orders }) {
  const [ordersList, setOrdersList] = useState(orders);

  // Auto-delete completed orders after 1 day
  useEffect(() => {
    const checkAndCleanOrders = () => {
      const now = new Date();
      setOrdersList(prevOrders => {
        return prevOrders.filter(customer => {
          // Check if all products are completed
          const allCompleted = customer.products.every(p => p.status === 'completed');

          if (allCompleted && customer.completedAt) {
            // Check if 24 hours have passed since completion
            const completedTime = new Date(customer.completedAt);
            const hoursDiff = (now - completedTime) / (1000 * 60 * 60);
            return hoursDiff < 24; // Keep if less than 24 hours
          }

          return true; // Keep if not all completed or no completedAt timestamp
        });
      });
    };

    // Check every minute
    const interval = setInterval(checkAndCleanOrders, 60000);
    checkAndCleanOrders(); // Check immediately on mount

    return () => clearInterval(interval);
  }, []);

  // Toggle order status (pending <-> completed)
  const toggleProductStatus = async (customerId, productId) => {
    // Find the new status first
    const customer = ordersList.find(c => c.id === customerId);
    const product  = customer?.products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === 'pending' ? 'completed' : 'pending';

    // Update UI immediately (optimistic update)
    setOrdersList(ordersList.map(customer => {
      if (customer.id === customerId) {
        const updatedProducts = customer.products.map(p => {
          if (p.id === productId) {
            return { ...p, status: newStatus };
          }
          return p;
        });

        // Check if all products are now completed
        const allCompleted = updatedProducts.every(p => p.status === 'completed');

        return {
          ...customer,
          products: updatedProducts,
          completedAt: allCompleted ? new Date().toISOString() : null
        };
      }
      return customer;
    }));

    // Sync to backend
    try {
      const { updateOrderStatus } = await import('../../services/farmerApi');
      await updateOrderStatus(productId, newStatus);
    } catch (err) {
      console.warn('Backend unavailable, order status updated locally only:', err.message);
    }
  };


  // Calculate statistics
  const totalOrders = ordersList.reduce((sum, customer) => sum + customer.products.length, 0);
  const completedOrders = ordersList.reduce((sum, customer) =>
    sum + customer.products.filter(p => p.status === 'completed').length, 0);
  const pendingOrders = totalOrders - completedOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📦 Customer Orders</h1>
        <p className="text-green-100 text-lg">Manage and track all customer orders with auto-cleanup</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border-l-8 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📋</span>
            <h3 className="text-lg text-muted-foreground font-semibold">Total Orders</h3>
          </div>
          <p className="text-4xl text-blue-600 font-black">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-l-8 border-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✅</span>
            <h3 className="text-lg text-muted-foreground font-semibold">Completed</h3>
          </div>
          <p className="text-4xl text-green-600 font-black">{completedOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-l-8 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⏳</span>
            <h3 className="text-lg text-muted-foreground font-semibold">Pending</h3>
          </div>
          <p className="text-4xl text-yellow-600 font-black">{pendingOrders}</p>
        </div>
      </div>

      <div className="space-y-8">
        {ordersList.map((customer) => {
          const customerPending = customer.products.filter(p => p.status === 'pending').length;
          const customerCompleted = customer.products.filter(p => p.status === 'completed').length;
          const allCompleted = customerPending === 0;

          return (
            <div key={customer.id} className={`bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 ${allCompleted ? 'border-green-400 bg-green-50/30' : 'border-gray-100'}`}>
              {/* Customer Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-inner border border-gray-100">
                    <ImageWithFallback
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.customerName}`}
                      alt={customer.customerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{customer.customerName}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                      <span>📍 {customer.location}</span>
                      <span className="text-primary">📞 {customer.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Order Date</p>
                    <p className="text-lg text-gray-700 font-bold">{customer.orderDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black shadow-sm">
                      ✅ {customerCompleted}
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black shadow-sm">
                      ⏳ {customerPending}
                    </span>
                  </div>
                  {allCompleted && customer.completedAt && (
                    <p className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold animate-pulse">
                      🗑️ Auto-delete in 24hrs
                    </p>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>📦</span> Ordered Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customer.products.map((product) => (
                    <div
                      key={product.id}
                      className={`group flex flex-col rounded-3xl border-2 transition-all duration-500 overflow-hidden ${product.status === 'completed'
                        ? 'bg-green-50/30 border-green-200'
                        : 'bg-white border-gray-100 shadow-md hover:shadow-2xl'
                        }`}
                    >
                      {/* Product Image Container */}
                      <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                        <ImageWithFallback
                          src={product.productImage}
                          alt={product.productName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Optional small status badge on image corner if desired, but we'll put details below */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg backdrop-blur-md ${product.status === 'completed'
                            ? 'bg-green-500/90 text-white'
                            : 'bg-yellow-500/90 text-white'
                            }`}>
                            {product.status === 'completed' ? 'Done' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 text-center space-y-4">
                        <div>
                          <p className={`text-2xl font-black mb-1 ${product.status === 'completed' ? 'text-green-700 line-through opacity-50' : 'text-gray-800'}`}>
                            {product.productName}
                          </p>
                          <p className="text-gray-400 font-bold text-lg">
                            {product.quantity} {product.unit}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => product.status !== 'pending' && toggleProductStatus(customer.id, product.id)}
                            className={`flex-1 py-3 rounded-xl font-black transition-all shadow-sm transform hover:scale-105 ${product.status === 'pending'
                              ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200 ring-4 ring-yellow-50 hover:bg-yellow-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => product.status !== 'completed' && toggleProductStatus(customer.id, product.id)}
                            className={`flex-1 py-3 rounded-xl font-black transition-all shadow-sm transform hover:scale-105 ${product.status === 'completed'
                              ? 'bg-green-600 text-white shadow-green-200 ring-4 ring-green-50 hover:bg-green-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Info */}
              <div className="px-6 py-4 bg-gray-50/50 rounded-b-3xl border-t border-gray-100">
                <p className="text-sm text-gray-400 font-medium text-center italic">
                  Mark all items as "Done" to finalize the order for the customer.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border-2 border-green-100 shadow-inner">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <span className="text-4xl text-primary font-bold">💡</span>
          </div>
          <h3 className="text-2xl text-gray-800 font-black">Pro Tips: Order Management</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { num: "1️⃣", text: "Orders are automatically grouped by customer for easier tracking." },
            { num: "2️⃣", text: "Click the 'Done' button when items are ready for delivery." },
            { num: "3️⃣", text: "Fully completed orders are moved to archive automatically after 24 hours." },
            { num: "4️⃣", text: "Use the customer's phone number to coordinate pickup/delivery 📞" }
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:bg-white transition-colors border border-white">
              <span className="text-3xl shrink-0">{tip.num}</span>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Expenses Content
function ExpensesContent({ rentalExpenses }) {
  const totalExpenses = rentalExpenses.reduce((total, expense) => total + expense.total, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2 flex items-center gap-3">
          <span className="text-4xl">📉</span>
          Farm Expenses
        </h1>
        <p className="text-red-100 text-lg">Track all your spending</p>
      </div>

      {/* Total Expenses Summary */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border-2 border-red-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <span className="text-5xl">💸</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-primary font-black uppercase tracking-tight">
              Total Expenses
            </h2>
            <p className="text-gray-500 font-bold">Money spent this month</p>
            <p className="text-4xl text-red-600 font-black mt-1">
              -LKR {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Rental Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-red-50 p-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🔧</span>
          <h2 className="text-3xl font-black text-gray-800">Equipment Rental</h2>
        </div>

        {rentalExpenses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rentalExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-red-50/50 rounded-3xl border-2 border-transparent hover:border-green-500 hover:bg-white hover:shadow-2xl transition-all duration-300 p-6"
                >
                  {/* Top Row: Image + Details */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* IMAGE */}
                    <div className="md:w-[54%] h-48 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
                      <img
                        src={expense.image || harvestorImg}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="md:w-[46%] flex flex-col justify-between">
                      <div>
                        <p className="text-2xl font-black text-gray-800 mb-1">
                          {expense.equipment}
                        </p>
                        <p className="text-sm text-gray-500 font-bold">
                          Provider: {expense.owner}
                        </p>
                        <p className="text-sm text-gray-400 font-bold mt-1">
                          📅 {expense.date}
                        </p>
                      </div>

                      <div>
                        <p className="text-3xl text-red-600 font-black">
                          -LKR {expense.total.toLocaleString()}
                        </p>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          💸 PAID IN FULL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Calculation */}
                  <div className="bg-white rounded-xl p-4 border border-red-100 mt-6">
                    <p className="text-sm text-gray-500 font-bold mb-1">📊 Calculation</p>
                    <p className="text-gray-600 font-semibold">
                      {expense.days} days × LKR {expense.pricePerDay.toLocaleString()}/day
                    </p>
                    <p className="text-lg text-red-600 font-bold">
                      = LKR {expense.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-6 border-t-2 border-red-500">
              <div className="flex items-center justify-between bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">💰</span>
                  <p className="text-2xl font-bold">Total Spent on Equipment Rental:</p>
                </div>
                <p className="text-4xl text-red-600 font-bold">-LKR {totalExpenses.toLocaleString()}</p>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">📊 Expense Breakdown</h3>
              <div className="space-y-3">
                {rentalExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{expense.equipment}</span>
                    </div>
                    <span className="text-lg text-red-600 font-bold">
                      LKR {expense.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <span className="text-8xl">🎉</span>
            <p className="text-2xl text-foreground mt-4">No expenses yet!</p>
            <p className="text-lg text-muted-foreground">
              You haven't spent money on equipment rentals
            </p>
          </div>
        )}
      </div>

      {/* Money Saving Tips */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">💡</span>
          <h3 className="text-xl font-bold">Money Saving Tips</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p>Buy your own equipment if you rent it often - saves money!</p>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p>Share equipment costs with nearby farmers</p>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <p>Rent equipment during off-season for better prices</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function LoansContent({ availableLoans, activeLoans }) {
  const [showDetailModal, setShowDetailModal] = useState(null);

  const totalBorrowed = activeLoans.reduce((total, loan) => total + loan.borrowed, 0);
  const totalPaid = activeLoans.reduce((total, loan) => total + loan.paid, 0);
  const totalRemaining = activeLoans.reduce((total, loan) => total + loan.remaining, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">💳 Bank Loans</h1>
        <p className="text-blue-100 text-lg">Find loans & manage repayments</p>
      </div>

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">💳</span>
            <div>
              <h2 className="text-2xl text-primary font-bold">My Active Loans</h2>
              <p className="text-muted-foreground">Manage your current repayments and progress</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLoans.map((loan) => {
              const paidPercentage = (loan.paid / loan.borrowed) * 100;
              return (
                <div key={loan.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center">
                  {/* Header Row: Logo & Basic Info Side-by-Side */}
                  <div className="flex items-center gap-4 w-full mb-4">
                    {/* Loan Image */}
                    <div className="w-24 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-200 shrink-0">
                      <img src={loan.bankLogo} alt={loan.bankName} className="w-full h-full object-contain" />
                    </div>

                    {/* Loan Details Text */}
                    <div className="flex-1 text-left">
                      <p className="text-lg text-primary font-bold leading-tight">{loan.loanType}</p>
                      <p className="text-sm text-foreground font-semibold">{loan.bankName}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Interest: {loan.interestRate}</p>
                      <div className="inline-flex mt-1.5 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-200">
                        {loan.status}
                      </div>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="w-full mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Payment Progress</span>
                      <span className="font-bold text-green-600">{paidPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${paidPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-2 gap-2 w-full text-sm text-foreground">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      💵 Borrowed<br />
                      <span className="font-bold">LKR {loan.borrowed.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      ✅ Paid<br />
                      <span className="font-bold text-green-600">LKR {loan.paid.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      ⏰ Remaining<br />
                      <span className="font-bold text-red-600">LKR {loan.remaining.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      📅 Monthly<br />
                      <span className="font-bold text-purple-600">LKR {loan.monthlyPayment.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Next Payment */}
                  <div className="mt-2 w-full bg-orange-50 rounded-lg p-2 text-center text-sm border-l-4 border-orange-500">
                    🔔 Next Payment: {loan.nextPayment}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Loans */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🏦</span>
          <div>
            <h2 className="text-2xl text-primary">Available Bank Loans</h2>
            <p className="text-muted-foreground">Choose the best loan for your farm</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableLoans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center h-full">

              {/* Standardized Image Container */}
              <div className="h-32 flex items-center justify-center mb-1 w-full">
                <div className="w-38 h-24 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-200 transition-all">
                  <img src={loan.image || loan.bankLogo} alt={loan.bankName} className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Standardized Title Area */}
              <div className="text-center h-16 flex flex-col justify-center mb-4">
                <p className="text-lg text-primary font-bold">{loan.loanType}</p>
                <p className="text-sm text-foreground font-semibold">{loan.bankName}</p>
              </div>

              {/* Loan Details - All aligned vertically */}
              <div className="w-full space-y-2 mb-4 text-sm">
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border-l-4 border-blue-500 h-10 items-center overflow-hidden">
                  <span className="whitespace-nowrap">💰 Amount</span>
                  <span className="font-bold text-xs x-sm:text-sm">LKR {loan.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border-l-4 border-green-500 h-10 items-center">
                  <span>📊 Interest</span>
                  <span className="font-bold">{loan.interestRate} %</span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border-l-4 border-purple-500 h-10 items-center">
                  <span>📅 Duration</span>
                  <span className="font-bold">{loan.duration}</span>
                </div>
              </div>

              {/* Requirements Area with fixed min-height for alignment */}
              <div className="w-full bg-gray-50 p-3 rounded-lg mb-4 text-xs flex-1 min-h-[100px]">
                <p className="font-bold mb-1">📋 Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  {loan.requirements.map((req, idx) => (
                    <li key={idx} className="">{req}</li>
                  ))}
                </ul>
              </div>

              {/* Call Button - Pushed to bottom */}
              <a
                href={`tel:${loan.phone}`}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3 text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
              >
                📞 Call Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





// Contacts Content - Service Providers, Customers, Experts
function ContactsContent() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">📞 My Contacts</h1>
        <p className="text-green-100 text-lg">Connect with Service Providers, Customers & Experts</p>
      </div>

      {/* Service Providers */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-xl text-primary">
            <Tractor className="w-8 h-8" />
          </div>
          <h2 className="text-2xl text-primary font-bold">Service Providers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ContactCard
            emoji="🚜"
            name="Rajith Equipment"
            role="Tractor Rental"
            phone="077-123-4567"
            location="Anuradhapura"
          />
          <ContactCard
            emoji="🌱"
            name="Silva Seeds Co."
            role="Seed Supplier"
            phone="071-234-5678"
            location="Kurunegala"
          />
          <ContactCard
            emoji="📦"
            name="Agro Chemicals Ltd"
            role="Pesticides"
            phone="076-345-6789"
            location="Colombo"
          />
          <ContactCard
            emoji="🛠️"
            name="Farm Tools Lanka"
            role="Equipment Repair"
            phone="077-456-7890"
            location="Anuradhapura"
          />
        </div>
      </div>

      {/* Customers */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl text-primary font-bold">Customers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ContactCard
            emoji="🛒"
            name="Perera Stores"
            role="Wholesale Buyer"
            phone="077-567-8901"
            location="Colombo"
          />
          <ContactCard
            emoji="🏪"
            name="Green Market"
            role="Retail Shop"
            phone="071-678-9012"
            location="Kandy"
          />
          <ContactCard
            emoji="🚛"
            name="Fresh Foods Pvt"
            role="Distributor"
            phone="076-789-0123"
            location="Gampaha"
          />
          <ContactCard
            emoji="🥗"
            name="Organic Mart"
            role="Organic Store"
            phone="077-890-1234"
            location="Colombo"
          />
        </div>
      </div>

      {/* Agricultural Experts */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl text-primary font-bold">Agricultural Experts</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ContactCard
            emoji="👨‍🔬"
            name="Dr. Kumara"
            role="Crop Specialist"
            phone="077-111-2222"
            location="Agriculture Dept"
          />
          <ContactCard
            emoji="👩‍🔬"
            name="Ms. Nishani"
            role="Soil Expert"
            phone="071-222-3333"
            location="Research Center"
          />
          <ContactCard
            emoji="👨‍🏫"
            name="Mr. Fernando"
            role="Rice Consultant"
            phone="076-333-4444"
            location="Paddy Institute"
          />
          <ContactCard
            emoji="📋"
            name="Dr. Silva"
            role="Farm Advisor"
            phone="077-444-5555"
            location="Extension Office"
          />
        </div>
      </div>
    </div>
  );
}

function EquipmentContent({ myEquipment, onAddClick, onDeleteEquipment, onRentClick }) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2 flex items-center gap-3">
          <span className="text-4xl">🚜</span>
          My Equipment for Rent
        </h1>
        <p className="text-green-100 text-lg">
          List your equipment to earn extra income
        </p>
      </div>

      {/* Add Equipment Button */}
      <button
        className="w-full lg:w-auto px-8 py-4 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg text-lg flex items-center gap-3"
        onClick={onAddClick}
      >
        <Plus className="w-6 h-6" />
        Add My Equipment
      </button>

      {/* My Equipment */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg text-primary">
            <Tractor className="w-6 h-6" />
          </div>
          <h2 className="text-2xl text-primary font-bold">
            My Equipment List
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEquipment.map(eq => (
            <EquipmentCard
              key={eq.id}
              image={eq.image || getImageForName(eq.name)}
              name={eq.name}
              price={`LKR ${eq.price}/day`}
              available={eq.available}
              onDelete={() => onDeleteEquipment(eq.id)}
            />
          ))}
        </div>
      </div>

      {/* Browse Equipment */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg text-primary">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h2 className="text-2xl text-primary font-bold">
            Browse Other Equipment
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <EquipmentCard
            image={harvestorImg}
            name="Harvester"
            price="LKR 8,000/day"
            available={true}
            owner={{
              name: "Rajith Equipment",
              location: "Anuradhapura",
              phone: "077-123-4567"
            }}
            onRent={() =>
              onRentClick({
                name: "Harvester",
                image: harvestorImg,
                price: 8000,
                owner: { name: "Rajith Equipment", phone: "077-123-4567" }
              })
            }
          />

          <EquipmentCard
            image={cultivatorImg}
            name="Cultivator"
            price="LKR 3,500/day"
            available={true}
            owner={{
              name: "Silva Agro",
              location: "Kurunegala",
              phone: "071-234-5678"
            }}
            onRent={() =>
              onRentClick({
                name: "Cultivator",
                image: cultivatorImg,
                price: 3500,
                owner: { name: "Silva Agro", phone: "071-234-5678" }
              })
            }
          />

          <EquipmentCard
            image={seederImg}
            name="Seeder"
            price="LKR 4,000/day"
            available={true}
            owner={{
              name: "Farm Tools Lanka",
              location: "Anuradhapura",
              phone: "076-345-6789"
            }}
            onRent={() =>
              onRentClick({
                name: "Seeder",
                image: seederImg,
                price: 4000,
                owner: { name: "Farm Tools Lanka", phone: "076-345-6789" }
              })
            }
          />

          <EquipmentCard
            image={irrigationPumpImg}
            name="Irrigation Pump"
            price="LKR 2,000/day"
            available={true}
            owner={{
              name: "Gampaha Agri",
              location: "Gampaha",
              phone: "077-456-7890"
            }}
            onRent={() =>
              onRentClick({
                name: "Irrigation Pump",
                image: irrigationPumpImg,
                price: 2000,
                owner: { name: "Gampaha Agri", phone: "077-456-7890" }
              })
            }
          />

        </div>
      </div>

    </div>
  );
}
// Weather Content
function WeatherContent({ userLocation }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2 flex items-center gap-3">
          <img src={weatherIcon} alt="" className="w-10 h-10 object-contain brightness-0 invert" />
          Weather Forecast
        </h1>
        <p className="text-blue-100 text-lg">7-day weather forecast for your farm</p>
      </div>

      {/* Current Weather - Large */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
        <h2 className="text-2xl text-primary mb-6">Today - {userLocation}</h2>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
          <div className="flex items-center gap-6 mb-6">
            <span className="text-8xl">☀️</span>
            <div>
              <p className="text-6xl text-foreground">28°C</p>
              <p className="text-2xl text-muted-foreground">Partly Cloudy</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-white rounded-lg p-4">
              <Droplets className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-xl mt-2">Humidity</p>
              <p className="text-2xl font-bold">75%</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4">
              <Wind className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-xl mt-2">Wind</p>
              <p className="text-2xl font-bold">12 km/h</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4">
              <CloudRain className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              <p className="text-xl mt-2">Rain</p>
              <p className="text-2xl font-bold">20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-2xl text-yellow-900">Weather Alert</h3>
        </div>
        <p className="text-xl text-yellow-900 ml-12">
          Moderate rain expected tomorrow. Consider harvesting ready crops today!
        </p>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">7-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <WeatherDayCard day="Mon" emoji="☀️" temp="29°C" />
          <WeatherDayCard day="Tue" emoji="☁️" temp="26°C" />
          <WeatherDayCard day="Wed" emoji="⛈️" temp="25°C" />
          <WeatherDayCard day="Thu" emoji="⛅" temp="27°C" />
          <WeatherDayCard day="Fri" emoji="☀️" temp="30°C" />
          <WeatherDayCard day="Sat" emoji="☀️" temp="28°C" />
          <WeatherDayCard day="Sun" emoji="🔥" temp="31°C" />
        </div>
      </div>
    </div>
  );
}

// Inventory Content
function InventoryContent({ inventory, onAddClick, onEdit, onDelete }) {
  const getAutoStatus = (quantityStr) => {
    if (!quantityStr) return 'In Stock';
    const amount = parseFloat(quantityStr.replace(/,/g, '')) || 0;
    const unit = quantityStr.toLowerCase();

    if (unit.includes('kg')) {
      return amount < 100 ? 'Low Stock' : 'In Stock';
    } else if (unit.includes('pcs')) {
      return amount < 30 ? 'Low Stock' : 'In Stock';
    } else if (unit.includes('l')) {
      return amount < 50 ? 'Low Stock' : 'In Stock';
    }
    return 'In Stock';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2 flex items-center gap-3">
          <img src={storageBagImg} alt="" className="w-10 h-10 object-contain brightness-0 invert" />
          Farm Inventory
        </h1>
        <p className="text-purple-100 text-lg">Track your farm supplies</p>
      </div>

      <button className="w-full lg:w-auto px-8 py-4 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg text-lg flex items-center gap-3" onClick={onAddClick}>
        <Plus className="w-6 h-6" />
        Add New Item
      </button>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => (
          <InventoryCard
            key={item.id}
            image={item.image || getImageForName(item.name || item.resource)}
            name={item.name || item.resource}
            quantity={item.quantity || item.amount}
            status={getAutoStatus(item.quantity)}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Chatbot Content
function ChatbotContent({ userLocation }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', message: `🌾 Hello! I am your NagroMS assistant. How can I help you today?` },
    { sender: 'user', message: 'When is the best time to plant rice?' },
    { sender: 'bot', message: `📅 The best time to plant rice in Sri Lanka is during Yala season (April-September) and Maha season (October-March). Based on your location in ${userLocation}, I recommend starting in early February for Yala season!` }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages(prev => [...prev, { sender: 'user', message: userText }]);
    setInputText('');

    // Simulated reply
    setTimeout(() => {
      let botReply = "That's a great question! I'm here to help with your farm management. Anything else specifically about crops or equipment?";

      const lower = userText.toLowerCase();
      if (lower.includes('price') || lower.includes('sale')) {
        botReply = "You can manage your sales and see current market prices in the 'Sales & Income' section.";
      } else if (lower.includes('weather')) {
        botReply = "The weather for next week looks favorable for spraying pesticides. Check the 'Weather' tab for a detailed 7-day forecast.";
      } else if (lower.includes('loan') || lower.includes('bank')) {
        botReply = "Applying for a loan? You can browse available agricultural loans in the 'Bank Loans' section!";
      }

      setMessages(prev => [...prev, { sender: 'bot', message: botReply }]);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white w-full max-w-2xl shadow-lg">
        <h1 className="text-2xl mb-1 flex items-center gap-2">
          <span>💬</span> Farm Assistant
        </h1>
        <p className="text-green-100 text-sm">Online | Ask me anything</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-green-100 h-[500px] flex flex-col w-full max-w-2xl overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              sender={msg.sender}
              message={msg.message}
            />
          ))}
        </div>
        <div className="p-4 border-t border-green-50 bg-gray-50/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-md"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-md active:scale-95 text-sm">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Settings Content
function SettingsContent({
  userName, userEmail, userPhone, userLocation, userNIC,
  setUserName, setUserEmail, setUserPhone, setUserLocation, setUserNIC,
  profilePicture, setProfilePicture
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Profile state initialized directly from props
  const [profileData, setProfileData] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const parsed = savedProfile ? JSON.parse(savedProfile) : {};

    return {
      name: (userName || '').toString() || 'Farmer',
      email: (userEmail || '').toString() || '',
      phone: (userPhone || '').toString() || '',
      location: (userLocation || '').toString() || 'Anuradhapura',
      nic: (userNIC || '').toString() || '',
      farmSize: (parsed.farmSize || '5').toString()
    };
  });
  const [showPicturePicker, setShowPicturePicker] = useState(false);

  // Password change state with verification
  const [passwordChangeStep, setPasswordChangeStep] = useState(1); // 1: Enter Contact, 2: Enter OTP, 3: New Password
  const [contactMethod, setContactMethod] = useState('email'); // 'email' or 'phone'
  const [contactInfo, setContactInfo] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [sentOTP] = useState('123456'); // Simulated OTP (in real app, comes from server)

  // Profile picture options
  const profilePicOptions = ['👨‍🌾', '👩‍🌾', '🧑‍🌾', '👨', '👩', '🧑', '😊', '🌾', '🌱'];

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      alert('⚠️ Please enter your password');
      return;
    }
    // Here you would verify the password and delete the account
    alert('🗑️ Account deleted successfully');
    setShowDeleteModal(false);
    setDeletePassword('');
    // Redirect to login or home page
  };

  const handleSaveProfile = () => {
    // Validate fields
    if (!profileData.name || !profileData.email || !profileData.phone) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    // Save profile data (in real app, send to backend)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('userName', profileData.name);
    localStorage.setItem('userEmail', profileData.email);
    localStorage.setItem('userPhone', profileData.phone);
    localStorage.setItem('userLocation', profileData.location);
    localStorage.setItem('userNIC', profileData.nic);
    localStorage.setItem('profilePicture', profilePicture);

    // Update parent state directly from profileData
    setUserName(profileData.name);
    setUserEmail(profileData.email);
    setUserPhone(profileData.phone);
    setUserLocation(profileData.location);
    setUserNIC(profileData.nic);

    alert('✅ Profile updated and synced successfully!');
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length <= 8) {
      errors.push('Password must be more than 8 characters');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    const disallowedChars = /[<>{}[\]|\\^~`]/;
    if (disallowedChars.test(password)) {
      errors.push('Password contains disallowed characters');
    }

    return errors;
  };

  // Handle Step 1: Send OTP
  const handleSendOTP = (e) => {
    e.preventDefault();

    if (!contactInfo) {
      alert('⚠️ Please enter your contact information');
      return;
    }

    // Validate format
    if (contactMethod === 'email' && !contactInfo.includes('@')) {
      alert('⚠️ Please enter a valid email address');
      return;
    }

    if (contactMethod === 'phone' && contactInfo.length < 10) {
      alert('⚠️ Please enter a valid phone number');
      return;
    }

    // In real app, send OTP to backend
    alert(`✅ Code sent to your ${contactMethod === 'email' ? 'email' : 'phone'}!\n\nDemo Code: ${sentOTP}`);
    setPasswordChangeStep(2);
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert('⚠️ Please enter the complete 6-digit code');
      return;
    }

    // Verify OTP (in real app, verify with backend)
    if (otp === sentOTP) {
      alert('✅ Code verified successfully!');
      setPasswordChangeStep(3);
    } else {
      alert('❌ Wrong code. Try again.\n\nDemo Code: ' + sentOTP);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();

    // Validate password
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);

    if (errors.length > 0) {
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    // In real app, update password in backend
    alert('✅ Password changed successfully!');
    // Reset all fields
    setPasswordChangeStep(1);
    setContactInfo('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors([]);
  };

  // Handle password input change with real-time validation
  const handlePasswordInputChange = (password) => {
    setNewPassword(password);

    if (password.length > 0) {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">⚙️ Settings</h1>
        <p className="text-green-100 text-lg">Manage your account</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <span className="text-6xl cursor-pointer" onClick={() => setShowPicturePicker(!showPicturePicker)}>{profilePicture}</span>
            <button
              onClick={() => setShowPicturePicker(!showPicturePicker)}
              className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-green-700 transition-colors"
              title="Change picture"
            >
              ✏️
            </button>
          </div>
          <div>
            <h2 className="text-2xl text-primary font-bold">Profile Information</h2>
            <p className="text-muted-foreground">Your personal details</p>
          </div>
        </div>

        {/* Profile Picture Picker */}
        {showPicturePicker && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3 font-semibold">Choose your profile picture:</p>
            <div className="grid grid-cols-5 gap-3">
              {profilePicOptions.map((pic, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setProfilePicture(pic);
                    setShowPicturePicker(false);
                  }}
                  className={`text-5xl p-3 rounded-lg hover:bg-green-100 transition-colors ${profilePicture === pic ? 'bg-green-200 ring-2 ring-primary' : 'bg-white'
                    }`}
                >
                  {pic}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-primary mb-1 block font-bold">👤 Full Name (As registered)</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground bg-white"
            />
          </div>

          <div>
            <label className="text-sm text-primary mb-1 block font-bold">📧 Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground bg-white"
            />
          </div>

          <div>
            <label className="text-sm text-primary mb-1 block font-bold">📱 Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground bg-white"
            />
          </div>

          <div>
            <label className="text-sm text-primary mb-1 block font-bold">🪪 NIC Number</label>
            <input
              type="text"
              value={profileData.nic}
              onChange={(e) => setProfileData({ ...profileData, nic: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground bg-white"
            />
          </div>

          <div>
            <label className="text-sm text-primary mb-1 block font-bold">🏠 Farm Location / District</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground bg-white"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block font-semibold">🌾 Farm Size (acres)</label>
            <input
              type="number"
              value={profileData.farmSize}
              onChange={(e) => setProfileData({ ...profileData, farmSize: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-primary text-white rounded-xl py-4 text-xl font-bold hover:bg-green-700 transition-colors"
          >
            Save Changes ✓
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">🔒</span>
          <div>
            <h2 className="text-2xl text-primary font-bold">Change Password</h2>
            <p className="text-muted-foreground">
              {passwordChangeStep === 1 && 'Verify your identity first'}
              {passwordChangeStep === 2 && 'Enter the code we sent'}
              {passwordChangeStep === 3 && 'Create your new password'}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-3 h-3 rounded-full ${passwordChangeStep >= 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`w-12 h-1 ${passwordChangeStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${passwordChangeStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`w-12 h-1 ${passwordChangeStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${passwordChangeStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        </div>

        {/* Step 1: Enter Contact Information */}
        {passwordChangeStep === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            {/* Contact Method Selection - Same as Login Page */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-3">
                📱 Choose How to Get Code
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod('email');
                    setContactInfo('');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${contactMethod === 'email'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                >
                  <Mail className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod('phone');
                    setContactInfo('');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${contactMethod === 'phone'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                >
                  <Phone className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactMethod('nic');
                    setContactInfo('');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${contactMethod === 'nic'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                >
                  <CreditCard className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">NIC</span>
                </button>
              </div>
            </div>

            {/* Contact Info Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-bold">
                {contactMethod === 'email' ? '📧 Your Email' : contactMethod === 'phone' ? '📱 Your Phone Number' : '🪪 Your NIC Number'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {contactMethod === 'email' ? (
                    <Mail className="w-5 h-5" />
                  ) : contactMethod === 'phone' ? (
                    <Phone className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder={
                    contactMethod === 'email'
                      ? 'farmer@example.com'
                      : contactMethod === 'phone'
                        ? '+94 77 123 4567'
                        : '200012345678'
                  }
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  required
                />
              </div>
            </div>

            {/* Send Code Button */}
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 text-xl font-bold"
            >
              📨 Send Code
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {passwordChangeStep === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                We sent a code to:
              </p>
              <p className="text-foreground font-bold text-lg">{contactInfo}</p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm text-muted-foreground mb-3 text-center font-bold">
                🔢 Enter 6-Digit Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => alert('✅ New code sent!\n\nDemo Code: ' + sentOTP)}
                className="text-primary hover:underline text-sm font-bold"
              >
                Didn't get code? Send again
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPasswordChangeStep(1)}
                className="flex-1 py-4 bg-gray-200 text-foreground rounded-xl hover:bg-gray-300 transition-colors text-lg font-bold"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 text-lg font-bold"
              >
                Verify ✓
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {passwordChangeStep === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Password Requirements Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-foreground mb-2">🔒 Password Rules:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>✓ More than 8 characters</p>
                <p>✓ At least one letter (a-z)</p>
                <p>✓ At least one number (0-9)</p>
                <p>✓ Can use: ! @ # $ % & * ( ) - _ = +</p>
                <p className="font-semibold text-red-600">✗ Cannot use: &lt; &gt; &#123; &#125; [ ] | \ ^ ~ `</p>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-bold">
                🔑 New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordInputChange(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                required
              />
            </div>

            {/* Password Validation Messages */}
            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-red-600 mb-1">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {newPassword.length > 0 && passwordErrors.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold">✅ Password is good!</span>
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-bold">
                🔑 Type Password Again
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type new password again"
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                required
              />
            </div>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <div className={`rounded-lg p-3 ${newPassword === confirmPassword
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
                }`}>
                <div className={`flex items-center gap-2 text-sm font-semibold ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>✅ Passwords match!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>❌ Passwords do not match</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPasswordChangeStep(1);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordErrors([]);
                }}
                className="flex-1 py-4 bg-gray-200 text-foreground rounded-xl hover:bg-gray-300 transition-colors text-lg font-bold"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                disabled={passwordErrors.length > 0}
                className={`flex-1 py-4 rounded-xl transition-colors text-lg font-bold ${passwordErrors.length > 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-green-700 shadow-md'
                  }`}
              >
                ✅ Change Password
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">🔔</span>
          <div>
            <h2 className="text-2xl text-primary font-bold">Notifications</h2>
            <p className="text-muted-foreground">Manage your alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
            <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-green-300 text-primary focus:ring-primary" />
            <div>
              <p className="text-lg text-foreground font-bold">📦 Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when product stock is low</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
            <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-green-300 text-primary focus:ring-primary" />
            <div>
              <p className="text-lg text-foreground font-bold">📅 Order Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified about new orders</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
            <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-green-300 text-primary focus:ring-primary" />
            <div>
              <p className="text-lg text-foreground font-bold">🌦️ Weather Alerts</p>
              <p className="text-sm text-muted-foreground">Get weather warnings for your area</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
            <input type="checkbox" className="w-6 h-6 rounded border-green-300 text-primary focus:ring-primary" />
            <div>
              <p className="text-lg text-foreground font-bold">💰 Payment Reminders</p>
              <p className="text-sm text-muted-foreground">Reminders for loan payments</p>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl shadow-lg border-2 border-red-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">⚠️</span>
          <div>
            <h2 className="text-2xl text-red-600 font-bold">Danger Zone</h2>
            <p className="text-muted-foreground">Irreversible actions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-2 border-red-200">
            <p className="text-lg text-foreground font-bold mb-2">🗑️ Delete Account</p>
            <p className="text-sm text-muted-foreground mb-3">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Forgot your password?{' '}
                <a href="#" className="text-primary hover:underline font-semibold">
                  Reset it here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <span className="text-6xl block mb-4">⚠️</span>
              <h2 className="text-2xl text-red-600 font-bold mb-2">Are You Sure?</h2>
              <p className="text-muted-foreground text-lg">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  🔒 Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                />
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-900 font-bold mb-1">⚠️ Warning:</p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>All your products will be deleted</li>
                  <li>Your farm data will be lost</li>
                  <li>All contacts will be removed</li>
                  <li>This cannot be undone!</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                onClick={handleDeleteAccount}
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component Cards
function QuickActionCard({ icon, title, subtitle, color, onClick }) {
  return (
    <div className={`${color} rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {icon && (
        <span className="w-12 h-12 flex items-center justify-center mb-3">
          {typeof icon === 'string' && icon.length <= 4 ? (
            <span className="text-5xl">{icon}</span>
          ) : (
            <img src={icon} alt="" className="w-12 h-12 object-contain" />
          )}
        </span>
      )}
      <p className="text-2xl text-gray-900 mb-1 font-semibold">{subtitle}</p>
      <p className="text-lg text-gray-700">{title}</p>
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
      {image ? (
        <img src={image} alt={name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-green-50 flex items-center justify-center">
          <Sprout className="w-12 h-12 text-primary opacity-20" />
        </div>
      )}

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

function ContactCard({ emoji, name, role, phone, location }) {
  return (
    <div className="bg-green-50 rounded-xl p-5 border border-green-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <span className="text-5xl">{emoji}</span>
        <div className="flex-1">
          <p className="text-xl text-foreground mb-1">{name}</p>
          <p className="text-md text-primary mb-3">{role}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-5 h-5" />
              <a href={`tel:${phone}`} className="text-lg hover:text-primary">{phone}</a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{location}</span>
            </div>
          </div>
        </div>
      </div>
      <a
        href={`tel:${phone}`}
        className="mt-4 w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg block text-center"
      >
        <Phone className="w-5 h-5" />
        Call Now
      </a>
    </div>
  );
}
function EquipmentCard({ image, name, price, available, onDelete, onRent, owner }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">

      {/* Image same size as product */}
      <div className="h-48 w-full bg-gray-50 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">

        <h3 className="text-xl font-semibold text-primary">{name}</h3>

        <p className="text-lg font-bold text-green-700">{price}</p>

        <span
          className={`px-3 py-1 text-sm rounded-full w-fit ${available
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {available ? "Available" : "Not Available"}
        </span>

        {owner && (
          <div className="text-sm text-gray-500">
            <p>{owner.name}</p>
            <p>{owner.location}</p>
            <p>{owner.phone}</p>
          </div>
        )}

        <div className="flex gap-3 mt-2">

          {onRent && (
            <button
              onClick={onRent}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Rent
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
function WeatherDayCard({ day, emoji, temp }) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
      <p className="text-lg text-muted-foreground mb-2">{day}</p>
      <span className="text-4xl block mb-2">{emoji}</span>
      <p className="text-xl text-foreground font-bold">{temp}</p>
    </div>
  );
}

function InventoryCard({ image, name, quantity, status, onEdit, onDelete }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default: // In Stock
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Rectangular Image Header */}
      <div className="w-full h-48 bg-purple-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-purple-600 opacity-20" />
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-2xl text-foreground font-bold mb-2">{name}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusStyles(status)}`}>
            {status}
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-4">Quantity: <span className="text-foreground font-bold">{quantity}</span></p>
        <div className="flex gap-2 pt-4 border-t border-purple-50">
          <button className="flex-1 px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2" onClick={onEdit}>
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

function ChatMessage({ sender, message }) {
  const isBot = sender === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs lg:max-w-md rounded-xl p-4 ${isBot ? 'bg-green-100 text-foreground' : 'bg-primary text-white'
        }`}>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
}
function SaleCard({ product, quantity, price, total, date, customer }) {
  // Extract emoji from product string (e.g., "🍅 Tomatoes" -> "🍅")
  const emoji = product.split(' ')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
      <div className="flex items-center gap-4">
        <span className="text-6xl">{emoji}</span>
        <div className="flex-1">
          <p className="text-xl text-foreground mb-1">{product}</p>
          <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
          <p className="text-sm text-muted-foreground">Price: {price}</p>
          <p className="text-sm text-muted-foreground">Total: {total}</p>
          <p className="text-sm text-muted-foreground">Date: {date}</p>
          <p className="text-sm text-muted-foreground">Customer: {customer}</p>
        </div>
      </div>
    </div>
  );
}

function CustomerPurchaseCard({ customer, items, total }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 flex flex-col hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-green-50">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 leading-tight">{customer}</h3>
          <p className="text-sm text-muted-foreground font-semibold">🛍️ {items.length} Sale{items.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-800 font-bold">{item.product}</span>
              <span className="text-primary font-bold">LKR {item.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.quantity} × LKR {item.price}/kg</span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t-2 border-dashed border-green-200">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Bill</p>
            <p className="text-2xl text-primary font-black">LKR {total.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black uppercase">
            Paid ✓
          </div>
        </div>
      </div>
    </div>
  );
}

function RenterRentalCard({ renter, rentals, total }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 flex flex-col hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-blue-50">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 leading-tight">{renter}</h3>
          <p className="text-sm text-muted-foreground font-semibold">🚜 {rentals.length} Rental{rentals.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {rentals.map((rental, idx) => (
          <div key={idx} className="bg-blue-50/30 p-3 rounded-xl border border-blue-50">
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-800 font-bold">{rental.equipment}</span>
              <span className="text-blue-600 font-bold">LKR {rental.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{rental.days} days × LKR {rental.pricePerDay.toLocaleString()}/day</span>
              <span>{rental.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t-2 border-dashed border-blue-200">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Due</p>
            <p className="text-2xl text-blue-600 font-black">LKR {total.toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-black uppercase">
            Paid ✓
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ product, quantity, customer, phone, status, date }) {
  // Extract emoji from product string (e.g., "🍅 Tomatoes" -> "🍅")
  const emoji = product.split(' ')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4">
      <div className="flex items-center gap-4">
        <span className="text-6xl">{emoji}</span>
        <div className="flex-1">
          <p className="text-xl text-foreground mb-1">{product}</p>
          <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
          <p className="text-sm text-muted-foreground">Customer: {customer}</p>
          <p className="text-sm text-muted-foreground">Phone: {phone}</p>
          <p className="text-sm text-muted-foreground">Status: {status}</p>
          <p className="text-sm text-muted-foreground">Date: {date}</p>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog
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

// Edit Product Modal
function EditProductModal({ product, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-[500px]">
        <h2 className="text-2xl text-primary mb-6">Edit Product</h2>
        <div className="space-y-4">

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name (Read-only)</label>
            <input type="text" value={product.name} readOnly className="w-full p-3 border rounded-lg text-lg bg-gray-50 cursor-not-allowed" />
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

// Edit Inventory Modal
function EditInventoryModal({ item, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl text-primary font-bold mb-4">✏️ Edit Status</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Item Name</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-foreground font-bold">
              {item.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Quantity</label>
            <input
              type="text"
              placeholder="e.g. 500 kg"
              value={item.quantity}
              onChange={(e) => onChange('quantity', e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Stock Status</label>
            <select
              value={item.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg appearance-none bg-white cursor-pointer"
            >
              <option value="In Stock">✅ In Stock</option>
              <option value="Low Stock">⚠️ Low Stock</option>
              <option value="Out of Stock">❌ Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Product Modal
function AddProductModal({ product, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-[500px]">
        <h2 className="text-2xl text-primary mb-6">Add New Product</h2>
        <div className="space-y-4">



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

// Add Equipment Modal
function AddEquipmentModal({ equipment, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
        <h2 className="text-2xl text-primary font-bold mb-6">Add My Equipment</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Equipment Name
            </label>
            <input
              type="text"
              placeholder="e.g. Tractor, Sprayer..."
              value={equipment.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Rent Price (LKR/day)
            </label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={equipment.price}
              onChange={(e) => onChange('price', e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
            onClick={onSave}
          >
            Add Equipment
          </button>
        </div>
      </div>
    </div>
  );
}


// Add Inventory Modal
function AddInventoryModal({ item, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 w-[400px] shadow-2xl border border-green-100 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6" /> Add Supplies
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.1em]">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Rice Seeds"
              value={item.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-green-100 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.1em]">Quantity</label>
            <input
              type="text"
              placeholder="e.g. 500 kg"
              value={item.quantity}
              onChange={(e) => onChange('quantity', e.target.value)}
              className="w-full px-4 py-3 border border-green-100 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.1em]">Current Status</label>
            <select
              value={item.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-green-100 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-bold bg-white cursor-pointer"
            >
              <option value="In Stock">✅ In Stock</option>
              <option value="Low Stock">⚠️ Low Stock</option>
              <option value="Out of Stock">❌ Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-10">
          <button
            className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-200/50 active:scale-95"
            onClick={onSave}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

// Rent Equipment Modal
function RentEquipmentModal({ equipment, quantity, days, onQuantityChange, onDaysChange, onConfirm, onCancel }) {
  if (!equipment) return null;
  const totalPrice = equipment.price * quantity * days;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 w-[380px] h-[580px] shadow-2xl border border-green-100 animate-in fade-in zoom-in duration-200 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Rent {equipment.name}
          </h2>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-green-50/50 p-5 rounded-2xl mb-6 space-y-3 text-base border border-green-100/50">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium">Provider:</p>
            <p className="font-bold text-foreground">{equipment.owner?.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium">Contact:</p>
            <p className="font-bold text-green-600 flex items-center gap-1">
              <Phone className="w-4 h-4" /> {equipment.owner?.phone}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium">Price/Day:</p>
            <p className="font-bold text-primary">LKR {equipment.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.15em]">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-2xl border-2 border-green-100 flex items-center justify-center hover:bg-green-50 hover:border-primary transition-all text-2xl font-bold active:scale-95"
              >-</button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center py-2 border-b-2 border-green-100 font-black text-2xl focus:border-primary outline-none bg-transparent"
              />
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-12 h-12 rounded-2xl border-2 border-green-100 flex items-center justify-center hover:bg-green-50 hover:border-primary transition-all text-2xl font-bold active:scale-95"
              >+</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.15em]">Rental Duration (Days)</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onDaysChange(Math.max(1, days - 1))}
                className="w-12 h-12 rounded-2xl border-2 border-green-100 flex items-center justify-center hover:bg-green-50 hover:border-primary transition-all text-2xl font-bold active:scale-95"
              >-</button>
              <input
                type="number"
                value={days}
                onChange={(e) => onDaysChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center py-2 border-b-2 border-green-100 font-black text-2xl focus:border-primary outline-none bg-transparent"
              />
              <button
                onClick={() => onDaysChange(days + 1)}
                className="w-12 h-12 rounded-2xl border-2 border-green-100 flex items-center justify-center hover:bg-green-50 hover:border-primary transition-all text-2xl font-bold active:scale-95"
              >+</button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-primary/5 p-5 rounded-2xl border-2 border-primary/10 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Amount</p>
            <p className="text-3xl font-black text-primary">LKR {totalPrice.toLocaleString()}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-200/50 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
            >
              Confirm Rental
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}