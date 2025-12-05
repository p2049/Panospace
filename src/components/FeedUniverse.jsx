/**
 * Feed Universe - Wrapper component for Art and Social feeds
 * Handles feed transitions when switching via planet logo
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedStore } from '../store/useFeedStore';
import { isDualFeedsEnabled } from '../config/feedConfig';

const FeedUniverse = ({ children }) => {
    const { currentFeed } = useFeedStore();

    // Don't render universe wrapper if dual feeds are disabled
    if (!isDualFeedsEnabled()) {
        return <>{children}</>;
    }

    // Simple fade transition - no sliding to avoid layout issues
    const fadeVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentFeed}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedUniverse;
