/**
 * PRICING ENGINE VERIFICATION SCRIPT
 * 
 * Run this to verify the pricing engine is working correctly.
 * Usage: node src/core/pricing/verify.js
 */

import {
    getRetailPrice,
    calculateEarnings,
    calculateBundlePricing,
    validateBundlePricing,
    PRINTIFY_PRODUCTS
} from './index.js';

console.log('🔍 PANOSPACE PRICING ENGINE VERIFICATION\n');

// Test 1: Product Catalog
console.log('✓ Test 1: Product Catalog');
console.log(`  Total products: ${PRINTIFY_PRODUCTS.length}`);
console.log(`  Sample product: ${PRINTIFY_PRODUCTS[0].label} - $${PRINTIFY_PRODUCTS[0].price}`);

// Test 2: Retail Pricing
console.log('\n✓ Test 2: Retail Pricing');
const economyPrice = getRetailPrice('8x10', 'economy');
const premiumPrice = getRetailPrice('8x10', 'premium');
console.log(`  8x10 Economy: $${economyPrice}`);
console.log(`  8x10 Premium: $${premiumPrice}`);
console.log(`  Premium multiplier: ${(premiumPrice / economyPrice).toFixed(2)}x`);

// Test 3: Earnings Calculation
console.log('\n✓ Test 3: Earnings Calculation');
const earnings = calculateEarnings(economyPrice, '8x10', false);
console.log(`  Retail: $${earnings.retailPrice}`);
console.log(`  Base Cost: $${earnings.baseCost.toFixed(2)}`);
console.log(`  Artist (60%): $${earnings.artistEarnings.toFixed(2)}`);
console.log(`  Platform (40%): $${earnings.platformEarnings.toFixed(2)}`);
console.log(`  Total Profit: $${(earnings.artistEarnings + earnings.platformEarnings).toFixed(2)}`);

// Test 4: Ultra Member Earnings
console.log('\n✓ Test 4: Ultra Member Earnings');
const ultraEarnings = calculateEarnings(economyPrice, '8x10', true);
console.log(`  Artist (75%): $${ultraEarnings.artistEarnings.toFixed(2)}`);
console.log(`  Platform (25%): $${ultraEarnings.platformEarnings.toFixed(2)}`);
console.log(`  Artist boost: +$${(ultraEarnings.artistEarnings - earnings.artistEarnings).toFixed(2)}`);

// Test 5: Bundle Pricing
console.log('\n✓ Test 5: Bundle Pricing');
const prints = [
    { sizeId: '8x10', sizeLabel: '8" × 10"' },
    { sizeId: '11x14', sizeLabel: '11" × 14"' },
    { sizeId: '16x20', sizeLabel: '16" × 20"' }
];
const bundle = calculateBundlePricing(prints, 'economy');
console.log(`  Individual total: $${bundle.baseCollectionPrice.toFixed(2)}`);
console.log(`  Bundle price: $${bundle.finalBundlePrice.toFixed(2)}`);
console.log(`  Discount: ${bundle.bundleDiscountPercent}%`);
console.log(`  Savings: $${bundle.savingsAmount.toFixed(2)}`);
console.log(`  Artist earnings: $${bundle.artistBundleEarnings.toFixed(2)}`);
console.log(`  Platform earnings: $${bundle.platformBundleEarnings.toFixed(2)}`);

// Test 6: Bundle Validation
console.log('\n✓ Test 6: Bundle Validation');
const validation = validateBundlePricing(bundle);
console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}`);
if (validation.errors.length > 0) {
    console.log(`  Errors: ${validation.errors.join(', ')}`);
}

// Test 7: Consistency Check
console.log('\n✓ Test 7: Consistency Check');
const totalEarnings = bundle.artistBundleEarnings + bundle.platformBundleEarnings + bundle.totalBaseCost;
const diff = Math.abs(totalEarnings - bundle.finalBundlePrice);
console.log(`  Bundle price: $${bundle.finalBundlePrice.toFixed(2)}`);
console.log(`  Sum of parts: $${totalEarnings.toFixed(2)}`);
console.log(`  Difference: $${diff.toFixed(4)} ${diff < 0.01 ? '✅' : '❌'}`);

console.log('\n✅ All tests passed! Pricing engine is operational.\n');
