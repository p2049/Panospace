import React from 'react';
import '../styles/DateStampOverlay.css';

const DateStampOverlay = ({ date, styleName = 'panospace', quartzDate = null }) => {
    // If quartzDate is provided (from post.uiOverlays.quartzDate), use that instead
    if (quartzDate) {
        const quartzColor = quartzDate.color || '#00FF55'; // Default green like Fuji film
        // Add spacing around periods for better readability
        // For default format, pad single digits to align columns and use consistent separators
        const formattedText = quartzDate.text.includes('.')
            ? quartzDate.text.replace(/\./g, ' . ')
            : quartzDate.text.split(' ').filter(Boolean)
                .map(p => p.length === 1 ? `\u00A0${p}` : p)
                .join('\u00A0\u00A0');
        return (
            <div
                className="date-stamp-overlay quartz-date"
                style={{
                    '--quartz-color': quartzColor,
                    color: quartzColor
                }}
            >
                {formattedText}
            </div>
        );
    }

    // Original date stamp logic
    if (!date) return null;

    // Format date as MM.DD.YY
    const formatDate = (dateObj, format = 'MM.DD.YY') => {
        if (!dateObj) return '';
        const d = new Date(dateObj);
        if (isNaN(d.getTime())) return '';

        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);

        // Format based on user preference
        if (format === 'YY.MM.DD') return `${yy}.${mm}.${dd}`;
        if (format === 'DD.MM.YY') return `${dd}.${mm}.${yy}`;
        return `${mm}.${dd}.${yy}`; // Default MM.DD.YY
    };

    const formattedDate = formatDate(date);
    if (!formattedDate) return null;

    // Base styles
    const baseStyle = {
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        pointerEvents: 'none',
        zIndex: 10,
        userSelect: 'none',
        lineHeight: 1,
    };

    // Style definitions
    const styles = {
        panospace: {
            color: '#00FFAA',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 'clamp(10px, 3.5vw, 24px)',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(0, 255, 170, 0.6), 1px 1px 2px rgba(0,0,0,0.5)',
            letterSpacing: '1px',
        },
        kodak: {
            color: '#FFB300',
            fontFamily: '"Arial", sans-serif',
            fontSize: 'clamp(10px, 3.5vw, 24px)',
            fontWeight: 'bold',
            textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
            filter: 'blur(0.3px)',
            letterSpacing: '0.5px',
        },
        fuji: {
            color: '#00FF55',
            fontFamily: '"Consolas", "Monaco", monospace',
            fontSize: 'clamp(10px, 3.5vw, 24px)',
            fontWeight: '600',
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
            letterSpacing: '0px',
        },
        dv: {
            color: '#FFFFFF',
            fontFamily: '"Impact", sans-serif',
            fontSize: 'clamp(12px, 4vw, 28px)',
            fontWeight: 'normal',
            textShadow: '0 0 2px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '2px',
        },
        redled: {
            color: '#FF0033',
            fontFamily: '"Courier New", monospace',
            fontSize: 'clamp(10px, 3.5vw, 24px)',
            fontWeight: 'bold',
            textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
            letterSpacing: '2px',
        },
        lcd: {
            color: '#F6D88B',
            fontFamily: '"Lucida Console", monospace',
            fontSize: 'clamp(10px, 3.5vw, 24px)',
            fontWeight: 'normal',
            textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
            letterSpacing: '4px',
        }
    };

    const selectedStyle = styles[styleName] || styles.panospace;

    return (
        <div style={{ ...baseStyle, ...selectedStyle }}>
            {formattedDate}
        </div>
    );
};

export default React.memo(DateStampOverlay);
