# PanoSpace Production Implementation Plan

## Status: IN PROGRESS
**Started**: 2025-11-20T23:28:02-06:00
**Last Updated**: 2025-11-20T23:28:02-06:00

---

## PART A - PRIORITIES (Iterative Sprints)

### ✅ Sprint 1: Stability & Safety (COMPLETED)
- [x] Fix black-screen bug in FullscreenViewer.jsx
- [x] Fix broken modals with missing images
- [x] Add triple fallback for imageUrl || shopImageUrl || item.url
- [x] Prevent crashes with conditional rendering
- [x] Update Post.jsx with safeguards
- [x] Update Profile.jsx thumbnail rendering

### 🔄 Sprint 2: Core Functionality (IN PROGRESS)
- [ ] Verify posting works end-to-end
- [ ] Ensure image upload to Firebase Storage returns downloadURL
- [ ] Verify Firestore writes for posts
- [ ] Test profile posts display
- [ ] Verify delete/edit posts
- [ ] Test follow/unfollow
- [ ] Validate tags array handling
- [ ] Validate location object storage

### 📋 Sprint 3: Search & Discovery (PENDING)
- [ ] Integrate Algolia
- [ ] Implement fuzzy search for title/caption
- [ ] Add tag button filters
- [ ] Add location filter
- [ ] Create Search.jsx page
- [ ] Provide Firestore fallback search

### 📋 Sprint 4: Shop / POD Integration (PENDING)
- [ ] Integrate Printful API
- [ ] Create POD product creation flow
- [ ] Implement checkout function
- [ ] Ensure shop items excluded from feed
- [ ] Verify Shop tab in Profile works
- [ ] Add Buy Print button logic

### 📋 Sprint 5: UX Polish (PENDING)
- [ ] Add Google Places location autocomplete
- [ ] Implement art-type buttons (complete list)
- [ ] Add placeholder images
- [ ] Ensure responsive UI
- [ ] Add comprehensive error messages
- [ ] EXIF extraction client-side

### 📋 Sprint 6: Tests & Deployment (PENDING)
- [ ] Unit tests for components
- [ ] Integration tests
- [ ] Firestore indexes
- [ ] Security rules validation
- [ ] Cloud Functions deployment
- [ ] Algolia setup
- [ ] Printful API configuration
- [ ] Deployment instructions
- [ ] Rollback plan

---

## NEXT STEPS
1. Verify black screen fix in browser
2. Test image upload pipeline
3. Begin core functionality verification
4. Start backend Cloud Functions implementation
