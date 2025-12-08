import { useState, useEffect } from 'react';
import { layoutForScreen, getDeviceClass, getOrientation, LayoutConfig, getSafeSpacing } from './layoutEngine';

/**
 * Hook to access responsive layout engine
 * Reacts to window resize events
 */
export function useLayoutEngine(screen: string = 'default') {
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const layout: LayoutConfig = layoutForScreen(dimensions.width, dimensions.height, screen);
    const device = getDeviceClass(dimensions.width, dimensions.height);
    const orientation = getOrientation(dimensions.width, dimensions.height);

    return {
        layout,
        device,
        orientation,
        width: dimensions.width,
        height: dimensions.height,
        isMobile: device === 'phone',
        isTablet: device === 'tablet',
        isDesktop: device === 'desktop',
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape',
        getSafeSpacing
    };
}
