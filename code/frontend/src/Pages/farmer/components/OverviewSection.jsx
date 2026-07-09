import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../utils/firebase';
import { doc, onSnapshot, collection, query, where, updateDoc, addDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function OverviewSection({ setActiveTab }) {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // Products and modal state
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const getProductNameTranslation = (name) => {
    if (!name) return '';
    const cropMap = {
      'rice (paddy)': 'rice', 'වී': 'rice', 'நெல்': 'rice', 'நெல் (பச்சரிசி)': 'rice',
      'tomatoes': 'tomatoes', 'තක්කාලි': 'tomatoes', 'தக்காளி': 'tomatoes',
      'potatoes': 'potatoes', 'අර්තාපල්': 'potatoes', 'உருளைக்கிழங்கு': 'potatoes',
      'onions': 'onions', 'ලූනු': 'onions', 'வெங்காயம்': 'onions',
      'carrots': 'carrots', 'කැරට්': 'carrots', 'கேரட்': 'carrots',
      'cabbage': 'cabbage', 'ගෝවා': 'cabbage', 'முட்டைக்கோஸ்': 'cabbage',
      'corn': 'corn', 'බඩඉරිඟු': 'corn', 'சோளம்': 'corn',
      'banana': 'banana', 'කෙසෙල්': 'banana', 'வாழைப்பழம்': 'banana',
      'mango': 'mango', 'අඹ': 'mango', 'மாம்பழம்': 'mango',
      'papaya': 'papaya', 'ගස්ලබු': 'papaya', 'பப்பாளி': 'papaya',
      'pumpkin': 'pumpkin', 'වට්ටක්කා': 'pumpkin', 'பூசணிக்காய்': 'pumpkin',
      'chili': 'chili', 'මිරිස්': 'chili', 'மிளகாய்': 'chili'
    };
    const key = cropMap[name.toLowerCase()];
    if (key) {
      return t(`farmer.crops.${key}`) || name;
    }
    return name;
  };

  const getStockStatusTranslation = (status) => {
    if (status === 'Full Stock') return t('farmer.productForm.fullStock') || 'Full Stock';
    if (status === 'Medium Stock') return t('farmer.productForm.mediumStock') || 'Medium Stock';
    if (status === 'Low Stock') return t('farmer.productForm.lowStock') || 'Low Stock';
    return status;
  };
const PREDEFINED_CROPS = [
  { name: t('farmer.crops.rice') || 'Rice (Paddy)', image: 'https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.tomatoes') || 'Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.potatoes') || 'Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.onions') || 'Onions', image: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.carrots') || 'Carrots', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.cabbage') || 'Cabbage', image: 'https://images.unsplash.com/photo-1529311029279-d2d416b23b49?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.corn') || 'Corn', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.banana') || 'Banana', image: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.mango') || 'Mango', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.papaya') || 'Papaya', image: 'https://images.unsplash.com/photo-1615486171447-74070be6a89c?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.pumpkin') || 'Pumpkin', image: 'https://images.unsplash.com/photo-1509506489701-afe29e5033fc?auto=format&fit=crop&q=80&w=800' },
  { name: t('farmer.crops.chili') || 'Chili', image: 'https://images.unsplash.com/photo-1596647209377-62f9014fb54c?auto=format&fit=crop&q=80&w=800' },
];
const DEFAULT_CROP_IMAGE = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800';

  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    stockStatus: 'Full Stock'
  });

  const resetProductForm = () => {
    setFormData({
      productName: '',
      quantity: '',
      unit: 'kg',
      pricePerUnit: '',
      stockStatus: 'Full Stock'
    });
  };

  const [orders, setOrders] = useState([]);
  // Weather state
  const [weather, setWeather] = useState({
    temp: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    condition: null,
    description: null,
    icon: null,
    city: null,
    country: null,
    loading: true,
    error: null
  });

  const [weatherFetched, setWeatherFetched] = useState(false);

  useEffect(() => {
    if (profile && !weatherFetched) {
      setWeatherFetched(true);
      const fetchWeather = async () => {
        const cityName = profile.villageTown || profile.district || 'Colombo';
        try {
          const weatherRes = await fetch(`http://localhost:5000/api/weather/current?city=${encodeURIComponent(cityName)}`);
          const weatherData = await weatherRes.json();

          if (weatherData.success) {
            setWeather({
              temp: Math.round(weatherData.temperature),
              feelsLike: Math.round(weatherData.feelsLike),
              humidity: weatherData.humidity,
              windSpeed: weatherData.windSpeed,
              condition: weatherData.condition,
              description: weatherData.description,
              icon: weatherData.icon,
              city: weatherData.city,
              country: weatherData.country,
              loading: false,
              error: null,
              fallbackUsed: weatherData.fallbackUsed || (!profile.villageTown && !profile.district)
            });
          } else {
            setWeather(prev => ({ ...prev, loading: false, error: t('farmer.overview.weatherError') || 'Unable to load weather right now.' }));
          }
        } catch (err) {
          setWeather(prev => ({ ...prev, loading: false, error: t('farmer.overview.weatherError') || 'Unable to load weather right now.' }));
        }
      };
      fetchWeather();
    }
  }, [profile, weatherFetched, t]);

  useEffect(() => {
    let unsubscribeDoc = null;
    let unsubscribeProducts = null;
    let unsubscribeOrders = null;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        });

        const q = query(
          collection(db, 'products'),
          where('farmerId', '==', user.uid)
        );
        unsubscribeProducts = onSnapshot(q, (snapshot) => {
          const productList = [];
          snapshot.forEach((doc) => {
            productList.push({ id: doc.id, ...doc.data() });
          });
          productList.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          setProducts(productList);
        }, (error) => {
          console.error("Products onSnapshot error:", error);
        });

        const ordersQuery = query(collection(db, 'orders'), where('farmerId', '==', user.uid));
        unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
          const ordersList = [];
          for (const document of snapshot.docs) {
            let order = { id: document.id, ...document.data() };
            
            if (!order.customerName || !order.customerPhone || !order.customerLocation) {
              if (order.customerId) {
                try {
                  const userSnap = await getDoc(doc(db, 'users', order.customerId));
                  if (userSnap.exists()) {
                    const ud = userSnap.data();
                    order.customerName = order.customerName || ud.fullName || ud.name || 'Not available';
                    order.customerPhone = order.customerPhone || ud.phone || ud.phoneNumber || 'Not available';
                    order.customerLocation = order.customerLocation || ud.village || ud.villageTown || ud.district || ud.address || 'Not available';
                  }
                } catch(e) { console.error('Error fetching customer details:', e); }
              }
            }
            
            order.productName = order.productName || 'Not available';
            order.quantity = order.quantity ? `${order.quantity} ${order.unit || ''}`.trim() : 'Not available';
            const price = order.totalPrice || order.totalAmount;
            order.totalPriceDisplay = price ? `Rs ${price}` : 'Not available';
            order.customerName = order.customerName || 'Not available';
            order.customerPhone = order.customerPhone || 'Not available';
            order.customerLocation = order.customerLocation || 'Not available';

            ordersList.push(order);
          }
          setOrders(ordersList);
        });
      } else {
        setProfile(null);
        setProducts([]);
        setOrders([]);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [navigate, t, setActiveTab]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      await fetch(`http://localhost:5000/api/farmer/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !auth.currentUser) return;
    if (productToDelete.farmerId !== auth.currentUser.uid) {
      alert("You are not authorized to delete this product.");
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProductToDelete(null);
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product) => {
    if (!product.farmerId) {
      console.warn("Product missing farmerId. Please recreate product or fix Firestore document.");
      alert("You cannot edit this product because it is missing ownership data.");
      return;
    }
    setEditProductId(product.id);
    setFormData({
      productName: product.productName || product.name || '',
      quantity: product.quantity || '',
      unit: product.unit || 'kg',
      pricePerUnit: product.pricePerUnit || product.price || '',
      stockStatus: product.stockStatus || 'Full Stock'
    });
    setShowModal(true);
  };

  const completedSales = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log("Add product clicked");

    if (!auth.currentUser) return;
    const user = auth.currentUser;
    console.log("Current user:", user.uid);

    try {
      const quantityNum = Number(formData.quantity);
      const priceNum = Number(formData.pricePerUnit);
      let imageUrl = editProductId ? (products.find(p => p.id === editProductId)?.imageUrl || '') : '';

      if (!imageUrl) {
        const matchingCrop = PREDEFINED_CROPS.find(c => c.name.toLowerCase() === formData.productName.toLowerCase());
        imageUrl = matchingCrop ? matchingCrop.image : DEFAULT_CROP_IMAGE;
      }

      if (editProductId) {
        const prod = products.find(p => p.id === editProductId);
        
        console.log("Current user UID:", user.uid);
        console.log("Product farmerId:", prod ? prod.farmerId : 'not found');
        console.log("Editing product ID:", editProductId);

        if (!prod || prod.farmerId !== user.uid) {
          alert("You cannot edit this product because you are not the owner.");
          return;
        }
        
        await updateDoc(doc(db, 'products', editProductId), {
          productName: formData.productName,
          quantity: quantityNum,
          unit: formData.unit,
          pricePerUnit: priceNum,
          totalPrice: quantityNum * priceNum,
          stockStatus: formData.stockStatus,
          imageUrl: imageUrl,
          farmerId: user.uid,
          updatedAt: serverTimestamp()
        });
      } else {
        const newProduct = {
          productName: formData.productName,
          quantity: quantityNum,
          unit: formData.unit,
          pricePerUnit: priceNum,
          totalPrice: quantityNum * priceNum,
          stockStatus: formData.stockStatus,
          imageUrl: imageUrl,
          farmerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'products'), newProduct);
      }

      setShowModal(false);
      setEditProductId(null);
      resetProductForm();
    } catch (error) {
      console.error('Save product error:', error);
      alert('Failed to save product: ' + error.message);
    }
  };


  return (
    <div className="nagro-section-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>{t('farmer.overview.title') || 'Overview'}</h2>

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
            <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>{t('farmer.header.activeFarmer') || 'Active Farmer'}</span>
          </div>

          {/* Role Switcher */}
          {profile?.allowedRoles && profile.allowedRoles.length > 0 && (
            <select
              value="farmer"
              onChange={(e) => {
                const role = e.target.value;
                if (role === 'farmer') navigate('/farmer/dashboard');
                else if (role === 'customer') navigate('/customer/dashboard');
                else if (role === 'expert') navigate('/expert/dashboard');
                else if (role === 'admin') navigate('/admin/dashboard');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {profile.allowedRoles.includes('farmer') && <option value="farmer">Role: Farmer</option>}
              {profile.allowedRoles.includes('customer') && <option value="customer">Role: Customer</option>}
              {profile.allowedRoles.includes('expert') && <option value="expert">Role: Expert</option>}
              {profile.allowedRoles.includes('admin') && <option value="admin">Role: Admin</option>}
            </select>
          )}

          {/* Farmer Profile */}
          <div
            onClick={() => setActiveTab && setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderLeft: '1px solid #e5e7eb',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              backgroundColor: 'transparent'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {!profile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ width: '80px', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                  <div style={{ width: '120px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                </div>
              </div>
            ) : (
              <>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 'bold', fontSize: '18px' }}>
                    {(profile.fullName || profile.name || profile.email || 'F').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {profile.fullName || profile.name || profile.email?.split('@')[0]}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {profile.email || 'Farmer'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Products Section */}
      {products.length === 0 ? (
        <div style={{ padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center', border: '1px dashed #d1d5db', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '12px' }}>{t('farmer.overview.welcome') || 'Welcome to NagroMS!'}</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('farmer.overview.noProductsText') || "It looks like you haven't added any products yet."}</p>
          <button 
            onClick={() => { setEditProductId(null); resetProductForm(); setShowModal(true); }}
            style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            + {t('farmer.overview.addFirstProduct') || 'Add Your First Product'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{t('farmer.overview.myProducts') || 'My Products'}</h3>
            <button 
              onClick={() => { setEditProductId(null); resetProductForm(); setShowModal(true); }}
              style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              + {t('farmer.overview.addProduct') || 'Add Product'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.productName || product.name} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{getProductNameTranslation(product.productName || product.name)}</h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>
                  Rs {product.pricePerUnit || product.price} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>/ {product.unit}</span>
                </p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>{t('farmer.overview.available') || 'Available'}: {product.quantity} {product.unit}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>{t('farmer.overview.totalPrice') || 'Total Price'}: Rs {product.totalPrice}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>{t('farmer.overview.status') || 'Status'}: {getStockStatusTranslation(product.stockStatus)}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
                  {t('farmer.overview.added') || 'Added'}: {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleDateString() : 'Just now'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditClick(product)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #22c55e', color: '#22c55e', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.common.edit') || 'Edit'}</button>
                  <button onClick={() => handleDeleteClick(product)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.common.delete') || 'Delete'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sales Box */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{t('farmer.overview.sales') || 'Sales'}</h3>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{t('farmer.overview.totalRevenue') || 'Total Revenue'}: Rs {totalRevenue}</span>
        </div>

        {completedSales.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>{t('farmer.overview.noSales') || 'No sales and income yet.'}</p>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '14px' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>{t('farmer.overview.productName') || 'Product Name'}</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>{t('farmer.overview.quantitySold') || 'Quantity Sold'}</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>{t('farmer.overview.price') || 'Price'}</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>{t('farmer.overview.buyerName') || 'Buyer Name'}</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>{t('farmer.overview.soldDate') || 'Sold Date'}</th>
                </tr>
              </thead>
              <tbody>
                {completedSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px', color: '#111827', fontWeight: 500 }}>{sale.productName}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>{sale.quantity}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>{sale.totalPriceDisplay}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>{sale.customerName}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>
                      {sale.createdAt ? new Date(sale.createdAt.toDate ? sale.createdAt.toDate() : sale.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incoming Orders Box */}
      <div style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.overview.incomingOrders') || 'Incoming Orders'}</h3>

        {orders.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>{t('farmer.overview.noIncomingOrders') || 'No incoming orders yet.'}</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{order.customerName}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: order.status === 'completed' ? '#dcfce7' : order.status === 'pending' ? '#fef3c7' : order.status === 'declined' ? '#fee2e2' : '#e0e7ff',
                      color: order.status === 'completed' ? '#166534' : order.status === 'pending' ? '#b45309' : order.status === 'declined' ? '#991b1b' : '#3730a3',
                      textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
                    <div><strong>{t('farmer.overview.productName') || 'Product'}:</strong> {order.productName}</div>
                    <div><strong>{t('farmer.overview.quantity') || 'Qty'}:</strong> {order.quantity}</div>
                    <div><strong>{t('farmer.overview.totalPrice') || 'Total'}:</strong> {order.totalPriceDisplay}</div>
                    <div><strong>{t('farmer.settings.phone') || 'Phone'}:</strong> {order.customerPhone}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>{t('farmer.overview.location') || 'Location'}:</strong> {order.customerLocation}</div>
                  </div>

                  {order.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#22c55e', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'declined')}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Weather Section */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.overview.localWeather') || 'Local Weather (Live)'}</h3>
        {weather.loading ? (
          <p style={{ color: '#6b7280' }}>{t('farmer.overview.fetchingWeather') || 'Fetching live weather...'}</p>
        ) : weather.error ? (
          <p style={{ color: '#ef4444', fontWeight: 500 }}>{weather.error}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {weather.fallbackUsed && (
              <p style={{ color: '#d97706', fontSize: '14px', marginBottom: '0px' }}>
                {t('farmer.overview.weatherFallback') || 'Showing weather for Colombo'}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} style={{ width: '64px', height: '64px' }} />
              <div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: 0 }}>{weather.temp}°C</p>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: 0, textTransform: 'capitalize' }}>
                  {weather.description} in {weather.city}, {weather.country}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('farmer.overview.feelsLike') || 'Feels Like'}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{weather.feelsLike}°C</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('farmer.overview.humidity') || 'Humidity'}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{weather.humidity}%</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('farmer.overview.windSpeed') || 'Wind Speed'}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{weather.windSpeed} m/s</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
              {editProductId ? (t('farmer.productForm.editProduct') || 'Edit Product') : (t('farmer.productForm.addNewProduct') || 'Add New Product')}
            </h2>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('farmer.productForm.productName') || 'Product Name'}</label>
                <input required type="text" list="cropOptions" placeholder="Enter product name" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <datalist id="cropOptions">
                  {PREDEFINED_CROPS.map((crop, idx) => (
                    <option key={idx} value={crop.name} />
                  ))}
                </datalist>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>Select a common crop or type your own. A default image will be provided.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('farmer.productForm.quantity') || 'Quantity'}</label>
                  <input required type="number" min="0" step="any" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('farmer.productForm.unit') || 'Unit'}</label>
                  <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pieces">pieces</option>
                    <option value="bunch">bunch</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('farmer.productForm.pricePerUnit') || 'Price per unit (Rs.)'}</label>
                <input required type="number" min="0" step="any" value={formData.pricePerUnit} onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('farmer.productForm.stockStatus') || 'Stock Status'}</label>
                <select value={formData.stockStatus} onChange={(e) => setFormData({...formData, stockStatus: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option value="Full Stock">{t('farmer.productForm.fullStock') || 'Full Stock'}</option>
                  <option value="Medium Stock">{t('farmer.productForm.mediumStock') || 'Medium Stock'}</option>
                  <option value="Low Stock">{t('farmer.productForm.lowStock') || 'Low Stock'}</option>
                </select>
              </div>

              {formData.quantity && formData.pricePerUnit && !isNaN(formData.quantity) && !isNaN(formData.pricePerUnit) && (
                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', marginTop: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: 500 }}>
                    {t('farmer.productForm.calculatedPrice') || 'Total Price = Rs.'} {Number(formData.quantity) * Number(formData.pricePerUnit)} for {formData.quantity} {formData.unit}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditProductId(null); resetProductForm(); }} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 500 }}>
                  {t('farmer.productForm.cancel') || 'Cancel'}
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {editProductId ? (t('farmer.productForm.updateProduct') || 'Update Product') : (t('farmer.productForm.addProduct') || 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#dc2626', marginBottom: '16px' }}>{t('farmer.productForm.deleteProduct') || 'Delete Product'}</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              {t('farmer.productForm.confirmDeleteMessage') || 'Are you sure you want to delete this product? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setProductToDelete(null)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                {t('farmer.common.cancel') || 'Cancel'}
              </button>
              <button onClick={confirmDeleteProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                {t('farmer.productForm.confirmDelete') || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
