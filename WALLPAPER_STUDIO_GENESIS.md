# 🌌 WALLPAPER STUDIO GENESIS: THE BLUEPRINT

> **INSTRUCTIONS FOR ANTIGRAVITY:** 
> When starting the new project, paste this entire file into your context. Use the "Genesis Prompt" at the bottom to initialize the application.

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

### 1. The Math Engine (Generative Art Capped)
The app must include all 8 tiers of mathematical visualizations:
*   **Attractors**: Aizawa, Lorenz, Rossler (Strange Attractors in 3D).
*   **Manifolds**: Torus Knots, Enneper Surfaces, Mobius Strips.
*   **Hyperplex**: 4D Tesseract projections, 24-Cell, Pentachon.
*   **Quantum Flux**: Wave interference, Quantum Foam, Probability clouds.
*   **Geometric Flora**: Fibonacci growth, Golden Angle Phyllotaxis.
*   **Symmetry Fields**: Lissajous harmonics, Spirographs, Gielis Supershapes.
*   **Cosmic Singularity**: Calabi-Yau 6D Manifolds, Event Horizon simulations.
*   **Transcendence**: Fractal Flames (IFS), Spectral Snakes, Topological Nebulas.

### 2. The Studio UI
*   **Dynamic Controls**: Real-time sliders for Speed (`dt`), Complexity (Point counts), Scale, and Opacity.
*   **Aspect Ratio Switching**: One-click toggles for Mobile (`9:16`), Desktop (`16:9`), and Ultrawide (`21:9`).
*   **Live Export**: High-resolution Canvas-to-PNG export with resolution scaling (4K support).
*   **Background Management**: Toggleable scanlines, CRT effects, and noise textures.

---

## 🤖 THE GENESIS PROMPT (SEND THIS TO START)

"Hey Antigravity, we are building 'WALLPAPER STUDIO'—a standalone generative art app based on the Panospace Vector Dynamics infrastructure. This is a 100% separate project.

**Phase 1: Foundation**
1. Initialize a Vite-React project with a pure black background.
2. Implement a 'Master Engine' that routes to different Mathematical Visualizers.
3. Import the 'Transcendence' and 'Cosmic' logic: We need the IFS Fractal Flames, the Spectral Snake with power-decay trails, and the 6D Calabi-Yau manifold projections.

**Phase 2: Visual Excellence**
1. Re-implement the 'Panospace Overlay System': Add a cumulative Scanline overlay and a Radial Vignette that darkens the edges for depth.
2. Every mathematical core must use 'Additive Blending' (globalCompositeOperation = 'screen' or 'lighter') for that glowing neon look.
3. Ensure all 10 brand-colored entities bounce across the screen with smooth, high-fps physics.

**Phase 3: Studio UI**
1. Build a 'Glassmorphism' control panel on the left. It should be semi-transparent with a blur effect.
2. Add sliders to control the internal math (e.g., speed of the Fractal Flame, length of the Spectral Snake's tail).
3. Add a 'CAPTURE' button that saves the current canvas state as a 4K resolution PNG.

**Phase 4: The Mathematical Library**
Stitch in all existing visual variants from Panospace:
- Strange Attractors (Rossler/Lorenz)
- Topological Manifolds (Mobius/Enneper)
- Quantum Probabilities (Wave/Foam)
- Geometric Flora (Fibonacci/Spiral)

Do not use any external CSS libraries. Use vanilla CSS with modern variables. The goal is an app that looks like a high-end discovery engine for mathematical beauty."

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
