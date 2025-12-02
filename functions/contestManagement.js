const { db, admin } = require('./shared/admin');
const { FieldValue } = require('firebase-admin/firestore');
const { filterValidLikes } = require('./antiCheat');

/**
 * Create a new contest
 */
async function createContest(contestData) {
    try {
        const contestRef = db.collection('contests').doc();

        // Generate search keywords from title and tags
        const searchKeywords = [
            ...contestData.title.toLowerCase().split(' ').filter(w => w.length > 2),
            ...(contestData.tags || []).map(t => t.toLowerCase())
        ];

        const contest = {
            ...contestData,
            id: contestRef.id,
            searchKeywords,
            deadline: contestData.endAt, // For search compatibility
            entryCount: 0,
            totalPrizePool: contestData.prizePool,
            createdAt: FieldValue.serverTimestamp()
        };

        await contestRef.set(contest);

        return { success: true, contestId: contestRef.id };
    } catch (error) {
        console.error('Error creating contest:', error);
        throw error;
    }
}

/**
 * Close contest and calculate winners
 */
async function closeContest(contestId) {
    try {
        const contestRef = db.collection('contests').doc(contestId);
        const contestDoc = await contestRef.get();

        if (!contestDoc.exists) {
            throw new Error('Contest not found');
        }

        const contest = contestDoc.data();

        // Update contest status to closed
        await contestRef.update({
            status: 'closed'
        });

        // Calculate winners
        const winners = await calculateWinners(contestId);

        // Distribute prizes
        if (winners.length > 0) {
            await distributePrizes(contestId, winners, contest.prizePool);
        }

        return { success: true, winners };
    } catch (error) {
        console.error('Error closing contest:', error);
        throw error;
    }
}

/**
 * Calculate winners based on valid likes
 */
async function calculateWinners(contestId) {
    try {
        const entriesSnapshot = await db.collection(`contests/${contestId}/entries`)
            .where('isValidEntry', '==', true)
            .get();

        const entriesWithLikes = [];

        // Calculate valid likes for each entry
        for (const entryDoc of entriesSnapshot.docs) {
            const entry = entryDoc.data();
            const validLikeCount = await filterValidLikes(entry.postId, contestId);

            // Get post data for display
            const postDoc = await db.collection('posts').doc(entry.postId).get();
            const post = postDoc.exists ? postDoc.data() : {};

            entriesWithLikes.push({
                ...entry,
                id: entryDoc.id,
                validLikeCount,
                imageUrl: post.imageUrl || post.items?.[0]?.url || '',
                title: post.title || 'Untitled'
            });

            // Update entry with final like count
            await entryDoc.ref.update({
                likeCount: post.likeCount || 0,
                validLikeCount
            });
        }

        // Sort by valid likes
        entriesWithLikes.sort((a, b) => b.validLikeCount - a.validLikeCount);

        // Assign ranks
        entriesWithLikes.forEach((entry, index) => {
            entry.finalRank = index + 1;
        });

        // Update entries with final ranks
        for (const entry of entriesWithLikes) {
            await db.collection(`contests/${contestId}/entries`).doc(entry.id).update({
                finalRank: entry.finalRank
            });
        }

        return entriesWithLikes;
    } catch (error) {
        console.error('Error calculating winners:', error);
        throw error;
    }
}

/**
 * Distribute prizes to winners
 */
async function distributePrizes(contestId, winners, totalPrizePool) {
    try {
        if (winners.length === 0) {
            return;
        }

        // Prize distribution: 50% to 1st, 30% to 2nd, 20% to 3rd
        const prizeDistribution = [0.5, 0.3, 0.2];

        for (let i = 0; i < Math.min(3, winners.length); i++) {
            const winner = winners[i];
            const prize = totalPrizePool * prizeDistribution[i];

            // Add funds to winner's wallet
            const userRef = db.collection('users').doc(winner.userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const currentWallet = userDoc.data().wallet || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };

                await userRef.update({
                    wallet: {
                        ...currentWallet,
                        balance: (currentWallet.balance || 0) + prize,
                        lifetimeEarnings: (currentWallet.lifetimeEarnings || 0) + prize
                    }
                });

                // Create transaction record
                await db.collection('transactions').add({
                    userId: winner.userId,
                    type: 'contest_prize',
                    amount: prize,
                    description: `Contest prize - Rank ${i + 1}`,
                    relatedItemId: contestId,
                    relatedItemType: 'contest',
                    createdAt: FieldValue.serverTimestamp()
                });

                // Update entry with prize won
                await db.collection(`contests/${contestId}/entries`).doc(winner.id).update({
                    prizeWon: prize
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error distributing prizes:', error);
        throw error;
    }
}

module.exports = {
    createContest,
    closeContest,
    calculateWinners,
    distributePrizes
};
