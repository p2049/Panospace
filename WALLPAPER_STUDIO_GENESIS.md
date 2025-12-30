# 🌌 WALLPAPER STUDIO GENESIS: THE BLUEPRINT V2 (COMPLETE PORT)

> **INSTRUCTIONS FOR ANTIGRAVITY:** 
> When starting the new project, paste this entire file into your context. Use the "Genesis Prompt" at the bottom to initialize the application. This is a BRUTAL PORT of the entire Panospace visual library.

---

## 🎨 THE DESIGN DNA
*   **Aesthetic**: "Calming Complexity." Ultra-premium, dark-mode, glassmorphism.
*   **Palette**: 
    *   `MINT`: #7FFFD4
    *   `ION_BLUE`: #1B82FF
    *   `SOLAR_PINK`: #FF5C8A
    *   `DEEP_PURPLE`: #5A3FFF
    *   `WHITE`: #FFFFFF
*   **Overlays**: Scanlines, vignette depth, and "Quantum Spark" particles.

---

## 🧩 THE CORE MODULES (TO BE REPLICATED)

### 1. The Banner Engine (ALL 70+ VARIANTS)
The app must include EVERY SINGLE banner type found in Panospace `BannerThemeRenderer.jsx`.
*   **Technicolor Tech**: Hardware visualization.
*   **Window Series**: Train, Shuttle, Plane, Metro, Boat, Submarine, Rocket, Aquarium (Single/Dual), Apartment, SkyDrive, Botanical, Lava Lamp, Omni Portal.
*   **Liquid Dynamics**: Gossamer, Cyber Kinetic.
*   **Cityscape Pack**: City Vista, Night City, Cyber Lofts.
*   **Ocean Pack**: Lighthouse (Night/Day), Deep Underwater, Bio-Luminescence.
*   **Abstract Pack**: Oscilloscope, Lava Cube, Omni Paradox, SciFi UI, Neural Silk, Genesis Core, Singularity, Black Mirror, Pinball.
*   **Cosmic Pack**: Earth, Black Hole, Singularity City, Nebula, Galaxy, Aether Gate, Seraphim, Omegasphere, Infinite, Ascendant, Apex, Paradox, Opus, Flux, Ether, Resonance, Interference, Omniscience, Absolute.
*   **Atmos Pack**: Pulse, Flux, Aether, Globe.
*   **System Environments**: Static system memory visualizations.

### 2. The Overlay System (CRITICAL)
You must port the `BannerOverlayRenderer` logic 1:1.
*   **Planet Horizon**: The complex conic gradient horizon with atmospheric haze.
*   **Ice Planet**: Frozen world with cracked texture and mint/cyan aurora spikes.
*   **Northern Lights**: All 12 palettes (Borealis, Australis, Polar, Deep, Plasma, etc.).
*   **Cyberpunk Lines**: The rainbow-bracket HUD with SVG data lines and pulse.
*   **Neon Grid**: Retrowave perspective grid with horizon glow.

### 3. The Studio UI
*   **Dynamic Controls**: Real-time sliders for Speed (`dt`), Complexity (Point counts), Scale, and Opacity.
*   **Aspect Ratio Switching**: One-click toggles for Mobile (`9:16`), Desktop (`16:9`), and Ultrawide (`21:9`).
*   **Live Export**: High-resolution Canvas-to-PNG export with resolution scaling (4K support).
*   **Background Management**: Toggleable scanlines, CRT effects, and noise textures.

---

## 🤖 THE GENESIS PROMPT (SEND THIS TO START)

"Hey Antigravity, we are building 'WALLPAPER STUDIO'—a standalone generative art app based on the Panospace Vector Dynamics infrastructure. This is a 100% separate project, but we are stealing EVERYTHING from the source.

**Phase 1: Foundation**
1. Initialize a Vite-React project.
2. Create a 'BannerRenderer' component that can swap between 70+ modes.
3. Import the 'Transcendence' logic (Math Banners) as simply one category among many.

**Phase 2: The Great Port (Categories)**
You must meticulously recreate these categories from the Blueprint:
- **Windows**: (15 variants) Static background + animated rain/snow/stars/traffic.
- **Liquid**: (2 variants) WebGL fluid simulations.
- **Cosmic**: (20+ variants) Particle systems and rotating 3D meshes.
- **Abstract**: (10+ variants) Oscilloscopes and geometric wireframes.
- **City & Ocean**: Parallax scrolling layers.

**Phase 3: The Overlay Engine**
Implement the 'Overlay Layer' that sits on top of any banner:
- **Planet Mode**: Port the CSS `conic-gradient` earth horizon and stars.
- **Aurora Mode**: Port the SVG `<filter>` turbulence for the northern lights.
- **Cyberpunk Link**: Port the SVG brackets and data lines.

**Phase 4: Studio UI**
1. Build a 'Glassmorphism' control panel on the left.
2. Add a 'CAPTURE' button that saves the current canvas state as a 4K resolution PNG.
3. Add a 'Theme Selector' dropdown that is categorized (Window, Cosmic, Abstract, etc.).

Do not use any external CSS libraries. Use vanilla CSS with modern variables. The goal is an app that looks like a high-end discovery engine for unique wallpapers."

---

## 📦 CODE SNIPPET: THE PORTABLE TRANSITION ENGINE
(Copy this into the new app's `src/engine/CoreMath.js`)

```javascript
/* 
  THIS IS THE 'TRANSCENDENCE' CORE 
  STOLEN DIRECTLY FROM PANOSPACE 
*/
export const BRAND = { MINT: '#7FFFD4', ION_BLUE: '#1B82FF', SOLAR_PINK: '#FF5C8A', WHITE: '#FFFFFF' };

export const mathLogic = {
    fractalFlame: (p, t, dt) => {
        const r = Math.random();
        if (r < 0.33) {
            p.x = p.x * 0.5 + 0.5 * Math.cos(t * 0.1);
            p.y = p.y * 0.5 + 0.5 * Math.sin(t * 0.1);
        } else if (r < 0.66) {
            p.x = p.x * 0.5 - 0.5 * Math.sin(t * 0.2);
            p.y = p.y * 0.5 + 0.5 * Math.cos(t * 0.2);
        } else {
            p.x = Math.sin(p.x); p.y = Math.sin(p.y);
        }
    },
    spectralSnake: (t, offset, sideMult) => {
        const localT = t - offset;
        const angle = localT * 0.5 * sideMult;
        return {
            x: Math.cos(angle) * 160,
            y: Math.sin(angle) * 80
        };
    }
};
```
