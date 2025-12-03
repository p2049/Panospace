import React from 'react';
import { FaCamera, FaImage, FaLayerGroup, FaTrophy, FaCalendar, FaUsers, FaIdCard, FaUniversity } from 'react-icons/fa';
import ModernIcon from '../ModernIcon';
import PSButton from '../PSButton';

const SearchModeTabs = ({ currentMode, setCurrentMode, isMobile }) => {
    return (
        <div className="search-mode-switcher" style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: isMobile ? '0' : '1rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            {[
                { key: 'posts', icon: FaCamera, label: 'Posts' },
                { key: 'galleries', icon: FaImage, label: 'Studios' },
                { key: 'collections', icon: FaLayerGroup, label: 'Collections' },
                { key: 'museums', icon: FaUniversity, label: 'Museums' },
                { key: 'contests', icon: FaTrophy, label: 'Contests' },
                { key: 'events', icon: FaCalendar, label: 'Events' },
                { key: 'users', icon: FaUsers, label: 'Users' },
                { key: 'spacecards', icon: FaIdCard, label: 'SpaceCards' }
            ].map(mode => (
                <PSButton
                    key={mode.key}
                    variant="mint"
                    size={isMobile ? 'sm' : 'md'}
                    active={currentMode === mode.key}
                    onClick={() => setCurrentMode(mode.key)}
                    icon={<ModernIcon icon={mode.icon} size={14} glow={currentMode === mode.key} />}
                >
                    {!isMobile && mode.label}
                </PSButton>
            ))}
        </div>
    );
};

export default SearchModeTabs;
