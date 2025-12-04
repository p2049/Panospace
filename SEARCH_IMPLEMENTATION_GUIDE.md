# PanoSpace Search Microservice - Implementation Guide

## 🎯 Overview

This document outlines the implementation of a scalable search microservice for PanoSpace, designed to handle 100k+ users and scale to millions.

## 📊 Current State vs Target State

### Current (Broken at Scale)
```
❌ Firestore array-contains (1 field limit)
❌ Client-side filtering (doesn't scale)
❌ No typo tolerance
❌ No relevance scoring
❌ Scattered logic (useSearch, filters, helpers)
❌ Optional Algolia (inconsistent)
```

### Target (Production Ready)
```
✅ Algolia primary (instant, typo-tolerant)
✅ Firestore fallback (free, reliable)
✅ In-memory cache (hot queries)
✅ Unified SearchService API
✅ Real-time sync (Cloud Functions)
✅ Metrics & monitoring
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           SearchService (Unified API)        │
│  - Automatic provider selection              │
│  - Caching layer                             │
│  - Metrics tracking                          │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Algolia  │  │Firestore │  │  Cache   │
│ Provider │  │ Provider │  │ Provider │
│(Primary) │  │(Fallback)│  │ (Speed)  │
└──────────┘  └──────────┘  └──────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
        ┌───────────────────────┐
        │   Cloud Functions     │
        │   (Real-time Sync)    │
        └───────────────────────┘
```

## 📁 File Structure

```
/src/core/search/
├── index.js                      # Main export
├── SearchService.js              # Unified search API
├── architecture.js               # Config & strategy
├── providers/
│   ├── AlgoliaProvider.js       # Primary search
│   ├── FirestoreProvider.js     # Fallback search
│   └── CacheProvider.js         # Performance cache
└── sync/
    ├── algoliaSync.js           # Cloud Function
    └── indexConfig.js           # Algolia index setup
```

## 🚀 Implementation Steps

### Phase 1: Setup (Week 1)

#### 1.1 Create Algolia Account
```bash
# Sign up at algolia.com
# Free tier: 10k records, 10k searches/month
```

#### 1.2 Configure Environment
```env
# .env
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
VITE_ALGOLIA_ADMIN_KEY=your_admin_key  # Server-side only
```

#### 1.3 Install Dependencies
```bash
npm install algoliasearch
```

#### 1.4 Create Algolia Indices
```javascript
// Run once to set up indices
import { SEARCH_INDICES } from '@/core/search/architecture';

async function setupIndices() {
    const client = algoliasearch(APP_ID, ADMIN_KEY);
    
    for (const config of Object.values(SEARCH_INDICES)) {
        const index = client.initIndex(config.name);
        
        await index.setSettings({
            searchableAttributes: config.searchableAttributes,
            attributesForFaceting: config.attributesForFaceting,
            customRanking: config.customRanking
        });
        
        console.log(`✅ Configured index: ${config.name}`);
    }
}
```

### Phase 2: Sync Setup (Week 1-2)

#### 2.1 Create Cloud Function for Real-time Sync
```javascript
// functions/algoliaSync.js
import * as functions from 'firebase-functions';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(APP_ID, ADMIN_KEY);

// Sync posts to Algolia
export const syncPostToAlgolia = functions.firestore
    .document('posts/{postId}')
    .onWrite(async (change, context) => {
        const postId = context.params.postId;
        const index = client.initIndex('posts');

        // Delete
        if (!change.after.exists) {
            await index.deleteObject(postId);
            return;
        }

        // Create or Update
        const post = change.after.data();
        const algoliaObject = {
            objectID: postId,
            title: post.title,
            tags: post.tags || [],
            authorName: post.authorName,
            uid: post.uid,
            location: post.location,
            parkId: post.parkId,
            parkName: post.parkName,
            camera: post.camera,
            film: post.film,
            orientation: post.orientation,
            aspectRatio: post.aspectRatio,
            safe: post.safe,
            shopEnabled: post.shopEnabled,
            likesCount: post.likesCount || 0,
            commentsCount: post.commentsCount || 0,
            createdAt: post.createdAt?.toMillis() || Date.now(),
            capturedAt: post.capturedAt?.toMillis() || null
        };

        await index.saveObject(algoliaObject);
    });

// Similar functions for users, galleries, collections, etc.
```

#### 2.2 Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Phase 3: Backfill Existing Data (Week 2)

#### 3.1 Export Firestore Data
```javascript
// scripts/backfillAlgolia.js
import { db } from '../firebase';
import algoliasearch from 'algoliasearch';

async function backfillPosts() {
    const client = algoliasearch(APP_ID, ADMIN_KEY);
    const index = client.initIndex('posts');
    
    const snapshot = await db.collection('posts').get();
    const objects = snapshot.docs.map(doc => ({
        objectID: doc.id,
        ...transformPostForAlgolia(doc.data())
    }));

    // Batch upload (1000 at a time)
    for (let i = 0; i < objects.length; i += 1000) {
        const batch = objects.slice(i, i + 1000);
        await index.saveObjects(batch);
        console.log(`Uploaded ${i + batch.length}/${objects.length}`);
    }
}

backfillPosts();
```

### Phase 4: Integration (Week 3)

#### 4.1 Update useSearch Hook
```javascript
// hooks/useSearch.js
import { getSearchService } from '@/core/search';

export const useSearch = () => {
    const searchService = getSearchService();

    const searchPosts = async (query, filters = {}) => {
        const results = await searchService.search(query, {
            index: 'posts',
            filters,
            hitsPerPage: 20
        });
        
        return results;
    };

    const searchUsers = async (query, filters = {}) => {
        const results = await searchService.search(query, {
            index: 'users',
            filters,
            hitsPerPage: 20
        });
        
        return results;
    };

    return {
        searchPosts,
        searchUsers,
        // ... other methods
    };
};
```

#### 4.2 Update Search Components
```javascript
// pages/Search.jsx
import { search, suggest } from '@/core/search';

const Search = () => {
    const handleSearch = async (query) => {
        const results = await search(query, {
            index: 'posts',
            filters: selectedFilters,
            sort: sortBy,
            page: currentPage
        });
        
        setPosts(results.hits);
        setTotalResults(results.nbHits);
    };

    const handleAutocomplete = async (query) => {
        const suggestions = await suggest(query, {
            index: 'posts',
            maxSuggestions: 5
        });
        
        setSuggestions(suggestions);
    };

    // ...
};
```

### Phase 5: Monitoring (Week 4)

#### 5.1 Add Analytics Dashboard
```javascript
// components/admin/SearchAnalytics.jsx
import { getSearchMetrics, getSearchHealth } from '@/core/search';

const SearchAnalytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [health, setHealth] = useState(null);

    useEffect(() => {
        const loadMetrics = async () => {
            setMetrics(getSearchMetrics());
            setHealth(await getSearchHealth());
        };
        
        loadMetrics();
        const interval = setInterval(loadMetrics, 60000); // Every minute
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>Search Performance</h2>
            <p>Total Searches: {metrics?.totalSearches}</p>
            <p>Cache Hit Rate: {metrics?.cacheHitRate}</p>
            <p>Avg Query Time: {metrics?.avgQueryTime}ms</p>
            <p>Algolia Usage: {metrics?.algoliaUsage}</p>
            <p>Status: {health?.status}</p>
        </div>
    );
};
```

## 💰 Cost Analysis

### Algolia Pricing (2024)
- **Free Tier**: 10k records, 10k searches/month
- **Growth**: $1/1000 records, $0.50/1000 searches
- **Estimated at 100k users**:
  - 1M posts = $1000/month
  - 1M searches = $500/month
  - **Total: ~$1500/month**

### Firestore (Current)
- 1M searches × 50 reads = 50M reads
- **Cost: ~$30/month**

### Hybrid Approach
- Algolia for 90% of searches (fast, good UX)
- Firestore for 10% fallback
- **Total: ~$1400/month**

### ROI Justification
- **User Retention**: Fast search = better UX = more engagement
- **Conversion**: Better discovery = more shop sales
- **Scale**: Algolia handles billions, Firestore doesn't
- **Time Saved**: No custom search infrastructure

## 📈 Performance Targets

| Metric | Current | Target | Algolia |
|--------|---------|--------|---------|
| Query Time | 500-2000ms | <100ms | <10ms |
| Typo Tolerance | None | Yes | Yes |
| Relevance | Poor | Good | Excellent |
| Facets | Manual | Auto | Auto |
| Scale Limit | 10k users | 1M+ users | Billions |

## 🔄 Migration Checklist

- [ ] Create Algolia account
- [ ] Configure indices
- [ ] Set up Cloud Functions
- [ ] Backfill existing data
- [ ] Update useSearch hook
- [ ] Update Search components
- [ ] Add caching layer
- [ ] Implement analytics
- [ ] A/B test performance
- [ ] Full rollout

## 🚨 Rollback Plan

If Algolia fails:
1. SearchService automatically falls back to Firestore
2. No user-facing errors
3. Slightly slower, but functional
4. Monitor metrics to detect issues

## 📚 Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Search Best Practices](https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/how-to/best-practices/)

## 🎓 Training

### For Developers
- SearchService API is drop-in replacement
- Same interface as before
- Automatic provider selection
- Metrics built-in

### For Users
- Instant results
- Typo tolerance
- Better relevance
- Faceted filtering
- No changes needed

---

**Status**: Architecture complete, ready for implementation
**Timeline**: 4 weeks to full rollout
**Risk**: Low (fallback to Firestore built-in)
**ROI**: High (better UX = more engagement)
