import React from 'react';
import { FaArrowRight, FaHashtag } from 'react-icons/fa';
import '@/styles/topic-banner.css';

const TopicContextBanner = ({ selectedTags, onOpenTopic }) => {
    // Logic: Show when at least 1 tag is selected
    if (!selectedTags || selectedTags.length < 1) return null;

    // Generate topic title from tags (Canonical formatting)
    // e.g. ["cyberpunk", "neon"] -> "Cyberpunk Neon"
    const topicTitle = selectedTags
        .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))
        .join(' & ');

    return (
        <div className="topic-banner-container">
            <div className="topic-banner">
                <div className="topic-banner-content">
                    <div className="topic-title">
                        <FaHashtag size={14} color="#7FFFD4" />
                        <span>{topicTitle}</span>
                    </div>
                    <div className="topic-tags">
                        <span>Exploring the combination of</span>
                        {selectedTags.slice(0, 3).map(tag => (
                            <span key={tag} className="topic-tag-pill">#{tag}</span>
                        ))}
                        {selectedTags.length > 3 && <span>+{selectedTags.length - 3}</span>}
                    </div>
                </div>

                <button
                    className="topic-action-btn"
                    onClick={() => onOpenTopic(selectedTags)}
                >
                    View Topic Page <FaArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default TopicContextBanner;
