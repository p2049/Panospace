import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaGlobe, FaUsers, FaCompass, FaMapMarkerAlt, FaPalette, FaTimes, FaPlus } from 'react-icons/fa';
import { useCustomFeeds } from '@/hooks/useCustomFeeds';
import TagCategoryPanel from '@/components/create-post/TagCategoryPanel';

const CustomFeedCreator = () => {
    const navigate = useNavigate();
    const { createFeed } = useCustomFeeds();
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [tags, setTags] = useState([]);
    const [locations, setLocations] = useState([]);
    const [locationInput, setLocationInput] = useState('');
    const [orientation, setOrientation] = useState('any'); // any, portrait, landscape
    const [humorSetting, setHumorSetting] = useState('any'); // any, hide, only
    const [includeGlobal, setIncludeGlobal] = useState(true);
    const [includeFollowing, setIncludeFollowing] = useState(true);


    // Tag Panel State
    const [expandedCategories, setExpandedCategories] = useState({
        mood: false,
        style: false,
        subject: false,
        technical: false
    });

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleTagToggle = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    const handleAddLocation = (e) => {
        e.preventDefault();
        if (locationInput.trim()) {
            setLocations([...locations, locationInput.trim()]);
            setLocationInput('');
        }
    };

    const removeLocation = (loc) => {
        setLocations(locations.filter(l => l !== loc));
    };



    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please enter a feed name");
            return;
        }

        setSaving(true);
        try {
            await createFeed({
                name: name.trim(),
                tags,
                locations,
                orientation,
                humorSetting,
                includeGlobal,
                includeFollowing
            });
            navigate('/custom-feeds');
        } catch (error) {
            console.error("Failed to save feed", error);
            alert("Failed to save feed. Please try again.");
            setSaving(false);
        }
    };

    // Simple color palette for selection


    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-darker, #020404)',
            color: 'var(--text-primary, #d8fff1)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(110, 255, 216, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent, #6effd8)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--accent, #6effd8)',
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>New Custom Feed</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        marginLeft: 'auto',
                        background: 'var(--accent, #6effd8)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: saving ? 'wait' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>

                {/* Name Input */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>FEED NAME</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Minimalist Architecture"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid rgba(110, 255, 216, 0.3)',
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            padding: '0.5rem 0',
                            outline: 'none',
                            fontFamily: 'var(--font-family-heading)'
                        }}
                    />
                </div>

                {/* Sources Section */}
                <div style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}>Sources</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <ToggleOption
                            label="Include Global Feed"
                            active={includeGlobal}
                            onClick={() => setIncludeGlobal(!includeGlobal)}
                            icon={FaGlobe}
                        />
                        <ToggleOption
                            label="Include Following"
                            active={includeFollowing}
                            onClick={() => setIncludeFollowing(!includeFollowing)}
                            icon={FaUsers}
                        />
                    </div>
                    {!includeGlobal && !includeFollowing && (
                        <p style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            You must select at least one source (Global or Following)
                        </p>
                    )}
                </div>

                {/* Orientation */}
                <div style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}>Orientation</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#000', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {['any', 'portrait', 'landscape'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setOrientation(opt)}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    background: orientation === opt ? 'var(--dark-grey)' : 'transparent',
                                    color: orientation === opt ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    textTransform: 'capitalize',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Filters (Humor) */}
                <div style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}>Content Types</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#000', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setHumorSetting('any')}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                background: humorSetting === 'any' ? 'rgba(110, 255, 216, 0.15)' : 'transparent',
                                color: humorSetting === 'any' ? '#7FFFD4' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Mixed
                        </button>
                        <button
                            onClick={() => setHumorSetting('hide')}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                background: humorSetting === 'hide' ? 'rgba(255, 92, 138, 0.15)' : 'transparent',
                                color: humorSetting === 'hide' ? '#FF5C8A' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            No Humor
                        </button>
                        <button
                            onClick={() => setHumorSetting('only')}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                background: humorSetting === 'only' ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                color: humorSetting === 'only' ? '#7FFFD4' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Humor Only
                        </button>
                    </div>
                </div>



                {/* Locations */}
                <div style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}>Locations</h3>
                    <form onSubmit={handleAddLocation} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0 0.75rem'
                        }}>
                            <FaMapMarkerAlt color="var(--text-secondary)" />
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                placeholder="Add location (e.g. New York, Japan)"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0.8rem',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button type="submit" disabled={!locationInput.trim()} style={{
                            background: 'var(--dark-grey)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            width: '40px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaPlus />
                        </button>
                    </form>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {locations.map(loc => (
                            <span key={loc} style={{
                                background: 'rgba(110, 255, 216, 0.1)',
                                border: '1px solid rgba(110, 255, 216, 0.2)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.85rem',
                                color: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {loc}
                                <button onClick={() => removeLocation(loc)} style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', display: 'flex' }}>
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tags (Reusing Component) */}
                <div style={sectionStyle}>
                    <TagCategoryPanel
                        tags={tags}
                        handleTagToggle={handleTagToggle}
                        expandedCategories={expandedCategories}
                        toggleCategory={toggleCategory}
                    />
                </div>

            </div>
        </div>
    );
};

// UI Helpers
const ToggleOption = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        style={{
            flex: '1 1 150px',
            background: active ? 'rgba(110, 255, 216, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: active ? '1px solid var(--accent, #6effd8)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: active ? 'var(--accent)' : 'var(--text-secondary)'
        }}
    >
        <Icon size={20} />
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</span>
        {active && <FaCheck style={{ marginLeft: 'auto' }} />}
    </button>
);

const sectionStyle = {
    marginBottom: '2rem',
    background: 'var(--bg-card, #050808)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const sectionHeaderStyle = {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    marginTop: 0,
    letterSpacing: '0.05em'
};

export default CustomFeedCreator;
