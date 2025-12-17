import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * BirthDatePicker
 * 
 * A user-friendly date picker for birth dates with:
 * - Separate dropdown selectors for Day, Month, Year (easy to tap)
 * - Optional full calendar view matching app's calendar design
 * - Dark theme with cyan accents (matches app design)
 * 
 * @param {string} value - Current date in YYYY-MM-DD format
 * @param {function} onChange - Callback when date changes (receives YYYY-MM-DD string)
 * @param {boolean} required - Whether the field is required
 */
const BirthDatePicker = ({ value, onChange, required = false }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Parse current value
    const parsedDate = useMemo(() => {
        if (!value) return { day: '', month: '', year: '' };
        const parts = value.split('-');
        return {
            year: parts[0] || '',
            month: parts[1] || '',
            day: parts[2] || ''
        };
    }, [value]);

    // Generate options
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const arr = [];
        // From 100 years ago to current year (for birth dates)
        for (let y = currentYear; y >= currentYear - 100; y--) {
            arr.push(y.toString());
        }
        return arr;
    }, [currentYear]);

    const days = useMemo(() => {
        const arr = [];
        const daysInMonth = parsedDate.month && parsedDate.year
            ? new Date(parseInt(parsedDate.year), parseInt(parsedDate.month), 0).getDate()
            : 31;
        for (let d = 1; d <= daysInMonth; d++) {
            arr.push(d.toString().padStart(2, '0'));
        }
        return arr;
    }, [parsedDate.month, parsedDate.year]);

    const handleChange = (field, fieldValue) => {
        const newDate = { ...parsedDate, [field]: fieldValue };

        // Validate and adjust day if needed
        if (newDate.year && newDate.month && newDate.day) {
            const daysInMonth = new Date(parseInt(newDate.year), parseInt(newDate.month), 0).getDate();
            if (parseInt(newDate.day) > daysInMonth) {
                newDate.day = daysInMonth.toString().padStart(2, '0');
            }
            onChange(`${newDate.year}-${newDate.month}-${newDate.day}`);
        } else if (newDate.year && newDate.month) {
            onChange(`${newDate.year}-${newDate.month}-01`);
        } else if (newDate.year) {
            onChange(`${newDate.year}-01-01`);
        }
    };

    const handleCalendarDayClick = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setShowCalendar(false);
    };

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
        const lastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
        const startPadding = firstDay.getDay();
        const endPadding = 6 - lastDay.getDay();

        const days = [];

        // Previous month padding
        for (let i = startPadding - 1; i >= 0; i--) {
            const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), -i);
            days.push({ date: d, isCurrentMonth: false });
        }

        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i);
            days.push({ date: d, isCurrentMonth: true });
        }

        // Next month padding
        for (let i = 1; i <= endPadding; i++) {
            const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }

        return days;
    }, [calendarDate]);

    const selectStyle = {
        flex: 1,
        padding: '0.9rem 0.5rem',
        borderRadius: '10px',
        border: '1px solid rgba(127, 255, 212, 0.2)',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        fontSize: '0.95rem',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237FFFD4' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '30px',
        minWidth: '80px'
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Label */}
            <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                Birthday
            </div>

            {/* Dropdown Selectors */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                marginBottom: '0.5rem'
            }}>
                {/* Month */}
                <select
                    value={parsedDate.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    required={required}
                    style={selectStyle}
                >
                    <option value="" disabled>Month</option>
                    {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

                {/* Day */}
                <select
                    value={parsedDate.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    required={required}
                    style={{ ...selectStyle, minWidth: '70px' }}
                >
                    <option value="" disabled>Day</option>
                    {days.map(d => (
                        <option key={d} value={d}>{parseInt(d)}</option>
                    ))}
                </select>

                {/* Year */}
                <select
                    value={parsedDate.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    required={required}
                    style={{ ...selectStyle, minWidth: '90px' }}
                >
                    <option value="" disabled>Year</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                {/* Calendar Toggle Button */}
                <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{
                        padding: '0.9rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(127, 255, 212, 0.3)',
                        background: showCalendar ? 'rgba(127, 255, 212, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                        color: '#7FFFD4',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Open calendar"
                >
                    <FaCalendarAlt size={16} />
                </button>
            </div>

            {/* Calendar Modal */}
            {showCalendar && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowCalendar(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            zIndex: 1000
                        }}
                    />

                    {/* Calendar */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        zIndex: 1001,
                        width: '320px',
                        maxWidth: '90vw',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                    }}>
                        {/* Calendar Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                                style={{
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaChevronLeft />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {/* Month Dropdown in Calendar */}
                                <select
                                    value={calendarDate.getMonth()}
                                    onChange={(e) => setCalendarDate(new Date(calendarDate.getFullYear(), parseInt(e.target.value), 1))}
                                    style={{
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '0.4rem',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {months.map((m, i) => (
                                        <option key={i} value={i}>{m.label}</option>
                                    ))}
                                </select>

                                {/* Year Dropdown in Calendar */}
                                <select
                                    value={calendarDate.getFullYear()}
                                    onChange={(e) => setCalendarDate(new Date(parseInt(e.target.value), calendarDate.getMonth(), 1))}
                                    style={{
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '0.4rem',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                                style={{
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px',
                            marginBottom: '0.5rem'
                        }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} style={{
                                    textAlign: 'center',
                                    color: '#666',
                                    fontWeight: '600',
                                    fontSize: '0.75rem',
                                    padding: '0.25rem'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px'
                        }}>
                            {calendarDays.map((day, index) => {
                                const isSelected = value &&
                                    day.date.getFullYear() === parseInt(parsedDate.year) &&
                                    day.date.getMonth() + 1 === parseInt(parsedDate.month) &&
                                    day.date.getDate() === parseInt(parsedDate.day);
                                const isToday = day.date.toDateString() === new Date().toDateString();

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleCalendarDayClick(day.date)}
                                        style={{
                                            background: isSelected ? '#7FFFD4' : 'transparent',
                                            border: isToday ? '1px solid #7FFFD4' : '1px solid transparent',
                                            borderRadius: '6px',
                                            padding: '0.5rem',
                                            color: isSelected ? '#000' : (day.isCurrentMonth ? '#fff' : '#444'),
                                            cursor: 'pointer',
                                            fontWeight: isSelected || isToday ? 'bold' : 'normal',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {day.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setShowCalendar(false)}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'transparent',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default BirthDatePicker;
