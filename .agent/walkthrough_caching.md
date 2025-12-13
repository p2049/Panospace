# Walkthrough: Implementing Global Caching for Profile and Search

This walkthrough details the changes made to prevent profile feeds and search results from refetching or resetting when the user navigates away (e.g., to a Post Viewer) and returns.

## Problem
When a user opens a post (navigating to `/post/:id`), the previous page (`/profile/:id` or `/search`) is unmounted. When the user navigates back, the component remounts and triggers a fresh data fetch. This causes:
1.  Loss of scroll position (handled by browser usually, but data loss breaks it).
2.  Loss of loaded data (pagination state is reset).
3.  Unnecessary network requests.
4.  Flickering UI.

## Solution: In-Memory Global Caching
We implemented simple, robust in-memory caches that live in the module scope of the hooks. These caches persist as long as the application bundle is loaded (i.e., until a hard refresh).

### 1. Profile Caching (`useProfile.js`)
We introduced `PROFILE_CACHE` to store user data and tab content (posts, shop items) keyed by `userId`.

**Key Changes:**
- Defined `const PROFILE_CACHE = {}` at module level.
- In `useEffect` for fetching user: Check `PROFILE_CACHE[userId]` first. If found, set state and skip fetch.
- In `useEffect` for fetching items: Check `PROFILE_CACHE[userId].tabs[key]` first. If found, set state and skip fetch.
- Updates cache whenever a fetch logic (if triggered) completes successfully.

### 2. Search Caching (`useSearch.js` & `Search.jsx`)
We introduced `SEARCH_CACHE` to store the entire search state (results + pagination cursors) keyed by a hash of the search filters.

**Key Changes:**
-  Exported `SEARCH_CACHE` from `useSearch.js`.
-  In `Search.jsx`, `performSearch` generates a deterministic `cacheKey` based on all active filters (`term`, `tags`, `mode`, `sort`, etc.).
-  On "initial search" (not load more), we checks `SEARCH_CACHE[cacheKey]`.
-  If a cache hit occurs, we dispatch `SET_RESULTS` with the cached data immediately and return, bypassing the network request.
-  When new data is fetched (or "Load More" occurs), we update `SEARCH_CACHE[cacheKey]`.

### 3. Collection Caching (`useCollections.js`)
We introduced `COLLECTIONS_CACHE` (for list of collections) and `SINGLE_COLLECTION_CACHE` (for individual collection details).

**Key Changes:**
-  In `useCollections` hook: check `COLLECTIONS_CACHE[userId]` before fetching.
-  In `useCollection` hook: check `SINGLE_COLLECTION_CACHE[collectionId]` before fetching.
-  Added simple cache invalidation (deletion) on Create/Update/Delete operations to ensure data freshness when the user modifies content.

## Outcome
-   **Instant Navigation:** Returning to a profile or search results page is now instant.
-   **State Preservation:** Search results and loaded profile tabs are preserved exactly as they were left.
-   **Reduced API Usage:** Redundant reads to Firestore are eliminated for back-navigation.
