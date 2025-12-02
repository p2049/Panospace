# Migration Guide: Legacy to Modern Architecture

## Overview

This guide helps you migrate from the old codebase structure to the new domain-driven architecture.

## Phase 1: Install Dependencies

```bash
# Install new dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..

# Install Playwright for E2E tests
npx playwright install
```

## Phase 2: Update Imports

### Before (Old)
```javascript
import { calculateEarnings } from '../utils/printfulApi';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const createPost = async () => {
  await addDoc(collection(db, 'posts'), data);
};
```

### After (New)
```typescript
import { createPost } from '@/domain/posts/service';
import { calculateEarnings } from '@/domain/shop/pricing';
import { formatPrice } from '@/utils/helpers';

const handleCreatePost = async () => {
  const result = await createPost(userId, userName, userPhoto, formData);
};
```

## Phase 3: Update Components

### Example: Feed Component

**Before:**
```jsx
const [posts, setPosts] = useState([]);

useEffect(() => {
  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };
  fetchPosts();
}, []);
```

**After:**
```tsx
import { getRecentPosts } from '@/domain/posts/service';
import { rankPostsForUser } from '@/domain/feed/score';

const [posts, setPosts] = useState<Post[]>([]);

useEffect(() => {
  const fetchAndRankPosts = async () => {
    const { posts: fetchedPosts } = await getRecentPosts(10);
    const rankedPosts = rankPostsForUser(fetchedPosts, currentUser);
    setPosts(rankedPosts);
  };
  fetchAndRankPosts();
}, [currentUser]);
```

### Example: ShopItemDetail

**Before:**
```jsx
<div>${size.price.toFixed(2)}</div> {/* ❌ Can crash if price is undefined */}
```

**After:**
```tsx
import { formatPrice } from '@/utils/helpers';

<div>{formatPrice(size.price)}</div> {/* ✅ Safe, always works */}
```

## Phase 4: Replace Utilities

### Old Files to Remove
- `src/utils/printfulApi.js` → Use `@/domain/shop/pricing.ts` instead
- Manual Firestore calls in components → Use domain services

### New Files to Use
- `@/domain/posts/service.ts` - All post operations
- `@/domain/shop/service.ts` - All shop operations
- `@/domain/search/keywords.ts` - Search keyword generation
- `@/domain/feed/score.ts` - Feed ranking
- `@/utils/helpers.ts` - Safe utility functions

## Phase 5: Update Cloud Functions

### Old Structure
```
functions/
  index.js (monolith - 500+ lines)
```

### New Structure
```
functions/
  src/
    posts.ts
    stripe.ts
    printful.ts
    likes.ts
    search.ts
    shared/
      keywords.ts
  index.ts (exports only)
```

### Migration Steps
1. Copy `functions/src/` folder from new structure
2. Update `functions/index.ts` to use new exports
3. Run `cd functions && npm run build`
4. Test locally: `npm run serve`
5. Deploy: `npm run deploy`

## Phase 6: Add TypeScript Gradually

You don't need to convert everything at once. Start with:

1. **New files**: Write in `.ts` or `.tsx`
2. **Domain services**: Already TypeScript
3. **Critical components**: Convert high-risk components first
4. **Utilities**: Convert shared utilities

## Phase 7: Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Required indexes are in `firestore.indexes.json`.

## Phase 8: Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Common Migration Issues

### Issue 1: Import Errors
**Problem:** `Module not found: @/domain/...`

**Solution:** Ensure `tsconfig.json` and `vite.config.ts` have path aliases configured.

### Issue 2: TypeScript Errors
**Problem:** `Property 'price' does not exist on type 'PrintSize | undefined'`

**Solution:** Use safe helpers:
```typescript
const price = formatPrice(size?.price);  // ✅ Safe
// NOT: size.price.toFixed(2)  // ❌ Unsafe
```

### Issue 3: Firebase Type Errors
**Problem:** `Timestamp is not assignable to Date`

**Solution:** Import from correct package:
```typescript
import { Timestamp } from 'firebase/firestore';  // ✅ Client SDK
// NOT from 'firebase-admin'  // ❌ Admin SDK (functions only)
```

## Verification Checklist

After migration, verify:

- [ ] App builds without errors: `npm run build`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Dev server runs: `npm run dev`
- [ ] Functions build: `cd functions && npm run build`
- [ ] Can create post with images
- [ ] Can add images to shop
- [ ] Search works
- [ ] Feed shows personalized results
- [ ] Checkout flow works

## Rollback Plan

If issues arise:

1. **Frontend:** The new code is backward-compatible. Old Firestore structure still works.
2. **Functions:** Deploy old `functions/index.js` if needed:
   ```bash
   git checkout main -- functions/index.js
   cd functions && npm run deploy
   ```
3. **Database:** No schema changes required. All queries are compatible.

## Support

Questions? Check:
- `docs/ARCHITECTURE.md` - System overview
- `src/types/index.ts` - Data models
- `src/domain/**/*.ts` - Business logic with JSDoc comments

---

**Migration Timeline:** 1-2 hours for full conversion  
**Recommended Approach:** Incremental - migrate one feature area at a time  
**Risk Level:** Low - All changes are backward-compatible
