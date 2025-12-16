import React from 'react';
import { FaRocket } from 'react-icons/fa';
import StarBackground from '@/components/StarBackground';
import UserCard from '@/components/UserCard';
import GalleryCard from '@/components/ui/cards/GalleryCard';
import CollectionCard from '@/components/CollectionCard';
import ShopItemCard from '@/components/ui/cards/ShopItemCard';
import ContestCard from '@/components/ContestCard';
import EventCard from '@/components/EventCard';
import SpaceCard from '@/components/SpaceCard';
import PSButton from '@/components/PSButton';

const MarketResults = ({
    viewMode,
    currentMode,
    results,
    isMobile,
    isSearching,
    hasSearched,
    error,
    performSearch,
    setSearchTerm
}) => {
    return (
        <>
            {/* Results Area */}
            <div style={{ padding: isMobile ? '0.8rem 0.8rem 1.5rem 0.8rem' : '1.5rem' }}>
                <div
                    key={`${currentMode}-${results[currentMode]?.length || 0}`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                            ? 'repeat(auto-fill, minmax(110px, 1fr))'
                            : 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: isMobile ? '0.5rem' : '1rem',
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
                        <ShopItemCard key={post.id} item={post} />
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
            </div>

            {/* No Results State */}
            {
                !isSearching && !error && hasSearched && (() => {
                    const isEmpty =
                        currentMode === 'posts' ? results.posts?.length === 0 :
                            currentMode === 'users' ? results.users?.length === 0 :
                                currentMode === 'galleries' ? results.galleries?.length === 0 :
                                    currentMode === 'collections' ? results.collections?.length === 0 :
                                        currentMode === 'contests' ? results.contests?.length === 0 :
                                            currentMode === 'events' ? results.events?.length === 0 :
                                                currentMode === 'spacecards' ? results.spacecards?.length === 0 :
                                                    false;

                    return isEmpty;
                })() && (
                    <div style={{
                        width: '100%',
                        minHeight: 'calc(100vh - 120px)', // Ensure it covers page below header
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        padding: '2rem 1.5rem',
                        textAlign: 'center',
                        position: 'relative',
                        marginTop: '-1rem' // Pull up slightly to reduce gap
                    }}>
                        <StarBackground />

                        {/* Gradient Overlay for seamless blend */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100px',
                            background: 'linear-gradient(to bottom, #000, transparent)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%' }}>
                            <h2 style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                                fontWeight: '700',
                                letterSpacing: '0.05em',
                                color: '#7FFFD4',
                                textShadow: '0 0 10px rgba(127, 255, 212, 0.5)',
                                marginBottom: '0.5rem'
                            }}>
                                Empty Shelf
                            </h2>
                            <p style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                fontWeight: '500',
                                letterSpacing: '0.03em',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginBottom: '1.5rem',
                                lineHeight: '1.5'
                            }}>
                                No shop items found. Try adjusting your filters.
                            </p>
                            <PSButton
                                variant="glass"
                                size="lg"
                                onClick={() => {
                                    setSearchTerm('');
                                }}
                                icon={<FaRocket />}
                            >
                                Clear Search
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
                        <p>Searching Shop...</p>
                        <style>{`
                            @keyframes spin {
                                0 % { transform: rotate(0deg); }
                                100 % { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )
            }
        </>
    );
};

export default MarketResults;
