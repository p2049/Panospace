import React from 'react';
import { FaRocket } from 'react-icons/fa';
import StarBackground from '@/components/StarBackground';
import GridPostCard from '@/components/GridPostCard';
import FeedPostCard from '@/components/FeedPostCard';
import ListViewContainer from '@/components/feed/ListViewContainer';
import UserCard from '@/components/UserCard';
import StudioCard from '@/components/ui/cards/StudioCard';
import CollectionCard from '@/components/CollectionCard';
import ContestCard from '@/components/ContestCard';
import EventCard from '@/components/EventCard';
import SpaceCardComponent from '@/components/SpaceCardComponent';
import Post from '@/components/Post';
import PSButton from '@/components/PSButton';

const SearchResults = ({
    viewMode,
    currentMode,
    results,
    isMobile,
    selectedOrientation,
    selectedAspectRatio,
    isSearching,
    hasSearched,
    error,
    performSearch,
    setSearchTerm,
    setSelectedTags,
    setSelectedPark,
    setSelectedDate,
    setSelectedCamera,
    setSelectedFilm,
    setSelectedOrientation,
    setSelectedAspectRatio,
    sortBy,
    isMarketplaceMode, // NEW
    fallbackResults
}) => {
    // Calculate if current mode has no results
    const isEmpty = !isSearching && hasSearched && (
        currentMode === 'posts' ? results.posts?.length === 0 :
            currentMode === 'users' ? results.users?.length === 0 :
                currentMode === 'studios' ? results.studios?.length === 0 :
                    currentMode === 'collections' ? results.collections?.length === 0 :
                        currentMode === 'contests' ? results.contests?.length === 0 :
                            currentMode === 'events' ? results.events?.length === 0 :
                                currentMode === 'spacecards' ? results.spacecards?.length === 0 :
                                    currentMode === 'museums' ? results.museums?.length === 0 :
                                        currentMode === 'text' ? results.text?.length === 0 :
                                            false
    );

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Results Area - Only render if NOT empty or IS searching */}
            {(isSearching || !isEmpty) && !error && (
                <div style={{
                    padding: viewMode === 'feed' ? '0' : (isMobile ? '0.8rem 0.8rem 1.5rem 0.8rem' : '1.5rem'),
                    width: '100%',
                    flex: '1'
                }}>
                    {viewMode === 'grid' ? (
                        <div
                            key={`${currentMode}-${results[currentMode]?.length || 0}-${sortBy}`}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? 'repeat(auto-fill, minmax(110px, 1fr))'
                                    : 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: isMobile ? '4px' : '0.75rem',
                                animation: 'fadeIn 0.4s ease-out forwards',
                                opacity: 0
                            }}
                        >
                            <style>{`
    @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
    }
    `}</style>
                            {currentMode === 'posts' && results.posts.map(post => {
                                if (isMarketplaceMode) {
                                    // If in marketplace mode, we expect 'post' to actually be a ShopItem or a Post with shop data?
                                    // For now, let's assume 'post' object has what we need OR we are reusing the post visual.
                                    // NOTE: Real implementation would require fetching 'shopItems' in Search.jsx.
                                    // For this step, I'm just adding the UI switch.
                                    // Let's render a "Shop Item Version" of the card.
                                    return (
                                        <div key={post.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'visible', border: '1px solid #333' }}>
                                            <GridPostCard
                                                post={post}
                                                contextPosts={results.posts}
                                                selectedOrientation={selectedOrientation}
                                                selectedAspectRatio={selectedAspectRatio}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '0.75rem',
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                                                color: '#7FFFD4',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                pointerEvents: 'none'
                                            }}>
                                                <span>${(Math.random() * 50 + 10).toFixed(2)}</span>
                                                <span style={{ fontSize: '0.7rem', background: '#7FFFD4', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>BUY</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <GridPostCard
                                        key={post.id}
                                        post={post}
                                        contextPosts={results.posts}
                                        selectedOrientation={selectedOrientation}
                                        selectedAspectRatio={selectedAspectRatio}
                                    />
                                );
                            })}
                            {currentMode === 'text' && results.text.map(post => (
                                <GridPostCard
                                    key={post.id}
                                    post={post}
                                    contextPosts={results.text}
                                />
                            ))}
                            {currentMode === 'users' && results.users.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                            {currentMode === 'studios' && results.studios.map(studio => (
                                <StudioCard key={studio.id} studio={studio} />
                            ))}
                            {currentMode === 'collections' && results.collections.map(collection => (
                                <CollectionCard key={collection.id} collection={collection} />
                            ))}
                            {currentMode === 'contests' && results.contests.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                            {currentMode === 'events' && results.events.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                            {currentMode === 'museums' && results.museums.map(museum => (
                                <CollectionCard key={museum.id} collection={museum} />
                            ))}
                            {currentMode === 'spacecards' && results.spacecards.map(card => (
                                <div key={card.id} style={{ width: '100%', maxWidth: '240px', margin: '0 auto' }}>
                                    <SpaceCardComponent card={card} compact={false} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <ListViewContainer
                                posts={results[currentMode] || []}
                                renderPost={(item) => {
                                    switch (currentMode) {
                                        case 'users':
                                            return <UserCard user={item} />;
                                        case 'studios':
                                            return <StudioCard studio={item} />;
                                        case 'collections':
                                        case 'museums':
                                            return <CollectionCard collection={item} />;
                                        case 'contests':
                                            return <ContestCard contest={item} />;
                                        case 'events':
                                            return <EventCard event={item} />;
                                        case 'spacecards':
                                            return (
                                                <div style={{ padding: '0.5rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <SpaceCardComponent card={item} compact={true} />
                                                </div>
                                            );
                                        case 'posts':
                                        case 'text':
                                        default:
                                            return <Post post={item} priority="normal" viewMode="list" />;
                                    }
                                }}
                                style={{
                                    height: 'auto',
                                    overflowY: 'visible',
                                    paddingTop: '0',
                                    paddingBottom: '2rem',
                                    background: 'transparent'
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* No Results State */}
            {!isSearching && !error && hasSearched && isEmpty && (
                <div style={{
                    width: '100%',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    {/* Star Background */}
                    <StarBackground />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%' }}>
                        <h2 style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', // Responsive font size
                            fontWeight: '700',
                            letterSpacing: '0.05em',
                            color: '#7FFFD4',
                            textShadow: '0 0 10px rgba(127, 255, 212, 0.5)',
                            marginBottom: '0.5rem'
                        }}>
                            Lost in Space
                        </h2>
                        <p style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 'clamp(1rem, 3vw, 1.2rem)', // Responsive font size
                            fontWeight: '500',
                            letterSpacing: '0.03em',
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginBottom: '1.5rem',
                            lineHeight: '1.5'
                        }}>
                            No results found for {currentMode === 'studios' ? 'studios' : (currentMode === 'text' ? 'pings' : (currentMode === 'posts' ? 'visuals' : currentMode))}. Try adjusting your filters.
                        </p>
                        {currentMode === 'events' && (
                            <p style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: '0.9rem',
                                color: '#7FFFD4',
                                marginTop: '-1rem',
                                marginBottom: '1.5rem',
                                opacity: 0.8
                            }}>
                                No active events right now? Try switching to 'All' or checking back later.
                            </p>
                        )}
                        <PSButton
                            variant="glass"
                            size="lg"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedTags([]);
                                setSelectedPark(null);
                                setSelectedDate(null);
                                setSelectedCamera(null);
                                setSelectedFilm(null);
                                setSelectedOrientation(null);
                                setSelectedAspectRatio(null);
                            }}
                            icon={<FaRocket />}
                        >
                            Explore PanoSpace
                        </PSButton>
                    </div>

                    {/* Fallback / Trending Content */}
                    {fallbackResults && fallbackResults.length > 0 && (
                        <div style={{ width: '100%', marginTop: '3rem', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                margin: '0 0 1rem 0',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(127, 255, 212, 0.3))' }} />
                                <span style={{ color: '#7FFFD4', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Or check these out
                                </span>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(127, 255, 212, 0.3))' }} />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? 'repeat(auto-fill, minmax(140px, 1fr))'
                                    : 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: isMobile ? '0.75rem' : '1rem',
                                width: '100%'
                            }}>
                                {fallbackResults.map(post => (
                                    <GridPostCard
                                        key={post.id}
                                        post={post}
                                        contextPosts={fallbackResults}
                                        selectedOrientation={selectedOrientation}
                                        selectedAspectRatio={selectedAspectRatio}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
            }
            {
                !isSearching && error && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#ff6b6b' }}>
                        <p style={{ marginBottom: '1rem' }}>{error}</p>
                        <PSButton
                            variant="dark"
                            size="md"
                            onClick={() => performSearch(false)}
                        >
                            Retry Search
                        </PSButton>
                    </div>
                )
            }

            {/* Loading Indicator */}
            {
                isSearching && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(127, 255, 212, 0.1)',
                            borderTop: '3px solid var(--ice-mint)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem auto'
                        }} />
                        <p>Searching...</p>
                        <style>{`
    @keyframes spin {
        0 % { transform: rotate(0deg); }
        100 % { transform: rotate(360deg); }
    }

    /* Mobile Landscape Optimization */
    @media (orientation: landscape) and (max-height: 500px) {
        .search-header {
            padding: 0.25rem 1rem !important;
        }
        .search-mode-switcher {
            margin-bottom: 0.25rem !important;
        }
        .search-mode-switcher button {
            padding: 0.3rem 0.6rem !important;
            font-size: 0.8rem !important;
        }
        .search-bar-container {
            margin-bottom: 0.25rem !important;
            flex-direction: row !important;
            align-items: center !important;
        }
        .search-bar-container input {
            padding: 0.4rem 1rem 0.4rem 2.5rem !important;
            font-size: 0.85rem !important;
        }
        .search-bar-container label {
            padding: 0.4rem 0.8rem !important;
        }
    }
`}</style>
                    </div>
                )
            }
        </div>
    );
};

export default SearchResults;
