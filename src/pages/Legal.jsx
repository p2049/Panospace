import React, { useState } from 'react';
import { FaArrowLeft, FaShieldAlt, FaUserShield, FaGavel } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Legal = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('guidelines');

    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #333'
    };

    const tabContainerStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    };

    const tabStyle = (isActive) => ({
        padding: '0.8rem 1.5rem',
        borderRadius: '20px',
        border: isActive ? '1px solid #fff' : '1px solid #333',
        background: isActive ? '#fff' : 'transparent',
        color: isActive ? '#000' : '#aaa',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s'
    });

    const sectionStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6',
        color: '#ddd'
    };

    const h2Style = {
        color: '#fff',
        marginTop: '2rem',
        marginBottom: '1rem',
        fontSize: '1.5rem'
    };

    const h3Style = {
        color: '#fff',
        marginTop: '1.5rem',
        marginBottom: '0.5rem',
        fontSize: '1.2rem'
    };

    const ulStyle = {
        paddingLeft: '1.5rem',
        marginBottom: '1rem'
    };

    const liStyle = {
        marginBottom: '0.5rem'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <FaArrowLeft />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Legal & Guidelines</h1>
            </div>

            <div style={tabContainerStyle}>
                <button onClick={() => setActiveTab('guidelines')} style={tabStyle(activeTab === 'guidelines')}>
                    <FaShieldAlt /> Community Guidelines
                </button>
                <button onClick={() => setActiveTab('tos')} style={tabStyle(activeTab === 'tos')}>
                    <FaGavel /> Terms of Service
                </button>
                <button onClick={() => setActiveTab('privacy')} style={tabStyle(activeTab === 'privacy')}>
                    <FaUserShield /> Privacy Policy
                </button>
                <button onClick={() => setActiveTab('contact')} style={tabStyle(activeTab === 'contact')}>
                    <FaShieldAlt /> Contact
                </button>
            </div>

            <div style={sectionStyle}>
                {activeTab === 'guidelines' && (
                    <div className="fade-in">
                        <h2 style={h2Style}>Community Guidelines</h2>
                        <p>Welcome to Panospace. We are an art-first community built for real artists, not influencers. Our mission is to highlight real human creativity, especially from young and undiscovered talent.</p>

                        <h3 style={h3Style}>1. No Nudity or Sexual Content</h3>
                        <p>We maintain a strict, safe environment for users 14+.</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}><strong>No nudity of any kind.</strong></li>
                            <li style={liStyle}>No pornographic, sexual, or suggestive content.</li>
                            <li style={liStyle}>No "thirst traps", adult content, or sexualized posing.</li>
                        </ul>

                        <h3 style={h3Style}>2. No AI Art</h3>
                        <p>This platform is for human-made creative work only.</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}><strong>No AI-generated artwork, images, edits, or composites.</strong></li>
                            <li style={liStyle}>AI-generated content will be removed.</li>
                        </ul>

                        <h3 style={h3Style}>3. No Posting Art You Did Not Create</h3>
                        <p><strong>ZERO TOLERANCE FOR ART THEFT.</strong></p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>You may <strong>ONLY</strong> upload art you personally created.</li>
                            <li style={liStyle}>No reposting, even with credit.</li>
                            <li style={liStyle}>No screenshots of other people's work.</li>
                            <li style={liStyle}>No "sharing" from Pinterest, Instagram, or Google.</li>
                            <li style={liStyle}>No fan pages. Every post must be original.</li>
                        </ul>
                        <p style={{ color: '#ff4444', fontWeight: 'bold' }}>Violations will lead to immediate removal of posts and potential permanent account termination.</p>

                        <h3 style={h3Style}>4. Respect & Community</h3>
                        <ul style={ulStyle}>
                            <li style={liStyle}>No harassment, bullying, discrimination, or hate speech.</li>
                            <li style={liStyle}>No spam or irrelevant content.</li>
                            <li style={liStyle}>No "influencer-style" content unrelated to art.</li>
                            <li style={liStyle}>Respect the seriousness of the community. Promote growth and collaboration.</li>
                        </ul>
                    </div>
                )}

                {activeTab === 'tos' && (
                    <div className="fade-in">
                        <h2 style={h2Style}>Terms of Service</h2>

                        <h3 style={h3Style}>1. Acceptance of Terms</h3>
                        <p>By accessing or using Panospace, you agree to be bound by these Terms. If you do not agree, you may not use the platform.</p>

                        <h3 style={h3Style}>2. Age Requirement</h3>
                        <p>You must be at least <strong>14 years old</strong> to use Panospace. By creating an account, you confirm you meet this age requirement. Parents are responsible for monitoring their minor's use of the platform.</p>

                        <h3 style={h3Style}>3. User Content Rights</h3>
                        <ul style={ulStyle}>
                            <li style={liStyle}><strong>You retain full ownership and rights to your content.</strong></li>
                            <li style={liStyle}>By posting, you grant Panospace a non-exclusive license to display your work on the platform.</li>
                            <li style={liStyle}>We do not claim ownership of your artwork.</li>
                        </ul>

                        <h3 style={h3Style}>4. Prohibited Conduct</h3>
                        <p>You agree NOT to:</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>Upload content you do not own (No Reposting).</li>
                            <li style={liStyle}>Upload AI-generated content.</li>
                            <li style={liStyle}>Upload nudity or sexual content.</li>
                            <li style={liStyle}>Impersonate other artists.</li>
                        </ul>

                        <h3 style={h3Style}>5. Termination</h3>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms, particularly for repeat offenses regarding art theft, AI content, or inappropriate behavior.</p>

                        <h3 style={h3Style}>6. Disclaimers & Liability</h3>
                        <p>Panospace is provided "as is". We are not responsible for disputes between users or for the content posted by users. We disclaim all liability to the fullest extent permitted by law.</p>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="fade-in">
                        <h2 style={h2Style}>Privacy Policy</h2>

                        <h3 style={h3Style}>1. Data We Collect</h3>
                        <p>We collect minimal data necessary to operate the platform:</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>Account info: Username, email address.</li>
                            <li style={liStyle}>Content: Posts, likes, comments.</li>
                            <li style={liStyle}>Technical: Device logs for security and debugging.</li>
                        </ul>

                        <h3 style={h3Style}>2. How We Use Your Data</h3>
                        <p>We use your data solely to provide and improve the Panospace service. <strong>We do NOT sell your personal data to third parties.</strong></p>

                        <h3 style={h3Style}>3. Data Security</h3>
                        <p>We use industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>

                        <h3 style={h3Style}>4. Cookies & Tracking</h3>
                        <p>We use cookies solely for authentication and session management. We do not use third-party tracking cookies for advertising purposes.</p>

                        <h3 style={h3Style}>5. Your Rights</h3>
                        <p>You have the right to access, correct, or delete your personal data. You can request account deletion at any time through your profile settings.</p>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="fade-in">
                        <h2 style={h2Style}>Contact & Support</h2>
                        <p>If you have any questions, concerns, or need to report a violation, please contact us.</p>

                        <div style={{ marginTop: '2rem', background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ ...h3Style, marginTop: 0 }}>General Support</h3>
                            <p style={{ color: '#aaa' }}>For account issues, bugs, or feedback:</p>
                            <a href="mailto:support@panospace.app" style={{ color: '#fff', textDecoration: 'underline', fontSize: '1.1rem' }}>support@panospace.app</a>
                        </div>

                        <div style={{ marginTop: '1rem', background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ ...h3Style, marginTop: 0 }}>Legal & Safety</h3>
                            <p style={{ color: '#aaa' }}>For DMCA takedowns, safety reports, or legal inquiries:</p>
                            <a href="mailto:legal@panospace.app" style={{ color: '#fff', textDecoration: 'underline', fontSize: '1.1rem' }}>legal@panospace.app</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Legal;
