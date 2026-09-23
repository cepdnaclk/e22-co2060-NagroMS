// ============================================================
// NagroMS — utils/userDirectoryService.js
// Shared service for listing users by role, follow/unfollow,
// and real-time follower subscriptions via Firestore.
// ============================================================

import {
  collection, query, where, onSnapshot,
  doc, setDoc, deleteDoc, getDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ── List users by role (real-time) ──────────────────────────
// role: 'farmer' | 'expert' | 'serviceProvider' | 'customer'
export function subscribeToUsersByRole(role, callback) {
  try {
    const q = query(
      collection(db, 'users'),
      where('roles', 'array-contains', role)
    );
    return onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => ({
        id: d.id,
        uid: d.id,
        ...d.data(),
        name: d.data().fullName || d.data().contactPersonName || d.data().businessName || d.data().name || 'Unknown',
        district: d.data().district || d.data().location || '',
        phone: d.data().phone || d.data().phoneNumber || '',
        specialty: d.data().specialty || d.data().primaryCrop || d.data().cropType || '',
        serviceType: d.data().serviceType || d.data().serviceProviderType || '',
        rating: d.data().rating || 5.0,
      }));
      callback(users);
    }, (err) => {
      console.warn(`subscribeToUsersByRole(${role}) error:`, err.message);
      callback([]);
    });
  } catch (e) {
    console.warn('subscribeToUsersByRole failed:', e);
    callback([]);
    return () => {};
  }
}

// ── Follow a user ────────────────────────────────────────────
// Writes to follows/{followerId}_{followeeId}
export async function followUser(followerId, followeeId, followerRole, followeeRole) {
  try {
    const followId = `${followerId}_${followeeId}`;
    await setDoc(doc(db, 'follows', followId), {
      followerId,
      followeeId,
      followerRole,
      followeeRole,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error('followUser error:', e);
    return false;
  }
}

// ── Unfollow a user ──────────────────────────────────────────
export async function unfollowUser(followerId, followeeId) {
  try {
    const followId = `${followerId}_${followeeId}`;
    await deleteDoc(doc(db, 'follows', followId));
    return true;
  } catch (e) {
    console.error('unfollowUser error:', e);
    return false;
  }
}

// ── Check follow status (real-time) ─────────────────────────
export function subscribeToFollowStatus(followerId, followeeId, callback) {
  if (!followerId || !followeeId) { callback(false); return () => {}; }
  try {
    const followId = `${followerId}_${followeeId}`;
    return onSnapshot(doc(db, 'follows', followId), (snap) => {
      callback(snap.exists());
    });
  } catch (e) {
    callback(false);
    return () => {};
  }
}

// ── Get all followers of a user (real-time) ──────────────────
export function subscribeToFollowers(userId, callback) {
  if (!userId) { callback([]); return () => {}; }
  try {
    const q = query(
      collection(db, 'follows'),
      where('followeeId', '==', userId)
    );
    return onSnapshot(q, async (snap) => {
      const followers = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          try {
            const userSnap = await getDoc(doc(db, 'users', data.followerId));
            const userData = userSnap.exists() ? userSnap.data() : {};
            return {
              id: data.followerId,
              uid: data.followerId,
              name: userData.fullName || userData.contactPersonName || userData.businessName || 'Unknown',
              role: data.followerRole,
              district: userData.district || '',
              phone: userData.phone || '',
              followedAt: data.createdAt,
            };
          } catch {
            return {
              id: data.followerId,
              uid: data.followerId,
              name: 'Unknown',
              role: data.followerRole,
              district: '',
              phone: '',
            };
          }
        })
      );
      callback(followers);
    }, (err) => {
      console.warn('subscribeToFollowers error:', err.message);
      callback([]);
    });
  } catch (e) {
    console.warn('subscribeToFollowers failed:', e);
    callback([]);
    return () => {};
  }
}

// ── Get follower count for a user (real-time) ────────────────
export function subscribeToFollowerCount(userId, callback) {
  if (!userId) { callback(0); return () => {}; }
  try {
    const q = query(collection(db, 'follows'), where('followeeId', '==', userId));
    return onSnapshot(q, (snap) => callback(snap.size));
  } catch (e) {
    callback(0);
    return () => {};
  }
}
