import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FaStore, FaCheckCircle, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';

const SellerVerificationPage = () => {
    const { currentUser, userProfile } = useAuth(); // Assuming useAuth exposes userProfile
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [guardianEmail, setGuardianEmail] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState(null);

    // Calculate Age
    const getAge = (birthDateString) => {
        if (!birthDateString) return 0;
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = getAge(userProfile?.birthDate);
    // Fallback if birthDate is missing (should be there from signup, but legacy users might miss it)
    const isLegacyUser = !userProfile?.birthDate;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const userRef = doc(db, 'users', currentUser.uid);

            const updates = {
                sellerAppliedAt: serverTimestamp(),
                sellerStatus: 'verified', // AUTO-VERIFY FOR DEMO PURPOSES
                // sellerStatus: 'pending', // Real world
            };

            if (age < 18 && age >= 14) {
                if (!guardianEmail) throw new Error("Guardian email is required.");
                updates.guardianEmail = guardianEmail;
                updates.guardianRequired = true;
                // Minors might stay pending until guardian approves
                updates.sellerStatus = 'pending';
            } else if (age < 14) {
                throw new Error("You must be 14 or older to sell.");
            }

            await updateDoc(userRef, updates);

            // Navigate back to profile/shop
            navigate(`/profile/${currentUser.uid}?tab=shop`);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile) return <div style={{ color: '#fff', padding: '2rem' }}>Loading profile...</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: '#111',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #333'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaStore size={48} color="#7FFFD4" />
                    <h1 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>Seller Verification</h1>
                    <p style={{ color: '#888' }}>Join the Panospace Marketplace</p>
                </div>

                {isLegacyUser && (
                    <div style={{ background: '#332b00', color: '#ffcc00', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <FaExclamationTriangle />
                        <div>
                            <strong>Age Verification Needed</strong>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Please update your profile with your Date of Birth before applying.</p>
                        </div>
                    </div>
                )}

                {!isLegacyUser && age < 14 && (
                    <div style={{ background: '#330000', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <strong>Not Eligible</strong>
                        <p>You must be at least 14 years old to sell on Panospace.</p>
                    </div>
                )}

                {/* STEPS */}
                {(!isLegacyUser && age >= 14) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* 1. Age Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px' }}>
                            <FaUserShield size={24} color={age >= 18 ? '#7FFFD4' : '#ffcc00'} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{age >= 18 ? 'Identity Verified' : 'Guardian Consent Required'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                    {age >= 18 ? 'You are 18+. No guardian consent needed.' : `You are ${age}. A parent/guardian must approve your shop.`}
                                </div>
                            </div>
                        </div>

                        {/* 2. Guardian Email (If Minor) */}
                        {age < 18 && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Guardian Email</label>
                                <input
                                    type="email"
                                    value={guardianEmail}
                                    onChange={(e) => setGuardianEmail(e.target.value)}
                                    placeholder="parent@example.com"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#000', border: '1px solid #333', color: '#fff' }}
                                />
                            </div>
                        )}

                        {/* 3. Terms */}
                        <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ marginTop: '0.25rem' }}
                            />
                            <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                I agree to the <span style={{ color: '#7FFFD4', textDecoration: 'underline' }}>Seller Terms of Service</span>.
                                I confirm that I own all rights to the artwork I upload and sell.
                            </div>
                        </label>

                        {error && <div style={{ color: '#ff4444', textAlign: 'center' }}>{error}</div>}

                        <button
                            onClick={handleSubmit}
                            disabled={!agreedToTerms || loading || (age < 18 && !guardianEmail)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: agreedToTerms ? '#7FFFD4' : '#333',
                                color: agreedToTerms ? '#000' : '#888',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                                marginTop: '1rem'
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: '#888', width: '100%', marginTop: '1rem', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SellerVerificationPage;
