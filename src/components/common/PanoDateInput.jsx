import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from 'react-icons/fa';

/**
 * PanoDateInput
 * A reusable date picker component following the PanoSpace design system.
 * 
 * Props:
 * - selected: Date object or null
 * - onChange: (date: Date) => void
 * - placeholder: string
 * - showTimeSelect: boolean (default false)
 * - dateFormat: string (default 'MMM d, yyyy')
 * - className: string (optional wrapper class)
 * - ...other datepicker props
 */

// Custom Input Component
const CustomInput = forwardRef(({ value, onClick, onChange, isOpen, placeholder, readOnly }, ref) => (
    <div className={`pano-date-input-wrapper ${isOpen ? 'active' : ''}`} onClick={onClick} ref={ref}>
        <input
            value={value}
            onChange={onChange}
            className="pano-date-input"
            placeholder={placeholder}
            readOnly={readOnly}
        />
        <div className="calendar-icon-btn">
            <FaCalendarAlt />
        </div>
    </div>
));

const PanoDateInput = ({
    selected,
    onChange,
    placeholder = "Select Date",
    showTimeSelect = false,
    dateFormat = "MMM d, yyyy",
    className = "",
    readOnly = true, // Default to true to force picker use
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to ensure we don't pass invalid props to DatePicker 
    // or handle specific logic if needed.

    const handleChange = (date) => {
        onChange(date);
        setIsOpen(false);
    };

    return (
        <div className={`pano-date-input-container ${className}`}>
            <DatePicker
                selected={selected}
                onChange={handleChange}
                open={isOpen}
                onInputClick={() => setIsOpen(!isOpen)}
                onClickOutside={() => setIsOpen(false)}
                showTimeSelect={showTimeSelect}
                timeFormat="h:mm aa"
                timeIntervals={15}
                dateFormat={showTimeSelect ? "MMM d, yyyy h:mm aa" : dateFormat}
                placeholderText={placeholder}
                customInput={<CustomInput isOpen={isOpen} placeholder={placeholder} readOnly={readOnly} />}
                calendarClassName="panospace-calendar"
                dayClassName={() => "panospace-day"}
                popperClassName="panospace-popper"
                popperPlacement="bottom-start" // Default placement
                {...props}
            />
        </div>
    );
};

export default PanoDateInput;
