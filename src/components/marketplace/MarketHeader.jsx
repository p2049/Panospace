import React, { useState, useEffect } from 'react';
import MarketHeaderDesktop from './MarketHeader.desktop';
import MarketHeaderMobileVertical from './MarketHeader.mobile.vertical';
import MarketHeaderMobileHorizontal from './MarketHeader.mobile.horizontal';

const MarketHeader = (props) => {
    const { isMobile } = props;
    const [isLandscape, setIsLandscape] = useState(
        typeof window !== 'undefined' ? window.matchMedia("(orientation: landscape)").matches : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    if (!isMobile) {
        return <MarketHeaderDesktop {...props} />;
    }

    if (isLandscape) {
        return <MarketHeaderMobileHorizontal {...props} />;
    }

    return <MarketHeaderMobileVertical {...props} />;
};

export default MarketHeader;
