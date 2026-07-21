import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy, onSnapshot
} from 'firebase/firestore';
import { db } from '../../../../../utils/firebase.js';

// ΓöÇΓöÇΓöÇ CUSTOMER PROFILE ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const loadCustomerProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        name: data.contactPersonName || data.businessName || '',
        email: data.email || '',
        phone: data.phone || '',
        district: data.district || '',
        businessName: data.businessName || '',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        uid: data.uid || uid,
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

export const saveCustomerProfile = async (uid, profileData) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

// ΓöÇΓöÇΓöÇ PRODUCTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      let farmerName = 'Unknown Farmer';
      let location = 'Unknown Location';
      let farmerPhone = 'N/A';

      if (data.farmerId) {
        try {
          const userSnap = await getDoc(doc(db, 'users', data.farmerId));
          if (userSnap.exists()) {
            const ud = userSnap.data();
            farmerName = ud.fullName || ud.name || ud.businessName || 'Unknown Farmer';
            location = ud.villageTown || ud.district || ud.village || ud.addressLine1 || 'Unknown Location';
            farmerPhone = ud.phone || ud.phoneNumber || 'N/A';
          }
        } catch (e) {
          console.warn('Could not fetch farmer details', e);
        }
      }

      productsList.push({
        id: docSnap.id,
        ...data,
        name: data.productName || data.name || 'Unnamed Product',
        image: data.imageUrl || data.image || '',
        price: data.pricePerUnit || data.price || 0,
        available: `${data.quantity || 0} ${data.unit || 'kg'}`,
        farmer: farmerName,
        location: location,
        district: location,
        farmerPhone: farmerPhone,
        category: 'general',
        rating: 5.0,
        availableUnits: [
          { unit: data.unit || 'kg', price: data.pricePerUnit || data.price || 0, label: data.unit || 'kg' }
        ]
      });
    }

    return productsList;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const subscribeToProducts = (callback) => {
  const q = query(collection(db, 'products'));
  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    try {
      const productsList = [];
      const promises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let farmerName = 'Unknown Farmer';
        let location = 'Unknown Location';
        let farmerPhone = 'N/A';

        if (data.farmerId) {
          try {
            const userSnap = await getDoc(doc(db, 'users', data.farmerId));
            if (userSnap.exists()) {
              const ud = userSnap.data();
              farmerName = ud.fullName || ud.name || ud.businessName || 'Unknown Farmer';
              location = ud.villageTown || ud.district || ud.village || ud.addressLine1 || 'Unknown Location';
              farmerPhone = ud.phone || ud.phoneNumber || 'N/A';
            }
          } catch (e) {
            console.warn('Could not fetch farmer details', e);
          }
        }

        const n = (data.productName || data.name || '').toLowerCase();
        let inferredCategory = 'general';
        if (n.includes('tomato') || n.includes('carrot') || n.includes('onion') || n.includes('cabbage') || n.includes('chili') || n.includes('potato') || n.includes('bean') || n.includes('pumpkin')) inferredCategory = 'vegetables';
        else if (n.includes('mango') || n.includes('banana') || n.includes('papaya') || n.includes('apple') || n.includes('orange') || n.includes('fruit')) inferredCategory = 'fruits';
        else if (n.includes('rice') || n.includes('corn') || n.includes('wheat') || n.includes('grain')) inferredCategory = 'grains';

        return {
          id: docSnap.id,
          ...data,
          name: data.productName || data.name || 'Unnamed Product',
          image: data.imageUrl || data.image || '',
          price: data.pricePerUnit || data.price || 0,
          available: `${data.quantity || 0} ${data.unit || 'kg'}`,
          farmer: farmerName,
          location: location,
          district: location,
          farmerPhone: farmerPhone,
          category: inferredCategory,
          rating: 5.0,
          availableUnits: [
            { unit: data.unit || 'kg', price: data.pricePerUnit || data.price || 0, label: data.unit || 'kg' }
          ]
        };
      });

      const resolvedProducts = await Promise.all(promises);
      callback(resolvedProducts);
    } catch (error) {
      console.error('Error processing real-time products:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Snapshot listener error:', error);
    callback([]);
  });

  return unsubscribe;
};

// ΓöÇΓöÇΓöÇ ORDERS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const saveOrder = async (uid, orderData) => {
  try {
    const token = localStorage.getItem('nagroms_token');
    const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const res = await fetch(`${BACKEND}/api/network/orders/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!res.ok) throw new Error('Failed to save order');
    const data = await res.json();
    return data.orderId;
  } catch (error) {
    console.warn('Error saving order via backend, attempting fallback direct firestore write:', error);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (fsError) {
      console.error('Direct Firestore order save fallback also failed:', fsError);
      return null;
    }
  }
};

export const loadCustomerOrders = async (uid) => {
  try {
    const token = localStorage.getItem('nagroms_token');
    const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const res = await fetch(`${BACKEND}/api/network/orders/customer`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};

export const subscribeToCustomerOrders = (uid, callback) => {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', uid)
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    try {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(orders);
    } catch (error) {
      console.error('Error processing real-time orders:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Orders snapshot listener error:', error);
    callback([]);
  });

  return unsubscribe;
};

// ΓöÇΓöÇΓöÇ CART ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const saveCart = async (uid, cart) => {
  try {
    const docRef = doc(db, 'carts', uid);
    await setDoc(docRef, {
      items: cart,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving cart:', error);
    return false;
  }
};

export const loadCart = async (uid) => {
  try {
    const docRef = doc(db, 'carts', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

// ΓöÇΓöÇΓöÇ FOLLOWED FARMERS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const loadFollowedFarmers = async (uid) => {
  try {
    const token = localStorage.getItem('nagroms_token');
    const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const res = await fetch(`${BACKEND}/api/network/connections`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch connections');
    const data = await res.json();
    const connections = data.connections || [];

    const connectedUserIds = new Set();
    connections.forEach(conn => {
      if (conn.status === 'connected') {
        if (conn.requesterId === uid) connectedUserIds.add(conn.targetId);
        if (conn.targetId === uid) connectedUserIds.add(conn.requesterId);
      }
    });

    if (connectedUserIds.size === 0) return [];

    const farmers = [];
    for (const farmerId of connectedUserIds) {
      const userRef = doc(db, 'users', farmerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === 'farmer') {
          farmers.push({
            id: farmerId,
            name: userData.fullName || userData.businessName || userData.contactPersonName || 'Unknown Farmer',
            district: userData.district || '',
            village: userData.villageTown || userData.village || ''
          });
        }
      }
    }
    return farmers;
  } catch (error) {
    console.error('Error loading followed farmers:', error);
    return [];
  }
};

// ΓöÇΓöÇΓöÇ PRODUCT REQUESTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export const createProductRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('nagroms_token');
    const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const res = await fetch(`${BACKEND}/api/network/product-requests/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!res.ok) throw new Error('Failed to create product request');
    const data = await res.json();
    return data.requestId;
  } catch (error) {
    console.error('Error creating product request:', error);
    return null;
  }
};

export const subscribeToCustomerRequests = (uid, callback) => {
  if (!uid) return () => {};
  let isCancelled = false;
  
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('nagroms_token');
      const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND}/api/network/product-requests/customer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      if (!isCancelled) callback(data.requests || []);
    } catch (error) {
      console.error('Customer requests backend fetch error:', error);
      if (!isCancelled) callback([]);
    }
  };

  fetchRequests();
  
  return () => { isCancelled = true; };
};

export const subscribeToFarmerRequests = (farmerId, callback) => {
  if (!farmerId) return () => {};
  let isCancelled = false;
  
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('nagroms_token');
      const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND}/api/network/product-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      if (!isCancelled) callback(data.requests || []);
    } catch (error) {
      console.error('Farmer requests backend fetch error:', error);
      if (!isCancelled) callback([]);
    }
  };

  fetchRequests();
  
  // Return dummy unsubscribe since it's not real-time anymore
  return () => { isCancelled = true; };
};

export const respondToProductRequest = async (requestId, farmerId, farmerName, status, message = '') => {
  try {
    const token = localStorage.getItem('nagroms_token');
    const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const res = await fetch(`${BACKEND}/api/network/product-requests/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requestId, farmerName, status, message })
    });
    
    if (!res.ok) throw new Error('Failed to respond');
    return true;
  } catch (error) {
    console.error('Error responding to product request:', error);
    return false;
  }
};

