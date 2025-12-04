# Pricing Engine Migration Guide

## Overview
The PanoSpace pricing system has been consolidated into a single canonical source at `/src/core/pricing/`.

## New Structure

```
/src/core/pricing/
├── index.js              # Main export - import from here
├── productCatalog.js     # Product definitions (sizes, costs)
├── basePricing.js        # Core pricing calculations
├── tierModifiers.js      # Tier-based adjustments
├── bundlePricing.js      # Collection/bundle discounts
└── printifyAdapter.js    # Printify API integration
```

## Migration Steps

### ✅ DONE - Backward Compatibility
All existing imports will continue to work:
- `utils/printifyPricing.js` → Re-exports from core
- `utils/bundlePricing.js` → Re-exports from core
- `utils/printfulApi.js` → Uses core adapter
- `domain/shop/pricing.ts` → Imports from core

### 🔄 TODO - Update Imports (Recommended)

**Before:**
```javascript
import { calculateEarnings } from '../utils/printifyPricing';
import { calculateBundlePricing } from '../utils/bundlePricing';
```

**After:**
```javascript
import { calculateEarnings, calculateBundlePricing } from '../core/pricing';
```

### 📋 Files to Update

1. **Shop Components** (`src/components/shop/`)
   - ShopItemCard.jsx
   - CreateShopItem.jsx
   - Any component calculating prices

2. **Services** (`src/services/`)
   - ShopService.js
   - monetizationService.js
   - pod.js

3. **Hooks** (`src/hooks/`)
   - useCreatePost.js (if it handles pricing)

## API Reference

### Product Catalog
```javascript
import { PRINTIFY_PRODUCTS, PRINT_TIERS } from '@/core/pricing';

// Get all products
const products = PRINTIFY_PRODUCTS;

// Access tiers
const tier = PRINT_TIERS.ECONOMY; // or PREMIUM, LIMITED
```

### Base Pricing
```javascript
import { 
    getRetailPrice, 
    calculateEarnings,
    getValidSizesForImage 
} from '@/core/pricing';

// Get retail price for a size
const price = getRetailPrice('8x10', 'economy');

// Calculate earnings split
const earnings = calculateEarnings(price, '8x10', isUltra);
// Returns: { artistEarnings, platformEarnings, baseCost, retailPrice }

// Get valid sizes for an image
const sizes = getValidSizesForImage(width, height);
```

### Bundle Pricing
```javascript
import { 
    calculateBundlePricing,
    validateBundlePricing 
} from '@/core/pricing';

const prints = [
    { sizeId: '8x10', sizeLabel: '8" × 10"' },
    { sizeId: '11x14', sizeLabel: '11" × 14"' }
];

const bundle = calculateBundlePricing(prints, 'economy');
// Returns: { finalBundlePrice, savingsAmount, artistBundleEarnings, ... }

const validation = validateBundlePricing(bundle);
// Returns: { isValid, errors, warnings }
```

### Printify Integration
```javascript
import { 
    mapSizeToPrintify,
    createPrintifyProductPayload 
} from '@/core/pricing';

// Map size to Printify IDs
const mapping = mapSizeToPrintify('8x10');
// Returns: { providerId, blueprintId, sizeLabel }

// Create API payload
const payload = createPrintifyProductPayload({
    imageUrl: 'https://...',
    title: 'My Print',
    sizeIds: ['8x10', '11x14'],
    prices: [14.40, 19.80]
});
```

## Benefits

✅ **Single Source of Truth** - All pricing logic in one place
✅ **No Conflicts** - Impossible to have mismatched prices
✅ **Easy Updates** - Change prices in one file
✅ **Type Safety** - Clear function signatures
✅ **Testable** - Isolated, pure functions
✅ **Maintainable** - Clear separation of concerns

## Testing

Run existing tests - they should all pass due to backward compatibility:
```bash
npm test
```

## Rollout Plan

1. ✅ Create canonical pricing engine
2. ✅ Update legacy files to re-export
3. 🔄 Gradually update imports in components/services
4. 🔄 Add comprehensive tests
5. 🔄 Remove legacy files (after full migration)

## Support

If you encounter any pricing discrepancies:
1. Check `/src/core/pricing/productCatalog.js` for product definitions
2. Verify tier modifiers in `/src/core/pricing/tierModifiers.js`
3. Review calculation logic in `/src/core/pricing/basePricing.js`
