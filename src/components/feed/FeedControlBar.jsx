import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '@/core/store/useFeedStore';
import { useThemeColors } from '@/core/store/useThemeStore';
import { useCustomFeeds } from '@/hooks/useCustomFeeds';
import {
    FiUsers,
    FiGlobe,
    FiLayers,
    FiImage,
    FiMessageSquare,
    FiEye,
    FiHash,
    FiFilter,
    FiPlus
} from 'react-icons/fi';

const FeedControlBar = () => {
    const {
        feedContentType,
        setFeedContentType,
        feedScope,
        setFeedScope,
        activeCustomFeedId,
        listFilter,
        setListFilter,
        customFeedEnabled,
        setCustomFeedEnabled,
        feedViewMode,
        setFeedViewMode,
        setActiveCustomFeed
    } = useFeedStore();

    const navigate = useNavigate();

    const { accentColor } = useThemeColors();
    const { feeds } = useCustomFeeds();

    // Enhanced mobile/horizontal detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            // Treat as mobile if narrow OR if it's horizontal mobile (wide but short)
            const isNarrow = width < 600;
            const isHorizontal = width > height && height < 500;
            setIsMobile(isNarrow || isHorizontal);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // AUTO-SWITCH: If only PINGS are selected, auto-switch Content Group to SOCIAL
    useEffect(() => {
        if (listFilter === 'text' && feedContentType !== 'social') {
            setFeedContentType('social');
        }
    }, [listFilter, feedContentType, setFeedContentType]);

    // AUTO-SWITCH: If PINGS is selected while on visual mode, switch to list view
    // This must run BEFORE any other filter logic
    useEffect(() => {
        if (listFilter === 'text' && feedViewMode === 'image') {
            setFeedViewMode('list');
        }
    }, [listFilter, feedViewMode, setFeedViewMode]);

    // PANO BRAND COLORS
    const COLORS = {
        mint: '#7FFFD4',
        blue: '#4CC9F0',
        ionBlue: '#1B82FF',
        pink: '#FF6B9D',
        lightPink: '#FFB7D5',
        purple: '#6C5CE7',
        gray: '#A1A1A1',
        accent: accentColor
    };

    const buttonStyle = (isActive) => ({
        padding: isMobile ? '6px 10px' : '7px 14px',
        borderRadius: '8px',
        border: '1px solid transparent',
        background: 'transparent',
        color: 'rgba(255,255,255,0.6)',
        fontSize: isMobile ? '0.65rem' : '0.8rem',
        fontWeight: '600',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        minWidth: isMobile ? 'auto' : '85px',
        fontFamily: "'Orbitron', sans-serif",
        gap: isMobile ? '3px' : '6px'
    });

    const hexToRgb = (hex) => {
        if (!hex) return '127, 255, 212';
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '127, 255, 212';
    };

    const groupContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        position: 'relative',
        paddingTop: isMobile ? '20px' : '24px' // Increased from 14/18 to create more separation from ALL button
    };

    const bothButtonStyle = (isActive) => ({
        fontSize: isMobile ? '0.55rem' : '0.65rem',
        padding: isMobile ? '3px 8px' : '3px 12px',
        background: isActive ? `rgba(${hexToRgb(COLORS.mint)}, 0.1)` : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: isActive ? COLORS.mint : 'rgba(255, 255, 255, 0.4)',
        fontWeight: '800',
        letterSpacing: '0.15em',
        cursor: 'pointer',
        position: 'absolute',
        top: '0',
        transition: 'all 0.2s',
        textShadow: isActive ? `0 0 10px ${COLORS.mint}` : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '2px' : '4px',
        fontFamily: "'Orbitron', sans-serif",
        transform: isActive ? 'scale(1.05)' : 'scale(1)'
    });

    const pillContainerStyle = {
        display: 'flex',
        gap: isMobile ? '2px' : '4px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        padding: '2px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s ease'
    };

    const getPillStyle = (isSelected, isBothMode, activeColor = COLORS.accent) => {
        const active = isSelected || isBothMode;
        const color = active ? activeColor : 'rgba(255,255,255,0.4)';
        return {
            ...buttonStyle(active),
            border: active ? `1px solid ${activeColor}40` : '1px solid transparent',
            background: active ? `rgba(${hexToRgb(activeColor)}, 0.15)` : 'transparent',
            color: color,
            boxShadow: isSelected ? `0 0 12px ${activeColor}30` : 'none',
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            padding: isMobile ? '5px 8px' : '7px 14px',
            minWidth: isMobile ? 'auto' : '85px'
        };
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '16px',
            width: 'auto',
            margin: '0 auto',
            height: 'auto',
            padding: '2px 0 8px 0',
            background: 'transparent',
            boxSizing: 'border-box'
        }}>

            {/* Scope Group */}
            <div style={{
                ...groupContainerStyle,
                paddingTop: isMobile ? '28px' : '34px' // Substantially increased gap
            }}>
                <button
                    onClick={() => setFeedScope(feedScope === 'all' ? 'global' : 'all')}
                    style={bothButtonStyle(feedScope === 'all')}
                >
                    <FiLayers size={isMobile ? 8 : 10} /> ALL
                </button>
                <div style={pillContainerStyle}>
                    <button
                        onClick={() => setFeedScope('following')}
                        style={getPillStyle(feedScope === 'following', feedScope === 'all', COLORS.lightPink)}
                    >
                        <FiUsers size={isMobile ? 10 : 12} /> {isMobile ? '' : 'ADDED'}
                    </button>
                    <button
                        onClick={() => setFeedScope('global')}
                        style={getPillStyle(feedScope === 'global', feedScope === 'all', COLORS.ionBlue)}
                    >
                        <FiGlobe size={isMobile ? 10 : 12} /> {isMobile ? '' : 'GLOBAL'}
                    </button>
                </div>
            </div>

            <div style={{ width: '1px', height: isMobile ? '14px' : '18px', background: 'rgba(255,255,255,0.1)', marginBottom: isMobile ? '6px' : '8px' }} />

            {/* Content Group */}
            <div style={{
                ...groupContainerStyle,
                paddingTop: isMobile ? '28px' : '34px'
            }}>
                <button
                    onClick={() => {
                        // If user is viewing pings-only and activating ALL, switch list filter to show mixed feed
                        if (listFilter === 'text' && feedContentType !== 'all') {
                            setListFilter('all');
                        }
                        setFeedContentType(feedContentType === 'all' ? 'art' : 'all');
                    }}
                    style={bothButtonStyle(feedContentType === 'all')}
                >
                    <FiLayers size={isMobile ? 8 : 10} /> ALL
                </button>
                <div style={pillContainerStyle}>
                    <button
                        onClick={() => {
                            // If user is viewing pings-only, switch to all list items so art can show
                            if (listFilter === 'text') {
                                setListFilter('all');
                            }
                            setFeedContentType('art');
                        }}
                        style={getPillStyle(feedContentType === 'art', feedContentType === 'all', COLORS.pink)}
                    >
                        <FiImage size={isMobile ? 10 : 12} /> {isMobile ? '' : 'ART'}
                    </button>
                    <button
                        onClick={() => setFeedContentType('social')}
                        style={getPillStyle(feedContentType === 'social', feedContentType === 'all', COLORS.mint)}
                    >
                        <FiMessageSquare size={isMobile ? 10 : 12} /> {isMobile ? '' : 'SOCIAL'}
                    </button>
                </div>
            </div>

            <div style={{ width: '1px', height: isMobile ? '14px' : '18px', background: 'rgba(255,255,255,0.1)', marginBottom: isMobile ? '6px' : '8px' }} />

            {/* List Group */}
            <div style={{
                ...groupContainerStyle,
                paddingTop: isMobile ? '28px' : '34px'
            }}>
                <button
                    onClick={() => setListFilter(listFilter === 'all' ? 'visual' : 'all')}
                    style={bothButtonStyle(listFilter === 'all')}
                >
                    <FiLayers size={isMobile ? 8 : 10} /> ALL
                </button>
                <div style={pillContainerStyle}>
                    <button
                        onClick={() => setListFilter('visual')}
                        style={getPillStyle(listFilter === 'visual', listFilter === 'all', COLORS.blue)}
                    >
                        <FiEye size={isMobile ? 10 : 12} /> {isMobile ? '' : 'VISUAL'}
                    </button>
                    <button
                        onClick={() => setListFilter('text')}
                        style={getPillStyle(listFilter === 'text', listFilter === 'all', COLORS.purple)}
                    >
                        <FiHash size={isMobile ? 10 : 12} /> {isMobile ? '' : 'PINGS'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default FeedControlBar;
