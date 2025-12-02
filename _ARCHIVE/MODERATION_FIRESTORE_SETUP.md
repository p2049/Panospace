# Moderation System Firestore Setup

## Security Rules

```javascript
// Reports Collection
match /reports/{reportId} {
  // Users can read their own reports
  allow read: if request.auth != null 
    && resource.data.reporterUid == request.auth.uid;
  
  // Admins can read all reports
  allow read: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  
  // Authenticated users can create reports
  allow create: if request.auth != null 
    && request.resource.data.reporterUid == request.auth.uid
    && request.resource.data.targetType in ['post', 'user', 'comment'];
  
  // Only admins can update reports
  allow update: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  
  // No one can delete reports
  allow delete: if false;
}
```

## Required Indexes

```
Collection: reports
Fields: targetType (Ascending), targetId (Ascending), createdAt (Descending)

Collection: reports
Fields: reporterUid (Ascending), createdAt (Descending)

Collection: reports
Fields: status (Ascending), createdAt (Descending)

Collection: reports
Fields: category (Ascending), status (Ascending), createdAt (Descending)

Collection: reports
Fields: reporterUid (Ascending), targetType (Ascending), targetId (Ascending)
```

## firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetType", "order": "ASCENDING" },
        { "fieldPath": "targetId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "reporterUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "reporterUid", "order": "ASCENDING" },
        { "fieldPath": "targetType", "order": "ASCENDING" },
        { "fieldPath": "targetId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy with:
```bash
firebase deploy --only firestore:indexes
```
