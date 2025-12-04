import { useEffect } from 'react';

/**
 * useModalEscape - Hook to handle modal escape patterns
 * Ensures modals can always be closed via Escape key and backdrop click
 * 
 * @param {boolean} isOpen - Whether the modal is currently open
 * @param {function} onClose - Callback to close the modal
 * @param {boolean} closeOnBackdrop - Whether clicking backdrop should close (default: true)
 * @param {boolean} closeOnEscape - Whether Escape key should close (default: true)
 */
export const useModalEscape = (isOpen, onClose, closeOnBackdrop = true, closeOnEscape = true) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (closeOnEscape && e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Prevent body scroll when modal is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose, closeOnEscape]);

    // Return backdrop click handler
    const handleBackdropClick = closeOnBackdrop ? onClose : null;

    return { handleBackdropClick };
};

export default useModalEscape;
