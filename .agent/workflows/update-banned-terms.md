---
description: Updating Banned Terms for Content Moderation
---

# Updating Banned Terms for Content Moderation

This workflow describes how to safely update the list of banned terms used by the Panospace content moderation system.

## 1. Locate the Blacklist File
The banned terms are defined in:
`src/core/utils/moderation/blacklists.js`

## 2. Identify the Category
Decide which category your new term belongs to:

*   **`SLURS`**: For hate speech, racial/ethnic/religious slurs, and homophobic/transphobic terms. These are STRICTLY BLOCKED.
*   **`VIOLENCE`**: For threats of death, harm, or suicide. These are STRICTLY BLOCKED.
*   **`SEXUAL_VIOLENCE`**: For references to non-consensual sexual acts or child exploitation.

## 3. Adding a New Term
Add the term to the appropriate array as a specific string.
*   **Case Sensitivity**: All terms should be lowercase. The moderator normalizes input to lowercase automatically.
*   **Exact vs. Fuzzy**: 
    *   The system checks for terms in `SLURS` inside normalized text (spaces removed). E.g., adding `badword` will block `bad word`, `b a d w o r d`, and `badword`.
    *   The system checks for phrases in `VIOLENCE` exactly as written but case-insensitive.

```javascript
// Example: Adding a new slur
SLURS: [
    ...
    'existingterm',
    'newbannedterm' // <--- Add here
],
```

## 4. Handling False Positives (Exceptions)
If a banned term is part of a common safe word (e.g., "ass" in "class"), you must add the safe word to the `EXCEPTIONS` list in the same file.

```javascript
export const EXCEPTIONS = [
    ...
    'safecontainerword' // e.g. 'class' to allow 'associate' if 'ass' is banned (though 'ass' isn't banned by default)
];
```

## 5. Verification
After updating the list:
1.  Try to create a post or update your profile bio with the new term.
2.  Verify you receive the error: "This content contains language that isn’t allowed on Panospace."
3.  Try to use a safe word that contains the term (if applicable) and ensure it is ALLOWED.

## 6. Commit Changes
Commit the updated `blacklists.js` file to source control.
