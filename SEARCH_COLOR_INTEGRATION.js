// Add this to Search.jsx to complete the color search integration

// 1. Import colorSimilarity at the top
import { colorSimilarity } from '../utils/colorExtraction';

// 2. Add selectedColor state (around line 140)
const [selectedColor, setSelectedColor] = useState(null);

// 3. Update SearchFilters component props (find the SearchFilters component usage)
<SearchFilters
    sortBy={sortBy}
    setSortBy={setSortBy}
    viewMode={viewMode}
    setViewMode={setViewMode}
    isSortDropdownOpen={isSortDropdownOpen}
    setIsSortDropdownOpen={setIsSortDropdownOpen}
    selectedColor={selectedColor}
    onColorSelect={setSelectedColor}
    onColorClear={() => setSelectedColor(null)}
/>

// 4. Add color filtering logic in the search/filter function
// Find where posts are filtered and add this:
if (selectedColor && currentMode === 'posts') {
    filteredPosts = filteredPosts.filter(post => {
        if (!post.dominantColor) return false;
        const similarity = colorSimilarity(selectedColor, post.dominantColor);
        return similarity >= 70; // 70% similarity threshold (adjustable)
    });
}

// 5. Reset color filter when changing modes or clearing search
// Add to the reset/clear function:
setSelectedColor(null);
