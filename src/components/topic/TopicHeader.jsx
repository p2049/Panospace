import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCheck, FaPenFancy, FaHashtag, FaUsers } from 'react-icons/fa';
import { useTopicFollow } from '@/hooks/useTopicFollow';
import PSButton from '@/components/PSButton';

/**
 * Generates a title from tags based on canonical priority rules.
 */
const generateTopicTitle = (tags) => {
    if (!tags || tags.length === 0) return "Topic";

    // Priority Buckets (Simplified for MVP)
    const brands = ['nikon', 'canon', 'sony', 'leica', 'kodak', 'fujifilm', 'polaroid', 'hasselblad'];
    const formats = ['35mm', '120mm', 'digital', 'film', 'analog', 'polaroid'];
    const genres = ['street', 'portrait', 'landscape', 'architecture', 'cyberpunk', 'abstract', 'fashion', 'wildlife', 'nature'];

    // 1. Sort logic could go here, but for now we trust the slug/tag order or just simple detection
    // Let's just Capitalize for V1
    const capitalTags = tags.map(t => t.charAt(0).toUpperCase() + t.slice(1));

    // Join logic
    let title = capitalTags.join(' & ');

    // Suffix logic: If last word isn't a "Root Noun", add one.
    const lastWord = title.split(' ').pop().toLowerCase();
    const rootNouns = ['photography', 'art', 'design', 'style', 'mode', 'vibes', 'culture', 'architecture', 'memes'];

    if (!rootNouns.some(n => lastWord.includes(n))) {
        // Simple heuristic: if 'Art' related, append 'Art', otherwise 'Photography'
        // Default to nothing for now to keep it clean, or "Zone" / "Topic"
        // Per spec: "Applies Photography if not present"
        // Let's be careful not to make "Red Photography" if it's just "Red"
        if (tags.length > 0) {
            // We'll leave it raw for now to avoid "Nikon Film Photography Photography" edge cases
            // until the classifier is smarter.
        }
    }

    return title;
};

const TopicHeader = ({ tags, canonicalSlug }) => {
    const navigate = useNavigate();
    const { isFollowing, followerCount, toggleFollow } = useTopicFollow(canonicalSlug, tags);

    const title = useMemo(() => generateTopicTitle(tags), [tags]);

    // Background Gradient based on string hash to give unique per-topic feel
    const bgGradient = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < canonicalSlug.length; i++) {
            hash = canonicalSlug.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `linear-gradient(135deg, hsl(${h}, 70%, 15%) 0%, hsl(${(h + 40) % 360}, 60%, 10%) 100%)`;
    }, [canonicalSlug]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            padding: '3rem 2rem 2rem 2rem',
            background: bgGradient,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '1rem',
            overflow: 'hidden'
        }}>
            {/* Visual Noise / Texture Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>

                {/* Left: Identity */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                        {tags.map(tag => (
                            <span key={tag} style={{
                                fontFamily: 'var(--font-family-mono)',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: 'var(--ice-mint)'
                            }}>#{tag}</span>
                        ))}
                    </div>

                    <h1 style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: '900',
                        color: '#fff',
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: '0 0 20px rgba(127,255,212,0.2)',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                    }}>
                        {title}
                    </h1>

                    {/* Non-clickable stats */}
                    <div style={{
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUsers />
                            <span>{followerCount.toLocaleString()} <span style={{ opacity: 0.7 }}>Followers</span></span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

                    {/* Follow Toggle */}
                    <PSButton
                        onClick={toggleFollow}
                        variant={isFollowing ? 'success' : 'glass'}
                        size="md"
                        icon={isFollowing ? <FaCheck /> : <FaPlus />}
                        style={{ minWidth: '140px' }}
                    >
                        {isFollowing ? 'ADDED' : 'FOLLOW TOPIC'}
                    </PSButton>

                    {/* Post Here */}
                    <PSButton
                        onClick={() => navigate('/create-post', { state: { tags: tags } })}
                        variant="primary"
                        size="md"
                        icon={<FaPenFancy />}
                    >
                        POST HERE
                    </PSButton>
                </div>
            </div>
        </div>
    );
};

export default TopicHeader;
