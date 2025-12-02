# PanoSpace Deployment Guide

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** initialized:
   ```bash
   firebase login
   firebase use --add
   ```

3. **Environment Variables** configured (see Configuration section below)

---

## PART 1: Configuration

### 1.1 Create `.env` file (REQUIRED)

Create `c:\Users\pjadl\Panospace\.env`:

```env
# Firebase (auto-configured from src/firebase.js)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Algolia Search (OPTIONAL - app works without this)
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_SEARCH_KEY=your_algolia_search_only_key

# Google Places API (for location autocomplete - FUTURE)
VITE_GOOGLE_PLACES_API_KEY=your_google_places_key
```

### 1.2 Configure Firebase Functions Environment

```bash
# Set Algolia credentials (OPTIONAL)
firebase functions:config:set algolia.app_id="YOUR_ALGOLIA_APP_ID"
firebase functions:config:set algolia.admin_key="YOUR_ALGOLIA_ADMIN_KEY"

# Set Printful API key (OPTIONAL - mock mode works without this)
firebase functions:config:set printful.api_key="YOUR_PRINTFUL_API_KEY"

# View current config
firebase functions:config:get
```

---

## PART 2: Deployment Steps

### Step 1: Install Dependencies

```bash
# Frontend dependencies (if not done)
npm install

# Backend/Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Deploy Firestore Security Rules & Indexes

```bash
# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# This will:
# - Update security rules from firestore.rules
# - Create composite indexes from firestore.indexes.json
# - May take 5-10 minutes for indexes to build
```

**Expected Output:**
```
✔  firestore: released rules firestore.rules to cloud.firestore
✔  firestore: deployed indexes in firestore.indexes.json successfully
```

### Step 3: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# OR deploy specific functions
firebase deploy --only functions:onPostCreate,functions:onPostUpdate,functions:onPostDelete
```

**Expected Output:**
```
✔  functions[onPostCreate(us-central1)] Successful create operation.
✔  functions[onPostUpdate(us-central1)] Successful create operation.
✔  functions[onPostDelete(us-central1)] Successful create operation.
✔  functions[createPodProduct(us-central1)] Successful create operation.
✔  functions[getPrintfulCheckoutUrl(us-central1)] Successful create operation.
✔  functions[onLikeCreate(us-central1)] Successful create operation.
✔  functions[onLikeDelete(us-central1)] Successful create operation.
```

### Step 4: Deploy Frontend (Hosting)

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Expected Output:**
```
✔  hosting[your-app]: file upload complete
✔  hosting[your-app]: version finalized
✔  hosting[your-app]: release complete

Project Console: https://console.firebase.google.com/project/your-app/overview
Hosting URL: https://your-app.web.app
```

### Step 5: Verify Deployment

```bash
# Open your app
firebase open hosting:site

# View function logs
firebase functions:log

# Check Firestore indexes status
firebase firestore:indexes
```

---

## PART 3: Testing Deployment

### 3.1 Quick Smoke Test

1. **Open App**: Navigate to your hosting URL
2. **Login**: Create account or sign in
3. **Create Post**: 
   - Upload an image
   - Add title and tags
   - Submit
4. **Verify Backend**:
   - Check Firebase Console → Firestore → posts collection
   - Verify `searchKeywords` array was auto-generated
   - Check `likeCount` initialized to 0

### 3.2 Test Cloud Functions

**Test onPostCreate:**
```bash
# In Firebase Console → Firestore → posts
# Create a test post, then check Functions logs:
firebase functions:log --only onPostCreate

# Should see: "Post created: [postId]"
# Should see: "Post [postId] indexed in Algolia" (if configured)
```

**Test Algolia Indexing (if configured):**
```bash
# Check Algolia dashboard
# Should see new object with postId, title, tags, etc.
```

**Test POD Product Creation:**
```javascript
// In browser console on your app:
const { httpsCallable } = firebase.functions();
const createProduct = httpsCallable('createPodProduct');

createProduct({
  shopItemId: 'test123',
  imageUrl: 'https://example.com/image.jpg',
  title: 'Test Print',
  description: 'Test'
}).then(result => console.log(result));

// Should return: { success: true, productId: 'mock_...', mode: 'mock' }
```

---

## PART 4: Rollback Plan

### If Deployment Fails:

**Rollback Functions:**
```bash
# List function versions
firebase functions:list

# Delete specific function
firebase functions:delete onPostCreate

# Re-deploy previous version
git checkout HEAD~1 functions/
firebase deploy --only functions
```

**Rollback Rules:**
```bash
# Revert rules file
git checkout HEAD~1 firestore.rules

# Re-deploy
firebase deploy --only firestore:rules
```

**Rollback Hosting:**
```bash
# View previous deployments
firebase hosting:releases

# Revert to previous release (use release ID from above)
firebase hosting:rollback
```

---

## PART 5: Monitoring & Debugging

### View Logs

```bash
# All function logs
firebase functions:log

# Specific function
firebase functions:log --only onPostCreate

# Last 50 lines
firebase functions:log --lines 50

# Real-time streaming
firebase functions:log --tail
```

### Check Indexes

```bash
# List all indexes
firebase firestore:indexes

# Output should show:
# - posts: authorId + createdAt
# - posts: searchKeywords + createdAt
# - etc.
```

### Debug Common Issues

**Issue: "Missing or insufficient permissions"**
```bash
# Solution: Re-deploy security rules
firebase deploy --only firestore:rules
```

**Issue: "Index not found"**
```bash
# Solution: Wait for indexes to build (5-10 min)
# Or manually create in Firebase Console
firebase firestore:indexes
```

**Issue: "Function timeout"**
```bash
# Solution: Increase timeout in functions/index.js
// Change: { timeoutSeconds: 60, memory: '512MB' }
firebase deploy --only functions
```

**Issue: "Algolia not indexing"**
```bash
# Check function logs
firebase functions:log --only onPostCreate

# Verify Algolia config
firebase functions:config:get

# If empty, set it:
firebase functions:config:set algolia.app_id="YOUR_ID"
firebase functions:config:set algolia.admin_key="YOUR_KEY"
firebase deploy --only functions
```

---

## PART 6: Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Security rules deployed and tested
- [ ] Composite indexes built (check status in Console)
- [ ] Cloud Functions deployed and returning success
- [ ] Test post creation → Algolia indexing
- [ ] Test shop item creation → POD product creation
- [ ] Test search (Algolia or Firestore fallback)
- [ ] Test image uploads (check Firebase Storage)
- [ ] Test follow/unfollow
- [ ] Test like/unlike (verify count updates)
- [ ] Run Lighthouse audit (Performance > 80)
- [ ] Test on mobile devices
- [ ] Privacy policy page created
- [ ] Terms of service page created
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (Firebase Analytics, etc.)

---

## PART 7: Cost Optimization

### Free Tier Limits (Firebase Spark Plan)

- **Firestore**: 50K reads/day, 20K writes/day, 20K deletes/day
- **Storage**: 5GB total, 1GB/day transfer
- **Functions**: 125K invocations/month, 40K seconds compute
- **Hosting**: 10GB/month transfer

### Upgrade Triggers
- If you exceed free tier limits
- If you need guaranteed SLA
- If you enable Algolia (paid service)
- If you enable Printful (per-transaction fees)

### Cost-Saving Tips
1. Cache Firestore reads on client
2. Use Cloud Functions sparingly (batch operations)
3. Compress images before upload (use `sharp` library)
4. Implement request throttling
5. Monitor Firebase Console → Usage tab

---

## Quick Reference

```bash
# Full deployment (everything)
npm run build && firebase deploy

# Frontend only
npm run build && firebase deploy --only hosting

# Backend only
firebase deploy --only functions,firestore

# Rules only
firebase deploy --only firestore:rules

# View live logs
firebase functions:log --tail

# Open Firebase Console
firebase open

# Open hosted app
firebase open hosting:site
```

---

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs
- Algolia Docs: https://www.algolia.com/doc/
- Printful API: https://www.printful.com/docs
- PanoSpace Issues: Check PROGRESS_SUMMARY.md for known issues
