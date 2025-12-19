# Panospace Topic — Canonical Definition

## What is a Topic?
A Topic is an emergent, followable lens over the global Panospace content stream, defined by one or more canonicalized tags.

A Topic does not contain content. It reveals content.

Topics exist automatically whenever tags are used. No user creates, owns, or moderates a Topic. Participation is open and democratic: any user contributes by tagging their post.

Topics are persistent only as user relationships, not as owned entities. Persistence exists through follows, metadata, and presentation—not through lifecycle management.

## What a Topic is NOT

*   **Not a group** (no members, admins, or chat rooms)
*   **Not a Studio** (no ownership, projects, or curation)
*   **Not a Collection** (no manual selection of posts)
*   **Not a new content type** (posts remain in the existing posts collection)

## Topic vs Search
*   **Search** is ephemeral and transactional.
*   **Topics** are persistent and relational.

Search answers “What do I want to see right now?”
Topics answer “What do I care about over time?”

## Topic vs Studio
*   **Studios** are owned, curated, and intentional.
*   **Topics** are unowned, automatic, and emergent.

Studios organize people around a vision.
Topics organize content around interest.

## Technical Notes

*   **Topics do not store posts.**
*   Posts are queried from the existing posts collection via tag filters.
*   **Tag combinations are canonicalized** before Topic resolution.
*   Topic metadata (followers, optional visuals) may be stored separately.
*   Following a Topic adds the tag combination to user preferences and softly influences the Home Feed.
*   **ReadOnly**: Topics cannot be edited, renamed, or deleted by users.
*   **Guardrails**: Following a topic does not guarantee chronological delivery of all posts (soft-injection).
