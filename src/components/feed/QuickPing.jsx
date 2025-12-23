import React, { useState, useRef } from 'react';
import { FaRocket, FaExpand, FaPalette } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useThemeColors } from '@/core/store/useThemeStore';
import { FREE_COLOR_PACK } from '@/core/constants/colorPacks';
import { fadeColor, isColorDark, lightenColor } from '@/core/utils/colorUtils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useEffect } from 'react';

const QuickPing = ({ onPostSuccess }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createPost, loading } = useCreatePost();
    const { accentColor } = useThemeColors();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    // Default to a solid color that is definitely in WRITER_THEMES (classic-mint is index 10/11)
    const [selectedColor, setSelectedColor] = useState(FREE_COLOR_PACK.find(c => c.id === 'classic-mint') || FREE_COLOR_PACK[1]);
    const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
    const [isPosting, setIsPosting] = useState(false);
    const [isSignal, setIsSignal] = useState(false);

    const getAvailableTextColors = (bgColorOption) => {
        if (!bgColorOption) return [];
        const options = [];
        const bgHex = bgColorOption.color.toLowerCase();
        const isDark = isColorDark(bgHex);
        const bgId = bgColorOption.id;

        // 0. Theme Identity (Match Border) - Use Periwinkle for purple
        if (bgId !== 'event-horizon-black' && bgId !== 'ice-white') {
            const themeColor = bgId === 'deep-orbit-purple' ? '#A7B6FF' : bgColorOption.color;
            options.push({ id: 'self', name: bgId === 'deep-orbit-purple' ? 'Periwinkle' : 'Theme Match', color: themeColor });
        }

        // 1. Black & White (with exclusion rules)
        // Always push White (available on all themes)
        options.push({ id: 'white', name: 'White', color: '#ffffff' });

        // User Rule: Black text is ONLY allowed on White background
        if (bgId === 'ice-white' || bgHex === '#ffffff' || bgHex === '#f2f7fa') {
            options.push({ id: 'black', name: 'Black', color: '#000000' });
        }

        // 2. Lighter shade if dark
        // Exclude classic-mint/ion-blue/deep-orbit-purple (purple uses periwinkle instead)
        if (isDark && bgId !== 'event-horizon-black' && bgId !== 'classic-mint' && bgId !== 'ion-blue' && bgId !== 'deep-orbit-purple') {
            options.push({ id: 'light-self', name: 'Light Tone', color: lightenColor(bgColorOption.color, 40) });
        }

        // 3. Pink & Blue pair (Aurora Blue)
        // 3. Pink & Blue pair (Aurora Blue)
        if (bgId.includes('pink')) {
            options.push({ id: 'pair-aurora', name: 'Aurora Blue', color: '#7FDBFF' });
            options.push({ id: 'pair-green', name: 'Mint', color: '#7FFFD4' });
            options.push({ id: 'pair-light-pink', name: 'Light Pink', color: '#FFB7D5' });
        }
        if (bgId.includes('blue')) options.push({ id: 'pair-pink', name: 'Pink', color: '#FF5C8A' });
        if (bgId === 'ion-blue') options.push({ id: 'pair-aurora', name: 'Aurora Blue', color: '#7FDBFF' });

        // 4. Orange with Periwinkle & Aurora Blue
        if (bgId === 'stellar-orange') {
            options.push({ id: 'pair-periwinkle', name: 'Periwinkle', color: '#A7B6FF' });
            options.push({ id: 'pair-aurora', name: 'Aurora Blue', color: '#7FDBFF' });
        }

        // 5. Purple with Orange, Green
        if (bgId === 'deep-orbit-purple') {
            options.push({ id: 'pair-orange', name: 'Orange', color: '#FF914D' });
            options.push({ id: 'pair-green', name: 'Mint', color: '#7FFFD4' });
        }

        // 6. Green with Aurora Blue & Pink
        if (bgId === 'classic-mint') {
            options.push({ id: 'pair-aurora', name: 'Aurora Blue', color: '#7FDBFF' });
            options.push({ id: 'pair-pink', name: 'Pink', color: '#FF5C8A' });
        }

        // 7. Black/White backgrounds use ANY color
        if (bgId === 'event-horizon-black' || bgId === 'ice-white') {
            FREE_COLOR_PACK.forEach(c => {
                if (c.id !== 'brand-colors' && c.id !== bgId && c.id !== 'ice-white') {
                    options.push({ id: 'any-' + c.id, name: c.name, color: c.color });
                }
            });
        }

        const unique = [];
        const seen = new Set();
        options.forEach(opt => {
            const low = opt.color.toLowerCase();
            if (!seen.has(low)) {
                seen.add(low);
                unique.push(opt);
            }
        });
        return unique;
    };

    const availableTextColors = useMemo(() => getAvailableTextColors(selectedColor), [selectedColor]);

    useEffect(() => {
        // Fix glitch: Always reset to theme default (first option) when theme changes
        if (availableTextColors.length > 0) {
            setSelectedTextColor(availableTextColors[0].color);
        }
    }, [availableTextColors]);

    const handlePost = async () => {
        if (!title.trim() && !body.trim()) return;
        if (isPosting || loading) return;

        setIsPosting(true);

        const postData = {
            title: title.trim(),
            body: body.trim(),
            postType: 'text',
            type: 'social', // Pings are social
            writerTextColor: selectedTextColor,
            atmosphereBackground: selectedColor.isGradient ? selectedColor.color : 'black',
            tags: isSignal ? ['ping', 'Signal'] : ['ping'],
            isSignal: isSignal,
            showInProfile: true,
            layoutSettings: {
                compact: true
            }
        };

        try {
            // useCreatePost(postData, slides, status)
            // For text posts, slides is empty array
            await createPost(postData, []);
            setTitle('');
            setBody('');
            setIsSignal(false);
            // Small delay to allow Firestore to index the new document before refreshing
            if (onPostSuccess) {
                setTimeout(() => onPostSuccess(), 500);
            }
        } catch (error) {
            console.error('Quick Ping failed:', error);
            alert(error.message || 'Failed to post ping');
        } finally {
            setIsPosting(false);
        }
    };

    const handleExpand = () => {
        // Pass current state to CreatePost
        navigate('/create', {
            state: {
                initialTitle: title,
                initialBody: body,
                initialTheme: selectedColor.id,
                initialTextColor: selectedTextColor,
                initialPostType: 'text',
                isSignal: isSignal
            }
        });
    };

    const getBgStyle = () => {
        if (selectedColor.isGradient) {
            return { background: selectedColor.color };
        }
        return {
            background: fadeColor(selectedColor.color, 0.15),
            border: `1px solid ${fadeColor(selectedColor.color, 0.3)}`
        };
    };

    return (
        <>
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div
                style={{
                    ...getBgStyle(),
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    height: '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        letterSpacing: '0.1em',
                        color: selectedColor.isGradient ? '#fff' : selectedColor.color,
                        fontFamily: "'Orbitron', sans-serif"
                    }}>
                        QUICK PING
                    </span>
                    <button
                        onClick={handleExpand}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.6rem'
                        }}
                    >
                        <FaExpand size={10} /> EXPAND
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${fadeColor(selectedColor.color, 0.2)}`,
                        borderRadius: '6px',
                        padding: '5px 10px',
                        color: selectedTextColor,
                        fontSize: '0.8rem',
                        fontFamily: "'Rajdhani', sans-serif",
                        width: '100%',
                        outline: 'none'
                    }}
                />

                <textarea
                    placeholder="What's on your mind?"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${fadeColor(selectedColor.color, 0.2)}`,
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: selectedTextColor,
                        fontSize: '0.8rem',
                        fontFamily: "'Rajdhani', sans-serif",
                        width: '100%',
                        minHeight: '34px',
                        resize: 'none',
                        outline: 'none',
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${selectedColor.color} transparent`
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div
                        className="no-scrollbar"
                        style={{
                            flex: 1,
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            padding: '2px 0'
                        }}
                    >
                        {FREE_COLOR_PACK.filter(c => c.id !== 'brand-colors' && c.id !== 'transparent').map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedColor(color)}
                                style={{
                                    flex: '0 0 auto',
                                    minWidth: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: selectedColor.id === color.id
                                        ? (color.color.includes('gradient') ? 'rgba(255,255,255,0.1)' : fadeColor(color.color, 0.15))
                                        : 'transparent',
                                    backdropFilter: selectedColor.id === color.id ? 'blur(2px)' : 'none',
                                    border: selectedColor.id === color.id
                                        ? `2px solid ${(color.color.includes('gradient')) ? '#fff' : color.color}`
                                        : '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: selectedColor.id === color.id
                                        ? `0 0 10px ${(color.color.includes('gradient')) ? 'rgba(255,255,255,0.5)' : (color.color === '#000000' ? '#7FFFD4' : color.color)}`
                                        : 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: selectedColor.id === color.id ? '10px' : '100%',
                                    height: selectedColor.id === color.id ? '10px' : '100%',
                                    borderRadius: '50%',
                                    background: color.color,
                                    boxShadow: color.color === '#000000' ? '0 0 4px rgba(127, 255, 212, 0.5)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }} />
                            </button>
                        ))}
                    </div>

                    {/* Text Color Toggle */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '12px' }}>
                        <button
                            onClick={() => setSelectedTextColor('#ffffff')}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                border: selectedTextColor === '#ffffff' ? '2px solid #7FFFD4' : '1px solid #333',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            title="White Text"
                        />
                        <button
                            onClick={() => setSelectedTextColor('#000000')}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#000000',
                                border: selectedTextColor === '#000000' ? '2px solid #7FFFD4' : '1px solid #333',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            title="Black Text"
                        />
                    </div>

                    {/* Signal Toggle */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: isSignal ? '#7FFFD4' : '#666',
                        textTransform: 'uppercase',
                        userSelect: 'none'
                    }}>
                        <input
                            type="checkbox"
                            checked={isSignal}
                            onChange={(e) => setIsSignal(e.target.checked)}
                            style={{ accentColor: '#7FFFD4', transform: 'scale(0.9)' }}
                        />
                        Signal
                    </label>

                    <button
                        onClick={handlePost}
                        disabled={isPosting || loading || (!title.trim() && !body.trim())}
                        style={{
                            background: selectedColor.color,
                            border: 'none',
                            borderRadius: '16px',
                            padding: '4px 12px',
                            color: '#000',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            cursor: (isPosting || loading) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: (!title.trim() && !body.trim()) ? 0.5 : 1
                        }}
                    >
                        {isPosting ? '...' : <><FaRocket size={10} /> POST</>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default QuickPing;
