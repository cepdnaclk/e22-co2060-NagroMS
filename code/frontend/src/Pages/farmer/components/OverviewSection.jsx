import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../../utils/firebase';
import { doc, onSnapshot, collection, query, where, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function OverviewSection({ isNewFarmer: initialIsNewFarmer, setActiveTab }) {
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  
  // Products and modal state
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    stockStatus: 'Full Stock',
    imageFile: null
  });

  const resetProductForm = () => {
    setFormData({
      productName: '',
      quantity: '',
      unit: 'kg',
      pricePerUnit: '',
      stockStatus: 'Full Stock',
      imageFile: null
    });
  };

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Weather state
  const [weather, setWeather] = useState({
    temp: null,
    condition: null,
    city: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Weather fetch logic
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Fetch weather
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();
            
            // Fetch city name (reverse geocoding)
            let city = 'Unknown Location';
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const geoData = await geoRes.json();
              city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || 'Unknown Location';
            } catch (e) {
              console.warn('Could not fetch city name', e);
            }

            // Map open-meteo weather code to a simple emoji/condition (simplified)
            const code = weatherData.current_weather.weathercode;
            let condition = 'Clear';
            let emoji = '☀️';
            if (code >= 1 && code <= 3) { condition = 'Partly Cloudy'; emoji = '🌤️'; }
            else if (code >= 45 && code <= 48) { condition = 'Foggy'; emoji = '🌫️'; }
            else if (code >= 51 && code <= 67) { condition = 'Rainy'; emoji = '🌧️'; }
            else if (code >= 71 && code <= 77) { condition = 'Snowy'; emoji = '❄️'; }
            else if (code >= 80 && code <= 82) { condition = 'Showers'; emoji = '🌦️'; }
            else if (code >= 95 && code <= 99) { condition = 'Thunderstorm'; emoji = '⛈️'; }

            setWeather({
              temp: weatherData.current_weather.temperature,
              condition: condition,
              emoji: emoji,
              city: city,
              loading: false,
              error: null
            });
          } catch (err) {
            setWeather(prev => ({ ...prev, loading: false, error: 'Failed to fetch weather data.' }));
          }
        },
        (err) => {
          setWeather({ loading: false, error: 'Location permission needed to show live weather.', temp: null, condition: null, city: null });
        }
      );
    } else {
      setWeather({ loading: false, error: 'Geolocation is not supported by this browser.', temp: null, condition: null, city: null });
    }

    let unsubscribeDoc = null;
    let unsubscribeProducts = null;
    let unsubscribeOrders = null;
    let unsubscribeNotifs = null;

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
          where('farmerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        unsubscribeProducts = onSnapshot(q, (snapshot) => {
          const productList = [];
          snapshot.forEach((doc) => {
            productList.push({ id: doc.id, ...doc.data() });
          });
          setProducts(productList);
        }, (error) => {
          console.error("Products onSnapshot error:", error);
        });

        const ordersQuery = query(collection(db, 'orders'), where('farmerId', '==', user.uid));
        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          const ordersList = [];
          snapshot.forEach((doc) => {
            ordersList.push({ id: doc.id, ...doc.data() });
          });
          setOrders(ordersList);
        });

        const notifQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
          const notifs = [];
          snapshot.forEach((doc) => {
            notifs.push({ id: doc.id, ...doc.data() });
          });
          setNotifications(notifs);
        });
      } else {
        setProfile(null);
        setProducts([]);
        setOrders([]);
        setNotifications([]);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const order = orders.find(o => o.id === orderId);
      await fetch(`http://localhost:5000/api/farmer/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, productId: order.productId, customerId: order.customerId })
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this product?')) return;
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:5000/api/farmer/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const completedSales = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log("Add product clicked");
    
    if (!auth.currentUser) return;
    console.log("Current user:", auth.currentUser.uid);

    try {
      const quantityNum = Number(formData.quantity);
      const priceNum = Number(formData.pricePerUnit);
      let imageUrl = '';

      if (formData.imageFile) {
        const imageRef = ref(storage, `products/${auth.currentUser.uid}/${Date.now()}-${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const newProduct = {
        productName: formData.productName,
        quantity: quantityNum,
        unit: formData.unit,
        pricePerUnit: priceNum,
        totalPrice: quantityNum * priceNum,
        stockStatus: formData.stockStatus,
        imageUrl: imageUrl,
        farmerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), newProduct);
      console.log('Product saved:', docRef.id);

      setShowModal(false);
      resetProductForm();
      alert('Product added successfully');
    } catch (error) {
      console.error('Add product error:', error);
      alert('Failed to add product: ' + error.message);
    }
  };

  const isNewFarmer = products.length === 0;

  return (
    <div className="nagro-section-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>Overview</h2>

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
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>

          {/* Active Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)' }}></div>
            <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Active Farmer</span>
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


      {isNewFarmer ? (
        <div style={{ padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center', border: '1px dashed #d1d5db' }}>
          <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '12px' }}>Welcome to NagroMS!</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>It looks like you haven't added any products yet.</p>
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            + Add Your First Product
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button 
              onClick={() => setShowModal(true)}
              style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              + Add Product
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.productName || product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{product.productName || product.name}</h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>
                  Rs {product.pricePerUnit || product.price} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>/ {product.unit}</span>
                </p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Available: {product.quantity} {product.unit}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Total Price: Rs {product.totalPrice}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Status: {product.stockStatus}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
                  Added: {product.createdAt?.toDate ? product.createdAt.toDate().toLocaleDateString() : 'Just now'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #22c55e', color: '#22c55e', backgroundColor: 'transparent', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Box */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>Sales</h3>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>Total Revenue: Rs {totalRevenue}</span>
        </div>
        
        {completedSales.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>No sales and income yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '14px' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Product Name</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Quantity Sold</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Buyer Name</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Sold Date</th>
                </tr>
              </thead>
              <tbody>
                {completedSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px', color: '#111827', fontWeight: 500 }}>{sale.productName}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>{sale.quantity}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>Rs {sale.totalPrice || sale.totalAmount}</td>
                    <td style={{ padding: '12px 8px', color: '#4b5563' }}>{sale.customerName || sale.buyerName}</td>
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
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>Incoming Orders</h3>
        
        {orders.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>No incoming orders yet.</p>
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
                    <div><strong>Product:</strong> {order.productName}</div>
                    <div><strong>Qty:</strong> {order.quantity}</div>
                    <div><strong>Total:</strong> Rs {order.totalPrice || order.totalAmount}</div>
                    <div><strong>Phone:</strong> {order.customerPhone}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Location:</strong> {order.customerLocation}</div>
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
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>Local Weather (Live)</h3>
        {weather.loading ? (
          <p style={{ color: '#6b7280' }}>Fetching weather data...</p>
        ) : weather.error ? (
          <p style={{ color: '#ef4444', fontWeight: 500 }}>{weather.error}</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '40px' }}>{weather.emoji || '🌤️'}</span>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{weather.temp}°C</p>
              <p style={{ color: '#6b7280' }}>{weather.condition} in {weather.city}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Add New Product</h2>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Product Name</label>
                <input required type="text" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Quantity</label>
                  <input required type="number" min="0" step="any" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Unit</label>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Price per unit (Rs.)</label>
                <input required type="number" min="0" step="any" value={formData.pricePerUnit} onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Stock Status</label>
                <select value={formData.stockStatus} onChange={(e) => setFormData({...formData, stockStatus: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option value="Full Stock">Full Stock</option>
                  <option value="Medium Stock">Medium Stock</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>

              {formData.quantity && formData.pricePerUnit && !isNaN(formData.quantity) && !isNaN(formData.pricePerUnit) && (
                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', marginTop: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: 500 }}>
                    Total Price = Rs. {Number(formData.quantity) * Number(formData.pricePerUnit)} for {formData.quantity} {formData.unit}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => { setShowModal(false); resetProductForm(); }} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
