import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import type { MonthlyWinner, ContestStats, ContestEntry } from '../types/contest';

/**
 * Get current month's top posts for leaderboard
 */
export async function getCurrentMonthLeaders(limitCount: number = 50): Promise<ContestEntry[]> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
        collection(db, 'posts'),
        where('createdAt', '>=', Timestamp.fromDate(monthStart)),
        orderBy('createdAt', 'desc'),
        limit(200)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
        postId: doc.id,
        ...doc.data()
    })) as any[];

    // Sort by like count
    const sorted = posts
        .filter(p => p.likeCount && p.likeCount > 0)
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, limitCount);

    return sorted.map((post, index) => ({
        postId: post.postId,
        userId: post.authorId,
        userName: post.authorName,
        userPhoto: post.authorPhoto,
        imageUrl: post.imageUrl || post.items?.[0]?.url || '',
        title: post.title,
        likeCount: post.likeCount || 0,
        rank: index + 1
    }));
}

/**
 * Get previous month's winner
 */
export async function getPreviousWinner(): Promise<MonthlyWinner | null> {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const q = query(
        collection(db, 'monthlyWinners'),
        where('month', '==', lastMonth),
        where('year', '==', lastYear),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty || !snapshot.docs[0]) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as MonthlyWinner;
}

/**
 * Get all winners for Hall of Fame
 */
export async function getAllWinners(): Promise<MonthlyWinner[]> {
    const q = query(
        collection(db, 'monthlyWinners'),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonthlyWinner));
}

/**
 * Get contest stats for UI
 */
export async function getContestStats(): Promise<ContestStats> {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const [topPosts, previousWinner] = await Promise.all([
        getCurrentMonthLeaders(50),
        getPreviousWinner()
    ]);

    return {
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
        daysRemaining,
        topPosts,
        previousWinner: previousWinner || undefined
    };
}
