// Add to CreatePost.jsx after the state declarations (around line 100)

// 🛡️ NAVIGATION GUARD: Prevent accidental data loss
useEffect(() => {
    const handleBeforeUnload = (e) => {
        if (hasUnsavedChanges && !submittingRef.current) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);

// 💾 AUTO-SAVE DRAFT: Save draft when content changes
useEffect(() => {
    if (!title && !tags.length && !slides.length) {
        setHasUnsavedChanges(false);
        return;
    }

    setHasUnsavedChanges(true);

    // Debounced auto-save
    const timeoutId = setTimeout(() => {
        const draftData = {
            title,
            tags,
            location,
            slides: slides.map(s => ({
                type: s.type,
                title: s.title,
                caption: s.caption,
                // Don't save file objects, just metadata
                preview: s.preview,
                addToShop: s.addToShop,
                productTier: s.productTier
            })),
            filmMetadata,
            enableRatings,
            selectedCollectionId,
            showInProfile
        };
        saveDraft(draftData);
    }, 3000); // Auto-save 3 seconds after last change

    return () => clearTimeout(timeoutId);
}, [title, tags, location, slides, filmMetadata, enableRatings, selectedCollectionId, showInProfile, saveDraft]);

// 📂 LOAD DRAFT ON MOUNT
useEffect(() => {
    if (!hasDraft) return;

    const shouldLoad = window.confirm(
        'You have an unsaved draft. Would you like to restore it?'
    );

    if (shouldLoad) {
        const draft = loadDraft();
        if (draft) {
            setTitle(draft.title || '');
            setTags(draft.tags || []);
            setLocation(draft.location || { city: '', state: '', country: '' });
            setFilmMetadata(draft.filmMetadata || {
                isFilm: false,
                stock: '',
                customStock: '',
                format: '',
                iso: '',
                cameraOverride: '',
                lensOverride: '',
                scanner: '',
                lab: ''
            });
            setEnableRatings(draft.enableRatings ?? true);
            setSelectedCollectionId(draft.selectedCollectionId || '');
            setShowInProfile(draft.showInProfile ?? false);
            // Note: Can't restore file objects, user needs to re-select images
        }
    } else {
        clearDraft();
    }
}, [hasDraft, loadDraft, clearDraft]);
