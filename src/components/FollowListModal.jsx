import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { RocketIcon, AstronautIcon } from './SpaceIcons';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const FollowListModal = ({ isOpen, onClose, userId, type = 'followers', title }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // 1. Get the relationships
            const relationsRef = collection(db, 'follows');
            let q;

            if (type === 'followers') {
                q = query(relationsRef, where('followingId', '==', userId), limit(50));
            } else { // following
                q = query(relationsRef, where('followerId', '==', userId), limit(50));
            }

            const snapshot = await getDocs(q);
            const relationDocs = snapshot.docs.map(d => d.data());

            // 2. Get the User IDs to fetch
            const userIds = type === 'followers'
                ? relationDocs.map(r => r.followerId)
                : relationDocs.map(r => r.followingId);

            if (userIds.length === 0) {
                setUsers([]);
                setLoading(false);
                return;
            }

            // 3. Fetch User Profiles (Batched if needed, here taking simple approach for < 30)
            // Ideally use 'in' query, but sensitive to limit of 30.
            // Loop for now or use 'in' batches. 
            // We'll fetching one by one for simplicity in this artifact, or check if we can do 'in'

            const fetchedUsers = [];
            // Chunking for Firestore 'in' limit of 10-30
            const chunkSize = 10;
            for (let i = 0; i < userIds.length; i += chunkSize) {
                const chunk = userIds.slice(i, i + chunkSize);
                if (chunk.length === 0) continue;

                const usersQ = query(collection(db, 'users'), where('__name__', 'in', chunk));
                const userSnaps = await getDocs(usersQ);
                userSnaps.forEach(snap => fetchedUsers.push({ id: snap.id, ...snap.data() }));
            }

            setUsers(fetchedUsers);

        } catch (error) {
            console.error("Error fetching follow list:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                height: '600px',
                maxHeight: '90vh',
                background: '#111',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {title ? title : (
                            <>
                                {type === 'followers' ? <AstronautIcon size={20} /> : <RocketIcon size={20} />}
                                {type === 'followers' ? 'Followers' : 'Following'}
                            </>
                        )}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>Loading...</div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                            No users found.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {users.map(u => {
                                // Theme Logic for List Item
                                const usernameColor = (u.profileTheme?.usernameColor && !u.profileTheme.usernameColor.includes('gradient'))
                                    ? u.profileTheme.usernameColor
                                    : '#FFFFFF';
                                const isGradient = u.profileTheme?.usernameColor?.includes('gradient');
                                const borderColor = u.profileTheme?.borderColor || '#333';

                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => { onClose(); navigate(`/profile/${u.id}`); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                    >
                                        {/* PFP */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px', // Rounded Square
                                            border: `2px solid ${borderColor}`,
                                            background: '#333',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                            {u.photoURL ? (
                                                <img src={u.photoURL} alt={u.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#888' }}>
                                                    {u.displayName?.[0]}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: !isGradient ? usernameColor : 'transparent',
                                                background: isGradient ? u.profileTheme.usernameColor : 'none',
                                                WebkitBackgroundClip: isGradient ? 'text' : 'border-box',
                                                WebkitTextFillColor: isGradient ? 'transparent' : (usernameColor),
                                                fontFamily: 'var(--font-family-heading)'
                                            }}>
                                                {u.displayName}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                @{u.username}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;
