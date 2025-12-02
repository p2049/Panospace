import { useState } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    startAfter
} from 'firebase/firestore';

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
    const searchUsers = async (searchTerm, lastDoc = null) => {
        const term = (searchTerm || '').toLowerCase().trim();
        if (!term) return { data: [], lastDoc: null };

        setLoading(true);
        setError(null);

        const words = term.split(/\s+/).filter(w => w.length > 1);
        const primaryWord = words[0] || term;

        try {
            const usersRef = collection(db, 'users');
            let q = query(
                usersRef,
                where('searchKeywords', 'array-contains', primaryWord),
                orderBy('displayName'),
                limit(50)
            );

            if (lastDoc) {
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

            const filtered = docs.filter(user => {
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
                    ? searchableText.includes(primaryWord)
                    : words.every(w => searchableText.includes(w));
            });

            const newLastDoc =
                snapshot.docs.length > 0
                    ? snapshot.docs[snapshot.docs.length - 1]
                    : null;

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('User search error:', err);
            setError(err);
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    };

    /**
     * SEARCH POSTS
     * Strategy:
     *  - if artTypes filter: query posts where tags contains primary art type
     *  - else if searchTerm: query posts where searchKeywords contains primary word
     *  - else: fallback to recent posts
     *  - then client-side filter on artTypes, location, remaining words
     */
    const searchPosts = async (searchTerm, filters = {}, lastDoc = null) => {
        const { artTypes = [], location = '' } = filters;
        const term = (searchTerm || '').toLowerCase().trim();
        const words = term.split(/\s+/).filter(w => w.length > 0);
        const primaryWord = words[0] || term;

        setLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            let q;

            if (artTypes.length > 0) {
                // Primary art type search
                // Index required: posts [tags CONTAINS, createdAt DESC]
                const primaryType = artTypes[0];
                q = query(
                    postsRef,
                    where('tags', 'array-contains', primaryType),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
            } else if (term) {
                // Keyword search
                // Index required: posts [searchKeywords CONTAINS, createdAt DESC]
                q = query(
                    postsRef,
                    where('searchKeywords', 'array-contains', primaryWord),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
            } else {
                // Recent posts fallback
                q = query(
                    postsRef,
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
            }

            if (lastDoc) {
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

            // Client-side filtering: artTypes, location, and additional words
            let filtered = docs;

            if (artTypes.length > 0) {
                filtered = filtered.filter(post => {
                    const postTags = (post.tags || []).map(t => t.toLowerCase());
                    return artTypes.every(type =>
                        postTags.includes(type.toLowerCase())
                    );
                });
            }

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

            if (term) {
                filtered = filtered.filter(post => {
                    const searchableText = [
                        post.title,
                        post.authorName,
                        ...(post.tags || []),
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

            return { data: filtered, lastDoc: newLastDoc };
        } catch (err) {
            console.error('Post search error:', err);
            setError(err);
            return { data: [], lastDoc: null };
        } finally {
            setLoading(false);
        }
    };

    return {
        searchUsers,
        searchPosts,
        loading,
        error
    };
};
