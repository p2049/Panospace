---
description: Rule for using Brand Colors in Banner Creation
---

// turbo-all

# Use Brand Colors Rule

When creating or modifying visual banners (especially custom seed-driven banners like the Digi Jungle), you MUST strictly adhere to the official Panospace Brand Color Palette.

### 1. Identify Brand Colors
Always import and use `BRAND_COLORS` from `@/core/constants/colorPacks`:
```javascript
import { BRAND_COLORS } from '@/core/constants/colorPacks';
```

### 2. Forbidden Colors
*   Never use hardcoded standard CSS colors (e.g., `#00ff00`, `#0000ff`, `red`, `blue`).
*   Avoid using naturalistic colors that are outside the brand spectrum (e.g., forest green, sky blue) unless they are derived from a brand color.
*   The ONLY exceptions are:
    *   `#000000` (Black) for backgrounds and shadows.
    *   `#FFFFFF` (White) for extreme highlights or UI contrast.

### 3. Implementation in Banners
*   **Foliage/Plants**: Use the teals (`#7FFFD4`, `#7FDBFF`) and oranges/pinks (`#FF914D`, `#FF5C8A`) instead of standard greens.
*   **Sky/Atmosphere**: Use brand purples and blues (`#5A3FFF`, `#1B82FF`, `#A7B6FF`) for realistic but branded atmospheric gradients.
*   **Wildlife/Entities**: Randomly assign brand colors to animals and creatures to ensure they pop against the scenery.
*   **Procedural Selection**: When using `seededRandom`, ensure you indices into the `BRAND_COLORS` array:
    ```javascript
    const color = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
    ```

### 4. Overlays & Gradients
Ensure that any new gradients (e.g., `previewGradient` in `bannerThemes.js`) are also composed strictly of these brand hex codes.
