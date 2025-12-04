# Tap Target & Navigation Audit

## Issues to Fix:

### 1. **Minimum Tap Target Sizes**
- iOS HIG: 44x44px minimum
- Android Material: 48x48px minimum
- **Standard**: Use 44px minimum for all interactive elements

### 2. **Common Dead Zones:**
- Small icons without padding
- Overlapping z-index elements
- Buttons with insufficient hit area
- Back arrows too small
- Modal close buttons
- Dropdown triggers

### 3. **Modal Issues:**
- Missing escape key handlers
- No backdrop click to close
- Missing close buttons
- Stuck modals without exit

### 4. **iPhone Gestures:**
- Back swipe conflicts
- Safe area insets
- Touch action conflicts

## Files to Patch:

### High Priority:
1. `MobileNavigation.jsx` - Bottom nav tap targets
2. `Post.jsx` - Overlay buttons, info toggle
3. `HeaderBar.jsx` - Back arrows, action buttons
4. `PageHeader.jsx` - Navigation elements
5. All Modal components - Close buttons, backdrop

### Medium Priority:
6. `SearchHeader.jsx` - Filter toggles
7. `ThumbnailStrip.jsx` - Small thumbnails
8. `LikeButton.jsx` - Heart icon
9. Card components - Clickable areas

## Patches Needed:

### 1. Global Tap Target Mixin
```css
.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 2. Modal Escape Pattern
```javascript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### 3. Backdrop Click Pattern
```javascript
<div onClick={onClose} style={{ position: 'fixed', inset: 0 }}>
  <div onClick={(e) => e.stopPropagation()}>
    {/* Modal content */}
  </div>
</div>
```

### 4. Safe Area Insets
```css
padding-bottom: max(20px, env(safe-area-inset-bottom));
```
