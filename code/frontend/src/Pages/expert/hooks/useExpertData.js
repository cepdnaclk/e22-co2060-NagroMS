import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
    getDashboardStats,
    subscribeToConsultations,
    subscribeToArticles,
    subscribeToQuestions,
    subscribeToProfile,
    subscribeToFarmers,
    getMyFarmers,
} from '../../../services/expertService';
import {
    DUMMY_OVERVIEW, DUMMY_CONSULTATIONS, DUMMY_QUESTIONS,
    DUMMY_ARTICLES, DUMMY_FARMERS, DUMMY_PROFILE,
} from '../data/expertDummyData';

const DUMMY_MAP = {
    overview: DUMMY_OVERVIEW,
    consultations: DUMMY_CONSULTATIONS,
    qa: DUMMY_QUESTIONS,
    knowledge: DUMMY_ARTICLES,
    farmers: DUMMY_FARMERS,
    settings: DUMMY_PROFILE,
};

export function useExpertData(type = 'overview') {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const expertId = getAuth().currentUser?.uid;

    useEffect(() => {
        if (!expertId) {
            setData(DUMMY_MAP[type] ?? null);
            setLoading(false);
            return;
        }

        let unsub = () => { };

        const init = async () => {
            setLoading(true);
            try {
                if (type === 'overview') {
                    // Start with dummy data but fetch real data
                    setData(DUMMY_MAP.overview);

                    try {
                        const stats = await getDashboardStats(expertId);
                        setData(prev => ({ ...prev, stats: stats || DUMMY_OVERVIEW.stats }));
                    } catch (e) { console.warn('Stats fetch failed'); }

                    const unsubConsult = subscribeToConsultations(expertId, (list) => {
                        setData(prev => ({ ...prev, consultations: list.length > 0 ? list.slice(0, 3) : DUMMY_CONSULTATIONS.slice(0, 3) }));
                    });
                    const unsubQA = subscribeToQuestions(3, (list) => {
                        setData(prev => ({ ...prev, questions: list.length > 0 ? list : DUMMY_QUESTIONS.slice(0, 3) }));
                    });
                    const unsubProf = subscribeToProfile(expertId, (prof) => {
                        setData(prev => ({ ...prev, profile: prof }));
                        if (prof?.name) localStorage.setItem('userName', prof.name);
                    });
                    unsub = () => { unsubConsult(); unsubQA(); unsubProf(); };
                }
                else if (type === 'consultations') {
                    unsub = subscribeToConsultations(expertId, (list) => {
                        setData(list.length > 0 ? list : DUMMY_CONSULTATIONS);
                    });
                }
                else if (type === 'qa') {
                    unsub = subscribeToQuestions(20, (list) => {
                        setData(list.length > 0 ? list : DUMMY_QUESTIONS);
                    });
                }
                else if (type === 'knowledge') {
                    unsub = subscribeToArticles(expertId, (list) => {
                        setData(list.length > 0 ? list : DUMMY_ARTICLES);
                    });
                }
                else if (type === 'farmers') {
                    unsub = subscribeToFarmers(expertId, (list) => {
                        setData(list.length > 0 ? list : DUMMY_FARMERS);
                    });
                }
                else if (type === 'settings') {
                    unsub = subscribeToProfile(expertId, (prof) => {
                        setData(prof || DUMMY_PROFILE);
                    });
                }
            } catch (err) {
                console.warn('Real-time subscription failed:', err);
                setData(DUMMY_MAP[type] ?? null);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        init();
        return () => unsub();
    }, [expertId, type]);

    return { data, loading, error, expertId: expertId || 'demo-expert-1' };
}