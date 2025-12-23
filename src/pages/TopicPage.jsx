import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopicHeader from '@/components/topic/TopicHeader';
import ListViewContainer from '@/components/feed/ListViewContainer';
import useSearch from '@/hooks/useSearch'; // Reusing the search hook for the feed
import SEO from '@/components/SEO';

const TopicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

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
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'prompts'

    // Reuse Search Hook to fetch posts matching these tags
    // For Prompts tab, we add '#Prompt' to the search tags
    const searchTags = useMemo(() => {
        if (activeTab === 'prompts') {
            return [...tags, '#Prompt'];
        }
        return tags;
    }, [tags, activeTab]);

    const {
        results,
        loading: searchLoading,
        error
    } = useSearch({
        initialMode: 'posts',
        initialTags: searchTags, // Use computed tags including #Prompt if tab active
        initialSort: 'recent',
        autoSearch: true  // Trigger search immediately
    });

    const posts = results?.posts || [];

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
            <SEO title={`${activeTab === 'prompts' ? 'Prompts' : 'Topic'}: ${tags.join(', ')}`} description={`Explore ${activeTab === 'prompts' ? 'prompts' : 'posts'} tagged with ${tags.join(' and ')} on Panospace.`} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <TopicHeader tags={tags} canonicalSlug={canonicalSlug} />

                {/* Content Feed */}
                <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>

                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '1rem',
                        padding: '0 2rem'
                    }}>
                        <button
                            onClick={() => setActiveTab('feed')}
                            style={{
                                padding: '1rem 1.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'feed' ? '#7FFFD4' : '#666',
                                borderBottom: activeTab === 'feed' ? '2px solid #7FFFD4' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.2s'
                            }}
                        >
                            FEED
                        </button>
                        <button
                            onClick={() => setActiveTab('prompts')}
                            style={{
                                padding: '1rem 1.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'prompts' ? '#7FFFD4' : '#666',
                                borderBottom: activeTab === 'prompts' ? '2px solid #7FFFD4' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.2s'
                            }}
                        >
                            PROMPTS
                        </button>
                    </div>

                    {/* Feed List */}
                    {searchLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Loading feed...</div>
                    ) : error ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#ff6b6b' }}>Error loading topic: {error}</div>
                    ) : posts.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>No {activeTab === 'prompts' ? 'prompts' : 'posts'} yet.</h3>
                            <button
                                onClick={() => navigate('/create-post', { state: { tags: tags, initialPostType: activeTab === 'prompts' ? 'text' : 'image' } })}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #7FFFD4',
                                    color: '#7FFFD4',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {activeTab === 'prompts' ? 'Launch a prompt' : 'Start the conversation'}
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
