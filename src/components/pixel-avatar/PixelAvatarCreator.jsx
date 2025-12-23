import React, { useState, useRef, useCallback, useEffect } from 'react';
import PixelAvatarDisplay from './PixelAvatarDisplay';
import { ALL_COLORS } from '@/core/constants/colorPacks';

// --- Constants ---
const GRID_SIZE = 16;
const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;

const COSMIC_PALETTE = [
    ...ALL_COLORS.filter(c =>
        !c.isGradient &&
        !c.color.includes('gradient') &&
        c.color !== 'transparent' &&
        c.id !== 'transparent-border' &&
        c.id !== 'brand-colors' &&
        c.color !== '#000000' &&
        c.color !== 'brand'
    ),
    { id: 'eraser', color: null, name: 'Eraser' }
];

// true = safe, false = cut off
// This mimics a 22-25% border radius on a square profile pic
// (Keeping for future reference/logic if needed, but not blocking paint)
const PIXEL_MASK = [
    false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false,
    false, false, true, true, true, true, true, true, true, true, true, true, true, true, false, false,
    false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
    false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false,
    false, false, true, true, true, true, true, true, true, true, true, true, true, true, false, false,
    false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false,
];

/**
 * PixelAvatarCreator
 * A complete editor for creating 16x16 pixel art avatars with mirror mode and border options.
 * 
 * @param {Array} initialData - Optional initial grid state.
 * @param {Function} onSave - Callback receiving { data: Array, image: string, borderMode: string }.
 * @param {Function} onClose - Optional cancel/close callback.
 */
const PixelAvatarCreator = ({ initialData, initialGlow = false, initialGrid = true, onSave, onClose }) => {
    // --- Refs ---
    const gridRef = useRef(null);

    // --- State ---
    const [gridData, setGridData] = useState(initialData || Array(TOTAL_PIXELS).fill(null));
    const [selectedColor, setSelectedColor] = useState(COSMIC_PALETTE[0].color); // Default to Blue
    const [isEraser, setIsEraser] = useState(false);
    const [mirrorMode, setMirrorMode] = useState(false);
    const [borderMode, setBorderMode] = useState('default'); // 'default', 'clear', 'none'
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [brushSize, setBrushSize] = useState(1); // 1, 2, or 3 for 1x1, 2x2, 3x3
    const [activeTool, setActiveTool] = useState('brush'); // 'brush' or 'bucket'
    const [showGrid, setShowGrid] = useState(initialGrid); // Toggle grid lines visibility
    const [showGlow, setShowGlow] = useState(initialGlow); // Toggle pixel glow effect

    const addToHistory = () => {
        setHistory(prev => [...prev.slice(-30), [...gridData]]); // Save up to 30 steps
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        setGridData(previousState);
        setHistory(prev => prev.slice(0, -1));
    };

    // Track ref to avoid closure staleness during drag events if needed, 
    // though simplified React state is usually fine for this scale.

    // --- Actions ---

    const paintPixel = useCallback((index) => {
        setGridData(prev => {
            const newData = [...prev];
            const colorToApply = isEraser ? null : selectedColor;
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;

            // Get all pixels to paint based on brush size
            const pixelsToPaint = [];
            for (let dr = 0; dr < brushSize; dr++) {
                for (let dc = 0; dc < brushSize; dc++) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow < GRID_SIZE && newCol < GRID_SIZE) {
                        pixelsToPaint.push(newRow * GRID_SIZE + newCol);
                    }
                }
            }

            // Apply color to all pixels
            pixelsToPaint.forEach(idx => {
                newData[idx] = colorToApply;

                // --- Corner Bleed / Auto-Fill Logic ---
                // If we paint a visible pixel, automatically fill any adjacent hidden pixels.
                // This ensures corners are always "full" and solid behind the curve.
                if (PIXEL_MASK[idx]) {
                    const r = Math.floor(idx / GRID_SIZE);
                    const c = idx % GRID_SIZE;
                    // Check 8-way neighbors
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                                const nIdx = nr * GRID_SIZE + nc;
                                if (!PIXEL_MASK[nIdx]) {
                                    newData[nIdx] = colorToApply;
                                }
                            }
                        }
                    }
                }

                // Apply mirroring if enabled
                if (mirrorMode) {
                    const pRow = Math.floor(idx / GRID_SIZE);
                    const pCol = idx % GRID_SIZE;
                    const mirrorCol = (GRID_SIZE - 1) - pCol;
                    const mirrorIndex = pRow * GRID_SIZE + mirrorCol;
                    newData[mirrorIndex] = colorToApply;

                    // Also bleed on mirrored side
                    if (PIXEL_MASK[mirrorIndex]) {
                        const mr = Math.floor(mirrorIndex / GRID_SIZE);
                        const mc = mirrorIndex % GRID_SIZE;
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                const mnr = mr + dr;
                                const mnc = mc + dc;
                                if (mnr >= 0 && mnr < GRID_SIZE && mnc >= 0 && mnc < GRID_SIZE) {
                                    const mnIdx = mnr * GRID_SIZE + mnc;
                                    if (!PIXEL_MASK[mnIdx]) {
                                        newData[mnIdx] = colorToApply;
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return newData;
        });
    }, [isEraser, selectedColor, mirrorMode, brushSize]);

    // Fill all empty pixels with the selected color (Paint Bucket)
    const fillBackground = useCallback(() => {
        if (isEraser) return; // Can't fill with eraser
        addToHistory();
        setGridData(prev => {
            return prev.map(pixel => pixel === null ? selectedColor : pixel);
        });
    }, [selectedColor, isEraser]);

    const getPixelIndexFromEvent = (e) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();

        // Calculate relative position
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate grid coordinates with clamping
        // This allows "tracing" outside to hit the edges
        const col = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((x / rect.width) * GRID_SIZE)));
        const row = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((y / rect.height) * GRID_SIZE)));

        return row * GRID_SIZE + col;
    };

    const handlePointerDown = (e) => {
        const index = getPixelIndexFromEvent(e);
        if (index === null) return;

        if (activeTool === 'bucket') {
            fillBackground();
            return;
        }

        e.currentTarget.setPointerCapture(e.pointerId);
        addToHistory();
        setIsDrawing(true);
        paintPixel(index);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;
        const index = getPixelIndexFromEvent(e);
        if (index !== null) {
            paintPixel(index);
        }
    };

    const handlePointerUp = (e) => {
        setIsDrawing(false);
    };

    // Attach global mouse up to catch drags outside
    useEffect(() => {
        const handleGlobalUp = () => setIsDrawing(false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    const clearCanvas = () => {
        if (confirm('Clear your masterpiece?')) {
            addToHistory();
            setGridData(Array(TOTAL_PIXELS).fill(null));
        }
    };

    const handleSave = () => {
        // Prepare export data
        // For Image export, usually we'd use a hidden canvas, but for JSON payload:
        // We pass the raw array. User logic can convert to PNG on server or client.
        // Base64 generation could happen here if requested, but raw data is more editable.
        // Let's create a minimal JSON object.
        const payload = {
            data: gridData,
            borderMode,
            showGlow, // Pass glow preference
            showGrid, // Pass grid visibility preference
            palette: 'cosmic',
            timestamp: Date.now()
        };

        if (onSave) onSave(payload);
    };

    // --- Styling Helpers ---
    const primaryAccent = selectedColor || '#7FFFD4'; // Fallback for glow

    return (
        <div style={{
            background: '#0B0D17', // Deep space dark
            padding: '24px',
            borderRadius: '24px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '100%',
            width: '400px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
        }} className="pixel-avatar-creator">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.05em' }}>
                    PIXEL LAB
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Undo Button */}
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        title="Undo"
                        style={{
                            background: history.length > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: history.length > 0 ? '#fff' : '#444',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: history.length > 0 ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        ↩
                    </button>
                    {/* Mirror Toggle */}
                    <button
                        onClick={() => setMirrorMode(!mirrorMode)}
                        title="Mirror Mode"
                        style={{
                            background: mirrorMode ? '#7FFFD4' : 'rgba(255,255,255,0.1)',
                            color: mirrorMode ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        <span>⇄</span>
                        {mirrorMode ? 'ON' : 'OFF'}
                    </button>
                    {/* Clear Button */}
                    <button
                        onClick={clearCanvas}
                        title="Clear Canvas"
                        style={{
                            background: 'rgba(255, 50, 50, 0.2)',
                            color: '#FF5C5C',
                            border: '1px solid rgba(255, 50, 50, 0.3)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        CLEAR
                    </button>
                    {/* Glow Toggle */}
                    <button
                        onClick={() => setShowGlow(!showGlow)}
                        title="Toggle Glow"
                        style={{
                            background: showGlow ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: showGlow ? '#7FFFD4' : '#666',
                            border: showGlow ? '1px solid rgba(127, 255, 212, 0.3)' : 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        ✦
                    </button>
                    {/* Grid Toggle */}
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                        style={{
                            background: showGrid ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: showGrid ? '#fff' : '#666',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        ▦
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <div
                    ref={gridRef}
                    className="editor-grid"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gap: showGrid ? '1px' : '0px',
                        width: '280px',
                        height: '280px',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', // Default Glass
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '44px', // Mimics the Profile Avatar's rounded corners (scaled up)
                        cursor: isEraser ? 'cell' : 'crosshair',
                        touchAction: 'none', // Prevent scrolling while drawing on touch
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {gridData.map((color, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: color || (showGrid ? 'rgba(255,255,255,0.05)' : 'transparent'),
                                borderRadius: showGrid ? '2px' : '0px',
                                boxShadow: (showGlow && color) ? `0 0 12px ${color}` : 'none',
                                width: '100%',
                                height: '100%',
                                transition: 'all 0.2s',
                                pointerEvents: 'none' // Pointer events handled by parent for "clamping" logic
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Tools Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Brush Size & Tool Selection */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
                        BRUSHES
                    </label>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {/* 1px Brush */}
                        <button
                            onClick={() => { setActiveTool('brush'); setBrushSize(1); }}
                            title="1x1 Pixel"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: activeTool === 'brush' && brushSize === 1 ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: activeTool === 'brush' && brushSize === 1 ? '2px solid #7FFFD4' : '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '1px' }} />
                        </button>
                        {/* 2x2 Brush */}
                        <button
                            onClick={() => { setActiveTool('brush'); setBrushSize(2); }}
                            title="2x2 Pixels"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: activeTool === 'brush' && brushSize === 2 ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: activeTool === 'brush' && brushSize === 2 ? '2px solid #7FFFD4' : '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                flexWrap: 'wrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px' }}>
                                {[0, 1, 2, 3].map(i => <div key={i} style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '1px' }} />)}
                            </div>
                        </button>
                        {/* 3x3 Brush */}
                        <button
                            onClick={() => { setActiveTool('brush'); setBrushSize(3); }}
                            title="3x3 Pixels"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: activeTool === 'brush' && brushSize === 3 ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: activeTool === 'brush' && brushSize === 3 ? '2px solid #7FFFD4' : '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px' }}>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '1px' }} />)}
                            </div>
                        </button>
                        {/* Paint Bucket */}
                        <button
                            onClick={() => setActiveTool('bucket')}
                            title="Fill Background"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: activeTool === 'bucket' ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: activeTool === 'bucket' ? '2px solid #7FFFD4' : '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            🪣
                        </button>
                    </div>
                </div>

                {/* Palette */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
                        COSMIC PALETTE
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {COSMIC_PALETTE.map((p) => {
                            const isActive = isEraser ? (p.id === 'eraser') : (p.color === selectedColor && p.id !== 'eraser');

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        if (p.id === 'eraser') {
                                            setIsEraser(true);
                                        } else {
                                            setIsEraser(false);
                                            setSelectedColor(p.color);
                                        }
                                    }}
                                    title={p.name}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: p.color || `repeating-linear-gradient(
                                            45deg,
                                            #333,
                                            #333 4px,
                                            #444 4px,
                                            #444 8px
                                        )`, // Eraser pattern
                                        border: isActive ? `2px solid #fff` : '2px solid rgba(255,255,255,0.1)',
                                        boxShadow: isActive ? `0 0 10px ${p.color || '#fff'}60` : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                        flex: '0 0 auto' // Prevent squishing
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Border Options */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
                        BORDER STYLE
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['default', 'clear', 'none'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setBorderMode(mode)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: borderMode === mode ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: borderMode === mode ? `1px solid ${primaryAccent}` : '1px solid rgba(255,255,255,0.1)',
                                    color: borderMode === mode ? '#fff' : '#888',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview & Save */}
                <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <PixelAvatarDisplay
                            data={gridData}
                            size="48px"
                            borderMode={borderMode}
                            primaryColor={selectedColor}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Preview</span>
                    </div>

                    <button
                        onClick={handleSave}
                        style={{
                            background: 'linear-gradient(90deg, #4B69FE, #BC13FE)',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(75, 105, 254, 0.4)'
                        }}
                    >
                        SAVE AVATAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PixelAvatarCreator;
