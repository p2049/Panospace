# 🔍 IMAGE LOADING DEBUG SCRIPT

## Quick Diagnostic

Run this in your browser console on the Home feed page to see what data structure your posts have:

```javascript
// Check what the first post looks like
const firstPost = document.querySelector('[style*="scroll-snap-align"]');
console.log("=== POST DATA STRUCTURE ===");

// This will show you exactly what fields exist
fetch('http://localhost:8080/__/firebase/firestore/posts')
  .catch(() => {
    console.log("Using manual check instead...");
    console.log("Check Network tab → Firestore requests → Response");
  });
```

## Manual Check Steps:

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Filter by "firestore" or "posts"
4. Refresh the page
5. Click on the `posts` request
6. Look at the **Response** tab
7. Find the `documents` array
8. Check the first document's `fields` object

### What to look for:

```
fields: {
  images: {
    arrayValue: {
      values: [
        {
          mapValue: {
            fields: {
              url: { stringValue: "https://..." }  ← THIS SHOULD EXIST
            }
          }
        }
      ]
    }
  }
}
```

## If `images` array is missing or empty:

The issue is in **CreatePost** - images aren't being uploaded correctly.

## If `images[0].url` is empty or undefined:

The issue is in **useCreatePost** - the download URL isn't being saved.

## If everything looks correct in Firestore:

The issue is in **Post.jsx** - the component isn't reading the data correctly.
