import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopicHeader from '@/components/topic/TopicHeader';
import ListViewContainer from '@/components/feed/ListViewContainer';
import useSearch from '@/hooks/useSearch'; // Reusing the search hook for the feed
import SEO from '@/components/SEO';

const TopicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Parse Slug -> Tags
    // Slug format: "tag1+tag2"
    const tags = useMemo(() => {
        if (!slug) return [];
        return slug.split('+').filter(Boolean).map(t => decodeURIComponent(t));
    }, [slug]);

    // Construct Canonical Slug locally to ensure it matches logic even if URL was messy
    const canonicalSlug = useMemo(() => {
        return [...tags].sort().join('+');
    }, [tags]);

    // Reuse Search Hook to fetch posts matching these tags
    const {
        results,
        loading: searchLoading,
        error
    } = useSearch({
        initialMode: 'posts',
        initialTags: tags, // Start with these tags selected
        initialSort: 'recent',
        autoSearch: true  // Trigger search immediately
    });

    const posts = results?.posts || [];

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
            <SEO title={`Topic: ${tags.join(', ')}`} description={`Explore posts tagged with ${tags.join(' and ')} on Panospace.`} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <TopicHeader tags={tags} canonicalSlug={canonicalSlug} />

                {/* Content Feed */}
                <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>

                    {/* Feed Controls */}
                    <div style={{
                        padding: '1rem 2rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        color: '#7FFFD4',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>LATEST POSTS</span>
                    </div>

                    {/* Feed List */}
                    {searchLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Loading feed...</div>
                    ) : error ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#ff6b6b' }}>Error loading topic: {error}</div>
                    ) : posts.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>No posts yet.</h3>
                            <button
                                onClick={() => navigate('/create-post', { state: { tags: tags } })}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #7FFFD4',
                                    color: '#7FFFD4',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Start the conversation
                            </button>
                        </div>
                    ) : (
                        <ListViewContainer posts={posts} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopicPage;
