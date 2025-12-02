# Tag Category Box Implementation - CRITICAL REFERENCE

## ⚠️ DO NOT MODIFY - WORKING IMPLEMENTATION

This document describes the **exact implementation** of the tag category boxes in CreatePost.jsx that the user confirmed as perfect. **Never break this implementation.**

## Location

File: `src/pages/CreatePost.jsx`
Section: Categories & Tags (in left column, after image gallery)

## Critical CSS Structure

Each tag category box container MUST use these exact CSS properties:

```javascript
<div style={{
    display: 'flex',
    flexDirection: 'column',    // ← Stack items vertically first
    flexWrap: 'wrap',           // ← Wrap to next column when height is full
    gap: '0.5rem',
    height: '90px',             // ← CRITICAL: Exactly 90px for 2 rows
    overflowX: 'auto',          // ← Enable horizontal scrolling
    overflowY: 'hidden',        // ← Prevent vertical scrolling
    paddingBottom: '0.5rem',
    scrollbarWidth: 'thin',     // ← Firefox: thin scrollbar
    scrollbarColor: 'rgba(127, 255, 212, 0.6) transparent'  // ← Firefox: green scrollbar
}}>
```

## How It Works

1. **flexDirection: 'column'** - Items stack vertically first
2. **flexWrap: 'wrap'** - When column reaches 90px height, wrap to next column
3. **height: '90px'** - Fixed height ensures exactly 2 rows of tags
4. **overflowX: 'auto'** - Creates horizontal scrolling through the columns
5. **Green scrollbar** - Visible indicator for horizontal scroll

## Tag Button Styling

Tag buttons use:
```javascript
style={{
    padding: '0.4rem 0.9rem',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    flexShrink: 0
}}
```

This creates buttons ~30-35px tall, allowing exactly 2 to fit in the 90px height with gap.

## Webkit Scrollbar (Chrome/Safari)

Global CSS in `<style>` block:
```css
.form-section > div > div > div::-webkit-scrollbar {
    height: 8px;
}
.form-section > div > div > div::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
.form-section > div > div > div::-webkit-scrollbar-thumb {
    background: rgba(127, 255, 212, 0.6);
    border-radius: 4px;
}
.form-section > div > div > div::-webkit-scrollbar-thumb:hover {
    background: rgba(127, 255, 212, 0.8);
}
```

## Categories Affected

All 7 tag categories use this exact structure:
1. Technical & Gear
2. Contests & Events
3. Nature Types
4. Subject
5. Location
6. Style
7. Film

## Visual Result

- ✅ Tags display in 2 rows (stacked vertically)
- ✅ Tags scroll horizontally when overflow occurs
- ✅ Green/teal scrollbar visible at bottom
- ✅ Tags are regular size (not oversized)
- ✅ Smooth horizontal scrolling experience

## ⚠️ NEVER CHANGE

- Do NOT change `flexDirection` from 'column'
- Do NOT change `flexWrap` from 'wrap'
- Do NOT change `height` from '90px'
- Do NOT change scrollbar colors
- Do NOT remove `overflowX: 'auto'`

## If Issues Arise

If tag boxes appear broken:
1. Verify `flexDirection: 'column'` and `flexWrap: 'wrap'`
2. Verify `height: '90px'`
3. Verify `overflowX: 'auto'` and `overflowY: 'hidden'`
4. Check tag button padding is `0.4rem 0.9rem`
5. Verify webkit scrollbar CSS is present in style block
