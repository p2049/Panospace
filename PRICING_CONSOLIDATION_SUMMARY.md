# Pricing Logic Consolidation Summary

## Overview
All pricing-related logic, definitions, and calculations have been consolidated into a single source of truth: `src/utils/printPricing.js`. Duplicate logic in other files has been replaced with imports from this central file.

## Changes Made

### 1. Centralized Logic (`src/utils/printPricing.js`)
- **Consolidated `PRINT_SIZES`**: Merged all print sizes from `config/printSizes.js` and existing `printPricing.js`.
- **Updated `calculateEarnings`**: Enhanced to support both legacy signature `(price, baseCost)` and new signature `(price, sizeId, isUltra)`.
- **Added `ESTIMATED_BASE_COSTS`**: Exported for compatibility with `pricing.ts`.
- **Added `STICKER_SIZES`**: Moved sticker definitions here.

### 2. Updated Files
The following files were updated to import from `src/utils/printPricing.js` instead of defining their own logic:

- **`src/config/printSizes.js`**: Replaced duplicate `PRINT_SIZES`, `calculateEarnings`, and helper functions with imports.
- **`src/services/pod.js`**: Replaced duplicate `PRINT_SIZES` and `calculatePrice` with imports.
- **`src/domain/shop/pricing.ts`**: Replaced duplicate definitions with imports (preserving TypeScript types).
- **`src/domain/shop/service.ts`**: Updated to import from `printPricing.js`.
- **`src/hooks/useCreatePost.js`**: Updated sticker import to point to `printPricing.js`.
- **`src/pages/CreatePost.jsx`**: Added missing import for `PRINT_TIERS`.

### 3. Verification
- **`ShopDrafts.jsx`**: Verified imports (uses `ShopService`).
- **`ShopSetup.jsx`**: Verified imports (no pricing logic used directly).
- **Linting**: Fixed TypeScript type mismatch in `pricing.ts`.

## Usage Guide

### Importing Pricing Logic
Always import from `src/utils/printPricing.js`:

```javascript
import { 
    PRINT_SIZES, 
    PRINT_TIERS, 
    calculateTieredPricing, 
    calculateEarnings 
} from '../utils/printPricing';
```

### Calculating Earnings
```javascript
// New Way (Preferred)
const earnings = calculateEarnings(retailPrice, sizeId, isUltra);

// Legacy Way (Supported)
const earnings = calculateEarnings(retailPrice, baseCost);
```

### Adding New Sizes
Add new size definitions to `PRINT_SIZES` in `src/utils/printPricing.js`. All other files will automatically inherit the new sizes.
