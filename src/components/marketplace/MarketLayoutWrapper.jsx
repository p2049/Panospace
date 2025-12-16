import React from 'react';
import MarketPanels from './MarketPanels';

const MarketLayoutWrapper = ({ children, ...props }) => {
    return (
        <MarketPanels {...props}>
            {children}
        </MarketPanels>
    );
};

export default MarketLayoutWrapper;
