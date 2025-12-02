# EMERGENCY FIX - Nothing Loads

## What to do RIGHT NOW:

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Click on your project: **panospace-7v4ucn**

### Step 2: Fix Firestore Rules
1. Click **Firestore Database** in the left menu
2. Click the **Rules** tab at the top
3. **DELETE EVERYTHING** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

### Step 3: Fix Storage Rules
1. Click **Storage** in the left menu
2. Click the **Rules** tab
3. **DELETE EVERYTHING** and paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

### Step 4: Restart Your App
1. Close all browser tabs with localhost
2. In your terminal, press `Ctrl+C` to stop the server
3. Run: `npm run dev`
4. Open the URL it shows (probably http://localhost:5174 or 5173)

### Step 5: Test
1. Sign up for a new account
2. Try to view the feed (it will be empty - that's okay!)
3. Try to create a post
4. See if it works!

---

## If STILL Nothing Works:

**Open your browser's Developer Console:**
1. Press `F12` in your browser
2. Click the **Console** tab
3. Copy ALL the red error messages
4. Send them to me

---

## Quick Check:
- [ ] Firebase rules published?
- [ ] Dev server running?
- [ ] Browser at correct localhost URL?
- [ ] Logged in to the app?
- [ ] Internet connection working?

DO THESE STEPS NOW! 👆
