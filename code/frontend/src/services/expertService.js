import {
    collection, doc, query, where, orderBy, limit,
    getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
    serverTimestamp, onSnapshot, increment,
} from 'firebase/firestore';
import { db, auth } from '../utils/firebase.js'; // adjust to your firebase config path


// ─── CONSULTATIONS ────────────────────────────────────────────────────────────

export const getConsultations = async (expertId) => {
    const q = query(
        collection(db, 'consultations'),
        where('expertId', '==', expertId),
        orderBy('scheduledAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateConsultationStatus = async (id, status, data = {}) => {
    const ref = doc(db, 'consultations', id);
    // Use setDoc with merge so it works even if the doc doesn't exist (e.g. dummy data)
    await setDoc(ref, { 
        ...data,
        status, 
        updatedAt: serverTimestamp() 
    }, { merge: true });
};

// ─── Q&A FORUM ────────────────────────────────────────────────────────────────

export const getForumQuestions = async (limitCount = 20) => {
    const q = query(
        collection(db, 'questions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addAnswer = async (questionId, expertId, answerText, questionData = {}) => {
    const qRef = doc(db, 'questions', questionId);
    const aRef = collection(qRef, 'answers');

    // Promote dummy question to real if needed
    if (questionData.question) {
        await setDoc(qRef, {
            ...questionData,
            updatedAt: serverTimestamp()
        }, { merge: true });
    }

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

export const getArticles = async (expertId) => {
    const q = query(
        collection(db, 'articles'),
        where('expertId', '==', expertId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

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

// ─── MY FARMERS ───────────────────────────────────────────────────────────────

export const getMyFarmers = async (expertId) => {
    const q = query(
        collection(db, 'expertFarmers'),
        where('expertId', '==', expertId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeToFarmers = (expertId, callback) => {
    const q = query(
        collection(db, 'expertFarmers'),
        where('expertId', '==', expertId)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

// ─── EXPERT PROFILE ───────────────────────────────────────────────────────────

// ─── EXPERT PROFILE ───────────────────────────────────────────────────────────

export const getExpertProfile = async (expertId) => {
    // Check experts collection first
    const expertSnap = await getDoc(doc(db, 'experts', expertId));
    const expertData = expertSnap.exists() ? expertSnap.data() : {};

    // Check users collection for base info (like fullName)
    const userSnap = await getDoc(doc(db, 'users', expertId));
    const userData = userSnap.exists() ? userSnap.data() : {};

    if (!expertSnap.exists() && !userSnap.exists()) return null;

    return {
        id: expertId,
        name: userData.fullName || expertData.name || '',
        ...expertData,
        email: userData.email || expertData.email || '',
    };
};

export const updateExpertProfile = async (expertId, data) => {
    const { name, email, ...expertSpecificData } = data;

    const updates = [];

    // Update users collection if name exists
    if (name) {
        updates.push(updateDoc(doc(db, 'users', expertId), {
            fullName: name,
            updatedAt: serverTimestamp()
        }));
    }

    // Update experts collection
    updates.push(setDoc(doc(db, 'experts', expertId), {
        ...expertSpecificData,
        name: name || '',
        updatedAt: serverTimestamp()
    }, { merge: true }));

    await Promise.all(updates);
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const getDashboardStats = async (expertId) => {
    const [consultSnap, farmersSnap] = await Promise.all([
        getDocs(query(collection(db, 'consultations'), where('expertId', '==', expertId))),
        getDocs(query(collection(db, 'expertFarmers'), where('expertId', '==', expertId))),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = consultSnap.docs.filter(d => {
        const date = d.data().scheduledAt?.toDate?.();
        return date && date >= startOfMonth;
    }).length;

    const profileSnap = await getDoc(doc(db, 'experts', expertId));
    const rating = profileSnap.data()?.rating ?? 0;

    return {
        totalConsultations: consultSnap.size,
        thisMonth,
        rating,
        activeFarmers: farmersSnap.size,
    };
};

// ─── LISTENERS (REAL-TIME) ───────────────────────────────────────────────────

export const subscribeToConsultations = (expertId, callback) => {
    const q = query(
        collection(db, 'consultations'),
        where('expertId', '==', expertId),
        orderBy('scheduledAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const subscribeToArticles = (expertId, callback) => {
    const q = query(
        collection(db, 'articles'),
        where('expertId', '==', expertId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const subscribeToQuestions = (limitCount, callback) => {
    const q = query(
        collection(db, 'questions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const subscribeToProfile = (expertId, callback) => {
    return onSnapshot(doc(db, 'users', expertId), async (userSnap) => {
        let expertData = {};
        try {
            const expertSnap = await getDoc(doc(db, 'experts', expertId));
            if (expertSnap.exists()) expertData = expertSnap.data();
        } catch (e) { console.warn('Expert profile fetch failed (offline)'); }
        
        const userData = userSnap.exists() ? userSnap.data() : {};
        
        callback({
            id: expertId,
            name: userData.fullName || expertData.name || localStorage.getItem('userName') || 'Expert',
            ...expertData,
            email: userData.email || expertData.email || '',
        });
    });
};
