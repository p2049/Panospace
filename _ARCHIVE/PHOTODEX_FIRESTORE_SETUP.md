# PhotoDex Firestore Setup

## Security Rules

Add these rules to your `firestore.rules` file:

```javascript
// PhotoDex Entries Collection
match /photoDexEntries/{entryId} {
  // Anyone can read badges (for viewing other users' collections)
  allow read: if true;
  
  // Only authenticated users can create badges
  // System creates these via PhotoDexService
  allow create: if request.auth != null 
    && request.resource.data.userId == request.auth.uid;
  
  // Only the owner can update their badges
  allow update: if request.auth != null 
    && resource.data.userId == request.auth.uid;
  
  // Only the owner can delete their badges
  allow delete: if request.auth != null 
    && resource.data.userId == request.auth.uid;
}

// PhotoDex Rewards Collection
match /photoDexRewards/{rewardId} {
  // Only the owner can read their rewards
  allow read: if request.auth != null 
    && resource.data.userId == request.auth.uid;
  
  // System creates rewards automatically
  allow create: if request.auth != null;
  
  // Only the owner can update (claim) their rewards
  allow update: if request.auth != null 
    && resource.data.userId == request.auth.uid;
  
  // Only the owner can delete their rewards
  allow delete: if request.auth != null 
    && resource.data.userId == request.auth.uid;
}
```

## Required Firestore Indexes

Create these composite indexes in the Firebase Console:

### Index 1: Badges by User
```
Collection: photoDexEntries
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

### Index 2: Badges by User and Type
```
Collection: photoDexEntries
Fields:
  - userId (Ascending)
  - type (Ascending)
  - createdAt (Descending)
```

### Index 3: Check Existing Badge
```
Collection: photoDexEntries
Fields:
  - userId (Ascending)
  - subjectKey (Ascending)
```

### Index 4: Rewards by User
```
Collection: photoDexRewards
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

## firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "photoDexEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photoDexEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photoDexEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "subjectKey", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "photoDexRewards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy with:
```bash
firebase deploy --only firestore:indexes
```
