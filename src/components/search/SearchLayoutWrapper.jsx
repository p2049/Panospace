import React from 'react';
import SearchPanels from '@/components/SearchPanels';

const SearchLayoutWrapper = ({ children, ...props }) => {
    return (
        <SearchPanels {...props}>
            {children}
        </SearchPanels>
    );
};

export default SearchLayoutWrapper;
