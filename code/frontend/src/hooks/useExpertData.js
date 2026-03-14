import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
    getDashboardStats,
    getConsultations,
    getForumQuestions,
    getArticles,
    getMyFarmers,
    getExpertProfile,
} from '../services/expertService';

export function useExpertData(type = 'overview') {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const expertId = getAuth().currentUser?.uid;

    useEffect(() => {
        if (!expertId) return;

        const fetchers = {
            overview: () => Promise.all([getDashboardStats(expertId), getConsultations(expertId), getForumQuestions(3)]).then(([stats, consultations, questions]) => ({ stats, consultations: consultations.slice(0, 3), questions })),
            consultations: () => getConsultations(expertId),
            qa: () => getForumQuestions(20),
            knowledge: () => getArticles(expertId),
            farmers: () => getMyFarmers(expertId),
            settings: () => getExpertProfile(expertId),
        };

        const fetch = fetchers[type];
        if (!fetch) return;

        setLoading(true);
        fetch()
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [expertId, type]);

    return { data, loading, error, expertId };
}