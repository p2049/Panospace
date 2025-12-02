# Panospace Fixes - Implementation Plan

## Status: IN PROGRESS

### 1. Multiple Photo Selection ⏳
**Location:** `src/hooks/useCreatePost.js`, `src/pages/CreatePost.jsx`
**Changes Needed:**
- [ ] Add `multiple` attribute to both file inputs in CreatePost.jsx
- [ ] Update `addImageSlide` function to handle FileList array
- [ ] Implement MAX_IMAGES checking with graceful overflow
- [ ] Test: Select 5 images at once

### 2. User Search Fix ⏳  
**Location:** `src/hooks/useSearch.js`
**Changes Needed:**
- [ ] Implement searchUsers function with proper Firestore queries
- [ ] Add pagination support with lastDoc cursor
- [ ] Handle empty/whitespace queries gracefully
- [ ] Test: Search for existing users by display name

### 3. Print Sizes Centralization ⏳
**Location:** `src/constants/printSizes.js`, `src/utils/printfulApi.js`, `functions/index.js`
**Changes Needed:**
- [ ] Create/verify PRINT_SIZES constant with canonical sizes
- [ ] Update all imports to use centralized config
- [ ] Map frontend size IDs to backend Printful variants
- [ ] Test: Verify only allowed sizes show in CreatePost

### 4. Shop Item Creation Fix ⏳
**Location:** `src/hooks/useCreatePost.js`
**Changes Needed:**
- [ ] Ensure shop items use `authorId` not `ownerId`
- [ ] Store `postRef` as Firestore DocumentReference
- [ ] Use proper printSizes array format matching PRINT_SIZES
- [ ] Test: Create post with shop item, verify it appears in Profile

### 5. Like Icon Change ⏳
**Location:** `src/components/Post.jsx`  
**Changes Needed:**
- [ ] Replace FaHeart with FaSmile icon
- [ ] Verify like/unlike functionality still works
- [ ] Test: Like and unlike a post

### 6. Color Overhaul ⏳
**Location:** Multiple component files
**Changes Needed:**
- [ ] Map all hardcoded hex colors to CSS variables
- [ ] Use accent colors for CTAs
- [ ] Ensure readability maintained
- [ ] Test: Visual review of all pages

## Implementation Order:
1.  Fix corrupted useCreatePost.js file structure
2. Multiple photo selection (high UX impact)
3. Print sizes (affects shop functionality)
4. Shop item creation (critical bug)
5. User search (critical feature)
6. Like icon (quick win)
7. Color overhaul (polish)
