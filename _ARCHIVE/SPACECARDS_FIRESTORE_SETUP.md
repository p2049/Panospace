# SpaceCards Firestore Security Rules & Indexes

## Security Rules

Add these rules to your `firestore.rules` file:

```javascript
// SpaceCards Collection
match /spaceCards/{cardId} {
  // Anyone can read cards
  allow read: if true;
  
  // Only authenticated users can create cards
  // Creator must match the authenticated user
  allow create: if request.auth != null 
    && request.resource.data.creatorUid == request.auth.uid;
  
  // Only the creator can update their cards
  allow update: if request.auth != null 
    && resource.data.creatorUid == request.auth.uid;
  
  // Only the creator can delete their cards
  allow delete: if request.auth != null 
    && resource.data.creatorUid == request.auth.uid;
}

// SpaceCard Ownership Collection
match /spaceCardOwnership/{ownershipId} {
  // Anyone can read ownership records (for marketplace)
  allow read: if true;
  
  // Only authenticated users can create ownership records
  // This is typically done through the service layer during minting/purchase
  allow create: if request.auth != null;
  
  // Only the owner can update their ownership records
  // (e.g., listing for sale, changing price)
  allow update: if request.auth != null 
    && resource.data.ownerId == request.auth.uid;
  
  // Only the owner can delete their ownership records
  allow delete: if request.auth != null 
    && resource.data.ownerId == request.auth.uid;
}
```

## Required Firestore Indexes

Create these composite indexes in the Firebase Console:

### Index 1: Cards by Creator
```
Collection: spaceCards
Fields:
  - creatorUid (Ascending)
  - createdAt (Descending)
```

### Index 2: Ownership by Owner
```
Collection: spaceCardOwnership
Fields:
  - ownerId (Ascending)
  - acquiredAt (Descending)
```

### Index 3: Ownership by Card
```
Collection: spaceCardOwnership
Fields:
  - cardId (Ascending)
  - editionNumber (Ascending)
```

### Index 4: Marketplace Listings (Price Ascending)
```
Collection: spaceCardOwnership
Fields:
  - forSale (Ascending)
  - salePrice (Ascending)
```

### Index 5: Marketplace Listings (Price Descending)
```
Collection: spaceCardOwnership
Fields:
  - forSale (Ascending)
  - salePrice (Descending)
```

### Index 6: Marketplace Listings (Newest)
```
Collection: spaceCardOwnership
Fields:
  - forSale (Ascending)
  - listedAt (Descending)
```

## How to Add Indexes

### Option 1: Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click on "Indexes" tab
3. Click "Create Index"
4. Select collection and add fields as specified above
5. Click "Create"

### Option 2: Via Error Messages
1. Try to run a query that needs an index
2. Firebase will show an error with a direct link to create the index
3. Click the link and confirm

### Option 3: firestore.indexes.json
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "spaceCards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "creatorUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "spaceCardOwnership",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "acquiredAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "spaceCardOwnership",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "cardId", "order": "ASCENDING" },
        { "fieldPath": "editionNumber", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "spaceCardOwnership",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "forSale", "order": "ASCENDING" },
        { "fieldPath": "salePrice", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "spaceCardOwnership",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "forSale", "order": "ASCENDING" },
        { "fieldPath": "salePrice", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "spaceCardOwnership",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "forSale", "order": "ASCENDING" },
        { "fieldPath": "listedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy with:
```bash
firebase deploy --only firestore:indexes
```

## Testing the Rules

### Test Card Creation
```javascript
// Should succeed (authenticated user creating their own card)
const cardData = {
  creatorUid: currentUser.uid,
  creatorName: currentUser.displayName,
  // ... other fields
};
await addDoc(collection(db, 'spaceCards'), cardData);

// Should fail (trying to create card for another user)
const cardData = {
  creatorUid: 'someOtherUserId',
  // ... other fields
};
await addDoc(collection(db, 'spaceCards'), cardData); // Permission denied
```

### Test Ownership Updates
```javascript
// Should succeed (owner listing their card for sale)
await updateDoc(doc(db, 'spaceCardOwnership', ownershipId), {
  forSale: true,
  salePrice: 50
});

// Should fail (trying to update someone else's ownership)
await updateDoc(doc(db, 'spaceCardOwnership', someoneElsesOwnershipId), {
  forSale: true
}); // Permission denied
```
