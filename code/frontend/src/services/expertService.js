import {
    collection, doc, query, where, orderBy, limit,
    getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../utils/firebase'; // adjust to your firebase config path


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

export const updateConsultationStatus = async (consultationId, status) => {
    await updateDoc(doc(db, 'consultations', consultationId), { status });
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

export const addAnswer = async (questionId, expertId, answerText) => {
    await addDoc(collection(db, 'questions', questionId, 'answers'), {
        expertId,
        text: answerText,
        createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'questions', questionId), {
        replyCount: (await getDoc(doc(db, 'questions', questionId))).data().replyCount + 1,
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

// ─── EXPERT PROFILE ───────────────────────────────────────────────────────────

export const getExpertProfile = async (expertId) => {
    const snap = await getDoc(doc(db, 'experts', expertId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateExpertProfile = async (expertId, data) => {
    await updateDoc(doc(db, 'experts', expertId), { ...data, updatedAt: serverTimestamp() });
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