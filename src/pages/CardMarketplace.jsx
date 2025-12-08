import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaStar } from 'react-icons/fa';
import { SpaceCardService, RARITY_TIERS, CARD_DISCIPLINES, EDITION_TYPES } from '@/services/SpaceCardService';
import SpaceCardComponent from '@/components/SpaceCardComponent';

const CardMarketplace = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [selectedRarity, setSelectedRarity] = useState('');
    const [selectedDiscipline, setSelectedDiscipline] = useState('');
    const [selectedEditionType, setSelectedEditionType] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchMarketplace();
    }, [selectedRarity, selectedDiscipline, selectedEditionType, minPrice, maxPrice, sortBy]);

    const fetchMarketplace = async () => {
        setLoading(true);
        try {
            const filters = {
                rarity: selectedRarity || undefined,
                discipline: selectedDiscipline || undefined,
                editionType: selectedEditionType || undefined,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                sortBy
            };

            const marketplace = await SpaceCardService.getMarketplace(filters);
            setCards(marketplace);
        } catch (error) {
            console.error('Error fetching marketplace:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCards = cards.filter(card => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            card.title.toLowerCase().includes(search) ||
            card.creatorName.toLowerCase().includes(search) ||
            card.description?.toLowerCase().includes(search)
        );
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', color: '#fff', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #333' }}>
                <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>SpaceCards Marketplace</h1>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Search cards by name, creator, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                {/* Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    <select
                        value={selectedRarity}
                        onChange={(e) => setSelectedRarity(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    >
                        <option value="">All Rarities</option>
                        {Object.keys(RARITY_TIERS).map(rarity => (
                            <option key={rarity} value={rarity}>{rarity}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDiscipline}
                        onChange={(e) => setSelectedDiscipline(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    >
                        <option value="">All Disciplines</option>
                        {Object.values(CARD_DISCIPLINES).map(disc => (
                            <option key={disc} value={disc}>{disc}</option>
                        ))}
                    </select>

                    <select
                        value={selectedEditionType}
                        onChange={(e) => setSelectedEditionType(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    >
                        <option value="">All Editions</option>
                        <option value={EDITION_TYPES.LIMITED}>Limited</option>
                        <option value={EDITION_TYPES.TIMED}>Timed</option>
                        <option value={EDITION_TYPES.CHALLENGE}>Challenge</option>
                        <option value={EDITION_TYPES.CONTEST}>Contest</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                {/* Price Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                </div>
            </div>

            {/* Results */}
            <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem', color: '#888' }}>
                    {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} available
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        Loading marketplace...
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        <FaFilter size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <div>No cards found matching your filters</div>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredCards.map(card => (
                            <div
                                key={card.listing.id}
                                onClick={() => navigate(`/cards/${card.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <SpaceCardComponent
                                    card={card}
                                    ownership={card.listing}
                                    showPrice={true}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardMarketplace;
