// Admin Color Backfill Page
import React, { useState } from 'react';
import { colorBackfillTool } from '@/core/utils/colors';

const ColorBackfillPage = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({ processed: 0, succeeded: 0, failed: 0, skipped: 0 });
    const [logs, setLogs] = useState([]);
    const [batchSize, setBatchSize] = useState(20);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
    };

    const runBackfill = async () => {
        setIsRunning(true);
        setLogs([]);
        addLog(`Starting backfill for ${batchSize} posts...`, 'info');

        try {
            await colorBackfillTool.backfillColors(batchSize, (progress) => {
                setStats(colorBackfillTool.getStats());

                const msg = `[${progress.current}/${progress.total}] ${progress.postId?.substring(0, 10)}... - ${progress.status}`;
                const logType = progress.status === 'success' ? 'success' :
                    progress.status === 'failed' ? 'error' : 'info';

                if (progress.color) {
                    addLog(`${msg} (${progress.color})`, logType);
                } else if (progress.error) {
                    addLog(`${msg} - ${progress.error}`, logType);
                } else {
                    addLog(msg, logType);
                }
            });

            const finalStats = colorBackfillTool.getStats();
            setStats(finalStats);
            addLog(`✅ Backfill complete! Succeeded: ${finalStats.succeeded}, Failed: ${finalStats.failed}, Skipped: ${finalStats.skipped}`, 'success');
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            background: '#0a0a0a',
            minHeight: '100vh',
            color: '#fff'
        }}>
            <h1 style={{ color: '#7FFFD4', marginBottom: '2rem' }}>🎨 Color Backfill Tool</h1>

            {/* Controls */}
            <div style={{
                background: 'rgba(127, 255, 212, 0.05)',
                border: '1px solid rgba(127, 255, 212, 0.2)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                        Batch Size:
                    </label>
                    <input
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                        min="1"
                        max="100"
                        disabled={isRunning}
                        style={{
                            padding: '0.5rem',
                            background: '#1a1a1a',
                            border: '1px solid rgba(127, 255, 212, 0.3)',
                            borderRadius: '4px',
                            color: '#fff',
                            width: '100px'
                        }}
                    />
                    <span style={{ marginLeft: '1rem', color: '#888' }}>
                        (Recommended: 10-20 for first run)
                    </span>
                </div>

                <button
                    onClick={runBackfill}
                    disabled={isRunning}
                    style={{
                        padding: '0.75rem 2rem',
                        background: isRunning ? '#555' : '#7FFFD4',
                        color: isRunning ? '#aaa' : '#000',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {isRunning ? '⏳ Running...' : '▶️ Start Backfill'}
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatCard label="Processed" value={stats.processed} color="#7FFFD4" />
                <StatCard label="Succeeded" value={stats.succeeded} color="#00ff88" />
                <StatCard label="Failed" value={stats.failed} color="#ff4444" />
                <StatCard label="Skipped" value={stats.skipped} color="#ffaa00" />
            </div>

            {/* Logs */}
            <div style={{
                background: '#1a1a1a',
                border: '1px solid rgba(127, 255, 212, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                maxHeight: '500px',
                overflowY: 'auto'
            }}>
                <h3 style={{ color: '#7FFFD4', marginBottom: '1rem' }}>📋 Logs</h3>
                {logs.length === 0 ? (
                    <p style={{ color: '#888' }}>No logs yet. Click "Start Backfill" to begin.</p>
                ) : (
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {logs.map((log, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '0.5rem',
                                    borderBottom: '1px solid rgba(127, 255, 212, 0.1)',
                                    color: log.type === 'success' ? '#00ff88' :
                                        log.type === 'error' ? '#ff4444' :
                                            log.type === 'warning' ? '#ffaa00' : '#aaa'
                                }}
                            >
                                <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(127, 255, 212, 0.05)',
                border: '1px solid rgba(127, 255, 212, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#aaa'
            }}>
                <h4 style={{ color: '#7FFFD4', marginBottom: '0.5rem' }}>ℹ️ Instructions</h4>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li>Start with a small batch (10-20 posts) to test</li>
                    <li>The tool will extract colors from post images and save them to Firestore</li>
                    <li>Posts that already have colors will be skipped</li>
                    <li>Processing takes ~200ms per post (rate limited)</li>
                    <li>You can run multiple batches until all posts are processed</li>
                    <li>Check the logs for any errors or issues</li>
                </ul>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div style={{
        background: 'rgba(127, 255, 212, 0.05)',
        border: `1px solid ${color}33`,
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center'
    }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
        <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>{label}</div>
    </div>
);

export default ColorBackfillPage;
