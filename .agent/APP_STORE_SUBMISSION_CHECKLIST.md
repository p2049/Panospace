# APP STORE SUBMISSION CHECKLIST

## 🚨 CRITICAL PRE-FLIGHT
- [ ] **Demo Account Created**: `appreview@paxus.app` / `ReviewTest123`
- [ ] **Database Rules**: Ensure `reports` and `blocks` collections are writable.
- [ ] **Storage Rules**: Ensure `legal` docs are accessible if hosted there (currently in-app).

## 📱 APP FUNCTIONALITY
- [ ] **Launch**: App loads with PanoSpace logo (no white screen).
- [ ] **Login**: Demo account logs in successfully.
- [ ] **Feed**: Posts load without crashing.
- [ ] **NSFW**: 
    - [ ] Find/Create post with "nsfw" tag.
    - [ ] Verify blurred/overlayed.
    - [ ] Tap to reveal works.
    - [ ] Settings -> Content Preferences -> Toggle works.
- [ ] **UGC**:
    - [ ] "Report Post" opens modal.
    - [ ] "Block User" works.
- [ ] **Offline**:
    - [ ] Airplane mode ON -> Banner appears.
    - [ ] Airplane mode OFF -> Banner changes/disappears.
- [ ] **Settings**:
    - [ ] "Privacy & Legal" opens Legal page.
    - [ ] "Delete Account" is visible and clickable.

## 📝 METADATA (For App Store Connect)
- [ ] **Support URL**: `https://panospace.com/help` (or your actual URL)
- [ ] **Privacy Policy URL**: `https://panospace.com/privacy` (or your actual URL)
- [ ] **Demo Account**: Provide the credentials above.
- [ ] **Notes**: "This app allows user-generated content. We have strict moderation, reporting, and blocking features."

## 🙈 HIDDEN FEATURES
- [ ] Debug route (`/debug`) is inaccessible.
- [ ] Wallet/Marketplace unfinished features are hidden.

**GOOD LUCK! 🚀**
