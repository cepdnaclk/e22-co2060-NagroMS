import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp, 
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../utils/firebase.js';

/**
 * Fetch all registered users from the `users` collection.
 */
export const getAllNetworkUsers = async () => {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching network users:', error);
    return [];
  }
};

/**
 * Listen to connections for a specific user.
 */
export const subscribeToConnections = (userId, callback) => {
  if (!userId) return () => {};
  
  let isCancelled = false;

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('nagroms_token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${BACKEND}/api/network/connections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch connections');
      const data = await res.json();
      if (!isCancelled) callback(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections via backend:', error);
      if (!isCancelled) callback([]);
    }
  };

  fetchConnections();

  // Return a dummy unsubscribe function since it's no longer a real-time listener
  return () => {
    isCancelled = true;
  };
};

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const toggleConnection = async (requesterId, targetId, currentlyConnected) => {
  try {
    const token = localStorage.getItem('nagroms_token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${BACKEND}/api/network/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ targetId, currentlyConnected })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle connection');
    
    return data;
  } catch (error) {
    console.error('Error toggling connection:', error);
    throw error;
  }
};
