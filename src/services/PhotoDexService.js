import { db } from '../firebase';
import { doc, getDoc, getDocs, addDoc, updateDoc, runTransaction, collection, query, where, orderBy, limit, serverTimestamp, increment } from 'firebase/firestore';
import { PHOTODEX_SUBJECTS, normalizeSubjectKey, REWARD_MILESTONES } from '../constants/photoDexSubjects';

export const PhotoDexService = {
    /**
     * Calculate Photo Points based on rarity and coolness scores
     * Formula: PP = (rarity * 50) + (coolness * 50), clamped to [100, 1000]
     */
    calculatePhotoPoints: (rarityScore, coolnessScore = 5) => {
        const pp = (rarityScore * 50) + (coolnessScore * 50);
        return Math.max(100, Math.min(1000, pp));
    },

    /**
     * Extract subjects from post data
     */
    extractSubjectsFromPost: (postData) => {
        const subjects = [];

        // Check tags for known subjects
        if (postData.tags && Array.isArray(postData.tags)) {
            postData.tags.forEach(tag => {
                const normalized = normalizeSubjectKey(tag);
                if (PHOTODEX_SUBJECTS[normalized]) {
                    subjects.push({
                        key: normalized,
                        ...PHOTODEX_SUBJECTS[normalized]
                    });
                }
            });
        }

        // Check location for parks (simple matching for now)
        if (postData.location) {
            const locationLower = postData.location.toLowerCase();
            Object.entries(PHOTODEX_SUBJECTS).forEach(([key, subject]) => {
                if (subject.type === 'park' && locationLower.includes(subject.name.toLowerCase())) {
                    subjects.push({ key, ...subject });
                }
            });
        }

        return subjects;
    },

    /**
     * Check if user already has a badge for this subject
     */
    checkExistingBadge: async (userId, subjectKey) => {
        try {
            const q = query(
                collection(db, 'photoDexEntries'),
                where('userId', '==', userId),
                where('subjectKey', '==', subjectKey),
                limit(1)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty ? snapshot.docs[0].data() : null;
        } catch (error) {
            console.error('Error checking existing badge:', error);
            return null;
        }
    },

    /**
     * Award badge and Photo Points to user
     */
    awardBadge: async (userId, userName, postId, subject, imageUrl) => {
        try {
            return await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error('User not found');
                }

                const userData = userDoc.data();
                const currentPP = userData.photoPoints || 0;

                // Calculate PP for this badge (using default coolness of 5 for now)
                const pointsAwarded = PhotoDexService.calculatePhotoPoints(subject.rarity, 5);

                // Create badge entry
                const badgeData = {
                    userId,
                    userName,
                    type: subject.type,
                    subjectKey: subject.key,
                    subjectName: subject.name,
                    badgeImageUrl: imageUrl,
                    pointsAwarded,
                    rarityScore: subject.rarity,
                    coolnessScore: 5,
                    relatedPostId: postId,
                    createdAt: serverTimestamp()
                };

                const badgeRef = doc(collection(db, 'photoDexEntries'));
                transaction.set(badgeRef, badgeData);

                // Update user stats
                const newPP = currentPP + pointsAwarded;
                const stats = userData.photoDexStats || {};
                const typeKey = `${subject.type}Badges`;

                transaction.update(userRef, {
                    photoPoints: newPP,
                    [`photoDexStats.totalBadges`]: increment(1),
                    [`photoDexStats.${typeKey}`]: increment(1)
                });

                // Check for milestone rewards
                const newRewards = PhotoDexService.checkMilestoneRewards(currentPP, newPP);
                for (const reward of newRewards) {
                    const rewardRef = doc(collection(db, 'photoDexRewards'));
                    transaction.set(rewardRef, {
                        userId,
                        ...reward,
                        claimedAt: null,
                        createdAt: serverTimestamp()
                    });
                }

                return {
                    badgeId: badgeRef.id,
                    pointsAwarded,
                    newTotalPP: newPP,
                    newRewards
                };
            });
        } catch (error) {
            console.error('Error awarding badge:', error);
            throw error;
        }
    },

    /**
     * Award bonus XP for duplicate subject
     */
    awardBonusXP: async (userId, subjectKey) => {
        try {
            const bonusXP = 25; // Small bonus for duplicate subjects
            const userRef = doc(db, 'users', userId);

            await updateDoc(userRef, {
                photoPoints: increment(bonusXP)
            });

            return bonusXP;
        } catch (error) {
            console.error('Error awarding bonus XP:', error);
            return 0;
        }
    },

    /**
     * Check and award badges for a post
     */
    checkAndAwardBadge: async (userId, userName, postId, postData) => {
        try {
            const subjects = PhotoDexService.extractSubjectsFromPost(postData);

            if (subjects.length === 0) {
                return { newBadges: [], bonusXP: 0 };
            }

            const newBadges = [];
            let totalBonusXP = 0;
            const imageUrl = postData.downloadURL || postData.images?.[0]?.url;

            for (const subject of subjects) {
                // Check if user already has this badge
                const existingBadge = await PhotoDexService.checkExistingBadge(userId, subject.key);

                if (!existingBadge) {
                    // Award new badge
                    const result = await PhotoDexService.awardBadge(
                        userId,
                        userName,
                        postId,
                        subject,
                        imageUrl
                    );
                    newBadges.push({
                        ...subject,
                        ...result
                    });
                } else {
                    // Award bonus XP for duplicate
                    const bonusXP = await PhotoDexService.awardBonusXP(userId, subject.key);
                    totalBonusXP += bonusXP;
                }
            }

            return { newBadges, bonusXP: totalBonusXP };
        } catch (error) {
            console.error('Error checking and awarding badges:', error);
            return { newBadges: [], bonusXP: 0 };
        }
    },

    /**
     * Get all badges for a user
     */
    getUserBadges: async (userId, type = null) => {
        try {
            let q = query(
                collection(db, 'photoDexEntries'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            if (type) {
                q = query(
                    collection(db, 'photoDexEntries'),
                    where('userId', '==', userId),
                    where('type', '==', type),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching user badges:', error);
            return [];
        }
    },

    /**
     * Get user's Photo Points and stats
     */
    getUserPhotoPoints: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    photoPoints: data.photoPoints || 0,
                    stats: data.photoDexStats || {
                        totalBadges: 0,
                        animalBadges: 0,
                        birdBadges: 0,
                        plantBadges: 0,
                        parkBadges: 0,
                        celestialBadges: 0,
                        landscapeBadges: 0
                    }
                };
            }
            return { photoPoints: 0, stats: {} };
        } catch (error) {
            console.error('Error fetching photo points:', error);
            return { photoPoints: 0, stats: {} };
        }
    },

    /**
     * Check for milestone rewards
     */
    checkMilestoneRewards: (oldPP, newPP) => {
        const newRewards = [];

        Object.entries(REWARD_MILESTONES).forEach(([milestone, reward]) => {
            const milestoneValue = parseInt(milestone);
            if (oldPP < milestoneValue && newPP >= milestoneValue) {
                newRewards.push({
                    rewardType: reward.type,
                    rewardValue: reward.value,
                    milestone: milestoneValue,
                    description: reward.description,
                    icon: reward.icon
                });
            }
        });

        return newRewards;
    },

    /**
     * Get user's rewards
     */
    getUserRewards: async (userId) => {
        try {
            const q = query(
                collection(db, 'photoDexRewards'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching rewards:', error);
            return [];
        }
    },

    /**
     * Claim a reward
     */
    claimReward: async (rewardId) => {
        try {
            const rewardRef = doc(db, 'photoDexRewards', rewardId);
            await updateDoc(rewardRef, {
                claimedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error claiming reward:', error);
            return false;
        }
    }
};
