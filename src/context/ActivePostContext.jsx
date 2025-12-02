import React, { createContext, useContext, useState } from 'react';

const ActivePostContext = createContext();

export const useActivePost = () => useContext(ActivePostContext);

export const ActivePostProvider = ({ children }) => {
    const [activePostId, setActivePostId] = useState(null);
    const [activePost, setActivePost] = useState(null);

    return (
        <ActivePostContext.Provider value={{ activePostId, setActivePostId, activePost, setActivePost }}>
            {children}
        </ActivePostContext.Provider>
    );
};
