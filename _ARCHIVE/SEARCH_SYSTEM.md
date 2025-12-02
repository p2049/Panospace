# 🔍 Panospace Search System Documentation

## Overview

The Panospace search system provides comprehensive search functionality across **posts** and **users** with support for:
- **Keyword search** (title, tags, author names)
- **Location filtering** (city, state, country)
- **Art type filtering** (Photography, Painting, Digital Art, etc.)
- **Tag search** (exact and partial matching)
- **Combined multi-criteria search**
- **Prefix-based fuzzy matching**

## Architecture

### Components

1. **src/pages/Search.jsx** - Main search UI component
2. **src/utils/searchKeywords.js** - Search keyword generation utilities
3. **src/services/algolia.js** - Algolia integration with Firestore fallback
4. **functions/src/index.ts** - Cloud Functions for automatic indexing

### Search Flow

```
User Input → Debounce (400ms) → Firestore Query → Client-Side Filtering → Results Display
                                       ↓
                              (Fallback to Algolia if configured)
```

## How Search Works

### 1. User Search

**Firestore Queries:**
- Primary: `displayName` prefix search (`>=` and `<=`)
- Fallback: `searchKeywords` array-contains search

**Searchable Fields:**
- displayName
- email (prefix before @)
- bio
- artTypes
- searchKeywords

**Example:**
```javascript
// Searching for "john"
query(
    collection(db, 'users'),
    where('displayName', '>=', 'john'),
    where('displayName', '<=', 'john\uf8ff'),
    orderBy('displayName'),
    limit(20)
)
```

### 2. Post Search

**Firestore Queries:**
- Art Type Filter: `tags` array-contains (primary)
- Keyword Search: `searchKeywords` array-contains
- Recent Posts: `createdAt` orderBy (if no filters)

**Searchable Fields:**
- title
- authorName
- tags
- location (city, state, country)
- searchKeywords

**Example:**
```javascript
// Searching for "sunset california"
query(
    collection(db, 'posts'),
    where('searchKeywords', 'array-contains', 'sunset'),
    orderBy('createdAt', 'desc'),
    limit(50)
)
// Then client-side filter for "california"
```

### 3. Search Keywords Generation

Search keywords are prefix-based arrays that enable fuzzy matching:

```javascript
// Input: "San Francisco Sunset"
// Output: [
//   "san", "sa", "francisco", "fr", "fra", "fran", ...,
//   "sunset", "su", "sun", "suns", "sunse"
// ]
```

**How it works:**
1. Split text by spaces and punctuation
2. Convert to lowercase
3. For each word, generate all prefixes (minimum 2 characters)
4. Store in Firestore as an array

## Usage Examples

### Basic Search
```javascript
// User types "landscape"
// System searches:
// - Posts with "landscape" in title/tags/keywords
// - Users with "landscape" in name/bio
```

### Art Type Filter
```javascript
// User selects "Photography" art type
// System queries:
query(posts, where('tags', 'array-contains', 'Photography'))
// Then filters by additional search terms client-side
```

### Location Search
```javascript
// User enters location "Chicago"
// System filters posts client-side:
posts.filter(post =>
    post.location?.city?.includes('chicago') ||
    post.location?.state?.includes('chicago') ||
    post.location?.country?.includes('chicago')
)
```

### Combined Search
```javascript
User Input: "sunset" + Location: "california" + Art Type: "Photography"

1. Query: where('tags', 'array-contains', 'Photography')
2. Client filter: searchKeywords contains "sunset"
3. Client filter: location contains "california"
```

## Firestore Indexes Required

Create these composite indexes in Firebase Console:

```
Collection: posts
- tags (Array) + createdAt (Descending)
- searchKeywords (Array) + createdAt (Descending)

Collection: users
- searchKeywords (Array) + displayName (Ascending)
```

To create indexes:
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add the fields and directions as shown above

## Cloud Functions

### onPostCreate
Automatically generates search keywords when a new post is created.

**What it does:**
- Extracts keywords from title, authorName, tags, location
- Creates prefix-based keyword array
- Updates post document with searchKeywords field

### onUserCreate
Automatically generates search keywords when a new user signs up.

**What it does:**
- Extracts keywords from displayName, email, bio, artTypes
- Creates prefix-based keyword array
- Updates user document with searchKeywords field

### regenerateSearchKeywords
Callable function to backfill search keywords for existing documents.

**Usage:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const regenerateKeywords = httpsCallable(functions, 'regenerateSearchKeywords');

// Regenerate for posts
await regenerateKeywords({ collection: 'posts', limit: 100 });

// Regenerate for users
await regenerateKeywords({ collection: 'users', limit: 100 });
```

## Performance Optimization

### Client-Side Filtering
To work around Firestore's limitation of 1 array-contains per query, we use:
- **Server-side**: Single array-contains query (most selective filter)
- **Client-side**: Additional filtering for multiple criteria

This approach:
✅ Works within Firestore constraints
✅ Provides rich multi-criteria search
✅ Maintains fast initial query
⚠️ Requires fetching more documents than final result count

### Pagination
- Fetches 50 posts / 20 users per query
- Uses `startAfter` for "Load More" pagination
- Tracks `lastDoc` cursor for efficient pagination

### Debouncing
- 400ms debounce on search input
- Prevents excessive Firestore reads
- Improves user experience

## Algolia Integration (Optional)

If Algolia is configured (environment variables set), it provides:
- Full-text search (better than prefix matching)
- Typo tolerance
- Faceted search
- Instant search
- Geo-search capabilities

**Setup:**
1. Create an Algolia account
2. Set environment variables:
   ```
   VITE_ALGOLIA_APP_ID=your_app_id
   VITE_ALGOLIA_SEARCH_KEY=your_search_key
   ```
3. Index posts/users in Algolia (use Cloud Functions or batch script)

The system automatically falls back to Firestore if Algolia is unavailable.

## Testing the Search System

### Test Scenarios

1. **User Search:**
   ```
   - Search "john" → Should find users with "John" in displayName
   - Search partial name → Should use prefix matching via searchKeywords
   ```

2. **Post Title Search:**
   ```
   - Search "sunset" → Should find posts with "sunset" in title
   - Search multi-word → Should match all words
   ```

3. **Tag Search:**
   ```
   - Search "landscape" → Should find posts tagged "landscape"
   - Select art type → Should filter by exact tag match
   ```

4. **Location Search:**
   ```
   - Enter "Chicago" in location filter → Only posts from Chicago
   - Enter "California" → Posts from California cities
   ```

5. **Combined Search:**
   ```
   - Search: "beach" + Location: "miami" + Art Type: "Photography"
   - Should return only photography posts about beaches in Miami
   ```

### Create Test Data

Run this in your browser console after logging in:

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Create test posts
const testPosts = [
    {
        title: "Sunset in San Francisco",
        authorName: "John Doe",
        tags: ["Photography", "Landscape"],
        location: { city: "San Francisco", state: "California", country: "USA" },
        searchKeywords: ["sunset", "san", "francisco", "john", "photography", "landscape"]
    },
    {
        title: "Chicago Skyline at Night",
        authorName: "Jane Smith",
        tags: ["Photography", "Urban"],
        location: { city: "Chicago", state: "Illinois", country: "USA" },
        searchKeywords: ["chicago", "skyline", "night", "jane", "photography", "urban"]
    }
];

for (const post of testPosts) {
    await addDoc(collection(db, 'posts'), post);
}
```

## Troubleshooting

### Search Returns No Results

**Possible Causes:**
1. Missing searchKeywords field → Run `regenerateSearchKeywords` Cloud Function
2. Missing Firestore index → Check Firebase Console for index warnings
3. Incorrect query constraints → Check browser console for Firestore errors

**Solution:**
```javascript
// Check if searchKeywords exist
const post = await getDoc(doc(db, 'posts', 'POST_ID'));
console.log('searchKeywords:', post.data().searchKeywords);

// If null/undefined, regenerate
await regenerateKeywords({ collection: 'posts' });
```

### Search is Slow

**Causes:**
- Large dataset without indexes
- Too many client-side filters
- No pagination

**Solutions:**
1. Create composite indexes (see above)
2. Reduce fetch limit from 50 to 20
3. Consider Algolia for large datasets (>10,000 posts)

### Multi-Word Search Not Working

**Cause:** Firestore only supports one array-contains per query

**Solution:** This is working as designed:
1. Server queries with first word
2. Client filters for additional words
3. If no results, try Algolia integration

## Best Practices

1. **Always Generate Keywords:** Ensure `searchKeywords` is populated for all posts/users
2. **Use Debouncing:** Don't query on every keystroke
3. **Limit Results:** Fetch 20-50 documents max per query
4. **Client-Side Filter:** Use for secondary criteria
5. **Enable Algolia:** For large-scale production apps
6. **Test Regularly:** Verify search works after schema changes

## Future Enhancements

- [ ] Autocomplete suggestions
- [ ] Search history
- [ ] Popular searches
- [ ] Advanced filters (date range, like count)
- [ ] Saved searches
- [ ] Search analytics

---

**Last Updated:** 2025-11-21
**Version:** 1.0.0
