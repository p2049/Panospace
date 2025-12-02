import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { generateSearchKeywords } from '../utils/searchKeywords';

export const useGalleries = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Create a new gallery
    const createGallery = async (data) => {
        setLoading(true);
        setError(null);
        try {
            if (!currentUser) throw new Error('Must be logged in');

            // Generate search keywords from title and description
            const searchKeywords = [
                ...generateSearchKeywords(data.title || ''),
                ...generateSearchKeywords(data.description || '')
            ];

            const galleryDoc = {
                ownerId: currentUser.uid,
                ownerUsername: currentUser.displayName || currentUser.email || 'Unknown',
                title: data.title,
                description: data.description || '',
                visibility: data.visibility || 'public',
                coverImage: data.coverImage || null,
                postIds: [], // Starts empty
                memberIds: [currentUser.uid],
                tags: data.tags || [],
                locations: data.locations || [],
                searchKeywords,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'galleries'), galleryDoc);
            return docRef.id;
        } catch (err) {
            console.error('Error creating gallery:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Add a post to a gallery
    const addPostToGallery = async (galleryId, postId) => {
        setLoading(true);
        try {
            const galleryRef = doc(db, 'galleries', galleryId);
            await updateDoc(galleryRef, {
                postIds: arrayUnion(postId),
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Error adding post to gallery:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Remove a post from a gallery
    const removePostFromGallery = async (galleryId, postId) => {
        setLoading(true);
        try {
            const galleryRef = doc(db, 'galleries', galleryId);
            await updateDoc(galleryRef, {
                postIds: arrayRemove(postId),
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Error removing post from gallery:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get a single gallery
    const getGallery = async (galleryId) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'galleries', galleryId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Gallery not found');
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Get all galleries for a user
    const getUserGalleries = async (userId) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'galleries'),
                where('ownerId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50) // 🚀 OPTIMIZATION: Prevent unbounded reads
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error fetching user galleries:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        createGallery,
        addPostToGallery,
        removePostFromGallery,
        getGallery,
        getUserGalleries,
        loading,
        error
    };
};
