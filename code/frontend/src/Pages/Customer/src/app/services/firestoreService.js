import { 
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── CUSTOMER PROFILE ────────────────────────────────────────

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

// ─── PRODUCTS ────────────────────────────────────────────────

export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// ─── ORDERS ──────────────────────────────────────────────────

export const saveOrder = async (uid, orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      customerId: uid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving order:', error);
    return null;
  }
};

export const loadCustomerOrders = async (uid) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};

// ─── CART ─────────────────────────────────────────────────────

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
