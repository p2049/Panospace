# Search System Audit & Fixes

## Issues Identified:

### 1. **Search Delays (300ms debounce)**
- **Location**: `Search.jsx` line 478-484
- **Issue**: Every filter change triggers a 300ms delay
- **Fix**: Reduce to 150ms for better responsiveness

### 2. **Tag Filtering Logic**
- **Location**: `useSearch.js` lines 236-243
- **Issue**: Tags are filtered with `array-contains` for first tag only, then client-side for rest
- **Fix**: This is correct, but ensure all tags are lowercased consistently

### 3. **Following Filter Limitation**
- **Location**: `useSearch.js` line 179
- **Issue**: `authorIds.slice(0, 10)` limits to 10 followed users
- **Impact**: Users following >10 people won't see all their posts
- **Fix**: Implement batched queries or increase limit with pagination

### 4. **Color Filter Not Applied**
- **Location**: `Search.jsx` lines 556-562
- **Issue**: `selectedColor` state is set but never passed to search query
- **Fix**: Add color filter to `performSearch` and `searchPosts`

### 5. **Missing Results - Draft Posts**
- **Location**: `usePersonalizedFeed.js` line 66
- **Issue**: Drafts are filtered out, but search should also filter them
- **Fix**: Add draft filter to search queries

### 6. **Tag Case Sensitivity**
- **Location**: Multiple locations
- **Issue**: Tags compared with `.toLowerCase()` but not normalized on save
- **Fix**: Ensure consistent normalization

## Priority Fixes:

1. ✅ Reduce search debounce to 150ms
2. ✅ Add color filter to search
3. ✅ Filter out draft posts
4. ✅ Normalize tag comparison
5. ⚠️ Document following limit (requires architectural change)
