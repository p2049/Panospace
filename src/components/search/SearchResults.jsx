import React from 'react';
import { FaRocket } from 'react-icons/fa';
import StarBackground from '../StarBackground';
import GridPostCard from '../GridPostCard';
import FeedPostCard from '../FeedPostCard';
import UserCard from '../UserCard';
import GalleryCard from '../ui/cards/GalleryCard';
import CollectionCard from '../CollectionCard';
import ContestCard from '../ContestCard';
import EventCard from '../EventCard';
import SpaceCard from '../SpaceCard';
import PSButton from '../PSButton';

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
    sortBy
}) => {
    return (
        <>
            {/* Results Area */}
            <div style={{ padding: isMobile ? '0.8rem 0.8rem 1.5rem 0.8rem' : '1.5rem' }}>
                {viewMode === 'grid' ? (
                    <div
                        key={`${currentMode}-${results[currentMode]?.length || 0}-${sortBy}`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile
                                ? 'repeat(auto-fill, minmax(140px, 1fr))'
                                : 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: isMobile ? '0.75rem' : '1rem',
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
                        {currentMode === 'posts' && results.posts.map(post => (
                            <GridPostCard
                                key={post.id}
                                post={post}
                                contextPosts={results.posts}
                                selectedOrientation={selectedOrientation}
                                selectedAspectRatio={selectedAspectRatio}
                            />
                        ))}
                        {currentMode === 'users' && results.users.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                        {currentMode === 'galleries' && results.galleries.map(gallery => (
                            <GalleryCard key={gallery.id} studio={gallery} />
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
                        {currentMode === 'spacecards' && results.spacecards.map(card => (
                            <SpaceCard key={card.id} card={card} />
                        ))}
                    </div>
                ) : (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {currentMode === 'posts' && results.posts.map(post => (
                            <div key={post.id} style={{ marginBottom: '1rem' }}>
                                <FeedPostCard post={post} />
                            </div>
                        ))}
                        {/* Add other modes for feed view if needed */}
                    </div>
                )}
            </div>

            {/* No Results State */}
            {
                !isSearching && !error && (
                    currentMode === 'posts' ? results.posts.length === 0 :
                        currentMode === 'users' ? results.users.length === 0 :
                            currentMode === 'galleries' ? results.galleries.length === 0 :
                                currentMode === 'collections' ? results.collections.length === 0 :
                                    currentMode === 'contests' ? results.contests.length === 0 :
                                        currentMode === 'events' ? results.events.length === 0 :
                                            currentMode === 'spacecards' ? results.spacecards.length === 0 : true
                ) && hasSearched && (
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
                                No results found for {currentMode === 'galleries' ? 'studios' : currentMode}. Try adjusting your filters.
                            </p>
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
    @media(orientation: landscape) and(max - height: 500px) {
                            .search - header {
    padding: 0.25rem 1rem!important;
}
                            .search - mode - switcher {
    margin - bottom: 0.25rem!important;
}
                            .search - mode - switcher button {
    padding: 0.3rem 0.6rem!important;
    font - size: 0.8rem!important;
}
                            .search - bar - container {
    margin - bottom: 0.25rem!important;
    flex - direction: row!important;
    align - items: center!important;
}
                            .search - bar - container input {
    padding: 0.4rem 1rem 0.4rem 2.5rem!important;
    font - size: 0.85rem!important;
}
                            .search - bar - container label {
    padding: 0.4rem 0.8rem!important;
}
                        }
`}</style>
                    </div>
                )
            }
        </>
    );
};

export default SearchResults;
