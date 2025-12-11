import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FaStore, FaLock, FaCheck, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
import { countries } from 'countries-list';
import PanoDateInput from '@/components/common/PanoDateInput';

const countryOptions = Object.entries(countries).map(([code, data]) => ({
    code,
    name: data.name
})).sort((a, b) => a.name.localeCompare(b.name));

// Helper for Age Calculation (Sync with backend logic)
const getAgeFromDob = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const ShopSetupPage = () => {
    const { currentUser, userProfile } = useAuth(); // Assuming useAuth gives us the Firestore profile doc as userProfile
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Auth / Verification
        dateOfBirth: '', // YYYY-MM-DD

        // Business Info
        shopLegalName: '',
        shopCountry: 'US',
        shopAddressLine1: '',
        shopAddressLine2: '',
        shopCity: '',
        shopRegion: '',
        shopPostalCode: '',
        shopPayoutProvider: 'stripe', // Default

        // Checkboxes
        confirmAge: false,
        confirmOwner: false,
        confirmNoAI: false,
        confirmRights: false,
        confirmTerms: false
    });

    // Populate from existing profile if available
    useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                dateOfBirth: userProfile.dateOfBirth || '',
                shopLegalName: userProfile.shopLegalName || userProfile.displayName || '',
                shopCountry: userProfile.shopCountry || 'US',
                shopCity: userProfile.shopCity || '',
                shopRegion: userProfile.shopRegion || '',
                shopPostalCode: userProfile.shopPostalCode || '',
                shopAddressLine1: userProfile.shopAddressLine1 || '',
                // If they are already verified, we might show a read-only view or "Edit" view
                // For now, we assume this page is for setup.
            }));
        }
    }, [userProfile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    // 1. Age Check
    const age = getAgeFromDob(formData.dateOfBirth);
    const isUnderage = age !== null && age < 18;
    const isDobMissing = !formData.dateOfBirth;

    // 2. Checkboxes Check
    const allCheckboxesChecked =
        formData.confirmAge &&
        formData.confirmOwner &&
        formData.confirmNoAI &&
        formData.confirmRights &&
        formData.confirmTerms;

    // 3. Required Fields Check
    const requiredFieldsFilled =
        formData.shopLegalName &&
        formData.shopCountry &&
        formData.shopAddressLine1 &&
        formData.shopCity &&
        formData.shopPostalCode;

    // -------------------------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------------------------

    const handleFinishSetup = async () => {
        setVerifying(true);
        try {
            const verifyFn = httpsCallable(functions, 'verifyUserShop');
            const result = await verifyFn({
                dateOfBirth: formData.dateOfBirth,
                shopLegalName: formData.shopLegalName,
                shopCountry: formData.shopCountry,
                shopAddressLine1: formData.shopAddressLine1,
                shopAddressLine2: formData.shopAddressLine2,
                shopCity: formData.shopCity,
                shopRegion: formData.shopRegion,
                shopPostalCode: formData.shopPostalCode,
                shopPayoutProvider: formData.shopPayoutProvider,
                rulesAccepted: true
            });

            if (result.data.success) {
                // Success! Redirect or refresh
                alert("Shop verified successfully! You can now publish items.");
                navigate('/profile/me'); // Or to the shop dashboard
            }
        } catch (error) {
            console.error("Setup failed:", error);
            alert("Shop verification failed: " + error.message);
        } finally {
            setVerifying(false);
        }
    };

    // -------------------------------------------------------------------------
    // RENDER: BLOCKED STATES
    // -------------------------------------------------------------------------

    if (isDobMissing) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <FaStore size={48} style={{ color: '#888', marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Set Up Your Shop</h2>
                <p style={{ color: '#ccc', maxWidth: '400px', marginBottom: '2rem' }}>
                    To ensure trust and safety on PanoSpace, we need to verify your date of birth before you can start selling.
                </p>
                <div style={{ padding: '1.5rem', background: '#111', borderRadius: '12px', border: '1px solid #333', textAlign: 'left', width: '100%', maxWidth: '400px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>Date of Birth</label>
                    <PanoDateInput
                        selected={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T12:00:00') : null} // Add time to prevent timezone shift issues on pure dates
                        onChange={(date) => {
                            const dateString = date ? date.toISOString().split('T')[0] : '';
                            setFormData(prev => ({ ...prev, dateOfBirth: dateString }));
                        }}
                        placeholder="Select Date of Birth"
                        className="shop-setup-date-input"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        You must be at least 18 years old. This will not be shown publicly on your profile.
                    </p>
                </div>
            </div>
        );
    }

    if (isUnderage) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <FaLock size={48} style={{ color: '#ff4444', marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Age Requirement</h2>
                <p style={{ color: '#ccc', maxWidth: '400px', marginBottom: '2rem' }}>
                    You must be at least 18 years old to run a shop and receive payouts on PanoSpace.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.8rem 1.5rem', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: MAIN FORM
    // -------------------------------------------------------------------------

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', background: '#000', color: '#fff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Shop Setup & Verification</h1>
                    <p style={{ color: '#888' }}>Complete the following steps to start selling your work.</p>
                </header>

                <div style={{ display: 'grid', gap: '3rem' }}>

                    {/* SECTION 1: BUSINESS INFO */}
                    <section>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#7FFFD4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: '#7FFFD4', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                            Business & Payout Info
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Legal Full Name</label>
                                <input
                                    type="text"
                                    name="shopLegalName"
                                    value={formData.shopLegalName}
                                    onChange={handleInputChange}
                                    placeholder="Legal name for tax purposes"
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Country</label>
                                <select
                                    name="shopCountry"
                                    value={formData.shopCountry}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                >
                                    {countryOptions.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>City</label>
                                <input
                                    type="text"
                                    name="shopCity"
                                    value={formData.shopCity}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Address Line 1</label>
                                <input
                                    type="text"
                                    name="shopAddressLine1"
                                    value={formData.shopAddressLine1}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="shopAddressLine2"
                                    value={formData.shopAddressLine2}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>State / Region</label>
                                <input
                                    type="text"
                                    name="shopRegion"
                                    value={formData.shopRegion}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Postal Code</label>
                                <input
                                    type="text"
                                    name="shopPostalCode"
                                    value={formData.shopPostalCode}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1rem', background: 'rgba(100, 116, 139, 0.1)', borderRadius: '8px', border: '1px solid #333' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>Payout Method</label>
                                <select
                                    disabled
                                    style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #333', borderRadius: '6px', color: '#888', cursor: 'not-allowed' }}
                                >
                                    <option>Stripe (Recommended)</option>
                                </select>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                                    Payout integration will be configured in the next step. For now, this is just onboarding.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: RULES */}
                    <section>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#7FFFD4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: '#7FFFD4', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                            What You Can Sell
                        </h3>

                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#4CAF50', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCheck /> Allowed</h4>
                            <ul style={{ paddingLeft: '1.2rem', color: '#ccc', lineHeight: '1.6' }}>
                                <li>The artwork is <strong>100% your original work</strong>, created by you.</li>
                                <li>You own all necessary rights (copyright, model releases) to sell the image.</li>
                                <li>Any identifiable people have given you permission to sell their image.</li>
                                <li>You are not using stock images or templates you didn't create.</li>
                            </ul>
                        </div>

                        <div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
                            <h4 style={{ color: '#ff4444', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaExclamationTriangle /> NOT Allowed</h4>
                            <ul style={{ paddingLeft: '1.2rem', color: '#ddd', lineHeight: '1.6' }}>
                                <li>Images you didn't create (reposts, screenshots, Pinterest downloads).</li>
                                <li><strong>AI-generated images</strong> (Midjourney, DALL-E, etc) are currently <strong>prohibited</strong> for sale.</li>
                                <li>Pictures of public figures, celebrities, or athletes without a license.</li>
                                <li>Images containing logos, trademarks, or brands you don't own.</li>
                                <li>Hateful, illegal, or infringing content.</li>
                            </ul>
                        </div>
                    </section>

                    {/* SECTION 3: AGREEMENT */}
                    <section>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#7FFFD4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: '#7FFFD4', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</span>
                            Agreement
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { key: 'confirmAge', label: 'I confirm that I am at least 18 years old.' },
                                { key: 'confirmOwner', label: 'I confirm that I am the original creator of all works I upload to sell, and that I have all necessary rights.' },
                                { key: 'confirmNoAI', label: 'I understand that I may NOT sell AI-generated images on PanoSpace.' },
                                { key: 'confirmRights', label: 'I will not upload or sell images that include other people, celebrities, or brands without proper rights.' },
                                { key: 'confirmTerms', label: 'I understand that violating these rules can result in my shop being suspended or my account being closed.' },
                            ].map((item) => (
                                <label key={item.key} style={{ display: 'flex', gap: '1rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', alignItems: 'start' }}>
                                    <input
                                        type="checkbox"
                                        name={item.key}
                                        checked={formData[item.key]}
                                        onChange={handleInputChange}
                                        style={{ marginTop: '4px', width: '20px', height: '20px', accentColor: '#7FFFD4', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: '#eee', lineHeight: '1.4' }}>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleFinishSetup}
                            disabled={!allCheckboxesChecked || !requiredFieldsFilled || verifying}
                            style={{
                                padding: '1rem 3rem',
                                background: (!allCheckboxesChecked || !requiredFieldsFilled) ? '#333' : '#7FFFD4',
                                color: (!allCheckboxesChecked || !requiredFieldsFilled) ? '#888' : '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: (!allCheckboxesChecked || !requiredFieldsFilled || verifying) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {verifying ? 'Verifying...' : (
                                <>
                                    <FaShieldAlt /> Finish Shop Setup
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ShopSetupPage;
