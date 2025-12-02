/**
 * Monthly Photo Contest Types
 */

import { Timestamp } from 'firebase/firestore';

export interface MonthlyWinner {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    postId: string;
    imageUrl: string;
    title: string;
    likeCount: number;
    month: number; // 1-12
    year: number;
    monthLabel: string; // "March 2025"
    createdAt: Timestamp;
    badgeAwarded: boolean;
}

export interface ContestStats {
    currentMonth: number;
    currentYear: number;
    daysRemaining: number;
    topPosts: ContestEntry[];
    previousWinner?: MonthlyWinner;
}

export interface ContestEntry {
    postId: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    imageUrl: string;
    title: string;
    likeCount: number;
    rank: number;
}
