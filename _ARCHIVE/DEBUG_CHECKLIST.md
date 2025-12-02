# DEBUGGING CHECKLIST

## What to check RIGHT NOW:

### 1. Open Browser Console
1. Press **F12** in your browser
2. Click **Console** tab
3. **Copy ALL red errors** and send them to me

### 2. Check if you're logged in
In the console, type:
```javascript
console.log(window.location.href)
```
Are you at the login page or the home page?

### 3. Check Firestore in Firebase Console
1. Go to: https://console.firebase.google.com/project/panospace-7v4ucn/firestore
2. Do you see a "posts" collection?
3. Are there any documents in it?
4. Screenshot it and show me

### 4. Check if indexes are building
1. Go to: https://console.firebase.google.com/project/panospace-7v4ucn/firestore/indexes
2. Do you see indexes listed?
3. Are they "Building" or "Enabled"?
4. Screenshot it

---

## Common Issues:

### Issue: "Posts never save"
**Possible causes:**
- Firestore write is failing silently
- Storage upload succeeds but Firestore save fails
- User not authenticated properly

**Check:** Open browser console when creating a post. Look for errors.

### Issue: "Home page never loads"
**Possible causes:**
- Firestore query requires an index that's still building
- Query is timing out
- No posts exist yet (empty state should show)

**Fix:** Wait 2-5 minutes for indexes to build, then refresh

### Issue: "Posts disappear"
**Possible causes:**
- Posts are being created but query can't find them (index issue)
- Posts are being deleted by moderation function
- Browser cache issue

**Fix:** Check Firestore console to see if posts actually exist

---

## Quick Fixes to Try:

### 1. Clear browser cache
```
Ctrl + Shift + Delete
Clear everything
Refresh page
```

### 2. Wait for indexes
Firestore indexes can take 2-10 minutes to build.
Check: https://console.firebase.google.com/project/panospace-7v4ucn/firestore/indexes

### 3. Check if Cloud Functions are running
Your moderation function might be deleting uploads!
Check: https://console.firebase.google.com/project/panospace-7v4ucn/functions

### 4. Try creating a simple post
- Just text, no images
- See if it saves
- Check Firestore console

---

## Send me:
1. ❌ Browser console errors (screenshot or copy/paste)
2. ❌ Firestore console screenshot (show posts collection)
3. ❌ Indexes page screenshot
4. ❌ What happens when you try to create a post (step by step)
