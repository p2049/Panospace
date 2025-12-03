# Toast Migration Quick Reference

## Standard Migration Pattern

### Step 1: Add Import
```javascript
import { useToast } from '../context/ToastContext';
```

### Step 2: Destructure Hook
```javascript
const { showError, showSuccess, showWarning, showInfo } = useToast();
```

### Step 3: Replace Alerts

#### Error Messages
```javascript
// Before:
alert('Failed to save: ' + error.message);

// After:
showError('Failed to save: ' + error.message);
```

#### Success Messages
```javascript
// Before:
alert('Saved successfully!');

// After:
showSuccess('Saved successfully!');
```

#### Warnings
```javascript
// Before:
alert('Please log in first');

// After:
showWarning('Please log in first');
```

#### Info Messages
```javascript
// Before:
alert('Link copied!');

// After:
showInfo('Link copied!');
```

## Type Selection Guide

| Scenario | Toast Type | Method |
|----------|-----------|--------|
| Operation failed | Error | `showError()` |
| Operation succeeded | Success | `showSuccess()` |
| Missing requirement | Warning | `showWarning()` |
| Informational | Info | `showInfo()` |
| Validation failed | Error | `showError()` |
| Permission denied | Warning | `showWarning()` |
| Action completed | Success | `showSuccess()` |
| Feature unavailable | Warning | `showWarning()` |

## Common Patterns

### Form Validation
```javascript
if (!title.trim()) {
    showError('Please enter a title');
    return;
}
```

### Try-Catch Blocks
```javascript
try {
    await someOperation();
    showSuccess('Operation completed!');
} catch (error) {
    console.error('Error:', error);
    showError(`Failed: ${error.message}`);
}
```

### Authentication Checks
```javascript
if (!currentUser) {
    showWarning('Please log in to continue');
    return;
}
```

### Success with Navigation
```javascript
showSuccess('Created successfully!');
navigate('/destination');
```

## Advanced Usage

### Custom Duration
```javascript
// Show for 6 seconds instead of default 4
showError('Important message', 6000);

// Show indefinitely (0 = no auto-dismiss)
showError('Critical error', 0);
```

### Manual Dismiss
```javascript
// Get toast ID for manual control
const toastId = showInfo('Processing...');

// Later, dismiss it manually
removeToast(toastId);
```

## Files Remaining

Quick checklist of files that still need migration:

- [ ] CollectionDetail.jsx
- [ ] AdminModeration.jsx
- [ ] AdminCleanup.jsx
- [ ] EditPost.jsx
- [ ] Settings.jsx
- [ ] ShopItemDetail.jsx
- [ ] UltraPage.jsx
- [ ] ShopDrafts.jsx
- [ ] MuseumView.jsx
- [ ] MagazineCuration.jsx
- [ ] MagazineView.jsx
- [ ] CreateMagazineIssue.jsx
- [ ] EditProfile.jsx
- [ ] CreatePost.jsx
- [ ] (See TOAST_MIGRATION_SUMMARY.md for complete list)
