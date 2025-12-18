import { useState, useCallback } from 'react';
import { db, functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    startAfter
} from 'firebase/firestore';
import { getDerivedDate, isSameDate } from '@/core/utils/dates';
import { SORT_OPTIONS } from '@/core/constants/searchFilters';
import { sortPostsByTrending } from '@/core/utils/trendingAlgorithm';
import { logger } from '@/core/utils/logger';

// Global cache for search results
export const SEARCH_CACHE = {};


export const useSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * SEARCH USERS
     * Strategy:
     *  - tokenize the search term
     *  - use the first word to query 'searchKeywords' via array-contains
     *  - client-side filter for the rest of the words across displayName/username/bio/email/artTypes
     */
    /**
     * SEARCH USERS
     * Strategy:
     *  - tokenize the search term
     *  - use the first word to query 'searchKeywords' via array-contains
     *  - client-side filter for the rest of the words across displayName/username/bio/email/artTypes
     */
    const searchUsers = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { userIds = [] } = filters;
        const term = (searchTerm || '').toLowerCase().trim();

        // Return all users if no term/filter (as requested)
        if (!term && userIds.length === 0) {
            // Allow fall-through
        }

        setLoading(true);
        setError(null);

        try {
            const usersRef = collection(db, 'users');
            let q;

            if (userIds.length > 0) {
                // Filter by specific user IDs (e.g. Museum Members)
                // 'in' query is limited to 10 (or 30). Slice for safety.
                // For MVP, we'll slice to 10.
                const safeUserIds = userIds.slice(0, 10);

                // If term exists, we might want to filter client-side after fetching by IDs
                // because we can't combine 'in' with 'array-contains' easily if not on same field
                q = query(
                    usersRef,
                    where('__name__', 'in', safeUserIds), // __name__ is document ID
                    limit(50)
                );
            } else if (term) {
                // Standard search with term
                const words = term.split(/\s+/).filter(w => w.length > 1);
                const primaryWord = words[0] || term;

                q = query(
                    usersRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('displayName'),
                    limit(50)
                );
            } else {
                // No term, list all users
                q = query(
                    usersRef,
                    orderBy('displayName'),
                    limit(50)
                );
            }

            if (lastDoc && userIds.length === 0) {
                // Only apply pagination for standard search for now
                const words = term.split(/\s+/).filter(w => w.length > 1);
                const primaryWord = words[0] || term;

                q = query(
                    usersRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('displayName'),
                    startAfter(lastDoc),
                    limit(50)
                );
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            let filtered = docs;

            // Client-side filtering for search term
            if (term) {
                const words = term.split(/\s+/).filter(w => w.length > 1);
                filtered = filtered.filter(user => {
                    const searchableText = [
                        user.displayName,
                        user.username,
                        user.bio,
                        user.email,
                        ...(user.artTypes || [])
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    return words.length === 0
                        ? searchableText.includes(words[0] || term)
                        : words.every(w => searchableText.includes(w));
                });
            }

            const newLastDoc =
                snapshot.docs.length > 0
                    ? snapshot.docs[snapshot.docs.length - 1]
                    : null;

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('User search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH POSTS
     */
    const searchPosts = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const {
            tags = [],
            parkId = '',
            selectedDate = null,
            location = '',
            camera = '',
            film = '',
            orientation = '',
            aspectRatio = '',
            sort = 'newest',
            authorIds = [],
            postType = 'image',
            type = 'art' // Art vs Social
        } = filters;

        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            let q;
            let orderByField = 'createdAt';
            let orderDirection = 'desc';

            // Determine sorting
            if (sort === 'oldest') {
                orderDirection = 'asc';
            } else if (sort === 'popular') {
                orderByField = 'likeCount';
            }
            // Note: 'trending' is handled client-side with sophisticated algorithm

            // 🔹 LOGGING START
            logger.log(`[useSearch] Executing search for term: "${term}"`);

            // Parallel Query Strategy for Text Search
            // We search against 'searchKeywords' AND 'tags' to ensure coverage
            let mergedDocs = [];

            if (term) {
                // 1. Keyword Search
                const keywordQuery = query(
                    postsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy(orderByField, orderDirection),
                    limit(30)
                );

                // 2. Tag Search (Treating search term as a potential tag)
                const tagQuery = query(
                    postsRef,
                    where('tags', 'array-contains', primaryWord),
                    orderBy(orderByField, orderDirection),
                    limit(30)
                );

                // Execute in parallel
                console.log(`[useSearch] Firestore Query: searchKeywords OR tags array-contains "${primaryWord}"`);

                // 🛡️ SAFETY: Timeout for parallel search
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Search request timed out')), 15000)
                );

                const [keywordSnap, tagSnap] = await Promise.race([
                    Promise.all([
                        getDocs(keywordQuery),
                        getDocs(tagQuery)
                    ]),
                    timeoutPromise
                ]);

                console.log(`[useSearch] Results: Keywords=${keywordSnap.size}, Tags=${tagSnap.size}`);

                // Merge and Dedup
                const keywordDocs = keywordSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const tagDocs = tagSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const seen = new Set();
                mergedDocs = [...keywordDocs, ...tagDocs].filter(doc => {
                    if (seen.has(doc.id)) return false;
                    seen.add(doc.id);
                    return true;
                });

            } else if (authorIds.length > 0) {
                // Filter by specific authors (Following Only)
                const safeAuthorIds = authorIds.slice(0, 10);
                q = query(
                    postsRef,
                    where('authorId', 'in', safeAuthorIds),
                    orderBy(orderByField, orderDirection),
                    limit(50)
                );
                const snapshot = await getDocs(q);
                mergedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            } else if (tags.length > 0) {
                // Primary tag search
                const primaryTag = tags[0];
                q = query(
                    postsRef,
                    where('tags', 'array-contains', primaryTag),
                    orderBy(orderByField, orderDirection),
                    limit(30)
                );
                const snapshot = await getDocs(q);
                mergedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            } else if (filters.postType === 'text') {
                // Specific Text Post Feed (Explore Text)
                q = query(
                    postsRef,
                    where('postType', '==', 'text'),
                    orderBy(orderByField, orderDirection), // Added ordering for consistency
                    limit(50) // Reduced from 100 for cost efficiency
                );
                const snapshot = await Promise.race([
                    getDocs(q),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Search timed out')), 15000))
                ]);
                mergedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            } else {
                // Fallback (Recent/Sorted) - Standard Image Search
                // PH3 OPTIMIZATION: Move common filters to backend when possible
                const targetContentMode = type || 'art';

                let constraints = [
                    where('type', '==', targetContentMode),
                    orderBy(orderByField, orderDirection),
                    limit(50)
                ];

                // Add specific location/event filters if present (using indices added to firestore.indexes.json)
                if (filters.parkId) {
                    constraints.unshift(where('parkId', '==', filters.parkId));
                } else if (filters.cityName) {
                    constraints.unshift(where('city', '==', filters.cityName));
                } else if (filters.eventId) {
                    constraints.unshift(where('eventId', '==', filters.eventId));
                }

                q = query(postsRef, ...constraints);

                try {
                    const snapshot = await Promise.race([
                        getDocs(q),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Search timed out')), 15000))
                    ]);
                    mergedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                } catch (err) {
                    logger.error('Search: Fallback query failed, likely missing index', err);
                    // Critical Fallback: if adding multiple filters failed because index isn't ready,
                    // try the most basic query to at least show something.
                    const basicQ = query(postsRef, where('type', '==', targetContentMode), orderBy(orderByField, orderDirection), limit(50));
                    const basicSnapshot = await getDocs(basicQ);
                    mergedDocs = basicSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                }
            }

            // Apply pagination if needed (Note: Parallel queries break simple cursor pagination, 
            // so we disable 'startAfter' for the text search combined mode effectively, 
            // or we rely on client side handling for now. 
            // For MVP/Bugfix where "Search returns no results", finding *something* is priority.)

            // Note: If we didn't use the parallel block (i.e. no term), we might need to apply startAfter manually
            // But strict pagination with merged results is complex.
            // We will skip `startAfter` logic for the text search term case for now to ensure correctness of results first.

            const docs = mergedDocs;
            const newLastDoc = null; // Pagination disabled for merged search temporarily

            // Log result count for debugging
            logger.log(`[useSearch] searchPosts returned ${docs.length} posts (merged)`);

            // Client-side filtering
            let filtered = docs;

            // Filter by Tags (remaining tags)
            if (tags.length > 0) {
                filtered = filtered.filter(post => {
                    const postTags = (post.tags || []).map(t => t.toLowerCase());
                    return tags.every(tag =>
                        postTags.includes(tag.toLowerCase())
                    );
                });
            }

            // Park filter
            if (parkId) {
                filtered = filtered.filter(post => post.parkId === parkId);
            }

            // Date filter
            if (selectedDate) {
                filtered = filtered.filter(post => {
                    const postDate = getDerivedDate(post);
                    return postDate && isSameDate(postDate, selectedDate);
                });
            }

            // Location filter
            if (location.trim()) {
                const locLower = location.toLowerCase().trim();
                filtered = filtered.filter(post => {
                    const city = (post.location?.city || '').toLowerCase();
                    const state = (post.location?.state || '').toLowerCase();
                    const country = (post.location?.country || '').toLowerCase();
                    const fullLoc = `${city} ${state} ${country}`;
                    return fullLoc.includes(locLower);
                });
            }

            // Camera filter
            if (camera) {
                const camLower = camera.toLowerCase();
                filtered = filtered.filter(post => {
                    const make = (post.exif?.make || '').toLowerCase();
                    const model = (post.exif?.model || '').toLowerCase();
                    return make.includes(camLower) || model.includes(camLower);
                });
            }

            // Film filter
            if (film) {
                const filmLower = film.toLowerCase();
                filtered = filtered.filter(post => {
                    // Check tags for film stock or explicit exif field if it exists
                    const tags = (post.tags || []).map(t => t.toLowerCase());
                    return tags.some(t => t.includes(filmLower));
                });
            }

            // Orientation filter
            if (orientation) {
                const targetOrientation = orientation.toLowerCase();
                filtered = filtered.filter(post => {
                    // Strictly calculate from dimensions (Prioritize first image)
                    // We ignore post.orientation to ensure visual accuracy based on the actual image
                    const firstImage = post.items?.[0] || post.images?.[0];
                    const width = Number(firstImage?.width || post.width || post.exif?.pixelXDimension || 0);
                    const height = Number(firstImage?.height || post.height || post.exif?.pixelYDimension || 0);

                    if (!width || !height) return false; // Strict: exclude if unknown

                    const ratio = width / height;
                    // Use a small tolerance (2%) for "square" to catch 1080x1079 etc.
                    const isSquare = Math.abs(ratio - 1) < 0.02;

                    if (targetOrientation === 'square') return isSquare;
                    if (targetOrientation === 'landscape') return ratio > 1 && !isSquare;
                    if (targetOrientation === 'portrait') return ratio < 1 && !isSquare;
                    return false;
                });
            }



            // Aspect Ratio filter (approximate)
            if (aspectRatio) {
                filtered = filtered.filter(post => {
                    const firstImage = post.items?.[0] || post.images?.[0];
                    const width = Number(firstImage?.width || post.width || post.exif?.pixelXDimension || 0);
                    const height = Number(firstImage?.height || post.height || post.exif?.pixelYDimension || 0);

                    if (!width || !height) return false; // Strict: exclude if unknown

                    const ratio = width / height;
                    // Simple tolerance check
                    if (aspectRatio === '1:1') return Math.abs(ratio - 1) < 0.05;
                    if (aspectRatio === '4:5') return Math.abs(ratio - 0.8) < 0.05;
                    if (aspectRatio === '16:9') return Math.abs(ratio - 1.77) < 0.05;
                    if (aspectRatio === '2:3') return Math.abs(ratio - 0.66) < 0.05;
                    if (aspectRatio === '3:2') return Math.abs(ratio - 1.5) < 0.05;
                    if (aspectRatio === '21:9') return Math.abs(ratio - 2.33) < 0.05;
                    return false;
                });
            }

            // Search Term filter (remaining words)
            if (term) {
                filtered = filtered.filter(post => {
                    const searchableText = [
                        post.title,
                        post.authorName,
                        ...(post.tags || []),
                        post.category,
                        (post.categories || []).join(' '),
                        post.description,
                        post.location?.city,
                        post.location?.state,
                        post.location?.country
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    return words.every(w => searchableText.includes(w));
                });
            }

            // PHASE 3: Post Type Filter (Text vs Image)
            if (filters.postType) {
                const beforeCount = filtered.length;
                filtered = filtered.filter(post => {
                    // Check actual postType property first, fall back to type
                    const pType = post.postType || post.type;
                    console.log('[DEBUG] Filtering Post:', post.id, 'postType:', post.postType, 'type:', post.type, 'pType:', pType, 'Filter:', filters.postType);

                    if (filters.postType === 'text') {
                        return pType === 'text';
                    } else if (filters.postType === 'image') {
                        // For 'image' mode, we exclude text posts
                        return pType !== 'text';
                    }

                    // Fallback for direct match if needed in future
                    return pType === filters.postType;
                });
                logger.log(`[useSearch] postType filter (${filters.postType}): ${beforeCount} -> ${filtered.length} posts`);
            }

            // Apply client-side sorting to handle derived fields (EXIF date) and ensure correct order
            // We apply this even for 'newest' to respect EXIF dates over upload dates
            if (!term) {
                if (sort === 'trending') {
                    // Use sophisticated trending algorithm with time-based fallback
                    const trendingResult = sortPostsByTrending(filtered);
                    filtered = trendingResult.posts;
                    // Optionally log which time period was used
                    logger.log(`Trending posts from: ${trendingResult.period}`);
                } else {
                    filtered.sort((a, b) => {
                        if (sort === 'newest' || sort === 'oldest') {
                            const dateA = getDerivedDate(a) || new Date(0);
                            const dateB = getDerivedDate(b) || new Date(0);
                            return sort === 'newest'
                                ? dateB - dateA
                                : dateA - dateB;
                        }

                        if (sort === 'popular') {
                            return (b.likeCount || 0) - (a.likeCount || 0);
                        }

                        return 0;
                    });
                }
            }

            // Filter by Author IDs (Strict "Added" / "Following" Mode)
            // This is critical when search terms are used, as the initial query bypasses the authorId filter
            if (filters.authorIds && filters.authorIds.length > 0) {
                const allowedIds = new Set(filters.authorIds);
                filtered = filtered.filter(post => allowedIds.has(post.authorId) || allowedIds.has(post.userId));
            }

            logger.log(`[useSearch] searchPosts final result: ${filtered.length} posts returned`);
            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Post search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH GALLERIES
     * Strategy:
     *  - if searchTerm: query galleries where searchKeywords contains primary word
     *  - else: fallback to recent galleries
     *  - then client-side filter on tags, location, remaining words
     */
    const searchGalleries = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { tags = [], location = '', galleryIds = [] } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const galleriesRef = collection(db, 'galleries');
            let q;

            if (galleryIds.length > 0) {
                // Filter by specific gallery IDs
                const safeGalleryIds = galleryIds.slice(0, 10);
                q = query(
                    galleriesRef,
                    where('__name__', 'in', safeGalleryIds),
                    limit(50)
                );
            } else if (tags.length > 0) {
                // Primary tag search
                const primaryTag = tags[0];
                q = query(
                    galleriesRef,
                    where('tags', 'array-contains', primaryTag),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
            } else if (term) {
                // Keyword search
                q = query(
                    galleriesRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
            } else {
                // Recent galleries fallback
                q = query(
                    galleriesRef,
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            }

            if (lastDoc && galleryIds.length === 0) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            const newLastDoc =
                snapshot.docs.length > 0
                    ? snapshot.docs[snapshot.docs.length - 1]
                    : null;

            // Client-side filtering: tags, location, and additional words
            let filtered = docs;

            if (tags.length > 0) {
                filtered = filtered.filter(gallery => {
                    const galleryTags = (gallery.tags || []).map(t => t.toLowerCase());
                    return tags.every(tag =>
                        galleryTags.includes(tag.toLowerCase())
                    );
                });
            }

            if (location.trim()) {
                const locLower = location.toLowerCase().trim();
                filtered = filtered.filter(gallery => {
                    const locations = gallery.locations || [];
                    return locations.some(loc => {
                        const city = (loc.city || '').toLowerCase();
                        const state = (loc.state || '').toLowerCase();
                        const country = (loc.country || '').toLowerCase();
                        const fullLoc = `${city} ${state} ${country}`;
                        return fullLoc.includes(locLower);
                    });
                });
            }

            if (term) {
                filtered = filtered.filter(gallery => {
                    const searchableText = [
                        gallery.title,
                        gallery.description,
                        gallery.ownerUsername,
                        ...(gallery.tags || []),
                        ...(gallery.locations || []).map(l => `${l.city} ${l.state} ${l.country}`).join(' ')
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    return words.every(w => searchableText.includes(w));
                });
            }

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Gallery search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH COLLECTIONS
     * Strategy:
     *  - if tags filter: query collections where tags contains primary tag
     *  - else if searchTerm: query collections where searchKeywords contains primary word
     *  - else: fallback to recent collections
     *  - then client-side filter on tags, discipline, creator, visibility
     */
    const searchCollections = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { tags = [], discipline = '', creatorId = '' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const collectionsRef = collection(db, 'collections');
            let q;

            if (tags.length > 0) {
                const primaryTag = tags[0];
                q = query(
                    collectionsRef,
                    where('tags', 'array-contains', primaryTag),
                    where('visibility', '==', 'public'),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            } else if (term) {
                q = query(
                    collectionsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    where('visibility', '==', 'public'),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            } else {
                q = query(
                    collectionsRef,
                    where('visibility', '==', 'public'),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

            // Client-side filtering
            let filtered = docs;

            if (tags.length > 0) {
                filtered = filtered.filter(collection => {
                    const collectionTags = (collection.tags || []).map(t => t.toLowerCase());
                    return tags.every(tag => collectionTags.includes(tag.toLowerCase()));
                });
            }

            if (discipline) {
                filtered = filtered.filter(collection => collection.discipline === discipline);
            }

            if (creatorId) {
                filtered = filtered.filter(collection => collection.ownerId === creatorId);
            }

            if (term) {
                filtered = filtered.filter(collection => {
                    const searchableText = [
                        collection.title,
                        collection.description,
                        collection.ownerUsername,
                        ...(collection.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    return words.every(w => searchableText.includes(w));
                });
            }

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Collection search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH CONTESTS
     * Strategy:
     *  - Query contests collection
     *  - Filter by status, tags, art type, entry type
     *  - Sort by deadline (soonest first)
     */
    const searchContests = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { tags = [], artType = '', entryType = '', status = 'active' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const contestsRef = collection(db, 'contests');
            let q;

            if (tags.length > 0) {
                const primaryTag = tags[0];
                q = query(
                    contestsRef,
                    where('tags', 'array-contains', primaryTag),
                    orderBy('deadline', 'asc'),
                    limit(50)
                );
            } else if (term) {
                q = query(
                    contestsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('deadline', 'asc'),
                    limit(50)
                );
            } else {
                q = query(
                    contestsRef,
                    orderBy('deadline', 'asc'),
                    limit(50)
                );
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

            // Client-side filtering
            let filtered = docs;

            if (status) {
                filtered = filtered.filter(contest => contest.status === status);
            }

            if (artType) {
                filtered = filtered.filter(contest => contest.artType === artType);
            }

            if (entryType) {
                filtered = filtered.filter(contest => contest.entryType === entryType);
            }

            if (term) {
                filtered = filtered.filter(contest => {
                    const searchableText = [
                        contest.title,
                        contest.description,
                        ...(contest.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    return words.every(w => searchableText.includes(w));
                });
            }

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Contest search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH EVENTS
     * Strategy:
     *  - Query events collection
     *  - Filter by type, park, status, date
     *  - Sort by date (soonest first)
     */
    const searchEvents = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { type = '', parkId = '', status = 'upcoming' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const eventsRef = collection(db, 'events');
            let q;

            if (term) {
                q = query(
                    eventsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('date', 'asc'),
                    limit(50)
                );
            } else {
                q = query(
                    eventsRef,
                    orderBy('date', 'asc'),
                    limit(50)
                );
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

            // Client-side filtering
            let filtered = docs;

            if (status) {
                filtered = filtered.filter(event => event.status === status);
            }

            if (type) {
                filtered = filtered.filter(event => event.type === type);
            }

            if (parkId) {
                filtered = filtered.filter(event => event.parkId === parkId);
            }

            if (term) {
                filtered = filtered.filter(event => {
                    const searchableText = [
                        event.title,
                        event.description,
                        event.parkName,
                        event.location?.city,
                        event.location?.state,
                        ...(event.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    return words.every(w => searchableText.includes(w));
                });
            }

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Event search error:', err);
            if (err.code !== 'permission-denied') {
                setError(err);
            }
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * SEARCH SPACECARDS
     * Strategy:
     *  - Query spacecards collection
     *  - Filter by discipline, rarity, forSale, price range
     *  - Sort by createdAt or price
     */
    const searchSpaceCards = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { tags = [], discipline = '', rarity = '', forSale = null, sort = 'newest' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const spacecardsRef = collection(db, 'spacecards');
            let q;
            let orderByField = 'createdAt';
            let orderDirection = 'desc';

            if (sort === 'price-low') {
                orderByField = 'price';
                orderDirection = 'asc';
            } else if (sort === 'price-high') {
                orderByField = 'price';
                orderDirection = 'desc';
            }

            if (tags.length > 0) {
                const primaryTag = tags[0];
                q = query(
                    spacecardsRef,
                    where('tags', 'array-contains', primaryTag),
                    orderBy(orderByField, orderDirection),
                    limit(50)
                );
            } else if (term) {
                q = query(
                    spacecardsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy(orderByField, orderDirection),
                    limit(50)
                );
            } else {
                q = query(
                    spacecardsRef,
                    orderBy(orderByField, orderDirection),
                    limit(50)
                );
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

            // Client-side filtering
            let filtered = docs;

            if (discipline) {
                filtered = filtered.filter(card => card.discipline === discipline);
            }

            if (rarity) {
                filtered = filtered.filter(card => card.rarity === rarity);
            }

            if (forSale !== null) {
                filtered = filtered.filter(card => card.forSale === forSale);
            }

            if (term) {
                filtered = filtered.filter(card => {
                    const searchableText = [
                        card.title,
                        card.description,
                        card.creatorUsername,
                        ...(card.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    return words.every(w => searchableText.includes(w));
                });
            }

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('SpaceCard search error:', err);
            setError(err);
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
         * SEARCH SHOP ITEMS
         * Strategy:
         * - Query shopItems collection
         * - Filter by status == 'active'
         * - Support keyword/tag search
         */
    const searchShopItems = useCallback(async (searchTerm, filters = {}, lastDoc = null) => {
        const { tags = [], sort = 'newest' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const shopItemsRef = collection(db, 'shopItems');
            let q;

            // Base query - MOVED STATUS CHECK TO CLIENT SIDE TO BYPASS MISSING INDEX
            // const baseConstraints = [where('status', '==', 'active')];
            const baseConstraints = [];

            if (tags.length > 0) {
                // Filter by tags
                q = query(shopItemsRef, ...baseConstraints, where('tags', 'array-contains', tags[0]), limit(50));
            } else if (term) {
                // Filter by keywords
                q = query(shopItemsRef, ...baseConstraints, where('searchKeywords', 'array-contains', primaryWord), limit(50));
            } else {
                // Recent items
                q = query(shopItemsRef, ...baseConstraints, orderBy('createdAt', 'desc'), limit(50));
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

            // Client-side filtering
            let filtered = docs;

            // Apply Status Filter (Client Side fallback)
            filtered = filtered.filter(item => item.status === 'active');

            // Apply Category Filter
            if (filters.shopCategory && filters.shopCategory !== 'all') {
                filtered = filtered.filter(item => {
                    const itemType = item.productType || 'print';
                    return itemType === filters.shopCategory;
                });
            }

            if (term) {
                filtered = filtered.filter(item => {
                    const searchableText = [
                        item.title,
                        item.description,
                        ...(item.tags || [])
                    ].filter(Boolean).join(' ').toLowerCase();
                    return words.every(w => searchableText.includes(w));
                });
            }


            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Shop item search error:', err);
            setError(err);
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        searchUsers,
        searchPosts,
        searchGalleries,
        searchCollections,
        searchContests,
        searchEvents,
        searchSpaceCards,
        searchShopItems, // Export new function
        loading,
        error
    };
};
