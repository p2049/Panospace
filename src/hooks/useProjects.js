import { useState, useEffect } from 'react';
import {
    getProject,
    getStudioProjects,
    getUserProjects,
    createProject,
    updateProject,
    deleteProject,
    addContributor,
    removeContributor,
    addPostToProject,
    removePostFromProject,
    toggleProjectFollow
} from '../services/projectService';

/**
 * Hook to fetch a single project
 * @param {string} studioId - The studio ID
 * @param {string} projectId - The project ID
 */
export const useProject = (studioId, projectId) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!studioId || !projectId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const projectData = await getProject(studioId, projectId);
            setProject(projectData);
            setError(null);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [studioId, projectId]);

    return { project, loading, error, refetch };
};

/**
 * Hook to fetch all projects for a studio
 * @param {string} studioId - The studio ID
 */
export const useStudioProjects = (studioId) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!studioId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const projectsData = await getStudioProjects(studioId);
            setProjects(projectsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching studio projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [studioId]);

    return { projects, loading, error, refetch };
};

/**
 * Hook to fetch projects where user is a contributor
 * @param {string} userId - The user ID
 */
export const useUserProjects = (userId) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const projectsData = await getUserProjects(userId);
            setProjects(projectsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching user projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [userId]);

    return { projects, loading, error, refetch };
};

/**
 * Hook for project management operations
 */
export const useProjectManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const create = async (studioId, projectData) => {
        try {
            setLoading(true);
            setError(null);
            const newProject = await createProject(studioId, projectData);
            return newProject;
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (studioId, projectId, updates) => {
        try {
            setLoading(true);
            setError(null);
            await updateProject(studioId, projectId, updates);
        } catch (err) {
            console.error('Error updating project:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (studioId, projectId) => {
        try {
            setLoading(true);
            setError(null);
            await deleteProject(studioId, projectId);
        } catch (err) {
            console.error('Error deleting project:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addContrib = async (studioId, projectId, contributor) => {
        try {
            setLoading(true);
            setError(null);
            await addContributor(studioId, projectId, contributor);
        } catch (err) {
            console.error('Error adding contributor:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeContrib = async (studioId, projectId, contributor) => {
        try {
            setLoading(true);
            setError(null);
            await removeContributor(studioId, projectId, contributor);
        } catch (err) {
            console.error('Error removing contributor:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addPost = async (studioId, projectId, postId) => {
        try {
            setLoading(true);
            setError(null);
            await addPostToProject(studioId, projectId, postId);
        } catch (err) {
            console.error('Error adding post to project:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removePost = async (studioId, projectId, postId) => {
        try {
            setLoading(true);
            setError(null);
            await removePostFromProject(studioId, projectId, postId);
        } catch (err) {
            console.error('Error removing post from project:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async (studioId, projectId, userId, follow) => {
        try {
            setLoading(true);
            setError(null);
            await toggleProjectFollow(studioId, projectId, userId, follow);
        } catch (err) {
            console.error('Error toggling project follow:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        create,
        update,
        remove,
        addContrib,
        removeContrib,
        addPost,
        removePost,
        toggleFollow,
        loading,
        error
    };
};
