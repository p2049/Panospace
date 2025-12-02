import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const SponsoredCard = ({ ad }) => {
    if (!ad) return null;

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto 2rem auto',
            background: '#1a1a1a',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #333',
            scrollSnapAlign: 'start'
        }}>
            <div style={{
                padding: '0.5rem 1rem',
                background: '#000',
                color: '#888',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '1px solid #333'
            }}>
                Sponsored
            </div>

            <img
                src={ad.imageUrl}
                alt={ad.title}
                style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover'
                }}
            />

            <div style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{ad.title}</h3>
                <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.5' }}>{ad.description}</p>

                <a
                    href={ad.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fff',
                        color: '#000',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '25px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s'
                    }}
                >
                    {ad.ctaText} <FaExternalLinkAlt size={12} />
                </a>
            </div>
        </div>
    );
};

export default SponsoredCard;
