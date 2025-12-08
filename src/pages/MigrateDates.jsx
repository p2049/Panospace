import React, { useState } from 'react';
import { migrateDateFormats } from '@/core/utils/dates';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin utility page to migrate date formats in existing posts
 * This converts old "MM.DD.YY" format to new "D M 'Y" format
 */
const MigrateDates = () => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleMigration = async () => {
        if (!window.confirm('This will update all posts with old date formats. Continue?')) {
            return;
        }

        setLoading(true);
        setStatus('Running migration...');

        try {
            const result = await migrateDateFormats();
            setResult(result);

            if (result.success) {
                setStatus(`✅ Migration complete! Updated ${result.updated} posts, skipped ${result.skipped} posts.`);
            } else {
                setStatus(`❌ Migration failed: ${result.error}`);
            }
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div style={{ padding: '2rem', color: '#fff' }}>
                <h2>Please log in to access this page</h2>
            </div>
        );
    }

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            color: '#fff'
        }}>
            <h1>Date Format Migration</h1>
            <p>This tool will update all existing posts to use the new date format:</p>
            <ul>
                <li><strong>Old format:</strong> MM.DD.YY (e.g., "11.30.24")</li>
                <li><strong>New format:</strong> D M 'Y (e.g., "30 11 '24")</li>
            </ul>

            <button
                onClick={handleMigration}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    background: loading ? '#666' : '#7FFFD4',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginTop: '1rem'
                }}
            >
                {loading ? 'Migrating...' : 'Run Migration'}
            </button>

            {status && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap'
                }}>
                    {status}
                </div>
            )}

            {result && result.success && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(127, 255, 212, 0.1)',
                    border: '1px solid #7FFFD4',
                    borderRadius: '8px'
                }}>
                    <h3>Migration Summary:</h3>
                    <p>✅ Updated: {result.updated} posts</p>
                    <p>⏭️ Skipped: {result.skipped} posts</p>
                </div>
            )}
        </div>
    );
};

export default MigrateDates;
