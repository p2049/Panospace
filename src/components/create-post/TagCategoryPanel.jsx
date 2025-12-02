import React from 'react';
import TagFilterPanel from '../TagFilterPanel';
import { TAG_CATEGORIES } from '../../constants/tagCategories';

/**
 * TagCategoryPanel Component
 * 
 * Displays the tag selection interface with:
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
    return (
        <div className="form-section" style={{ marginTop: '1.5rem' }}>
            <h3>Tags & Categories</h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
                Select tags to help people find your work.
            </p>

            <div className="tags-container">
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
