# PanoSpace Mobile Creation UI Standard

This document defines the standard CSS architecture for "Creation" pages (Create Post, Create Collection, etc.) on mobile devices. This standard ensures a consistent, responsive, and robust user experience across both portrait and landscape orientations.

## Philosophy: Universal Responsive Algorithm

The core principle is to use **native CSS `vw` units** for all spacing, sizing, and typography in portrait mode to ensure perfect scaling across different device widths. For landscape mode, we switch to a **Grid-based layout** to utilize the wider aspect ratio efficiently.

---

## 1. Portrait Mode (`orientation: portrait`)

**Target:** Mobile phones held vertically.
**Goal:** A clean, single-column vertical stack that scales perfectly.

### Key Rules:
*   **Layout:** `display: flex; flex-direction: column`
*   **Units:** Use `vw` for everything (padding, margin, font-size, gap).
    *   Standard Padding: `4vw`
    *   Standard Gap: `4vw`
    *   Standard Font Size: `max(3.5vw, 14px)`
*   **Containment:** `max-width: 100vw` and `overflow-x: hidden` on the main container to prevent horizontal scroll.
*   **Tag Lists:** `overflow-x: auto` with `max-width: 100%` and `display: grid; grid-auto-flow: column`.

### CSS Snippet:
```css
@media (max-width: 900px) and (orientation: portrait) {
    .create-layout {
        display: flex !important;
        flex-direction: column !important;
        height: auto !important;
        overflow: visible;
        padding: 4vw; 
        gap: 4vw;
        max-width: 100vw;
        box-sizing: border-box;
    }
    
    /* Form Sections */
    .form-section {
        padding: 4vw;
        margin-bottom: 4vw;
        width: 100%;
    }
    
    /* Typography Scaling */
    .title {
        font-size: max(3.5vw, 14px);
    }
    
    /* Tag/Scrollable Containers */
    .scroll-container {
        max-width: 100% !important;
        overflow: hidden !important;
    }
    .scroll-content {
        display: grid !important;
        grid-auto-flow: column !important;
        overflow-x: auto !important;
        max-width: 100% !important;
        gap: 1.5vw !important;
    }
}
```

---

## 2. Landscape Mode (`orientation: landscape`)

**Target:** Mobile phones held horizontally.
**Goal:** A compact, desktop-like 2-column layout to prevent excessive vertical scrolling.

### Key Rules:
*   **Layout:** `display: grid; grid-template-columns: 300px 1fr`
*   **Sidebar:** Fixed width (`300px`) for media/previews.
*   **Content:** Fluid width (`1fr`) for forms.
*   **Scrolling:** `height: 100dvh` with internal scrolling (`overflow-y: auto`) for columns.

### CSS Snippet:
```css
@media (max-width: 900px) and (orientation: landscape) {
    .create-layout {
        display: grid !important;
        grid-template-columns: 300px 1fr !important;
        padding: 1rem !important;
        gap: 1rem !important;
        height: 100dvh !important;
        overflow: hidden !important;
    }
    
    .left-column, .right-column {
        height: 100% !important;
        overflow-y: auto !important;
        width: 100% !important;
        max-width: 100% !important;
    }
    
    /* Ensure tags still scroll horizontally if needed */
    .scroll-content {
        display: grid !important;
        grid-auto-flow: column !important;
        overflow-x: auto !important;
        max-width: 100% !important;
        gap: 0.5rem !important;
    }
}
```

---

## 3. Implementation Checklist

When building a new creation page:
1.  [ ] Wrap the main content in a layout div (e.g., `.create-post-layout`).
2.  [ ] Use the **Split Media Query** approach (Portrait vs Landscape).
3.  [ ] Apply `vw` scaling for all Portrait styles.
4.  [ ] Apply Grid layout for Landscape styles.
5.  [ ] Ensure all horizontal scroll containers (tags, thumbnails) have `max-width: 100%` and `overflow: hidden` on their parent.
