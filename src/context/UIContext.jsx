import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
    return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
    const [activePost, setActivePost] = useState(null);

    const value = {
        activePost,
        setActivePost
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};
