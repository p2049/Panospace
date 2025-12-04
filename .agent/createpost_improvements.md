# CreatePost Robustness Improvements

## Issues Identified:

### 1. **EXIF Loading**
- ✅ Already implemented with try-catch (line 165-169)
- ⚠️ Issue: No user feedback when EXIF fails
- **Fix**: Add error state and retry option

### 2. **Draft Persistence**
- ✅ Already implemented (lines 117-139)
- ⚠️ Issue: Images not saved in drafts (only text/settings)
- ⚠️ Issue: No warning before navigation
- **Fix**: Add beforeunload warning, save image references

### 3. **Upload Failures**
- ✅ Retry logic exists (uploadWithRetry, 3 attempts)
- ❌ Issue: No UI feedback for retry attempts
- ❌ Issue: Generic error messages
- **Fix**: Add detailed error messages with retry button

### 4. **Thumbnail Generation**
- ✅ Already consistent (generateAllThumbnails)
- ⚠️ Issue: No fallback if generation fails
- **Fix**: Add fallback to original image

### 5. **Metadata Attachment**
- ✅ All metadata collected before Firestore write
- ✅ Verification step exists (lines 356-374)
- ✅ Rollback on failure
- **Status**: Already robust

## Implementation Plan:

1. ✅ Add EXIF retry UI
2. ✅ Enhance draft persistence with image refs
3. ✅ Add beforeunload warning
4. ✅ Improve error messages
5. ✅ Add thumbnail fallback
6. ✅ Add upload progress per image
