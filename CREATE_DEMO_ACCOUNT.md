# 🚀 Create Demo Account - Complete Guide

## Quick Start (3 Steps)

### Step 1: Get Firebase Service Account Key

1. **Open Firebase Console**: https://console.firebase.google.com
2. **Select** your PanoSpace project
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"** button
6. Click **"Generate Key"** to confirm
7. A JSON file will download (e.g., `panospace-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the Key File

Save the downloaded file as:
```
f:\PANOSPACE MASTER\Panospace\serviceAccountKey.json
```

**Important**: 
- The file MUST be named exactly `serviceAccountKey.json`
- It MUST be in the project root directory
- This file is already in `.gitignore` (won't be committed to git)

### Step 3: Run the Script

Open terminal in the project directory and run:

```bash
npm run create-demo-account
```

That's it! The script will:
- ✅ Create the demo account in Firebase Auth
- ✅ Create the user profile in Firestore
- ✅ Display the credentials

---

## Demo Account Credentials

After running the script, you'll have:

```
Email:    appreview@paxus.app
Password: ReviewTest123
```

---

## What to Do Next

### 1. Test the Account (5 minutes)

1. Open your PanoSpace app
2. Log in with the demo credentials
3. Test these features:
   - ✅ Create a post
   - ✅ Search for posts
   - ✅ Comment on a post
   - ✅ Like a post
   - ✅ View your profile

### 2. Add to App Store Submission

When submitting to the App Store:

1. Go to **App Store Connect**
2. Navigate to your app submission
3. In **"App Review Information"** section:
4. Add the demo account:
   - **Username**: `appreview@paxus.app`
   - **Password**: `ReviewTest123`
5. Add any special notes if needed

---

## Troubleshooting

### ❌ "Service account key not found"

**Solution**: 
- Make sure you downloaded the key from Firebase Console
- Check the file is named exactly `serviceAccountKey.json`
- Check it's in the project root: `f:\PANOSPACE MASTER\Panospace\`

### ❌ "User already exists"

**Solution**: 
- The script will ask if you want to recreate it
- Type `yes` to delete and recreate
- Type `no` to keep the existing account

### ❌ "Permission denied"

**Solution**: 
- Make sure your Firebase project has proper permissions
- Check that the service account has Admin role
- Try generating a new service account key

### ❌ "Cannot find module 'firebase-admin'"

**Solution**: 
```bash
npm install firebase-admin --save-dev
```

---

## Manual Creation (Alternative)

If the script doesn't work, you can create the account manually:

1. Go to Firebase Console
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add User"**
5. Enter:
   - Email: `appreview@paxus.app`
   - Password: `ReviewTest123`
6. Click **"Add User"**
7. Log in once to create the Firestore profile

---

## Security Notes

⚠️ **Important**:
- The `serviceAccountKey.json` file contains sensitive credentials
- Never commit it to git (it's in `.gitignore`)
- Never share it publicly
- Delete it after creating the demo account if you want

---

## You're Ready! 🎉

Once the demo account is created and tested, you're **100% ready** for App Store submission!

Check `.agent/FINAL_STATUS.md` for the complete submission checklist.

---

**Need help?** Check the detailed guide in `scripts/CREATE_DEMO_ACCOUNT_GUIDE.md`
