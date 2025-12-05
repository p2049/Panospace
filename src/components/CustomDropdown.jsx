import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaChevronDown } from 'react-icons/fa';
const CustomDropdown = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    style = {},
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Check if click is inside the portal menu
                const portalMenu = document.getElementById(`dropdown-portal-${placeholder.replace(/\s+/g, '-')}`);
                if (portalMenu && portalMenu.contains(event.target)) {
                    return;
                }
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false); // Close on scroll to avoid detached menu
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen, placeholder]);

    // Update position when opening
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.id === value || opt.value === value);
    const displayLabel = selectedOption?.label || placeholder;

    const dropdownMenu = (
        <div
            id={`dropdown-portal-${placeholder.replace(/\s+/g, '-')}`}
            style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                maxHeight: '300px',
                overflowY: 'auto',
                background: '#000',
                border: '1px solid var(--ice-mint)',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(127, 255, 212, 0.2), 0 10px 30px rgba(0,0,0,0.8)',
                zIndex: 9999,
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            {options.map(opt => {
                const optValue = opt.id || opt.value;
                const isSelected = optValue === value;

                return (
                    <button
                        key={optValue}
                        onClick={() => {
                            onChange(optValue);
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.8rem 1rem',
                            background: isSelected ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                            border: 'none',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            color: isSelected ? 'var(--ice-mint)' : '#fff',
                            fontSize: '0.85rem',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontWeight: isSelected ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = 'var(--ice-mint)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#fff';
                            }
                        }}
                    >
                        {opt.label}
                        {isSelected && (
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--ice-mint)',
                                boxShadow: '0 0 5px var(--ice-mint)'
                            }} />
                        )}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div ref={dropdownRef} style={{ position: 'relative', ...style }} className={className}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: isOpen ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isOpen ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: isOpen ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.85rem',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    opacity: disabled ? 0.5 : 1
                }}
            >
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {displayLabel}
                </span>
                <FaChevronDown style={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                }} />
            </button>

            {/* Render Dropdown via Portal */}
            {isOpen && ReactDOM.createPortal(dropdownMenu, document.body)}
        </div>
    );
};

export default CustomDropdown;
