import { useState, useEffect } from 'react';
import { SpaceCardService } from '@/services/SpaceCardService';

/**
 * Hook to fetch a space card and its marketplace listings
 * @param {string} cardId - Card ID to fetch
 * @returns {object} { card, listings, loading, error, refetch }
 */
export const useSpaceCard = (cardId) => {
    const [card, setCard] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!cardId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const cardData = await SpaceCardService.getCard(cardId);
            setCard(cardData);

            // Fetch marketplace listings for this card
            const marketplace = await SpaceCardService.getMarketplace();
            const cardListings = marketplace.filter(item => item.id === cardId);
            setListings(cardListings);
        } catch (err) {
            console.error('Error fetching card details:', err);
            setError(err.message || 'Failed to load card');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [cardId]);

    return { card, listings, loading, error, refetch };
};

export default useSpaceCard;
