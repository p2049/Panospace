# Panospace Firestore Schema

This document describes the data model for Collections, Studios, Museums, and Magazines.

## Collections
Sets of posts owned by a single user.

- **Collection**: `collections/{collectionId}`
  - `ownerId`: string (UID)
  - `title`: string
  - `description`: string
  - `coverImage`: string (URL)
  - `visibility`: "public" | "unlisted" | "private"
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `postCount`: number
  - `tags`: string[]
  - `allowDirectPosting`: boolean

- **Items**: `collections/{collectionId}/items/{itemId}`
  - `postId`: string (reference to posts collection)
  - `rawContentId`: string (optional, for non-post content)
  - `addedBy`: string (UID)
  - `addedAt`: timestamp
  - `orderIndex`: number

## Studios
Shared upload spaces for collaborative work.

- **Studio**: `studios/{studioId}`
  - `ownerId`: string (UID)
  - `title`: string
  - `description`: string
  - `coverImage`: string (URL)
  - `visibility`: "public" | "unlisted" | "private"
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `memberCount`: number

- **Members**: `studios/{studioId}/members/{uid}`
  - `role`: "owner" | "admin" | "member"
  - `joinedAt`: timestamp
  - `invitedBy`: string (UID, optional)

- **Items**: `studios/{studioId}/items/{itemId}`
  - `postId`: string
  - `addedBy`: string
  - `addedAt`: timestamp
  - `orderIndex`: number

## Museums
Curation hubs that contain multiple Studios, Collections, or Profiles.

- **Museum**: `museums/{museumId}`
  - `ownerId`: string (UID)
  - `title`: string
  - `description`: string
  - `coverImage`: string (URL)
  - `visibility`: "public" | "unlisted" | "private"
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

- **Sections**: `museums/{museumId}/sections/{sectionId}`
  - `type`: "studio" | "collection" | "profiles"
  - `studioId`: string (if type="studio")
  - `collectionId`: string (if type="collection")
  - `profileIds`: string[] (if type="profiles")
  - `title`: string
  - `orderIndex`: number

## Magazines
Digital magazine issues/pages.

- **Magazine Issue**: `magazines/{magazineId}`
  - `ownerType`: "user" | "studio"
  - `ownerId`: string (UID or StudioId)
  - `title`: string
  - `description`: string
  - `coverImage`: string (URL)
  - `visibility`: "public" | "unlisted" | "private"
  - `issueNumber`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `publishedAt`: timestamp (optional)

- **Pages**: `magazines/{magazineId}/pages/{pageId}`
  - `pageIndex`: number
  - `layoutType`: string
  - `contentBlocks`: object[] (or asset refs)
  - `createdAt`: timestamp
