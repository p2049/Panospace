# Quick Deploy Script

## Deploy Firebase Rules

After you sign in to Firebase CLI (one time only), you can use these commands:

### Deploy Firestore Rules Only
```bash
npx firebase-tools deploy --only firestore:rules
```

### Deploy Storage Rules Only
```bash
npx firebase-tools deploy --only storage:rules
```

### Deploy Both Rules
```bash
npx firebase-tools deploy --only firestore:rules,storage:rules
```

### Deploy Everything (Rules + Functions)
```bash
npx firebase-tools deploy
```

---

## First Time Setup

If you haven't logged in yet:
```bash
npx firebase-tools login
```

This will open a browser window - sign in with your Google account.

---

## Check Current Project
```bash
npx firebase-tools projects:list
```

## Set Active Project
```bash
npx firebase-tools use panospace-7v4ucn
```

---

## After Deploying Rules

1. Refresh your app at http://localhost:5173
2. Try signing up
3. Try creating a post
4. Everything should work!
