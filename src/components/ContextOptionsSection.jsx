import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight, FaPen, FaTrash, FaFlag, FaBan, FaLink, FaShareAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const ContextOptionsSection = ({
    currentContext,
    postOwnerId,
    profileUserId,
    onEditPost,
    onDeletePost,
    onReportPost,
    onReportProfile,
    onBlockUser,
    onCopyLink,
    onShareProfile
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { currentUser } = useAuth();

    if (!currentContext) return null;

    const isPost = currentContext === 'post';
    const isProfile = currentContext === 'profile';

    // Determine target user ID for blocking
    const targetUserId = isPost ? postOwnerId : profileUserId;
    const isOwner = currentUser?.uid === targetUserId;

    const title = isPost ? 'Post Options' : 'Profile Options';

    // Animation variants
    const contentVariants = {
        hidden: {
            height: 0,
            opacity: 0,
            y: -6,
            transition: {
                height: { duration: 0.2, ease: "easeInOut" },
                opacity: { duration: 0.15 },
                y: { duration: 0.15 }
            }
        },
        visible: {
            height: 'auto',
            opacity: 1,
            y: 0,
            transition: {
                height: { duration: 0.25, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.05 },
                y: { duration: 0.2, delay: 0.05 }
            }
        }
    };

    return (
        <div style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem 1.5rem',
                    paddingTop: '1.6rem', // Extra vertical padding
                    cursor: 'pointer',
                    background: 'transparent',
                    color: '#fff',
                    fontFamily: 'var(--font-family-heading, sans-serif)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#7FFFD4' }}>{title}</span>
                </div>
                <FaChevronRight
                    size={12}
                    style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.18s ease',
                        color: '#666'
                    }}
                />
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}
                    >
                        <div style={{ padding: '0.5rem 0' }}>
                            {/* Post Actions */}
                            {isPost && (
                                <>
                                    {isOwner && (
                                        <>
                                            <OptionItem label="Edit Post" icon={FaPen} onClick={onEditPost} />
                                            <OptionItem label="Delete Post" icon={FaTrash} onClick={onDeletePost} danger />
                                        </>
                                    )}
                                    {!isOwner && (
                                        <>
                                            <OptionItem label="Report Post" icon={FaFlag} onClick={onReportPost} />
                                            <OptionItem label="Block User" icon={FaBan} onClick={onBlockUser} danger />
                                        </>
                                    )}
                                    <OptionItem label="Copy Link" icon={FaLink} onClick={onCopyLink} />
                                </>
                            )}

                            {/* Profile Actions */}
                            {isProfile && (
                                <>
                                    {!isOwner ? (
                                        <>
                                            <OptionItem label="Report Profile" icon={FaFlag} onClick={onReportProfile} />
                                            <OptionItem label="Block User" icon={FaBan} onClick={onBlockUser} danger />
                                            <OptionItem label="Share Profile" icon={FaShareAlt} onClick={onShareProfile} />
                                        </>
                                    ) : (
                                        <OptionItem label="Share Profile" icon={FaShareAlt} onClick={onShareProfile} />
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Sub-component
const OptionItem = ({ label, icon: Icon, onClick, danger }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            // Indent 16px relative to header (1.5rem + 16px ~= 2.5rem)
            padding: '0.8rem 1.5rem 0.8rem 2.5rem',
            minHeight: '42px',
            cursor: 'pointer',
            color: danger ? '#ff4444' : '#ccc',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            background: 'transparent'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <Icon size={14} style={{ opacity: 0.8 }} />
        <span>{label}</span>
    </div>
);

export default ContextOptionsSection;
