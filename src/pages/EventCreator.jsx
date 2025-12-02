import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEventSystem } from '../hooks/useEventSystem';
import { FaCalendarAlt, FaClock, FaTrophy, FaLock, FaGlobe, FaInfoCircle, FaDollarSign, FaGem, FaHashtag, FaTimes } from 'react-icons/fa';

const EventCreator = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createEvent, generateUniqueTagSet, loading } = useEventSystem();

    // Generate stars once and memoize them
    const stars = useMemo(() => {
        return [...Array(100)].map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            glow: Math.random() * 3 + 2
        }));
    }, []);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('contest'); // Default to contest
    const [isTimedDrop, setIsTimedDrop] = useState(false);
    const [promptText, setPromptText] = useState('');

    // Tags
    const [requiredTags, setRequiredTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isGeneratingTag, setIsGeneratingTag] = useState(false);

    // Monetization
    const [isPayToEnter, setIsPayToEnter] = useState(false);
    const [entryFee, setEntryFee] = useState(5); // Default $5

    // Dates
    const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
    const [expiresAt, setExpiresAt] = useState('');
    const [dropTime, setDropTime] = useState('');

    // Timing controls
    const [autoStart, setAutoStart] = useState(true);
    const [autoEnd, setAutoEnd] = useState(true);
    const [allowSubmissionsBeforeStart, setAllowSubmissionsBeforeStart] = useState(false);
    const [allowSubmissionsAfterEnd, setAllowSubmissionsAfterEnd] = useState(false);

    // Requirements
    const [requirements, setRequirements] = useState({
        location: '',
        camera: '',
        lens: '',
        filmStock: '',
        filmFormat: '',
        campus: '',
        park: '',
        city: ''
    });

    // Optional constraints
    const [aestheticTagsRequired, setAestheticTagsRequired] = useState([]);
    const [aestheticTagInput, setAestheticTagInput] = useState('');
    const [shotDateRequired, setShotDateRequired] = useState(false);
    const [filmRequired, setFilmRequired] = useState(false);
    const [digitalOnly, setDigitalOnly] = useState(false);
    const [campusVerificationRequired, setCampusVerificationRequired] = useState(false);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam) {
            setEventType(typeParam);
        }
    }, [searchParams]);

    // Auto-generate tag from title on blur
    const handleTitleBlur = async () => {
        if (title && requiredTags.length === 0) {
            setIsGeneratingTag(true);
            try {
                const uniqueTags = await generateUniqueTagSet([title]);
                setRequiredTags(uniqueTags);
            } catch (error) {
                console.error("Failed to generate tag", error);
            } finally {
                setIsGeneratingTag(false);
            }
        }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!tagInput.trim()) return;

        setIsGeneratingTag(true);
        try {
            // Check if the new tag set (existing + new) is unique
            const newTagSet = [...requiredTags, tagInput];
            const uniqueTags = await generateUniqueTagSet(newTagSet);
            setRequiredTags(uniqueTags);
            setTagInput('');
        } catch (error) {
            alert("Error checking tag availability");
        } finally {
            setIsGeneratingTag(false);
        }
    };

    const removeTag = (tagToRemove) => {
        setRequiredTags(requiredTags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !startTime) return alert("Title and Start Time are required.");
        if (!expiresAt) return alert("End Time is required.");
        if (isTimedDrop && !dropTime) return alert("Drop Time is required for Timed Drops.");
        if (isPayToEnter && entryFee < 1) return alert("Entry fee must be at least $1.");
        if (requiredTags.length === 0) return alert("At least one unique event tag is required.");

        try {
            const eventData = {
                title,
                description,
                eventType,
                isContest: eventType === 'contest' || eventType === 'photo-month',
                isPhotoOfMonth: eventType === 'photo-month',
                isTimedDrop,
                promptText: eventType === 'prompt' ? promptText : null,

                // Monetization
                isPayToEnter,
                entryFee: isPayToEnter ? parseFloat(entryFee) : 0,
                prizeDistribution: isPayToEnter ? {
                    winner: 80,
                    platform: 20
                } : null,

                startTime,
                expiresAt,
                dropTime: isTimedDrop ? dropTime : null,
                autoStart,
                autoEnd,
                allowSubmissionsBeforeStart,
                allowSubmissionsAfterEnd,
                requirements: Object.fromEntries(
                    Object.entries(requirements).filter(([_, v]) => v && v.trim())
                ),
                requiredTags, // New field
                aestheticTagsRequired: aestheticTagsRequired.length > 0 ? aestheticTagsRequired : null,
                shotDateRequired: shotDateRequired || null,
                filmRequired: filmRequired || null,
                digitalOnly: digitalOnly || null,
                campusVerificationRequired: campusVerificationRequired || null
            };

            const result = await createEvent(eventData, currentUser);
            navigate(`/events/${result.id}`);
        } catch (err) {
            alert("Failed to create event: " + err.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
            {/* Animated Stars Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {stars.map((star) => (
                    <div
                        key={star.id}
                        style={{
                            position: 'absolute',
                            width: star.width + 'px',
                            height: star.height + 'px',
                            background: '#7FFFD4',
                            borderRadius: '50%',
                            top: star.top + '%',
                            left: star.left + '%',
                            opacity: star.opacity,
                            animation: `twinkle ${star.duration}s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`,
                            boxShadow: `0 0 ${star.glow}px #7FFFD4`
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create Event</h1>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Event Type Selector */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTrophy /> Event Type
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <div
                                onClick={() => setEventType('contest')}
                                style={{
                                    padding: '1rem',
                                    background: eventType === 'contest' ? 'rgba(127, 255, 212, 0.1)' : '#111',
                                    border: eventType === 'contest' ? '1px solid #7FFFD4' : '1px solid #333',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: eventType === 'prompt' ? 'rgba(127, 255, 212, 0.1)' : '#111',
                                    border: eventType === 'prompt' ? '1px solid #7FFFD4' : '1px solid #333',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: eventType === 'prompt' ? '#7FFFD4' : '#fff' }}>Photo Prompt</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Creative challenge with optional rules.</div>
                            </div>

                            <div
                                onClick={() => setEventType('timed-drop')}
                                style={{
                                    padding: '1rem',
                                    background: eventType === 'timed-drop' ? 'rgba(127, 255, 212, 0.1)' : '#111',
                                    border: eventType === 'timed-drop' ? '1px solid #7FFFD4' : '1px solid #333',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: eventType === 'timed-drop' ? '#7FFFD4' : '#fff' }}>Timed Drop</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>All submissions reveal at once.</div>
                            </div>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaInfoCircle /> Event Details
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Event Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    placeholder="e.g., Neon Nights Challenge"
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe the theme, rules, or prompt..."
                                    rows={4}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Required Tags */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaHashtag /> Required Tags
                        </h2>
                        <div style={{ marginBottom: '1rem', color: '#888', fontSize: '0.9rem' }}>
                            Posts must have ALL these tags to enter. Events can share individual tags, but the complete tag combination must be unique.
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateRows: 'repeat(2, min-content)',
                            gridAutoFlow: 'column',
                            gridAutoColumns: 'max-content',
                            gap: '0.5rem',
                            rowGap: '0.8rem',
                            width: '100%',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            paddingBottom: '0.5rem',
                            marginBottom: '1rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(127, 255, 212, 0.3) rgba(255, 255, 255, 0.02)'
                        }}>
                            {requiredTags.map(tag => (
                                <div key={tag} style={{
                                    background: 'rgba(127, 255, 212, 0.1)',
                                    border: '1px solid #7FFFD4',
                                    color: '#7FFFD4',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    #{tag}
                                    <FaTimes
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => removeTag(tag)}
                                    />
                                </div>
                            ))}
                            {isGeneratingTag && <div style={{ color: '#888', padding: '0.4rem', whiteSpace: 'nowrap' }}>Checking availability...</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                placeholder="Add custom tag..."
                                style={{ flex: 1, padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={handleAddTag}
                                disabled={!tagInput.trim() || isGeneratingTag}
                                style={{
                                    padding: '0 1.5rem',
                                    background: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </section>

                    {/* Monetization (Contests Only) */}
                    {(eventType === 'contest' || eventType === 'photo-month') && (
                        <section style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #FFD700'
                        }}>
                            <h2 style={{ fontSize: '1.1rem', color: '#FFD700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaGem /> Monetization
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.2rem' }}>Pay-to-Enter Contest</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Participants pay an entry fee to join.</div>
                                </div>
                                <div
                                    onClick={() => setIsPayToEnter(!isPayToEnter)}
                                    style={{
                                        width: '50px', height: '26px',
                                        background: isPayToEnter ? '#FFD700' : '#333',
                                        borderRadius: '13px', position: 'relative', cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '22px', height: '22px', background: '#fff', borderRadius: '50%',
                                        position: 'absolute', top: '2px',
                                        left: isPayToEnter ? '26px' : '2px', transition: 'left 0.2s'
                                    }} />
                                </div>
                            </div>

                            {isPayToEnter && (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Entry Fee ($)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FaDollarSign style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                            <input
                                                type="number"
                                                min="1"
                                                value={entryFee}
                                                onChange={e => setEntryFee(e.target.value)}
                                                style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#000', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 215, 0, 0.1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                        fontSize: '0.9rem',
                                        color: '#FFD700'
                                    }}>
                                        <strong>Prize Pool Split:</strong> 80% to Winner / 20% to Platform
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Prompt Text (for prompt events) */}
                    {eventType === 'prompt' && (
                        <section>
                            <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem' }}>Prompt Text</h2>
                            <textarea
                                value={promptText}
                                onChange={e => setPromptText(e.target.value)}
                                placeholder="e.g., Shoot something red, Self-portrait, Reflections..."
                                rows={3}
                                style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </section>
                    )}

                    {/* Timed Drop Toggle */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaClock /> Timed Drop
                        </h2>
                        <div
                            onClick={() => setIsTimedDrop(!isTimedDrop)}
                            style={{
                                padding: '1rem',
                                background: isTimedDrop ? 'rgba(127, 255, 212, 0.1)' : '#111',
                                border: isTimedDrop ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>Enable Timed Drop</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                    Submissions are hidden until the drop time.
                                </div>
                            </div>
                            <div style={{
                                width: '40px', height: '20px',
                                background: isTimedDrop ? '#7FFFD4' : '#333',
                                borderRadius: '10px', position: 'relative'
                            }}>
                                <div style={{
                                    width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                                    position: 'absolute', top: '2px',
                                    left: isTimedDrop ? '22px' : '2px', transition: 'left 0.2s'
                                }} />
                            </div>
                        </div>
                    </section>

                    {/* Requirements (Optional) */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaLock /> Submission Requirements (Optional)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Park</label>
                                <input
                                    type="text"
                                    value={requirements.park}
                                    onChange={e => setRequirements({ ...requirements, park: e.target.value })}
                                    placeholder="e.g., Yosemite"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City</label>
                                <input
                                    type="text"
                                    value={requirements.city}
                                    onChange={e => setRequirements({ ...requirements, city: e.target.value })}
                                    placeholder="e.g., Chicago"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Film Stock</label>
                                <input
                                    type="text"
                                    value={requirements.filmStock}
                                    onChange={e => setRequirements({ ...requirements, filmStock: e.target.value })}
                                    placeholder="e.g., Portra 400"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Film Format</label>
                                <input
                                    type="text"
                                    value={requirements.filmFormat}
                                    onChange={e => setRequirements({ ...requirements, filmFormat: e.target.value })}
                                    placeholder="e.g., 35mm"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Camera</label>
                                <input
                                    type="text"
                                    value={requirements.camera}
                                    onChange={e => setRequirements({ ...requirements, camera: e.target.value })}
                                    placeholder="e.g., Canon AE-1"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Lens</label>
                                <input
                                    type="text"
                                    value={requirements.lens}
                                    onChange={e => setRequirements({ ...requirements, lens: e.target.value })}
                                    placeholder="e.g., 50mm f/1.8"
                                    style={{ width: '100%', padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Constraints (Optional) */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem' }}>Additional Constraints</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#111', borderRadius: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={filmRequired}
                                    onChange={e => setFilmRequired(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ color: '#fff' }}>Film Photography Required</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#111', borderRadius: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={digitalOnly}
                                    onChange={e => setDigitalOnly(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ color: '#fff' }}>Digital Only</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#111', borderRadius: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={shotDateRequired}
                                    onChange={e => setShotDateRequired(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ color: '#fff' }}>Shot Date Required</span>
                            </label>
                        </div>
                    </section>

                    {/* Schedule */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', color: '#7FFFD4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt /> Schedule
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                            {isTimedDrop && (
                                <div>
                                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Drop Reveal Time</label>
                                    <input
                                        type="datetime-local"
                                        value={dropTime}
                                        onChange={e => setDropTime(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    />
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>End Time (Expiration)</label>
                                <input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={e => setExpiresAt(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#7FFFD4',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </form>
            </div>

            {/* Twinkle Animation CSS */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default EventCreator;
