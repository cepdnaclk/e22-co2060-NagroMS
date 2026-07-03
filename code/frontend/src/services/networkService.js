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
  const q1 = query(collection(db, 'connections'), where('requesterId', '==', userId));
  const q2 = query(collection(db, 'connections'), where('targetId', '==', userId));

  let connectionsMap = new Map();

  const handleUpdate = () => {
    callback(Array.from(connectionsMap.values()));
  };

  const unsub1 = onSnapshot(q1, (snap) => {
    snap.docs.forEach(doc => {
      connectionsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    handleUpdate();
  });

  const unsub2 = onSnapshot(q2, (snap) => {
    snap.docs.forEach(doc => {
      connectionsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    handleUpdate();
  });

  return () => {
    unsub1();
    unsub2();
  };
};

/**
 * Connect two users.
 */
export const toggleConnection = async (requesterId, targetId) => {
  try {
    // Check if connection already exists
    const q1 = query(collection(db, 'connections'), where('requesterId', '==', requesterId), where('targetId', '==', targetId));
    const q2 = query(collection(db, 'connections'), where('requesterId', '==', targetId), where('targetId', '==', requesterId));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    if (!snap1.empty) {
      await deleteDoc(doc(db, 'connections', snap1.docs[0].id));
      return { status: 'disconnected' };
    }
    if (!snap2.empty) {
      await deleteDoc(doc(db, 'connections', snap2.docs[0].id));
      return { status: 'disconnected' };
    }

    // Create new connection
    await addDoc(collection(db, 'connections'), {
      requesterId,
      targetId,
      status: 'connected',
      createdAt: serverTimestamp()
    });
    
    return { status: 'connected' };
  } catch (error) {
    console.error('Error toggling connection:', error);
    throw error;
  }
};
