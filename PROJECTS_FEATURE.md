# Projects Feature Implementation

## Overview
Implemented a new **Studio → Projects → Posts** structure that enables collaborative mini-profiles within Studios (formerly Galleries).

## Architecture

### Data Structure
```
Studio (Gallery)
  └── Projects (Subcollection)
      ├── Project Document
      │   ├── title
      │   ├── description
      │   ├── contributors[] (array of {uid, displayName, role})
      │   ├── roles[] (array of role names)
      │   ├── postIds[] (array of post IDs)
      │   ├── isTemporary (boolean)
      │   ├── createdBy
      │   ├── createdAt
      │   ├── updatedAt
      │   ├── followersCount
      │   └── postsCount
      └── Posts (referenced by postIds)
```

## Files Created

### 1. **projectService.js** (`src/services/projectService.js`)
- Complete CRUD operations for projects
- Functions:
  - `createProject(studioId, projectData)`
  - `getProject(studioId, projectId)`
  - `getStudioProjects(studioId)`
  - `getUserProjects(userId)`
  - `updateProject(studioId, projectId, updates)`
  - `addContributor(studioId, projectId, contributor)`
  - `removeContributor(studioId, projectId, contributor)`
  - `addPostToProject(studioId, projectId, postId)`
  - `removePostFromProject(studioId, projectId, postId)`
  - `deleteProject(studioId, projectId)`
  - `toggleProjectFollow(studioId, projectId, userId, follow)`

### 2. **useProjects.js** (`src/hooks/useProjects.js`)
- Custom React hooks for project management
- Hooks:
  - `useProject(studioId, projectId)` - Fetch single project
  - `useStudioProjects(studioId)` - Fetch all projects for a studio
  - `useUserProjects(userId)` - Fetch projects where user is contributor
  - `useProjectManagement()` - Management operations

### 3. **ProjectPage.jsx** (`src/pages/ProjectPage.jsx`)
- Full project detail page
- Features:
  - Project title, description, and metadata
  - Temporary project badge
  - Contributors list with roles
  - Posts grid
  - Follow/unfollow functionality
  - Edit button for project owners
  - Breadcrumb navigation
  - Stats display (contributors, posts, followers)

### 4. **CreateProjectModal.jsx** (`src/components/CreateProjectModal.jsx`)
- Modal for creating new projects
- Features:
  - Title and description inputs
  - Temporary project toggle
  - Dynamic roles management
  - Contributors management with roles
  - Form validation
  - Auto-adds creator as first contributor

### 5. **ProjectCard.jsx** (`src/components/ProjectCard.jsx`)
- Reusable project card component
- Features:
  - Temporary badge display
  - Project stats (contributors, posts, followers)
  - Contributors preview (first 3 + count)
  - Hover effects
  - Click navigation to project page

## Files Modified

### 1. **App.jsx**
- Added `ProjectPage` lazy import
- Added route: `/project/:studioId/:projectId`

### 2. **GalleryDetail.jsx** (StudioPage)
- Added imports for project components and hooks
- Added `showCreateProjectModal` state
- Integrated `useStudioProjects` hook
- Added "Projects" tab with count
- Added Projects tab content with:
  - "New Project" button for studio owners
  - Projects grid display
  - Empty state handling
- Added `CreateProjectModal` integration

## Features

### Project Page Features
1. **Project Information**
   - Title and description
   - Temporary project indicator
   - Breadcrumb navigation back to studio

2. **Contributors Section**
   - Grid display of all contributors
   - Shows contributor name and role
   - Clickable to view contributor profiles

3. **Posts Section**
   - Grid display of all project posts
   - Empty state with "Create Post" button for contributors
   - Uses existing `GridPostCard` component

4. **Actions**
   - Follow/Unfollow button (for authenticated users)
   - Edit button (for project owners)
   - Stats display (contributors, posts, followers)

### Studio Page Integration
1. **New "Projects" Tab**
   - Shows count of projects
   - Displays all projects in grid
   - "New Project" button for studio owners

2. **Project Creation**
   - Modal-based creation flow
   - Role management
   - Contributor management
   - Auto-navigation to new project on creation

## User Flows

### Creating a Project
1. Navigate to Studio page
2. Click "Projects" tab
3. Click "New Project" button (owner only)
4. Fill in project details:
   - Title (required)
   - Description (optional)
   - Mark as temporary (optional)
   - Add roles (optional)
   - Add contributors with roles (optional)
5. Click "Create Project"
6. Auto-navigate to new project page

### Viewing a Project
1. Navigate to Studio page
2. Click "Projects" tab
3. Click on a project card
4. View project details, contributors, and posts

### Following a Project
1. Navigate to project page
2. Click "Follow" button
3. Project is added to user's following list

## Database Structure

### Firestore Collections
```
galleries/{studioId}/projects/{projectId}
  - title: string
  - description: string
  - contributors: array
    - uid: string
    - displayName: string
    - role: string
  - roles: array of strings
  - postIds: array of strings
  - isTemporary: boolean
  - createdBy: string (uid)
  - createdAt: timestamp
  - updatedAt: timestamp
  - followersCount: number
  - postsCount: number
  - followers: array of uids
```

### User Document Updates
```
users/{userId}
  - followingProjects: array of "{studioId}/{projectId}" strings
```

## Future Enhancements

1. **Add to Profile → Projects**
   - Allow users to add projects to their profile
   - Display projects on user profiles

2. **Project Permissions**
   - Role-based permissions
   - Contributor-only editing
   - Post approval workflows

3. **Project Analytics**
   - View counts
   - Engagement metrics
   - Contributor activity

4. **Project Templates**
   - Pre-defined project structures
   - Quick setup for common project types

5. **Project Invitations**
   - Invite users to join as contributors
   - Email notifications
   - Invitation management

6. **Project Search**
   - Search projects across all studios
   - Filter by role, contributor, status

## Notes

- Projects are stored as subcollections within studios (galleries collection)
- Database collection names remain unchanged (`galleries`, not `studios`)
- UI consistently uses "Studio" terminology
- Projects support both permanent and temporary collaborations
- Follow functionality integrates with existing user following system
