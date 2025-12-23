import React from 'react';
import { FaCamera, FaImage, FaLayerGroup, FaTrophy, FaCalendar, FaUsers, FaIdCard, FaUniversity, FaAlignLeft } from 'react-icons/fa';
import ModernIcon from '@/components/ModernIcon';
import PSButton from '@/components/PSButton';

import { isFeatureEnabled } from '@/config/featureFlags';

const SearchModeTabs = ({ currentMode, setCurrentMode, isMobile, children }) => {
    return (
        <div className="search-mode-switcher" style={{
            display: 'flex',
            gap: '0.4rem', // Reduced gap (Group D)
            marginBottom: isMobile ? '0' : '0.25rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            justifyContent: 'flex-start',
            paddingRight: '2rem' // Added End Padding (Group D)
        }}>
            <style>{`
                @media (max-width: 1024px) {
                    .tab-label {
                        display: none !important;
                    }
                }
                .search-mode-switcher::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Render any prefix elements (like Art/Shop buttons) */}
            {children}

            {[
                { key: 'posts', icon: FaCamera, label: 'Visuals', enabled: true },
                { key: 'text', icon: FaAlignLeft, label: 'Pings', enabled: true },
                { key: 'studios', icon: FaImage, label: 'Studios', enabled: isFeatureEnabled('GALLERIES') },
                { key: 'collections', icon: FaLayerGroup, label: 'Collections', enabled: isFeatureEnabled('COLLECTIONS') },
                { key: 'museums', icon: FaUniversity, label: 'Museums', enabled: isFeatureEnabled('MUSEUMS') },
                { key: 'contests', icon: FaTrophy, label: 'Contests', enabled: isFeatureEnabled('CONTESTS') },
                { key: 'events', icon: FaCalendar, label: 'Events', enabled: isFeatureEnabled('EVENTS') },
                { key: 'users', icon: FaUsers, label: 'Users', enabled: true },
                { key: 'spacecards', icon: FaIdCard, label: 'SpaceCards', enabled: true }
            ].filter(mode => mode.enabled).map(mode => (
                <PSButton
                    key={mode.key}
                    variant="mint"
                    size="sm"
                    active={currentMode === mode.key}
                    onClick={() => setCurrentMode(mode.key)}
                    style={{
                        height: '32px',
                        width: isMobile ? '32px' : undefined, // Force square on mobile
                        padding: isMobile ? '0' : '0.5rem 1rem',
                        flexShrink: 0,
                        justifyContent: 'center',
                        minWidth: isMobile ? '32px' : undefined,
                        borderRadius: '8px', // Enforce rounded square (Group E)
                        fontSize: '0.8rem'
                    }}
                    icon={<mode.icon size={16} />} // Raw icon, no ModernIcon wrapper (Group E)
                >
                    <span className="tab-label">{!isMobile && mode.label}</span>
                </PSButton>
            ))}
        </div>
    );
};

export default SearchModeTabs;
