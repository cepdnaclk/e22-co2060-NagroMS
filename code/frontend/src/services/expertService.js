import {
    collection, doc, query, where,
    getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
    serverTimestamp, onSnapshot, increment,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../utils/firebase.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const mapUserToDisplay = (uid, data = {}) => {
    const roles = data.roles || [];
    const primaryRole = roles.includes('farmer') ? 'farmer'
        : roles.includes('customer') ? 'customer'
        : roles[0] || 'user';

    return {
        id: uid,
        uid,
        name: data.fullName || data.contactPersonName || data.businessName || data.name || 'Unknown User',
        email: data.email || '',
        phone: data.phone || '',
        district: data.district || data.location || '',
        role: primaryRole,
        roles,
        cropType: data.cropType || data.primaryCrop || '',
        businessName: data.businessName || '',
    };
};

export const getUserProfile = async (userId) => {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return mapUserToDisplay(userId, snap.data());
};

// ─── CONSULTATIONS ────────────────────────────────────────────────────────────

export const updateConsultationStatus = async (id, status, data = {}) => {
    const ref = doc(db, 'consultations', id);
    await updateDoc(ref, {
        ...data,
        status,
        updatedAt: serverTimestamp(),
    }).catch(async () => {
        await setDoc(ref, {
            ...data,
            status,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
};

// ─── Q&A FORUM ────────────────────────────────────────────────────────────────

export const addAnswer = async (questionId, expertId, answerText) => {
    const qRef = doc(db, 'questions', questionId);
    const aRef = collection(qRef, 'answers');

    await addDoc(aRef, {
        expertId,
        text: answerText,
        createdAt: serverTimestamp(),
    });

    await updateDoc(qRef, {
        replyCount: increment(1),
        lastReplyAt: serverTimestamp(),
    });
};

// ─── KNOWLEDGE BASE ───────────────────────────────────────────────────────────

export const createArticle = async (expertId, data) => {
    return await addDoc(collection(db, 'articles'), {
        expertId,
        ...data,
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
    });
};

export const updateArticle = async (articleId, data) => {
    await updateDoc(doc(db, 'articles', articleId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteArticle = async (articleId) => {
    await deleteDoc(doc(db, 'articles', articleId));
};

// ─── CONNECTIONS (incoming from farmers / customers) ───────────────────────────

export const subscribeToIncomingConnections = (expertId, callback) => {
    const q = query(
        collection(db, 'connections'),
        where('targetId', '==', expertId)
    );

    return onSnapshot(q, async (snap) => {
        const enriched = await Promise.all(
            snap.docs.map(async (d) => {
                const conn = { id: d.id, ...d.data() };
                try {
                    const profile = await getUserProfile(conn.requesterId);
                    return { ...conn, requester: profile };
                } catch {
                    return { ...conn, requester: null };
                }
            })
        );
        enriched.sort((a, b) => {
            const ta = a.createdAt?.toDate?.() || new Date(0);
            const tb = b.createdAt?.toDate?.() || new Date(0);
            return tb - ta;
        });
        callback(enriched);
    }, (err) => {
        console.warn('Connections subscription error:', err.message);
        callback([]);
    });
};

export const acceptConnection = async (connection, expertId) => {
    const requester = connection.requester || await getUserProfile(connection.requesterId);
    if (!requester) throw new Error('Requester profile not found');

    const memberId = connection.requesterId;
    const linkId = `${expertId}_${memberId}`;

    await setDoc(doc(db, 'expertFarmers', linkId), {
        expertId,
        memberId,
        memberRole: requester.role,
        name: requester.name,
        email: requester.email,
        phone: requester.phone,
        district: requester.district,
        cropType: requester.cropType || requester.businessName || '',
        status: 'active',
        connectedAt: serverTimestamp(),
    }, { merge: true });

    await updateDoc(doc(db, 'connections', connection.id), {
        status: 'accepted',
        expertAcknowledged: true,
        respondedAt: serverTimestamp(),
    });
};

export const declineConnection = async (connectionId) => {
    await updateDoc(doc(db, 'connections', connectionId), {
        status: 'declined',
        expertAcknowledged: true,
        respondedAt: serverTimestamp(),
    });
};

// ─── EXPERT PROFILE ───────────────────────────────────────────────────────────

export const ensureExpertProfile = async (expertId) => {
    // Guard: don't attempt Firestore writes without an authenticated user
    const currentUser = getAuth().currentUser;
    if (!currentUser || currentUser.uid !== expertId) {
        console.warn('ensureExpertProfile: skipping — user not authenticated yet');
        return;
    }

    const expertRef = doc(db, 'experts', expertId);
    const snap = await getDoc(expertRef);
    if (snap.exists()) return;

    const userSnap = await getDoc(doc(db, 'users', expertId));
    const userData = userSnap.exists() ? userSnap.data() : {};

    try {
        await setDoc(expertRef, {
            name: userData.fullName || '',
            email: userData.email || '',
            specialization: '',
            experience: 0,
            bio: '',
            availVideo: true,
            availPhone: true,
            availChat: true,
            rating: 0,
            createdAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.warn('ensureExpertProfile: failed to create profile —', err.message);
    }
};

export const updateExpertProfile = async (expertId, data) => {
    const { name, email, ...expertSpecificData } = data;
    const updates = [];

    if (name) {
        updates.push(updateDoc(doc(db, 'users', expertId), {
            fullName: name,
            updatedAt: serverTimestamp(),
        }).catch(() => setDoc(doc(db, 'users', expertId), {
            fullName: name,
            updatedAt: serverTimestamp(),
        }, { merge: true })));
    }

    updates.push(setDoc(doc(db, 'experts', expertId), {
        ...expertSpecificData,
        name: name || '',
        updatedAt: serverTimestamp(),
    }, { merge: true }));

    await Promise.all(updates);
};

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────────

export const getDashboardStats = async (expertId) => {
    // Guard: don't attempt queries without an authenticated user
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        console.warn('getDashboardStats: skipping — user not authenticated yet');
        return {
            totalConsultations: 0, thisMonth: 0, rating: 0,
            activeFarmers: 0, pendingConnections: 0,
        };
    }

    const [consultSnap, membersSnap, connSnap, profileSnap] = await Promise.all([
        getDocs(query(collection(db, 'consultations'), where('expertId', '==', expertId))),
        getDocs(query(collection(db, 'expertFarmers'), where('expertId', '==', expertId))),
        getDocs(query(collection(db, 'connections'), where('targetId', '==', expertId))),
        getDoc(doc(db, 'experts', expertId)),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = consultSnap.docs.filter(d => {
        const date = d.data().scheduledAt?.toDate?.();
        return date && date >= startOfMonth;
    }).length;

    const pendingConnections = connSnap.docs.filter(d => {
        const s = d.data().status;
        return s === 'connected' || s === 'pending';
    }).filter(d => !d.data().expertAcknowledged).length;

    return {
        totalConsultations: consultSnap.size,
        thisMonth,
        rating: profileSnap.data()?.rating ?? 0,
        activeFarmers: membersSnap.size,
        pendingConnections,
    };
};

// ─── REAL-TIME LISTENERS ─────────────────────────────────────────────────────

export const subscribeToConsultations = (expertId, callback) => {
    const q = query(
        collection(db, 'consultations'),
        where('expertId', '==', expertId)
    );
    return onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
            const ta = a.scheduledAt?.toDate?.() || new Date(0);
            const tb = b.scheduledAt?.toDate?.() || new Date(0);
            return ta - tb;
        });
        callback(list);
    }, () => callback([]));
};

export const subscribeToArticles = (expertId, callback) => {
    const q = query(
        collection(db, 'articles'),
        where('expertId', '==', expertId)
    );
    return onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
            const ta = a.createdAt?.toDate?.() || new Date(0);
            const tb = b.createdAt?.toDate?.() || new Date(0);
            return tb - ta;
        });
        callback(list);
    }, () => callback([]));
};

export const subscribeToQuestions = (limitCount, callback) => {
    const q = query(collection(db, 'questions'));
    return onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
            const ta = a.createdAt?.toDate?.() || new Date(0);
            const tb = b.createdAt?.toDate?.() || new Date(0);
            return tb - ta;
        });
        callback(list.slice(0, limitCount));
    }, () => callback([]));
};

export const subscribeToFarmers = (expertId, callback) => {
    const q = query(
        collection(db, 'expertFarmers'),
        where('expertId', '==', expertId)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => callback([]));
};

export const subscribeToProfile = (expertId, callback) => {
    let userData = {};
    let expertData = {};

    const emit = () => {
        callback({
            id: expertId,
            name: userData.fullName || expertData.name || '',
            email: userData.email || expertData.email || '',
            phone: userData.phone || expertData.phone || '',
            district: userData.district || expertData.district || '',
            ...expertData,
        });
    };

    const unsubUser = onSnapshot(doc(db, 'users', expertId), (snap) => {
        userData = snap.exists() ? snap.data() : {};
        emit();
    }, () => emit());

    const unsubExpert = onSnapshot(doc(db, 'experts', expertId), (snap) => {
        expertData = snap.exists() ? snap.data() : {};
        emit();
    }, () => emit());

    return () => { unsubUser(); unsubExpert(); };
};
