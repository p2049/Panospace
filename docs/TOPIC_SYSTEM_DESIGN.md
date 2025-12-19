# Topic System Design (Master Document)

## 1. Topic Definition
A **Topic** is an emergent, followable lens over the global Panospace content stream, defined by one or more canonicalized tags.

*   **Emergent**: Topics exist automatically whenever tags are used. No user creates or owns them.
*   **Persistent**: Topics persist as relationships (follows) and metadata, not as owned entities.
*   **Unowned**: No admins, no moderation (beyond global).
*   **Content-less**: Topics do not store posts; they query the `posts` collection.

---

## 2. Topic Identity & Slug Logic
To ensure consistency, all Topics map to a unique, immutable URL and ID structure.

*   **Canonical Slug Rule**: 
    **Topic slug format is a `+` joined, alphabetically sorted, lowercase tag list.**
    *   Example: `['Nikon', 'film']` -> **`film+nikon`**
    *   Example: `['Street', '35mm']` -> **`35mm+street`**
    *   This prevents `nikon+film` and `film+nikon` being duplicate topics.

*   **Title Generation**:
    *   Titles are auto-generated from tags.
    *   Prioritize: Brands/Gear > Format/Technique > Genre/Style > Description.
    *   Suffix "Photography" or "Art" added if no root noun exists.
    *   No emojis or slang.

---

## 3. Following System
### UX Flow
1.  **Action**: User clicks "Follow" on the **Topic Page Header**.
2.  **UI**: Button optimistically toggles to "Added" (Green Tick).
3.  **Storage**: Adds the **canonical slug** to `userSettings/{uid}.followedTopics`.
4.  **Privacy**: Follower identity is anonymous. No public list of "Who follows this topic."

### Data Model
*   **User Side**: `userSettings/{uid}` -> `followedTopics: ["film+nikon", "cyberpunk"]` (Array of strings).
*   **Topic Side**: `topics/{slug}` -> `{ followerCount: 1234, lastActivity: timestamp }` (Lazy created).

### Guardrails
*   **Follower Count Updates**: Handled via Cloud Function that **diffs before/after arrays** to ensure safe increment/decrement.
*   **Count Display**: Static text (non-clickable). No tooltips or navigation.
*   **Limits**: Users capped at ~50-100 followed topics to prevent document bloat.

---

## 4. Text Posts in Topics
*   **Behavior**: Distinct visual style intermixed with image posts.
*   **Posting**: Clicking "Post Here" redirects to `CreatePost` with **tags pre-filled**.
*   **Context**: `CreatePost` shows a banner: "Contributing to **[Topic Title]**".
*   **Conversational**: Threading happens in detail view, not inline.

---

## 5. Implementation Roadmap
1.  **`TopicContextBanner`** (Done): Links search results to Topic Page.
2.  **`TopicPage.jsx`**: Main route and layout container.
3.  **`TopicHeader.jsx`**: Identity, Title Gen, and Follow Button.
4.  **`useTopicFollow` Hook**: Manages userSettings updates.
5.  **`CreatePost` Integration**: Accept tags via URL/State.

**Constraint Checklist**
- [x] No ownership or admins.
- [x] Slugs are strictly canonical.
- [x] Follower counts are anonymous.
- [x] Text posts act as normal posts with extended context.
