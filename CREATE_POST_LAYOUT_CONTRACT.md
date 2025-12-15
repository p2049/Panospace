# Create Post Layout Contract 🔒

**DO NOT MODIFY THIS LAYOUT WITHOUT EXPLICIT PERMISSION.**

This document defines the **MANDATORY** layout structure for the `CreatePost` page. This structure was finalized on 2025-12-14 and must be preserved to ensure correct scrolling behavior.

## Core Hierarchy

The layout consists of three strict layers:

1.  **Root Container** (`.create-post-container`)
    *   **Behavior:** Locked to viewport height (`100vh`), NO scrolling.
    *   **Structure:** Flex column.
2.  **Header** (`PageHeader` / `.create-post-header`)
    *   **Behavior:** Fixed/Sticky. NEVER scrolls relative to the viewport.
    *   **Constraint:** Must sit inside the non-scrolling Root.
3.  **Body Wrapper** (`.create-post-layout`)
    *   **Behavior:** Fills remaining space (`flex: 1`), NO scrolling (`overflow: hidden`).
    *   **Structure:** CSS Grid (`480px 1fr`).
4.  **Columns** (`.preview-column` & `.form-column`)
    *   **Behavior:** Independent vertical scrolling (`overflow-y: auto`).
    *   **Constraint:** Must be `height: 100%` of the Body Wrapper.

## CSS Rules (Non-Negotiable)

### 1. Root Container
```css
.create-post-container {
    height: 100vh;           /* 🔒 LOCKED HEIGHT */
    overflow: hidden;        /* 🔒 NO ROOT SCROLL */
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--black);
}
```

### 2. Header
The header must be a direct child of the root and `flex-shrink: 0`.

### 3. Body Layout
```css
.create-post-layout {
    flex: 1 1 auto;          /* 🔒 FILL REMAINING SPACE */
    display: grid;
    grid-template-columns: 480px 1fr; /* 🔒 FIXED LEFT, FLUID RIGHT */
    gap: 2.75rem;
    padding: 0;              /* 🔒 NO PADDING ALLOWED HERE */
    width: 100%;
    height: auto;            /* 🔒 NO HEIGHT MATH OR CALC */
    overflow: hidden;        /* 🔒 TRAP SCROLL */
}
```

### 4. Scroll Columns
```css
.preview-column,
.form-column {
    height: 100%;            /* 🔒 FILL PARENT HEIGHT */
    overflow-y: auto;        /* 🔒 SCROLL HERE ONLY */
    overflow-x: hidden;
    scrollbar-gutter: stable; /* 🔒 PREVENTS LAYOUT SHIFT */
    padding: 1.5rem 1rem 4rem 0.5rem; /* Gap & Spacing */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
```

## Critical constraints
*   **NEVER** add `overflow-y: auto` to `.create-post-container` or `.create-post-layout`.
*   **NEVER** use `min-height: 100vh` on the root (must be `height: 100vh`).
*   **NEVER** add padding to the grid container (`.create-post-layout`). Padding belongs inside the columns.
*   **NEVER** remove `scrollbar-gutter: stable`.

## Mobile Behavior
On mobile, the layout shifts to a standard vertical scroll. The constraints above apply primarily to the **Desktop** view.

---
*Last Verified: 2025-12-14*
