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
    arrayRemove,
    increment,
    DocumentData
} from 'firebase/firestore';
import { db } from '@/firebase';

export interface Contributor {
    uid: string;
    displayName: string;
    role: string;
}

export interface Project {
    id: string;
    studioId?: string;
    studioTitle?: string;
    title: string;
    description: string;
    contributors: Contributor[];
    roles: string[];
    postIds: string[];
    isTemporary: boolean;
    createdBy: string;
    createdAt?: any;
    updatedAt?: any;
    followersCount: number;
    postsCount: number;
    followers?: string[];
    [key: string]: any;
}

/**
 * Project Service
 * Manages projects within studios (galleries)
 * Structure: Studio → Projects → Posts
 */

/**
 * Create a new project within a studio
 */
export const createProject = async (studioId: string, projectData: Partial<Project>): Promise<Project> => {
    try {
        const projectRef = collection(db, 'galleries', studioId, 'projects');

        const newProject = {
            title: projectData.title,
            description: projectData.description || '',
            contributors: projectData.contributors || [],
            roles: projectData.roles || [],
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
            ...(newProject as any)
        } as Project;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

/**
 * Get a single project by ID
 */
export const getProject = async (studioId: string, projectId: string): Promise<Project> => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            return {
                id: projectSnap.id,
                studioId,
                ...projectSnap.data()
            } as Project;
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
 */
export const getStudioProjects = async (studioId: string): Promise<Project[]> => {
    try {
        const projectsRef = collection(db, 'galleries', studioId, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            studioId,
            ...doc.data()
        } as Project));
    } catch (error) {
        console.error('Error getting studio projects:', error);
        throw error;
    }
};

/**
 * Get projects where user is a contributor
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
    try {
        // Note: This requires a composite index on contributors array
        // We'll need to query all galleries and filter
        // For better performance, consider maintaining a separate user-projects collection

        const galleriesRef = collection(db, 'galleries');
        const galleriesSnap = await getDocs(galleriesRef);

        const allProjects: Project[] = [];

        for (const galleryDoc of galleriesSnap.docs) {
            const projectsRef = collection(db, 'galleries', galleryDoc.id, 'projects');
            const projectsSnap = await getDocs(projectsRef);

            projectsSnap.docs.forEach(projectDoc => {
                const projectData = projectDoc.data();
                const isContributor = projectData.contributors?.some((c: Contributor) => c.uid === userId);

                if (isContributor) {
                    allProjects.push({
                        id: projectDoc.id,
                        studioId: galleryDoc.id,
                        studioTitle: galleryDoc.data().title,
                        ...projectData
                    } as Project);
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
 */
export const updateProject = async (studioId: string, projectId: string, updates: Partial<Project>): Promise<void> => {
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
 */
export const addContributor = async (studioId: string, projectId: string, contributor: Contributor): Promise<void> => {
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
 */
export const removeContributor = async (studioId: string, projectId: string, contributor: Contributor): Promise<void> => {
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
 */
export const addPostToProject = async (studioId: string, projectId: string, postId: string): Promise<void> => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            postIds: arrayUnion(postId),
            postsCount: increment(1), // Fixed: Use increment instead of invalid arrayUnion(...).length
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding post to project:', error);
        throw error;
    }
};

/**
 * Remove a post from a project
 */
export const removePostFromProject = async (studioId: string, projectId: string, postId: string): Promise<void> => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);

        await updateDoc(projectRef, {
            postIds: arrayRemove(postId),
            postsCount: increment(-1),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error removing post from project:', error);
        throw error;
    }
};

/**
 * Delete a project
 */
export const deleteProject = async (studioId: string, projectId: string): Promise<void> => {
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
 */
export const toggleProjectFollow = async (studioId: string, projectId: string, userId: string, follow: boolean): Promise<void> => {
    try {
        const projectRef = doc(db, 'galleries', studioId, 'projects', projectId);
        const userRef = doc(db, 'users', userId);

        if (follow) {
            await updateDoc(projectRef, {
                followers: arrayUnion(userId),
                followersCount: increment(1) // Fixed: Use increment
            });

            await updateDoc(userRef, {
                followingProjects: arrayUnion(`${studioId}/${projectId}`)
            });
        } else {
            await updateDoc(projectRef, {
                followers: arrayRemove(userId),
                followersCount: increment(-1)
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
