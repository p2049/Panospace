import React from 'react';
import { motion } from 'framer-motion';

/**
 * MotionWrapper - Global page transition wrapper
 * Provides subtle fade + slide transitions between routes
 * Premium, performant, no layout shifting
 */
const MotionWrapper = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for premium feel
                opacity: { duration: 0.25 },
                y: { duration: 0.3 }
            }}
            style={{
                width: '100%',
                height: '100%',
                willChange: 'opacity, transform' // Performance optimization
            }}
        >
            {children}
        </motion.div>
    );
};

export default MotionWrapper;
