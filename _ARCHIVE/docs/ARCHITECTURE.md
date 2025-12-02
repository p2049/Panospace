# Panospace Architecture Documentation

## 🏗️ System Overview

Panospace is a production-grade social platform and marketplace for visual artists built on modern web technologies with enterprise-level architecture patterns.

### Core Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Payments**: Stripe Checkout + Webhooks
- **Print-on-Demand**: Printful API
- **Search**: Firestore indexed queries + optional Algolia

### Key Features
1. **Multi-Image Posts** - Up to 10 images per post with EXIF metadata
2. **Shop System** - Per-image print sales with custom pricing
3. **Personalized Feed** - Discipline-based ranking algorithm
4. **Search** - Users and posts by keywords, tags, location
5. **Artist Profiles** - Disciplines, bio, portfolio grid

---

## 📁 Project Structure

```
panospace/
├── src/
│   ├── domain/              # Business logic & data access (NEW)
│   │   ├── posts/           # Post creation, updates, queries
│   │   ├── shop/            # Shop items, pricing, earnings
│   │   ├── users/           # User profiles, disciplines
│   │   ├── feed/            # Feed ranking & scoring
│   │   └── search/          # Search strategies & indexing
│   ├── components/          # React components
│   ├── pages/               # Route-level components
│   ├── hooks/               # React hooks (UI logic only)
│   ├── utils/               # Pure utility functions
│   ├── constants/           # Static data & config
│   ├── context/             # React context providers
│   └── types/               # TypeScript definitions (NEW)
├── functions/               # Cloud Functions (modular)
│   ├── src/
│   │   ├── posts/           # Post triggers & indexing
│   │   ├── stripe/          # Payment processing
│   │   ├── printful/        # POD integration
│   │   └── shared/          # Shared utilities
│   └── index.ts             # Functions entry point
└── docs/                    # Architecture & design docs
```

---

## 🎨 Design Principles

### 1. Domain-Driven Design
- **Separation of Concerns**: UI components don't touch Firestore directly
- **Service Layer**: All data access goes through domain services
- **Type Safety**: Strong TypeScript types for all data models
- **Testability**: Pure functions and injectable dependencies

### 2. Data Flow
```
Component → Hook → Service → Firestore
                    ↓
                  Types
```

Example:
```typescript
// ❌ OLD (Component touches Firestore)
const createPost = async () => {
  const docRef = await addDoc(collection(db, 'posts'), data);
}

// ✅ NEW (Component uses service)
const createPost = async () => {
  const post = await postsService.create(postData);
}
```

### 3. Error Handling Strategy
- **No alerts()**: Use toast notifications
- **Loading states**: Every async operation has clear UI feedback
- **Error boundaries**: Catch and display errors gracefully
- **Defensive coding**: Null checks, default values, safe navigation

### 4. Performance
- **Code splitting**: Lazy-loaded routes
- **Memoization**: React.memo, useMemo, useCallback where beneficial
- **Indexed queries**: All Firestore queries use composite indexes
- **Optimistic updates**: Immediate UI feedback before server confirmation

---

## 🔐 Security Model

### Firestore Security Rules
- **Authentication**: All writes require `request.auth != null`
- **Authorization**: Users can only edit their own content
- **Validation**: Server-side validation of all data shapes
- **Rate Limiting**: Implemented via Cloud Functions

### Environment Variables
```env
# Frontend (.env)
VITE_FIREBASE_API_KEY=...
VITE_STRIPE_PUBLIC_KEY=...
VITE_ALGOLIA_APP_ID=...
VITE_ALGOLIA_SEARCH_KEY=...

# Backend (functions/.env)
STRIPE_SECRET_KEY=...
PRINTFUL_API_KEY=...
ALGOLIA_ADMIN_KEY=...
```

---

## 📊 Data Models

### Post
```typescript
interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  description?: string;
  items: PostItem[];
  tags: string[];
  location?: Location;
  searchKeywords: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

interface PostItem {
  type: 'image' | 'text';
  url?: string;
  text?: string;
  exif?: ExifData;
  addToShop: boolean;
  printSizes?: string[];
  customPrices?: Record<string, number>;
}
```

### ShopItem
```typescript
interface ShopItem {
  id: string;
  authorId: string;
  postRef: string;
  imageUrl: string;
  title: string;
  tags: string[];
  printSizes: PrintSize[];
  podVariants?: PodVariant[];
  createdAt: Timestamp;
}

interface PrintSize {
  id: string;
  label: string;
  price: number;  // Always in dollars (e.g., 24.99)
  artistEarningsCents: number;
  platformFeeCents: number;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  disciplines?: {
    main: string[];
    niches: Record<string, string[]>;
  };
  searchKeywords: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔄 Key Workflows

### 1. Create Multi-Image Post with Shop Items

```typescript
// User Flow:
// 1. Upload 5 images
// 2. Select 3 to add to shop
// 3. Set custom prices for specific sizes
// 4. Submit post

// System Flow:
async function handleCreatePost(formData: PostFormData) {
  // 1. Upload images to Storage
  const uploadedItems = await Promise.all(
    formData.files.map(file => uploadImage(file, extractExif))
  );

  // 2. Create post document
  const post = await postsService.create({
    ...formData,
    items: uploadedItems,
  });

  // 3. Create shop items for selected images
  const shopItems = await shopService.createFromPost(
    post,
    uploadedItems.filter(item => item.addToShop)
  );

  // 4. Trigger POD product creation (Cloud Function)
  // Auto-triggered by Firestore onCreate

  return { post, shopItems };
}
```

### 2. Personalized Feed Ranking

```typescript
// Feed scoring algorithm (src/domain/feed/score.ts)
function calculatePostScore(post: Post, user: User): number {
  let score = 0;

  // Recency (base score)
  const ageHours = (Date.now() - post.createdAt.toMillis()) / (1000 * 60 * 60);
  score += Math.max(0, 100 - ageHours);

  // Following boost
  if (user.followingIds?.includes(post.authorId)) {
    score += 500;
  }

  // Discipline match
  const userDisciplines = user.disciplines?.main || [];
  const postTags = post.tags || [];
  const matchCount = userDisciplines.filter(d => 
    postTags.some(tag => tag.toLowerCase().includes(d.toLowerCase()))
  ).length;
  score += matchCount * 200;

  // Engagement boost
  score += (post.likesCount || 0) * 2;
  score += (post.commentsCount || 0) * 5;

  return score;
}
```

### 3. Shop Item Purchase Flow

```typescript
// User clicks "Buy Print" → ShopItemDetail page
// 1. Select size and quantity
// 2. Click "Checkout" button
// 3. Cloud Function creates Stripe Checkout session
// 4. User completes payment on Stripe
// 5. Webhook processes payment, creates order, triggers Printful

// Functions flow:
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { shopItemId, sizeId } = data;
  
  // Fetch shop item
  const shopItem = await shopService.getById(shopItemId);
  const size = shopItem.printSizes.find(s => s.id === sizeId);
  
  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(size.price * 100),
        product_data: { name: `${size.label} Print` }
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/${shopItemId}`,
    metadata: { shopItemId, sizeId, userId: context.auth.uid }
  });
  
  return { url: session.url };
});
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Domain services**: Mock Firestore, test business logic
- **Utilities**: Pure function testing (pricing, keywords, scoring)
- **Hooks**: Test with React Testing Library + mocked services

### Integration Tests
- **Create Post flow**: End-to-end with Firebase emulators
- **Search**: Test all query combinations
- **Feed ranking**: Test scoring with various user/post combinations

### E2E Tests (Playwright)
```typescript
test('User can create post and publish to shop', async ({ page }) => {
  await page.goto('/login');
  await login(page, testUser);
  
  await page.goto('/create');
  await uploadImages(page, ['img1.jpg', 'img2.jpg']);
  await toggleShop(page, 0); // Add first image to shop
  await setPrice(page, '8x10', 29.99);
  await page.click('button:has-text("Publish")');
  
  await expect(page).toHaveURL(/\/post\/.+/);
  
  // Verify shop item created
  await page.goto(`/profile/${testUser.uid}`);
  await page.click('button:has-text("Shop")');
  await expect(page.locator('.shop-item')).toHaveCount(1);
});
```

---

## 🚀 Deployment

### Production Checklist
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Firestore indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Cloud Functions deployed (`firebase deploy --only functions`)
- [ ] Security rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Environment variables set in Firebase
- [ ] Stripe webhooks configured
- [ ] Error monitoring enabled (Sentry)

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## 📚 Additional Documentation

- [Feed Ranking Algorithm](./feed-ranking.md)
- [Search Strategy](./search-strategy.md)
- [Shop & Pricing](./shop-pricing.md)
- [Data Migration Guide](./migrations.md)

---

**Last Updated**: 2025-11-22  
**Version**: 2.0.0  
**Status**: Production Ready 🚀
