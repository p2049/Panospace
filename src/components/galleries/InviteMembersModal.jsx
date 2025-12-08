import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inviteMembers } from '@/core/services/firestore/studios.service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaTimes, FaSearch, FaUserPlus } from 'react-icons/fa';
import './InviteMembersModal.css';

const InviteMembersModal = ({ galleryId, onClose, existingMembers = [], pendingInvites = [] }) => {
    const { currentUser } = useAuth();
    const [followings, setFollowings] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadFollowings();
    }, [currentUser]);

    const loadFollowings = async () => {
        try {
            setLoading(true);
            // Get users that current user follows
            const followsQuery = query(
                collection(db, 'follows'),
                where('followerId', '==', currentUser.uid)
            );
            const followsSnapshot = await getDocs(followsQuery);

            // Get user details for each following
            const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);

            if (followingIds.length === 0) {
                setFollowings([]);
                setLoading(false);
                return;
            }

            // Fetch user details in batches of 10
            const batchSize = 10;
            const userPromises = [];

            for (let i = 0; i < followingIds.length; i += batchSize) {
                const batch = followingIds.slice(i, i + batchSize);
                const usersQuery = query(
                    collection(db, 'users'),
                    where('__name__', 'in', batch)
                );
                userPromises.push(getDocs(usersQuery));
            }

            const userSnapshots = await Promise.all(userPromises);
            const users = [];

            userSnapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    const userData = { id: doc.id, ...doc.data() };
                    // Filter out users already in gallery or with pending invites
                    if (!existingMembers.includes(doc.id) && !pendingInvites.includes(doc.id)) {
                        users.push(userData);
                    }
                });
            });

            setFollowings(users);
        } catch (error) {
            console.error('Error loading followings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        const filtered = getFilteredFollowings();
        if (selectedUsers.length === filtered.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filtered.map(u => u.id));
        }
    };

    const handleSendInvites = async () => {
        if (selectedUsers.length === 0) return;

        try {
            setSending(true);
            await inviteMembers(galleryId, selectedUsers, currentUser.uid);
            onClose(true); // Pass true to indicate invites were sent
        } catch (error) {
            console.error('Error sending invites:', error);
            alert('Failed to send invites. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const getFilteredFollowings = () => {
        if (!searchQuery.trim()) return followings;

        const query = searchQuery.toLowerCase();
        return followings.filter(user =>
            user.username?.toLowerCase().includes(query) ||
            user.displayName?.toLowerCase().includes(query)
        );
    };

    const filteredFollowings = getFilteredFollowings();

    return (
        <div className="invite-modal-overlay" onClick={onClose}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <div className="invite-modal-header">
                    <h2><FaUserPlus /> Invite Members</h2>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="invite-modal-body">
                    {/* Search Bar */}
                    <div className="search-bar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search your followings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Select All */}
                    {filteredFollowings.length > 0 && (
                        <div className="select-all">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredFollowings.length && filteredFollowings.length > 0}
                                    onChange={handleSelectAll}
                                />
                                <span>Select All ({filteredFollowings.length})</span>
                            </label>
                        </div>
                    )}

                    {/* User List */}
                    <div className="users-list">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading your followings...</p>
                            </div>
                        ) : filteredFollowings.length === 0 ? (
                            <div className="empty-state">
                                {followings.length === 0 ? (
                                    <>
                                        <p>You're not following anyone yet</p>
                                        <span>Follow users to invite them to galleries</span>
                                    </>
                                ) : (
                                    <>
                                        <p>No users found</p>
                                        <span>Try a different search term</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            filteredFollowings.map(user => (
                                <label key={user.id} className="user-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleToggleUser(user.id)}
                                    />
                                    <img
                                        src={user.photoURL || '/default-avatar.png'}
                                        alt={user.username}
                                        className="user-avatar"
                                    />
                                    <div className="user-info">
                                        <strong>{user.displayName || user.username}</strong>
                                        <span>@{user.username}</span>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="invite-modal-footer">
                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                    <button
                        onClick={handleSendInvites}
                        disabled={selectedUsers.length === 0 || sending}
                        className="send-btn"
                    >
                        {sending ? 'Sending...' : `Send Invites (${selectedUsers.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMembersModal;
