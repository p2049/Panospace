import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    // This context is now reserved for PURE UI state (modals, themes, generic flags)
    // NOT data state like activePost.

    // Example: const [themeMode, setThemeMode] = useState('dark');

    const value = {
        // ... any future UI state
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};
