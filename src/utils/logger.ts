/**
 * Safe logging utility - only logs in development
 */

const isDevelopment = (import.meta as any).env?.MODE === 'development';

export const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    error: (...args: any[]) => {
        // Always log errors
        console.error(...args);
    },

    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    }
};
