# Deployment Checklist

## Pre-Deployment
- [ ] Run `npm install` to ensure all dependencies are locked.
- [ ] Run `npm test` to pass all unit tests.
- [ ] Run `npm run test:e2e` to pass all E2E tests.
- [ ] Check `firestore.rules` and `storage.rules` are secure.
- [ ] Ensure `firestore.indexes.json` is up to date.
- [ ] Verify Cloud Functions are deployed (`firebase deploy --only functions`).

## Deployment
- [ ] Push code to `main` branch to trigger GitHub Actions.
- [ ] Monitor the Action tab in GitHub for success.
- [ ] Verify the live site loads.

## Post-Deployment Verification
- [ ] Log in with a test account.
- [ ] Create a new post with images.
- [ ] Verify the post appears in the feed.
- [ ] Check the profile page for the new post.
- [ ] Test the search functionality.
- [ ] Verify images are loading correctly (signed URLs).

## Rollback Plan
If the deployment fails or bugs are found:
1. Revert the git commit: `git revert HEAD`
2. Push the revert to `main`.
3. GitHub Actions will redeploy the previous version.
4. If Firebase Rules are broken, manually deploy the old rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
