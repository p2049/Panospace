import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import FilmStripPost from './FilmStripPost';
import InstantPhotoPost from './InstantPhotoPost';
import StandardPost from './StandardPost';
import FullscreenTextPost from './FullscreenTextPost';
import { useActivePost } from '@/context/ActivePostContext';
import FeedPostCard from './FeedPostCard';
import '@/styles/Post.css';

import { isNSFW, getUserNSFWPreference } from '@/core/constants/nsfwTags';
import { preloadImage } from '@/core/utils/imageCache';
import { logger } from '@/core/utils/logger';

/**
 * Post (Controller Layer)
 * 
 * Responsibilities:
 * 1. Data Normalization (items traversal, validation)
 * 2. State Management (NSFW, Active Status, Author Photo)
 * 3. Event Handling (Deleting, Reporting - propagated or handled via Context)
 * 4. Renderer Selection (Film vs Instant vs Standard)
 */
const Post = ({ post, priority = 'normal', viewMode = 'image', contextPosts = [], onClick, onResize }) => {
    // Contexts
    const { currentUser } = useAuth();
    const { setActivePost } = useActivePost();
    const navigate = useNavigate();

    // Refs & Local State
    const containerRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);

    // --- 0. VIEW MODE CHECK ---
    if (viewMode === 'list') {
        return <FeedPostCard post={post} contextPosts={contextPosts} onClick={onClick} onResize={onResize} />;
    }

    // --- 1. DATA PREP ---
    // Early return if invalid
    if (!post) {
        logger.warn('Post component received null/undefined post');
        return null;
    }

    // NSFW Logic
    const hasNSFWContent = useMemo(() => isNSFW(post?.tags), [post?.tags]);
    const userPrefersNSFW = getUserNSFWPreference();
    const [showNSFWContent, setShowNSFWContent] = useState(userPrefersNSFW);

    // Normalize Items
    const items = useMemo(() => {
        let itemsList = post.items || post.images || post.slides || [];
        if (itemsList.length === 0) {
            // Fallback to single image fields
            const fallbackUrl = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
            if (fallbackUrl) {
                itemsList = [{ type: 'image', url: fallbackUrl }];
            }
        }
        return itemsList;
    }, [post]);

    // Author Photo Logic
    // We check all possible fields for the avatar
    const [authorPhoto, setAuthorPhoto] = useState(
        post.authorPhotoUrl || post.userPhotoUrl || post.userAvatar || post.profileImage || null
    );

    useEffect(() => {
        const fetchAuthorPhoto = async () => {
            // If we already have a valid http photo URL, don't fetch.
            if (authorPhoto && authorPhoto.startsWith('http')) return;

            const authorId = post.userId || post.authorId || post.uid;
            if (!authorId) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', authorId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.photoURL) {
                        setAuthorPhoto(data.photoURL);
                    }
                }
            } catch (err) {
                logger.warn("Failed to fetch author photo fallback", err);
            }
        };
        fetchAuthorPhoto();
    }, [post.userId, post.authorId, post.uid, authorPhoto]);

    // --- 2. INTERACTION LOGIC ---
    // Intersection Observer for Active State
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Set this post as the active one in the global context
                        setActivePost(post);
                    }
                });
            },
            { threshold: 0.6 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [post.id, setActivePost, post]);

    // Image Preloading (Optimization)
    // Preload first 3 slides when approaching viewport
    useEffect(() => {
        if (!items || items.length === 0 || !containerRef.current) return;
        const preloadObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    items.slice(0, 3).forEach(item => {
                        const url = item?.url || (typeof item === 'string' ? item : null);
                        if (url && typeof url === 'string') preloadImage(url);
                    });
                    preloadObserver.disconnect();
                }
            },
            { rootMargin: '50% 0px 50% 0px' }
        );
        preloadObserver.observe(containerRef.current);
        return () => preloadObserver.disconnect();
    }, [items]);

    // --- 3. HANDLERS ---
    const handleAuthorClick = useCallback(() => {
        navigate(`/profile/${post.userId || post.authorId}`);
    }, [navigate, post.userId, post.authorId]);

    // --- 4. RENDERER SELECTION ---
    if (post.postType === 'text') {
        // Fullscreen text post with left-side panel, same as image posts
        return <FullscreenTextPost post={post} containerRef={containerRef} viewMode={viewMode} />;
    }

    // Strict priority: Film -> Instant -> Standard
    const useFilmStripMode = post.uiOverlays?.sprocketBorder === true;
    const hasInstantBorder = post.uiOverlays?.instantPhotoBorder === true;

    if (useFilmStripMode) {
        return (
            <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
                <FilmStripPost post={post} images={items} uiOverlays={post.uiOverlays} priority={priority} postId={post.id} />
            </div>
        );
    }

    if (hasInstantBorder) {
        // Instant posts have their own wrappers, but we might want the containerRef here for active state tracking?
        // Actually, FilmStripPost and InstantPhotoPost might wrap their own stuff. 
        // BUT `containerRef` here is used for the `IntersectionObserver`. 
        // If we return `<FilmStripPost>`, the observer attached to `containerRef.current` (which is a div wrapping the return?) 
        // Wait, the previous code had `return <FilmStripPost ... />` directly.
        // If we return the component directly, and `containerRef` is not attached to a DOM element in THIS component's render output, the observer won't work!
        // The original `Post.jsx` attached `containerRef` to the Standard Post div.
        // It seems `FilmStripPost` and `InstantPhotoPost` handled their own active state? 
        // Let's check `FilmStripPost.jsx` in my memory... 
        // Ah, the original `Post.jsx` had `if (useFilmStripMode) return ...`. 
        // It did NOT attach the observer in that case?
        // Let's look at the original code again (Step 253).
        // Line 140: `if (useFilmStripMode) return ...`
        // Line 149: `useEffect(() => { ... observer ... }, [post.id])`
        // This effect runs AFTER the render. If the render returned early (Line 142), the effect (Line 149) might still be mounted? 
        // NO. If a component returns, the effects defined in it still run IF the component stays mounted.
        // But `containerRef` is initialized to `null`.
        // If we return `<FilmStripPost />`, `containerRef` is never attached to a DOM node.
        // So `containerRef.current` is null.
        // So the observer (Line 150) `if (!containerRef.current) return;` effectively does NOTHING for Film/Instant posts in the original code? 
        // That implies Film/Instant posts might be managing their own active state, OR the original code was bugged for them.
        // Actually, `FilmStripPost` likely has its own observer?
        // Let's assume for safety I should wrap them in a div with the ref, just to be sure the "Active Post" logic works consistently at this Controller level.
        // This consolidates the logic.

        return (
            <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
                <InstantPhotoPost post={post} images={items} uiOverlays={post.uiOverlays} priority={priority} />
            </div>
        );
    }

    // Default: Standard Post
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <StandardPost
                post={post}
                items={items}
                priority={priority}
                authorPhoto={authorPhoto}
                handleAuthorClick={handleAuthorClick}
                // We pass containerRef mainly for Quartz Date resizing if needed inside, 
                // though StandardPost creates its own layout. 
                // Actually StandardPost needs to measure itself for the quartz date.
                // We should pass the ref or let it handle its own ref?
                // StandardPost uses `containerRef` prop for `QuartzDateWrapper`.
                containerRef={containerRef}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                showNSFWContent={showNSFWContent}
                setShowNSFWContent={setShowNSFWContent}
                hasNSFWContent={hasNSFWContent}
                showDetailsSidebar={showDetailsSidebar}
                setShowDetailsSidebar={setShowDetailsSidebar}
            />
        </div>
    );
};

export default React.memo(Post, (prev, next) => {
    return prev.post.id === next.post.id && prev.priority === next.priority;
});
