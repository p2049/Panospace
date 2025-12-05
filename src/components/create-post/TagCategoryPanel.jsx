import React, { useState } from 'react';
import { FaPlus, FaTimes, FaHashtag } from 'react-icons/fa';
import TagFilterPanel from '../TagFilterPanel';
import { TAG_CATEGORIES, ALL_TAGS } from '../../constants/tagCategories';

/**
 * TagCategoryPanel Component
 * 
 * Displays the tag selection interface with:
 * - Custom tag input
 * - Section header and description
 * - Multiple tag category panels
 * - Expandable/collapsible categories
 * 
 * @param {Array} tags - Array of selected tag strings
 * @param {Function} handleTagToggle - Handler to toggle tag selection
 * @param {Object} expandedCategories - Object mapping category IDs to expanded state
 * @param {Function} toggleCategory - Handler to toggle category expansion
 */
const TagCategoryPanel = ({
    tags,
    handleTagToggle,
    expandedCategories,
    toggleCategory
}) => {
    const [customTagInput, setCustomTagInput] = useState('');

    // Filter tags to find ones that are NOT in the standard list
    // We use a Set for faster lookups
    const standardTagsSet = new Set(ALL_TAGS);
    const customTags = tags.filter(tag => !standardTagsSet.has(tag));

    const handleAddCustomTag = (e) => {
        e.preventDefault();
        if (!customTagInput.trim()) return;

        // Normalize: lowercase, trim, replace spaces with dashes
        const normalizedTag = customTagInput
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-');

        if (normalizedTag) {
            handleTagToggle(normalizedTag);
            setCustomTagInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomTag(e);
        }
    };

    return (
        <div className="form-section" style={{ marginTop: '2rem' }}>
            <h3>Tags & Categories</h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
                Select tags or add your own to help people find your work.
            </p>

            {/* Custom Tag Input */}
            <div className="custom-tag-input-container" style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    transition: 'all 0.2s ease'
                }}>
                    <FaHashtag color="rgba(255, 255, 255, 0.3)" size={14} style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add custom tag..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.9rem',
                            width: '100%',
                            outline: 'none',
                            fontFamily: 'var(--font-family-mono)'
                        }}
                    />
                    <button
                        onClick={handleAddCustomTag}
                        disabled={!customTagInput.trim()}
                        style={{
                            background: customTagInput.trim() ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.1)',
                            color: customTagInput.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: customTagInput.trim() ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                            marginLeft: '0.5rem'
                        }}
                    >
                        <FaPlus size={10} />
                    </button>
                </div>

                {/* Display Custom Tags */}
                {customTags.length > 0 && (
                    <div className="custom-tags-list" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.8rem'
                    }}>
                        {customTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                style={{
                                    background: 'rgba(127, 255, 212, 0.15)',
                                    border: '1px solid var(--ice-mint)',
                                    color: 'var(--ice-mint)',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'var(--font-family-mono)',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    boxShadow: '0 0 10px rgba(127, 255, 212, 0.1)'
                                }}
                            >
                                {tag}
                                <FaTimes size={10} style={{ opacity: 0.7 }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="tags-container" style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}>

                {Object.values(TAG_CATEGORIES).map(category => (
                    <TagFilterPanel
                        key={category.id}
                        category={category}
                        selectedTags={tags}
                        onTagToggle={handleTagToggle}
                        isExpanded={expandedCategories[category.id]}
                        onToggleExpand={() => toggleCategory(category.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TagCategoryPanel;
