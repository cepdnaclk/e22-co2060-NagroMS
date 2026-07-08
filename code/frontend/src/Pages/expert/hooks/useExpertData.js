import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    getDashboardStats,
    subscribeToConsultations,
    subscribeToArticles,
    subscribeToQuestions,
    subscribeToProfile,
    subscribeToFarmers,
    subscribeToIncomingConnections,
    ensureExpertProfile,
} from '../../../services/expertService';

const EMPTY_OVERVIEW = {
    stats: {
        totalConsultations: 0,
        thisMonth: 0,
        rating: 0,
        activeFarmers: 0,
        pendingConnections: 0,
    },
    consultations: [],
    questions: [],
    connections: [],
    profile: null,
};

export function useExpertData(type = 'overview') {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expertId, setExpertId] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (mountedRef.current) {
                setExpertId(user?.uid || null);
                setAuthReady(true);
            }
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        // Don't do anything until Firebase auth has confirmed the user state
        if (!authReady) return;

        if (!expertId) {
            setData(null);
            setLoading(false);
            return;
        }

        let unsub = () => { };

        const init = async () => {
            setLoading(true);
            setError(null);

            try {
                await ensureExpertProfile(expertId);

                // Bail out if component unmounted during async work
                if (!mountedRef.current) return;

                if (type === 'overview') {
                    setData(EMPTY_OVERVIEW);

                    getDashboardStats(expertId).then(stats => {
                        if (mountedRef.current) setData(prev => ({ ...prev, stats }));
                    }).catch(err => console.warn('Stats fetch failed:', err.message));

                    const unsubConsult = subscribeToConsultations(expertId, (list) => {
                        const upcoming = list
                            .filter(c => ['pending', 'confirmed', 'rescheduled'].includes(c.status))
                            .slice(0, 3);
                        setData(prev => ({ ...prev, consultations: upcoming }));
                    });

                    const unsubQA = subscribeToQuestions(3, (list) => {
                        setData(prev => ({ ...prev, questions: list }));
                    });

                    const unsubConn = subscribeToIncomingConnections(expertId, (list) => {
                        const pending = list.filter(c =>
                            (c.status === 'connected' || c.status === 'pending') && !c.expertAcknowledged
                        );
                        setData(prev => ({ ...prev, connections: pending.slice(0, 5) }));
                    });

                    const unsubProf = subscribeToProfile(expertId, (prof) => {
                        setData(prev => ({ ...prev, profile: prof }));
                        if (prof?.name) localStorage.setItem('userName', prof.name);
                    });

                    unsub = () => {
                        unsubConsult();
                        unsubQA();
                        unsubConn();
                        unsubProf();
                    };
                }
                else if (type === 'consultations') {
                    unsub = subscribeToConsultations(expertId, setData);
                }
                else if (type === 'qa') {
                    unsub = subscribeToQuestions(20, setData);
                }
                else if (type === 'knowledge') {
                    unsub = subscribeToArticles(expertId, setData);
                }
                else if (type === 'farmers') {
                    unsub = subscribeToFarmers(expertId, setData);
                }
                else if (type === 'connections') {
                    unsub = subscribeToIncomingConnections(expertId, (list) => {
                        setData(list);
                    });
                }
                else if (type === 'settings') {
                    unsub = subscribeToProfile(expertId, setData);
                }
            } catch (err) {
                console.warn('Expert data subscription failed:', err.message);
                if (mountedRef.current) {
                    setError(err);
                    setData(type === 'overview' ? EMPTY_OVERVIEW : []);
                }
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };

        init();
        return () => unsub();
    }, [expertId, type, authReady]);

    return { data, loading, error, expertId };
}
