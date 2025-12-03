# Color Search Feature Implementation

## Overview
Implemented a color wheel search feature that allows users to search for posts by dominant color. The system automatically extracts the dominant color from images during upload and stores it in post metadata.

## Features Implemented

### 1. **Color Extraction Utility** (`src/utils/colorExtraction.js`)
- **Dominant Color Extraction**: Analyzes images and extracts the most prominent color
- **Color Conversion**: RGB ↔ HEX ↔ HSL conversions
- **Color Similarity**: Calculate similarity between colors (0-100 scale)
- **Color Naming**: Automatically names colors (Red, Blue, Green, etc.)
- **Predefined Palette**: 15 preset colors for quick selection

**Key Functions:**
- `extractDominantColor(imageSource)` - Main extraction function
- `rgbToHex(r, g, b)` - Convert RGB to HEX
- `rgbToHsl(r, g, b)` - Convert RGB to HSL
- `hexToRgb(hex)` - Convert HEX to RGB
- `colorSimilarity(color1, color2)` - Calculate color similarity
- `getColorName(hex)` - Get human-readable color name

**Algorithm:**
1. Loads image into canvas (resized to 100x100 for performance)
2. Samples pixels (every 5th pixel)
3. Skips transparent, very dark, and very light pixels
4. Quantizes colors to reduce variations (groups similar colors)
5. Returns most common color as dominant color

### 2. **Color Wheel Search Component** (`src/components/search/ColorWheelSearch.jsx`)
- **Preset Color Palette**: 15 quick-select colors in a grid
- **Custom Color Picker**: HSL sliders for precise color selection
  - Hue slider (0-360°)
  - Saturation slider (0-100%)
  - Lightness slider (0-100%)
- **Live Preview**: Shows selected color before applying
- **Visual Feedback**: Selected color highlights, hover effects
- **Clear Button**: Remove color filter easily

**UI Features:**
- Dropdown modal design
- Responsive grid layout for preset colors
- Gradient sliders for intuitive color selection
- Real-time color preview
- Smooth animations and transitions

### 3. **Post Upload Integration** (`src/hooks/useCreatePost.js`)
- **Automatic Extraction**: Extracts dominant color during image upload
- **Metadata Storage**: Stores color in both item and post level
- **Error Handling**: Graceful fallback if extraction fails
- **Performance**: Runs in parallel with other upload tasks

**Implementation:**
```javascript
// Extract dominant color
let dominantColor = null;
try {
    const colorData = await extractDominantColor(url);
    dominantColor = colorData.hex;
} catch (e) {
    console.warn('Failed to extract dominant color', e);
}

// Store in item
return {
    type: 'image',
    url,
    dominantColor,
    // ... other fields
};

// Store in post document
dominantColor: items.find(i => i.dominantColor)?.dominantColor || null
```

### 4. **Search Filters Integration** (`src/components/search/SearchFilters.jsx`)
- **Added ColorWheelSearch Component**: Integrated into filter bar
- **New Props**: `selectedColor`, `onColorSelect`, `onColorClear`
- **Positioned**: Between sort dropdown and view mode buttons

## Database Schema

### Post Document
```javascript
{
    // ... existing fields
    dominantColor: "#FF5733" | null,  // HEX color string
}
```

### Post Item (Slide)
```javascript
{
    type: 'image',
    url: "...",
    dominantColor: "#FF5733" | null,  // HEX color string
    // ... other fields
}
```

## Next Steps to Complete Implementation

### 1. **Update Search.jsx**
Add color filtering logic to the search function:

```javascript
// Add state
const [selectedColor, setSelectedColor] = useState(null);

// Update SearchFilters props
<SearchFilters
    // ... existing props
    selectedColor={selectedColor}
    onColorSelect={setSelectedColor}
    onColorClear={() => setSelectedColor(null)}
/>

// Add color filtering in search logic
if (selectedColor && currentMode === 'posts') {
    // Filter posts by color similarity
    const colorFilteredPosts = results.posts.filter(post => {
        if (!post.dominantColor) return false;
        const similarity = colorSimilarity(selectedColor, post.dominantColor);
        return similarity >= 70; // 70% similarity threshold
    });
    // Use colorFilteredPosts instead of results.posts
}
```

### 2. **Update useSearch Hook**
Add color parameter to search queries:

```javascript
// In src/hooks/useSearch.js
export const useSearch = (searchTerm, filters, selectedColor) => {
    // ... existing logic
    
    // Add color filtering
    if (selectedColor) {
        // Filter results by color similarity
        posts = posts.filter(post => {
            if (!post.dominantColor) return false;
            return colorSimilarity(selectedColor, post.dominantColor) >= 70;
        });
    }
    
    return { posts, users, galleries, ... };
};
```

### 3. **Firestore Index (Optional)**
For better performance, create a Firestore index on `dominantColor`:

```
Collection: posts
Fields: dominantColor (Ascending), createdAt (Descending)
```

### 4. **Backfill Existing Posts**
Create a migration script to extract colors from existing posts:

```javascript
// Migration script
const backfillColors = async () => {
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);
    
    for (const doc of snapshot.docs) {
        const post = doc.data();
        if (!post.dominantColor && post.imageUrls && post.imageUrls.length > 0) {
            try {
                const colorData = await extractDominantColor(post.imageUrls[0]);
                await updateDoc(doc.ref, {
                    dominantColor: colorData.hex
                });
                console.log(`Updated post ${doc.id} with color ${colorData.hex}`);
            } catch (error) {
                console.error(`Failed to update post ${doc.id}:`, error);
            }
        }
    }
};
```

## Color Palette

The predefined color palette includes:
- **Primary Colors**: Red, Yellow, Blue
- **Secondary Colors**: Orange, Green, Purple
- **Tertiary Colors**: Lime, Teal, Cyan, Sky, Magenta, Pink
- **Neutrals**: Black, Gray, White

Each color is defined with:
- `name`: Human-readable name
- `hex`: HEX color code
- `hue`: Hue value (0-360°) for HSL calculations

## Performance Considerations

1. **Image Resizing**: Images are resized to 100x100 before analysis
2. **Pixel Sampling**: Only every 5th pixel is analyzed
3. **Color Quantization**: Similar colors are grouped to reduce variations
4. **Async Processing**: Color extraction runs in parallel with other upload tasks
5. **Error Handling**: Graceful fallback if extraction fails

## User Experience

### Search Flow:
1. User clicks "Search by Color" button
2. Modal opens with preset colors and custom picker
3. User selects a color (preset or custom)
4. Search results filter to show posts with similar colors
5. User can clear filter to see all results again

### Visual Feedback:
- Selected color shows in button background
- Clear button appears when color is selected
- Hover effects on preset colors
- Live preview of custom color selection
- Smooth animations and transitions

## Browser Compatibility

The color extraction uses standard Canvas API, supported in:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Future Enhancements

1. **Color Themes**: Search by color schemes (complementary, analogous, etc.)
2. **Multi-Color Search**: Select multiple colors
3. **Color Intensity**: Filter by saturation/lightness
4. **Color Trends**: Show popular colors over time
5. **AI Color Suggestions**: Recommend colors based on user preferences
6. **Color Palette Extraction**: Extract full color palette from images
7. **Advanced Filters**: Combine color with other filters (tags, location, etc.)

## Files Created

1. `src/utils/colorExtraction.js` - Color extraction and conversion utilities
2. `src/components/search/ColorWheelSearch.jsx` - Color picker UI component

## Files Modified

1. `src/hooks/useCreatePost.js` - Added dominant color extraction during upload
2. `src/components/search/SearchFilters.jsx` - Integrated ColorWheelSearch component

## Testing Checklist

- [ ] Upload new post and verify dominantColor is stored
- [ ] Select preset color and verify search filters
- [ ] Use custom color picker and verify selection
- [ ] Clear color filter and verify results reset
- [ ] Test on mobile devices
- [ ] Test with various image types (photos, graphics, etc.)
- [ ] Test error handling (invalid images, network errors)
- [ ] Verify performance with large result sets

## Notes

- Database collection names remain unchanged (still using `posts`)
- Color similarity threshold is set to 70% (adjustable)
- Extraction skips very dark/light pixels to focus on actual content
- Grayscale detection based on saturation < 10%
- Color naming uses hue ranges for categorization
