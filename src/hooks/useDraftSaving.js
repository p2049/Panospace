// src/hooks/useDraftSaving.js
import { useState, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'panospace_post_draft';
const DRAFT_EXPIRY_HOURS = 24;

export const useDraftSaving = () => {
    const [hasDraft, setHasDraft] = useState(false);

    // Check for existing draft on mount
    useEffect(() => {
        const draft = loadDraft();
        setHasDraft(!!draft);
    }, []);

    // Save draft to localStorage
    const saveDraft = useCallback((draftData) => {
        try {
            const draft = {
                data: draftData,
                timestamp: Date.now(),
                expiresAt: Date.now() + (DRAFT_EXPIRY_HOURS * 60 * 60 * 1000)
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setHasDraft(true);
        } catch (error) {
            console.warn('Failed to save draft:', error);
        }
    }, []);

    // Load draft from localStorage
    const loadDraft = useCallback(() => {
        try {
            const stored = localStorage.getItem(DRAFT_KEY);
            if (!stored) return null;

            const draft = JSON.parse(stored);

            // Check if expired
            if (Date.now() > draft.expiresAt) {
                clearDraft();
                return null;
            }

            return draft.data;
        } catch (error) {
            console.warn('Failed to load draft:', error);
            return null;
        }
    }, []);

    // Clear draft
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
        } catch (error) {
            console.warn('Failed to clear draft:', error);
        }
    }, []);

    // Auto-save draft (debounced)
    const autoSaveDraft = useCallback((draftData) => {
        // Only save if there's meaningful content
        if (!draftData.title && !draftData.tags?.length && !draftData.slides?.length) {
            return;
        }

        // Debounce auto-save
        const timeoutId = setTimeout(() => {
            saveDraft(draftData);
        }, 2000); // Save 2 seconds after last change

        return () => clearTimeout(timeoutId);
    }, [saveDraft]);

    return {
        saveDraft,
        loadDraft,
        clearDraft,
        autoSaveDraft,
        hasDraft
    };
};
