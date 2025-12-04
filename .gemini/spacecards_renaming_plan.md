# SpaceCards Naming Consolidation Plan

## Overview
The SpaceCards feature has been referenced by multiple names throughout the codebase:
- **PhotoDex** - Original name
- **PanoDex** - Alternative name
- **PanoVerse** - Another variant
- **SpaceCards** - **FINAL NAME** ✅

This document tracks all files that need to be updated to use the consistent "SpaceCards" naming.

## Files to Rename

### Services
- [ ] `src/services/PhotoDexService.js` → `src/services/SpaceCardsService.js`
- [ ] `src/services/PanoDexService.js` → DELETE (merge into SpaceCardsService if needed)

### Pages
- [ ] `src/pages/PhotoDexPage.jsx` → `src/pages/SpaceCardsPage.jsx`
- [ ] `src/pages/PanoVerse.jsx` → DELETE or rename to `SpaceCardsPage.jsx`

### Constants
- [ ] `src/constants/photoDexSubjects.js` → `src/constants/spaceCardSubjects.js`

### Utils
- [ ] `src/utils/panoVerseUtils.js` → `src/utils/spaceCardsUtils.js`

## Code References to Update

### Database Collections
- `photoDexEntries` → `spaceCardEntries`
- `photoDexRewards` → `spaceCardRewards`
- `user_panodex` → `user_spacecards`
- `panodex_entries` → `spacecard_entries`

### User Profile Fields
- `photoDexStats` → `spaceCardStats`
- `photoPoints` → `spaceCardPoints`

### Constants
- `PHOTODEX_SUBJECTS` → `SPACECARD_SUBJECTS`
- `PHOTODEX_TYPES` → `SPACECARD_TYPES`
- `PANODEX_CATEGORIES` → `SPACECARD_CATEGORIES`
- `PANODEX_UNLOCK_TYPES` → `SPACECARD_UNLOCK_TYPES`

### Service Names
- `PhotoDexService` → `SpaceCardsService`
- `PanoDexService` → DELETE or merge

## Files with References (from grep search)

### PhotoDex References (50+ occurrences)
- `src/services/PhotoDexService.js` - Main service file
- `src/services/SpaceCardService.js` - Has `linkedPhotoDexEntryId` field
- `src/pages/PhotoDexPage.jsx` - Main page
- `src/pages/UltraPage.jsx` - Mention in description
- `src/hooks/useCreatePost.js` - Badge checking logic
- `src/constants/photoDexSubjects.js` - Subject definitions

### PanoDex References (30+ occurrences)
- `src/services/PanoDexService.js` - Alternative service
- `src/constants/tagConfig.js` - Category definitions

### PanoVerse References (8 occurrences)
- `src/pages/PanoVerse.jsx` - Page component
- `src/utils/panoVerseUtils.js` - Utility functions
- `src/constants/tagConfig.js` - Comment reference
- `src/App.jsx` - Route import

## Implementation Strategy

### Phase 1: Fix Critical Issues ✅
- [x] Fix SpaceCard search collection name mismatch

### Phase 2: Consolidate Services
1. Review PhotoDexService and PanoDexService
2. Merge useful functionality into SpaceCardsService
3. Update all service imports

### Phase 3: Rename Files
1. Rename service files
2. Rename page files
3. Rename constant files
4. Update all imports

### Phase 4: Update Database References
1. Create migration script for Firestore collections
2. Update user profile field names
3. Test data migration

### Phase 5: Update Routes
1. Update App.jsx routes
2. Update navigation links
3. Test all navigation paths

## Notes
- The SpaceCardService.js already exists and is the primary service
- PhotoDexService and PanoDexService appear to be legacy/experimental
- Need to verify which features from PhotoDex/PanoDex should be merged into SpaceCards
