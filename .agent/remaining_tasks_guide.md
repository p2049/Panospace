# Remaining Critical Tasks - Implementation Guide

## 🚨 **CRITICAL FOR APP STORE APPROVAL**

### **Task 1: NSFW Content Filtering** ⚠️ REQUIRED

**Priority**: CRITICAL - App will be rejected without this

**Implementation Steps**:

1. **Create NSFW tag list** (`src/constants/nsfwTags.js`):
```javascript
export const NSFW_TAGS = [
    'nsfw',
    'explicit',
    'mature',
    'gore',
    'violence',
    'sensitive',
    'adult',
    '18+'
];

export const isNSFW = (tags) => {
    if (!tags || !Array.isArray(tags)) return false;
    return tags.some(tag => 
        NSFW_TAGS.includes(tag.toLowerCase())
    );
};
```

2. **Add NSFW warning overlay to Post component**:
```javascript
// In Post.jsx, after line 70
const hasNSFWContent = useMemo(() => {
    return isNSFW(post?.tags);
}, [post?.tags]);

const [showNSFW, setShowNSFW] = useState(false);

// In render, wrap image content:
{hasNSFWContent && !showNSFW ? (
    <div 
        onClick={() => setShowNSFW(true)}
        style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
        }}
    >
        <FaExclamationTriangle size={48} color="#ff6b6b" />
        <h3 style={{ margin: '1rem 0 0.5rem 0' }}>Sensitive Content</h3>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>
            This post may contain sensitive material
        </p>
        <button style={{
            padding: '0.75rem 1.5rem',
            background: '#7FFFD4',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
        }}>
            Tap to View
        </button>
    </div>
) : (
    // Normal image content
)}
```

3. **Add user preference in Settings** (optional but recommended):
```javascript
// In Settings.jsx
const [showNSFW, setShowNSFW] = useState(
    localStorage.getItem('showNSFW') === 'true'
);

const toggleNSFW = () => {
    const newValue = !showNSFW;
    setShowNSFW(newValue);
    localStorage.setItem('showNSFW', newValue.toString());
};

// In NOTIFICATIONS section, add:
<div style={{ /* same as other toggles */ }}>
    <span>Show Sensitive Content</span>
    <div onClick={toggleNSFW} style={{ /* toggle switch */ }}>
        {/* Toggle UI */}
    </div>
</div>
```

**Estimated Time**: 2-3 hours
**Files to Modify**: 
- Create: `src/constants/nsfwTags.js`
- Modify: `src/components/Post.jsx`
- Modify: `src/pages/Settings.jsx` (optional)

---

### **Task 2: Create Demo Account** ⚠️ REQUIRED

**Priority**: REQUIRED - Reviewer needs access

**Steps**:
1. Go to Firebase Console → Authentication
2. Add user manually:
   - Email: `appreview@paxus.app`
   - Password: `ReviewTest123`
3. Create user profile in Firestore:
   - Collection: `users`
   - Document ID: [auth UID]
   - Fields:
     ```json
     {
       "username": "AppReviewer",
       "email": "appreview@paxus.app",
       "displayName": "App Store Reviewer",
       "bio": "Test account for App Store review",
       "createdAt": [timestamp],
       "accountType": "art"
     }
     ```

4. Test functionality:
   - [ ] Login works
   - [ ] Can view feed
   - [ ] Can create post
   - [ ] Can delete own post
   - [ ] Can search
   - [ ] Can comment
   - [ ] Can like posts

**Estimated Time**: 30 minutes

---

### **Task 3: Clean Debug Code** ⚠️ RECOMMENDED

**Priority**: RECOMMENDED - Professional appearance

**Steps**:

1. **Remove console.log statements**:
```bash
# Search for console.log
grep -r "console.log" src/

# Remove or comment out non-essential ones
# Keep error logging (console.error, console.warn)
```

2. **Remove commented code**:
```bash
# Search for commented code blocks
grep -r "// TODO" src/
grep -r "// FIXME" src/
grep -r "// HACK" src/
```

3. **Remove placeholder text**:
- Search for "Lorem ipsum"
- Search for "Test"
- Search for "Placeholder"
- Search for "Coming soon"

4. **Clean up imports**:
- Remove unused imports
- Remove commented imports

**Estimated Time**: 1-2 hours

---

### **Task 4: Implement Feature Flags** ⚠️ RECOMMENDED

**Priority**: RECOMMENDED - Hide broken features

**Steps**:

1. **Import feature flags in components**:
```javascript
import { isFeatureEnabled } from '../config/featureFlags';
```

2. **Wrap disabled features**:
```javascript
// Example: Hide Boosts
{isFeatureEnabled('BOOSTS') && (
    <button onClick={() => setShowBoostModal(true)}>
        Boost Post
    </button>
)}

// Example: Hide Marketplace
{isFeatureEnabled('SPACECARDS_MARKETPLACE') ? (
    <Link to="/marketplace">Marketplace</Link>
) : null}
```

3. **Components to update**:
- Profile.jsx - Hide wallet if disabled
- MobileNavigation.jsx - Hide disabled menu items
- Post.jsx - Hide boost button
- Settings.jsx - Hide disabled features

**Estimated Time**: 1-2 hours

---

## 📊 **PRIORITY ORDER**

1. **NSFW Filtering** (2-3 hours) - CRITICAL
2. **Demo Account** (30 min) - REQUIRED
3. **Clean Debug Code** (1-2 hours) - RECOMMENDED
4. **Feature Flags** (1-2 hours) - RECOMMENDED

**Total Time**: 5-8.5 hours

---

## ✅ **COMPLETION CHECKLIST**

### **Before Submission**:
- [ ] NSFW filtering implemented
- [ ] Demo account created and tested
- [ ] Console.log statements removed
- [ ] Commented code removed
- [ ] Feature flags implemented
- [ ] All features tested
- [ ] Privacy Policy accessible
- [ ] Terms of Service accessible
- [ ] Account deletion works
- [ ] Report system works
- [ ] Block system works
- [ ] No crashes on common flows

### **App Store Metadata**:
- [ ] App name: "PanoSpace"
- [ ] Category: Photo & Video
- [ ] Age rating: 14+
- [ ] Keywords: photography, art, portfolio, gallery
- [ ] Description written
- [ ] Screenshots prepared
- [ ] Privacy Policy URL ready
- [ ] Support URL ready

---

## 🎯 **QUICK WIN PATH**

If time is limited, do this minimal set:

1. **NSFW Filtering** (MUST DO - 2-3 hours)
2. **Demo Account** (MUST DO - 30 min)
3. **Remove obvious console.log** (SHOULD DO - 30 min)

**Minimal Time**: 3-4 hours to be submission-ready

---

## 📝 **NOTES**

- NSFW filtering is non-negotiable for App Store
- Demo account is required for review process
- Debug cleanup makes app look professional
- Feature flags prevent reviewer from seeing broken features

**Current Status**: 71% ready
**After NSFW + Demo**: 85% ready
**After all tasks**: 100% ready

---

## 🚀 **NEXT ACTIONS**

1. Start with NSFW filtering (highest priority)
2. Create demo account while testing
3. Clean debug code in parallel
4. Implement feature flags last
5. Final testing pass
6. Submit to App Store!
