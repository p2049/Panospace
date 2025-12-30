# 🏗️ PANOSPACE BANNER SYSTEM: ARCHITECTURE & LOGIC MAP

> **PURPOSE**: This document explains the "Wiring" of the Panospace Banner System. Use this to understand how to reassemble the files found in the Migration Payload.

---

## 1. THE CORE RENDERER (`BannerThemeRenderer.jsx`)
This is the **Central Router**. It does not render graphics directly; it acts as a switch statement that lazy-loads the correct visual component based on the `mode` prop.

### **Input Props**
*   `mode` (String): The ID of the banner theme (e.g., `'math_fire'`, `'city_vista'`, `'window_rain'`).
*   `color` (String/Hex): The primary accent color override. Used by abstract/cosmic banners.
*   `starSettings` (Object): `{ enabled: boolean, color: string }`. Passed to banners that support dynamic star backgrounds.
*   `profileBorderColor` (String): Used by `Oscilloscope` and `Abstract` banners to sync with the profile UI.

### **Logic Flow**
1.  **Lazy Imports**: All heavy banner components are imported using `React.lazy()` to keep the initial bundle size low.
2.  **Theme Matching**:
    *   **Direct String Match**: `if (mode === 'math_fire') ...`
    *   **Prefix Match**: `if (mode.startsWith('city')) ...` (Handles the Cityscape pack).
    *   **Grouping**: Abstract banners (`abstract_...`) and Window banners (`window_...`) are grouped for code block organization.
3.  **Fallback**: If no mode matches, it usually returns `null` or falls through to a default.

---

## 2. THE OVERLAY ENGINE (`BannerOverlayRenderer.jsx`)
This component renders **On Top** of the banner. It is responsible for effects that need to "frame" the visual, like the Dashboard HUDs or the Planet Horizon.

### **Key Overlays**
*   **`planet` / `ice-planet`**: CSS-heavy implementation. Uses `conic-gradient` to create a lit horizon and a massive box-shadow for atmospheric glow. It sits at `bottom: -930px` to create the curvature.
*   **`northern-lights` (Aurora)**: Uses SVG filters (`feTurbulence` + `feDisplacementMap`) to create organic, shifting "curtains" of light.
*   **`cyberpunkLines`**: An SVG HUD frame that draws brackets and data lines around the edges.

### **Z-Index Layering**
*   **Level 0**: The Base Banner Canvas (`TranscendenceBanner`, etc.).
*   **Level 1**: The Overlay Renderer (`BannerOverlayRenderer`).
    *   *Note*: Some overlays (like stars) act as backgrounds (Level 0.5), while others (HUDs) act as foregrounds (Level 2).

---

## 3. DATA SOURCES (`src/core/constants/`)
*   **`bannerThemes.js`**: The Source of Truth. It contains the array of all available banners, their display names, categories (`'COSMIC'`, `'ABSTRACT'`), and unlock requirements.
*   **`bannerOverlays.js`**: Definitions for specific overlay options separate from the main theme.

---

## 4. CRITICAL RECONSTUCTION STEPS
When rebuilding this in the new "Wallpaper Studio":

1.  **Dependency Handling**: Most banners rely on `react`, `framer-motion`, or standard `canvas` APIs.
    *   *Warning*: `LiquidBanners.jsx` likely uses WebGL shaders. Ensure dependencies are installed or code is adapted.
2.  **Asset Handling**: Some banners (Cityscapes) use CSS `url()` for background images. You will need to extract these image assets or replace them with local placeholders if they are external URLs.
3.  **The "Prop Drill"**: Ensure your new `App.jsx` controls the `mode` state and passes it down into `BannerThemeRenderer`.

---

## 5. SPECIFIC BANNER BEHAVIORS

### **Transcendence (Math)**
*   **File**: `TranscendenceBanner.jsx`
*   **Tech**: HTML5 Canvas (2D Context).
*   **Behavior**: Physics simulation (bouncing entities) + Additive Blending (`globalCompositeOperation = 'screen'`) for the glowing effect.

### **Windows**
*   **File**: `*WindowBanner.jsx` (Train, Shuttle, etc.)
*   **Tech**: CSS Grid/Flexbox + animated PNGs/CSS gradients.
*   **Behavior**: Often involves a static "Frame" image overlaying an animated "Sky/City" background.

### **Cosmic**
*   **File**: `SingularityBanner.jsx`, `BlackHoleBanner.jsx`
*   **Tech**: Canvas or CSS Animations representing rotating 3D objects or particle systems.

---

> **MIGRATION TIP**: Use `source-over` canvas clearing for pure cleanliness, or `destination-out` with low opacity for trails (as seen in Transcendence).
