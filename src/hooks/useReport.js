import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useReport = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitReport = async ({ type, targetId, reason, description = '' }) => {
        if (!currentUser) {
            throw new Error('You must be logged in to report content.');
        }

        setLoading(true);
        setError(null);

        try {
            // Check for existing report from this user for this target
            const q = query(
                collection(db, 'reports'),
                where('reportedBy', '==', currentUser.uid),
                where('targetId', '==', targetId),
                where('type', '==', type)
            );

            const existingReports = await getDocs(q);

            if (!existingReports.empty) {
                throw new Error('You have already reported this content.');
            }

            // Create report
            await addDoc(collection(db, 'reports'), {
                type, // 'post' or 'user'
                targetId,
                reason,
                description,
                reportedBy: currentUser.uid,
                reporterName: currentUser.displayName || 'Anonymous',
                status: 'pending',
                createdAt: serverTimestamp()
            });

            return true;
        } catch (err) {
            console.error('Error submitting report:', err);
            setError(err.message || 'Failed to submit report');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        submitReport,
        loading,
        error
    };
};
