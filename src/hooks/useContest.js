import { useState, useEffect } from 'react';
import { getContest, getContestLeaderboard } from '@/services/contestService';

/**
 * Hook to fetch a contest and its leaderboard
 * @param {string} contestId - Contest ID to fetch
 * @returns {object} { contest, leaderboard, loading, error, refetch }
 */
export const useContest = (contestId) => {
    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!contestId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [contestData, leaderboardData] = await Promise.all([
                getContest(contestId),
                getContestLeaderboard(contestId)
            ]);

            setContest(contestData);
            setLeaderboard(leaderboardData);
        } catch (err) {
            console.error('Error fetching contest:', err);
            setError(err.message || 'Failed to load contest');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [contestId]);

    return { contest, leaderboard, loading, error, refetch };
};

export default useContest;
