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

// ============================================
// FULL CONTESTS SYSTEM TYPES
// ============================================

export interface Contest {
    id: string;
    title: string;
    description: string;
    startAt: Timestamp;
    endAt: Timestamp;
    deadline: Timestamp; // For search compatibility
    entryType: 'free' | 'paid';
    entryFee?: number;
    prizePool: number;
    creatorUid: string;
    tags: string[];
    searchKeywords: string[];
    discipline?: string;
    status: 'upcoming' | 'active' | 'closed';
    createdAt: Timestamp;

    // Validation rules
    requireOriginalContent?: boolean;
    allowAIArt?: boolean;
    requiredTags?: string[];

    // Stats
    entryCount?: number;
    totalPrizePool?: number;
}

export interface FullContestEntry {
    id: string;
    contestId: string;
    postId: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    submittedAt: Timestamp;
    isValidEntry: boolean;
    validationErrors?: string[];

    // Snapshot at contest close
    likeCount?: number;
    validLikeCount?: number;
    finalRank?: number;
    prizeWon?: number;
}

export interface UserIntegrityScore {
    userId: string;
    likeIntegrityScore: number; // 0-100
    accountAge: number; // days
    totalLikesGiven: number;
    totalPostsCreated: number;
    weeklyLikesGiven: number;
    suspiciousActivity: boolean;
    lastUpdated: Timestamp;
}
