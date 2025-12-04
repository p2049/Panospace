# Create Demo Account - Step-by-Step Guide

## Prerequisites

You need a Firebase service account key to run this script.

### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **PanoSpace** project
3. Click the ⚙️ gear icon → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. Click **"Generate Key"** in the confirmation dialog
7. A JSON file will download (e.g., `panospace-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the Key

Save the downloaded JSON file as:
```
f:\PANOSPACE MASTER\Panospace\serviceAccountKey.json
```

**⚠️ IMPORTANT**: This file contains sensitive credentials. It's already in `.gitignore` so it won't be committed.

### Step 3: Run the Script

```bash
npm run create-demo-account
```

Or manually:
```bash
node scripts/createDemoAccount.js
```

## What the Script Does

1. ✅ Checks if demo account already exists
2. ✅ Creates user in Firebase Authentication
3. ✅ Creates user profile in Firestore
4. ✅ Sets up proper permissions
5. ✅ Displays credentials for App Store submission

## Demo Account Details

- **Email**: `appreview@paxus.app`
- **Password**: `ReviewTest123`
- **Username**: `appreview`
- **Display Name**: `App Review Demo`

## Troubleshooting

### Error: "Service account key not found"
- Make sure you downloaded the key from Firebase Console
- Save it as `serviceAccountKey.json` in the project root
- Check the file path is correct

### Error: "User already exists"
- The script will ask if you want to delete and recreate
- Choose "yes" to recreate with fresh data
- Choose "no" to keep the existing account

### Error: "Permission denied"
- Make sure your service account has Admin privileges
- Check Firebase Console → IAM & Admin

## After Creation

1. Test the account by logging in to your app
2. Create a test post
3. Try all core features (search, comment, like)
4. Add credentials to App Store Connect submission

---

**Ready to submit!** 🚀
