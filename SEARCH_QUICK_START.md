# 🔍 Panospace Search - Quick Start Guide

## How to Use Search

### Basic Search

1. **Navigate to Search Page**
   - Click the Search icon in the bottom navigation
   - Or go to `/search` directly

2. **Search for Anything**
   - Type in the main search box: posts, artists, tags, locations
   - Results update automatically after 400ms

3. **Switch Between Tabs**
   - **All:** Shows both posts and artists
   - **Posts:** Shows only posts
   - **Artists:** Shows only user profiles

### Filters

#### Location Filter
- Enter any city, state, or country
- Examples: "Chicago", "California", "USA"
- Works with partial matching

#### Art Type Filter
- Click any art type chip to filter posts
- Multiple selections = show ONLY posts with ALL selected types
- Click again to remove filter

### Advanced Search

#### Multi-Criteria Search Example
```
Search Box: "sunset beach"
Location: "california"
Art Type: Photography

Result: Only photography posts about sunset beaches in California
```

#### Search Tips
- Use specific keywords for better results
- Combine search terms with spaces (e.g., "san francisco")
- Use location filter to narrow results by geography
- Select art types to focus on specific categories

### Clear Filters
Click "Clear All Filters" button to reset all search criteria

---

## For Developers

### How to Ensure Your Posts/Users Are Searchable

1. **When Creating Posts** (in CreatePost.jsx)
   ```javascript
   import { generateSearchKeywords } from '../utils/searchKeywords';
   
   // Build search keywords
   const searchKeywords = [
       ...generateSearchKeywords(title),
       ...generateSearchKeywords(authorName),
       ...tags.map(t => t.toLowerCase()),
       ...generateSearchKeywords(location.city),
       ...generateSearchKeywords(location.state),
       ...generateSearchKeywords(location.country)
   ];
   
   // Save with post
   await addDoc(collection(db, 'posts'), {
       ...postData,
       searchKeywords: [...new Set(searchKeywords)]
   });
   ```

2. **When Creating Users** (in Auth.jsx or profile creation)
   ```javascript
   import { generateUserSearchKeywords } from '../utils/searchKeywords';
   
   // Generate keywords
   const searchKeywords = generateUserSearchKeywords({
       displayName: user.displayName,
       email: user.email,
       bio: user.bio,
       artTypes: user.artTypes
   });
   
   // Save with user
   await setDoc(doc(db, 'users', user.uid), {
       ...userData,
       searchKeywords
   });
   ```

### Backfill Existing Data

If you have posts/users without `searchKeywords`:

```javascript
// In browser console after logging in
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const regenerate = httpsCallable(functions, 'regenerateSearchKeywords');

// For posts
await regenerate({ collection: 'posts', limit: 100 });

// For users
await regenerate({ collection: 'users', limit: 100 });

// Run multiple times if you have more than 100 documents
```

---

## Troubleshooting

### "No Results Found"

**Possible Causes:**
1. No posts/users match your criteria
2. Posts/users missing `searchKeywords` field
3. Firestore indexes not built

**Solutions:**
1. Try broader search terms
2. Run `regenerateSearchKeywords` Cloud Function
3. Check Firebase Console for index build status

### Search is Slow

**Causes:**
- Large dataset without indexes
- Too many documents fetched

**Solutions:**
1. Create Firestore composite indexes (see SEARCH_SYSTEM.md)
2. Enable Algolia for instant search
3. Reduce search result limit

### Multi-Word Search Not Working

**This is expected behavior:**
- First word queries Firestore
- Additional words filter client-side
- For better multi-word search, enable Algolia

---

## Search Examples

### Find Photographers Named "John"
```
Tab: Artists
Search: john
```

### Find Landscape Photography in California
```
Tab: Posts
Search: (empty)
Location: california
Art Type: [Photography, Landscape]
```

### Find Posts About "Sunset"
```
Tab: Posts
Search: sunset
```

### Find Posts by a Specific Artist
```
Tab: Posts
Search: [artist name]
```

### Browse All Photography
```
Tab: Posts
Search: (empty)
Art Type: [Photography]
```

---

## Performance Tips

1. **Be Specific:** More specific keywords = faster results
2. **Use Filters:** Art type and location filters narrow results efficiently
3. **Clear Old Filters:** Remove filters you're not using
4. **Tab Selection:** Search "Posts" or "Artists" specifically instead of "All"

---

**Need More Help?**
- Read full documentation: `SEARCH_SYSTEM.md`
- Check implementation details: `SEARCH_IMPLEMENTATION_SUMMARY.md`
- View source code: `src/pages/Search.jsx`

---

**Search System Version:** 1.0.0  
**Last Updated:** 2025-11-21
