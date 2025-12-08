import React from 'react';
import { FaCamera, FaImage, FaLayerGroup, FaTrophy, FaCalendar, FaUsers, FaIdCard, FaUniversity } from 'react-icons/fa';
import ModernIcon from '@/components/ModernIcon';
import PSButton from '@/components/PSButton';

import { isFeatureEnabled } from '@/config/featureFlags';

const SearchModeTabs = ({ currentMode, setCurrentMode, isMobile }) => {
    return (
        <div className="search-mode-switcher" style={{
            display: 'flex',
            gap: isMobile ? '0.15rem' : '1rem',
            marginBottom: isMobile ? '0' : '0.25rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            justifyContent: isMobile ? 'space-between' : 'flex-start'
        }}>
            <style>{`
                @media (max-width: 1024px) {
                    .tab-label {
                        display: none !important;
                    }
                    .search-mode-switcher button {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            {[
                { key: 'posts', icon: FaCamera, label: 'Posts', enabled: true },
                { key: 'galleries', icon: FaImage, label: 'Studios', enabled: isFeatureEnabled('GALLERIES') },
                { key: 'collections', icon: FaLayerGroup, label: 'Collections', enabled: isFeatureEnabled('COLLECTIONS') },
                { key: 'museums', icon: FaUniversity, label: 'Museums', enabled: isFeatureEnabled('MUSEUMS') },
                { key: 'contests', icon: FaTrophy, label: 'Contests', enabled: isFeatureEnabled('CONTESTS') },
                { key: 'events', icon: FaCalendar, label: 'Events', enabled: isFeatureEnabled('EVENTS') },
                { key: 'users', icon: FaUsers, label: 'Users', enabled: true },
                { key: 'spacecards', icon: FaIdCard, label: 'SpaceCards', enabled: isFeatureEnabled('SPACECARDS_CREATE') }
            ].filter(mode => mode.enabled).map(mode => (
                <PSButton
                    key={mode.key}
                    variant="mint"
                    size="sm"
                    active={currentMode === mode.key}
                    onClick={() => setCurrentMode(mode.key)}
                    style={{
                        height: '32px',
                        padding: isMobile ? '0 0.2rem' : '0.5rem 1.25rem',
                        flex: isMobile ? '1' : undefined,
                        justifyContent: 'center',
                        minWidth: isMobile ? '28px' : undefined
                    }}
                    icon={<ModernIcon icon={mode.icon} size={14} glow={currentMode === mode.key} />}
                >
                    <span className="tab-label">{!isMobile && mode.label}</span>
                </PSButton>
            ))}
        </div>
    );
};

export default SearchModeTabs;
