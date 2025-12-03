import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Project Service
 * Manages projects within studios (galleries)
 * Structure: Studio → Projects → Posts
 */

/**
 * Create a new project within a studio
 * @param {string} studioId - The studio (gallery) ID
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Created project with ID
 */
export const createProject = async (studioId, projectData) => {
    try {
        const projectRef = collection(db, 'galleries', studioId, 'projects');

        const newProject = {
            title: projectData.title,
            description: projectData.description || '',
            contributors: projectData.contributors || [], // Array of { uid, displayName, role }
            roles: projectData.roles || [], // Array of role names
            postIds: projectData.postIds || [],
            isTemporary: projectData.isTemporary || false,
            createdBy: projectData.createdBy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            followersCount: 0,
            postsCount: 0
        };

        const docRef = await addDoc(projectRef, newProject);

        return {
            id: docRef.id,
            ...newProject
        };
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

/**
 * Get a single project by ID
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Project data
 */
export const getProject = async (studioId, projectId) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            return {
                id: projectSnap.id,
                studioId,
                ...projectSnap.data()
            };
        } else {
            throw new Error('Project not found');
        }
    } catch (error) {
        console.error('Error getting project:', error);
        throw error;
    }
};

/**
 * Get all projects for a studio
 * @param {string} studioId - The studio ID
 * @returns {Promise<Array>} Array of projects
 */
export const getStudioProjects = async (studioId) => {
    try {
        const projectsRef = collection(db, 'galleries', studioId, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            studioId,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting studio projects:', error);
        throw error;
    }
};

/**
 * Get projects where user is a contributor
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of projects
 */
export const getUserProjects = async (userId) => {
    try {
        // Note: This requires a composite index on contributors array
        // We'll need to query all galleries and filter
        // For better performance, consider maintaining a separate user-projects collection

        const galleriesRef = collection(db, 'galleries');
        const galleriesSnap = await getDocs(galleriesRef);

        const allProjects = [];

        for (const galleryDoc of galleriesSnap.docs) {
            const projectsRef = collection(db, 'galleries', galleryDoc.id, 'projects');
            const projectsSnap = await getDocs(projectsRef);

            projectsSnap.docs.forEach(projectDoc => {
                const projectData = projectDoc.data();
                const isContributor = projectData.contributors?.some(c => c.uid === userId);

                if (isContributor) {
                    allProjects.push({
                        id: projectDoc.id,
                        studioId: galleryDoc.id,
                        studioTitle: galleryDoc.data().title,
                        ...projectData
                    });
                }
            });
        }

        return allProjects;
    } catch (error) {
        console.error('Error getting user projects:', error);
        throw error;
    }
};

/**
 * Update project details
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateProject = async (studioId, projectId, updates) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

/**
 * Add a contributor to a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {Object} contributor - { uid, displayName, role }
 * @returns {Promise<void>}
 */
export const addContributor = async (studioId, projectId, contributor) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            contributors: arrayUnion(contributor),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding contributor:', error);
        throw error;
    }
};

/**
 * Remove a contributor from a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {Object} contributor - Contributor object to remove
 * @returns {Promise<void>}
 */
export const removeContributor = async (studioId, projectId, contributor) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            contributors: arrayRemove(contributor),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error removing contributor:', error);
        throw error;
    }
};

/**
 * Add a post to a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {string} postId - The post ID
 * @returns {Promise<void>}
 */
export const addPostToProject = async (studioId, projectId, postId) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            postIds: arrayUnion(postId),
            postsCount: arrayUnion(postId).length,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding post to project:', error);
        throw error;
    }
};

/**
 * Remove a post from a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {string} postId - The post ID
 * @returns {Promise<void>}
 */
export const removePostFromProject = async (studioId, projectId, postId) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            postIds: arrayRemove(postId),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error removing post from project:', error);
        throw error;
    }
};

/**
 * Delete a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (studioId, projectId) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);
        await deleteDoc(projectRef);
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

/**
 * Follow/unfollow a project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID
 * @param {boolean} follow - True to follow, false to unfollow
 * @returns {Promise<void>}
 */
export const toggleProjectFollow = async (studioId, projectId, userId, follow) => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);
        const userRef = doc(db, 'users', userId);

        if (follow) {
            await updateDoc(projectRef, {
                followers: arrayUnion(userId),
                followersCount: arrayUnion(userId).length
            });

            await updateDoc(userRef, {
                followingProjects: arrayUnion(`${studioId}/${projectId}`)
            });
        } else {
            await updateDoc(projectRef, {
                followers: arrayRemove(userId)
            });

            await updateDoc(userRef, {
                followingProjects: arrayRemove(`${studioId}/${projectId}`)
            });
        }
    } catch (error) {
        console.error('Error toggling project follow:', error);
        throw error;
    }
};
