# 🗂️ REQUIRED FIRESTORE INDEXES

This document lists all Firestore composite indexes required for the Panospace app to function correctly.

## ⚠️ CRITICAL: Create These Indexes

### Posts Collection

#### 1. Profile Page Query
```
Collection: posts
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Purpose**: Load user's posts on their profile page  
**Query**: `where("userId", "==", currentUser.uid).orderBy("createdAt", "desc")`

---

#### 2. Shop Items Query
```
Collection: shopItems
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Purpose**: Load user's shop items on profile  
**Query**: `where("userId", "==", targetId).orderBy("createdAt", "desc")`

---

#### 3. Public Shop Browse
```
Collection: shopItems
Fields:
  - available (Ascending)
  - createdAt (Descending)
```

**Purpose**: Browse all available shop items  
**Query**: `where("available", "==", true).orderBy("createdAt", "desc")`

---

#### 4. Feed Ranking (Optional but Recommended)
```
Collection: posts
Fields:
  - userId (Ascending)
  - feedScore (Descending)
  - createdAt (Descending)
```

**Purpose**: Personalized feed ranking  
**Query**: Future optimization for ranked feeds

---

## 📋 How to Create These Indexes

### Option 1: Via Firebase Console (Recommended for Production)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** → **Composite**
4. Click **Create Index**
5. Enter the collection name and field configurations from above

### Option 2: Via Firestore Rules Suggestion
When you first run a query that needs an index, Firestore will provide an automatic link in the console error. Click it to auto-create the index.

### Option 3: Via `firestore.indexes.json` (Automated Deployment)
Create or update `firestore.indexes.json` in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shopItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shopItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "available", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## ✅ Verification

After creating indexes, verify they're active:
1. Go to Firebase Console → Firestore → Indexes
2. Check that all indexes show "Enabled" status (not "Building")
3. Test queries in your app

---

## 🚨 Known Query Limitations

**Single-Field Queries** (No Index Needed):
- `where("userId", "==", value)` alone
- `orderBy("createdAt")` alone

**Composite Queries** (Index Required):
- `where()` + `orderBy()` on different fields
- Multiple `where()` clauses
- `array-contains` + `orderBy()`

---

## 🔄 Index Build Time

- **Small datasets** (\u003c1000 docs): ~1-2 minutes
- **Medium datasets** (1000-10k docs): ~5-15 minutes  
- **Large datasets** (\u003e10k docs): May take hours

**Note**: Queries will fail until indexes are fully built. Plan accordingly before launch.

---

## 💡 Optimization Tips

1. **Avoid creating indexes for unused queries**
2. **Monitor index usage** in Firebase Console
3. **Delete unused indexes** to reduce costs
4. **Use array-contains sparingly** (creates many indexes)
5. **Consider denormalization** for hot paths

---

*Last Updated: 2025-11-22*
*PanoSpace Production Deployment Checklist*
