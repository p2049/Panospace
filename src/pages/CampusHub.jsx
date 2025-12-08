import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InstitutionService } from '@/services/InstitutionService';
import { FaUniversity, FaSearch, FaLock, FaCheckCircle } from 'react-icons/fa';
import SEO from '@/components/SEO';

const CampusHub = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [institution, setInstitution] = useState(null);
    const [emailStatus, setEmailStatus] = useState('checking'); // checking, valid, invalid_domain, no_email

    useEffect(() => {
        const checkInstitution = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            // 1. Check if user is already linked
            if (currentUser.institutionId) {
                const inst = await InstitutionService.getInstitution(currentUser.institutionId);
                setInstitution(inst);
                setLoading(false);
                return;
            }

            // 2. If not linked, check email domain
            if (currentUser.email) {
                const inst = await InstitutionService.findInstitutionByEmail(currentUser.email);
                if (inst) {
                    setInstitution(inst);
                    setEmailStatus('valid');
                    // Auto-join if found? Or ask confirmation? 
                    // Let's ask confirmation in UI.
                } else {
                    setEmailStatus('invalid_domain');
                }
            } else {
                setEmailStatus('no_email');
            }
            setLoading(false);
        };

        checkInstitution();
    }, [currentUser]);

    const handleJoin = async () => {
        if (!institution || !currentUser) return;
        try {
            await InstitutionService.joinInstitution(currentUser.uid, institution.id);
            // Force refresh or update local state
            window.location.reload();
        } catch (err) {
            alert("Failed to join institution.");
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading Campus Hub...</div>;

    // STATE 1: ALREADY JOINED
    if (currentUser?.institutionId && institution) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '4rem' }}>
                <SEO title={`${institution.name} Hub`} />

                {/* Hero Header */}
                <div style={{
                    height: '250px',
                    background: institution.coverImage ? `url(${institution.coverImage}) center/cover` : `linear-gradient(45deg, ${institution.primaryColor || '#003A2D'}, #000)`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2rem'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, #000 0%, transparent 100%)'
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            background: '#fff',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#000', fontSize: '2rem', fontWeight: 'bold'
                        }}>
                            {institution.logoUrl ? <img src={institution.logoUrl} style={{ width: '100%' }} /> : <FaUniversity />}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{institution.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7FFFD4' }}>
                                <FaCheckCircle /> Official Campus Hub
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        border: '1px solid #333'
                    }}>
                        <h2>Welcome to the {institution.name} Network</h2>
                        <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                            Connect with fellow students, share your work, and access exclusive campus events.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                            {['Campus Feed', 'Student Directory', 'Events', 'Marketplace'].map(feature => (
                                <div key={feature} style={{
                                    padding: '1.5rem',
                                    background: '#222',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{feature}</h3>
                                    <span style={{ color: '#7FFFD4', fontSize: '0.8rem' }}>COMING SOON</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 2: NOT JOINED (Discovery)
    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <SEO title="Campus Hub" />
            <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                <FaUniversity size={60} color="#7FFFD4" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Find Your Campus</h1>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                    Join your university's exclusive network on Panospace.
                </p>

                {institution ? (
                    <div style={{
                        background: '#111',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #333',
                        textAlign: 'left'
                    }}>
                        <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>We found a match!</div>
                        <h2 style={{ margin: '0 0 1rem 0' }}>{institution.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ccc' }}>
                            <FaCheckCircle color="#7FFFD4" />
                            <span>Matched via <strong>{currentUser.email}</strong></span>
                        </div>
                        <button
                            onClick={handleJoin}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#7FFFD4',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Join {institution.name}
                        </button>
                    </div>
                ) : (
                    <div style={{
                        background: '#111',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #333'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <FaLock size={24} color="#666" style={{ marginBottom: '0.5rem' }} />
                            <h3>No School Found</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                We couldn't match your email <strong>{currentUser?.email}</strong> to a partner university.
                            </p>
                        </div>
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid #444',
                            color: '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            Browse All Schools
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusHub;
