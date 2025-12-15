# QA Steps: Shop Marketplace Overhaul

## 1. Signup Age Gating
*   **Test Case 1.1: Underage User (<14)**
    *   **Action:** Go to Signup page. Enter a Date of Birth (DOB) that makes you 13 years old (e.g., 2011).
    *   **Expected Result:** Signup button click triggers error "You must be 14 or older to use Panospace." Account is NOT created.
*   **Test Case 1.2: Minor User (14-17)**
    *   **Action:** Enter a DOB for 15 years old. Complete signup.
    *   **Expected Result:** Account created.
    *   **Verification:** Check Firestore/User Object: `isAdult` should be `false`, `guardianRequired` should be `true`, `sellerStatus` should be `'none'`.
*   **Test Case 1.3: Adult User (18+)**
    *   **Action:** Enter a DOB for 20 years old. Complete signup.
    *   **Verification:** `isAdult` should be `true`, `sellerStatus` should be `'none'`.

## 2. Shop Tab & Seller Verification
*   **Test Case 2.1: Unverified Seller View**
    *   **Action:** Go to your own Profile -> Click "Shop" tab.
    *   **Expected Result:** You see the "Become a Seller" prompt with a "Start Verification" button. The empty state ("Your shop is looking empty") is NOT visible or is below the specific gate.
*   **Test Case 2.2: Verification Flow (Adult)**
    *   **Action:** Click "Start Verification". Verify Age Status says "Identity Verified". Agree to terms. Click "Submit Application".
    *   **Expected Result:** Redirected back to Profile. "Become a Seller" prompt is GONE. You see "Create Your First Item" button.
*   **Test Case 2.3: Verification Flow (Minor)**
    *   **Action:** log in as Minor. Click "Start Verification".
    *   **Expected Result:** Verify Age Status says "Guardian Consent Required". "Guardian Email" input is visible and required.
    *   **Note:** In current demo implementation, submission sets it to 'pending' or 'verified' depending on code logic (set to 'pending' for minors).

## 3. Image Pipeline & Print Quality
*   **Test Case 3.1: Large Image Upload**
    *   **Action:** Create Post. Upload a high-res photo (e.g., 4000x3000px). Toggle "Add to Shop".
    *   **Expected Result:**
        *   Client generates optimized Display version (max 3840px).
        *   App calculates valid print sizes based on **300 DPI** check.
        *   E.g. 4000px width / 300 = 13.3 inches. Prints wider than 13" should be disabled/hidden.
*   **Test Case 3.2: Small Image Upload**
    *   **Action:** Upload small image (800x600px). Toggle "Add to Shop".
    *   **Expected Result:**
        *   800 / 300 = 2.6 inches.
        *   Most print sizes (4x6, etc.) should be unavailable.
*   **Test Case 3.3: Storage Structure**
    *   **Action:** Publish the post.
    *   **Verification (Console/backend):**
        *   Display image URL points to `posts_display/...`.
        *   If Shop enabled, a separate upload occurred to `prints_master/...`.

## 4. Security Rules
*   **Test Case 4.1: Unverified Shop Creation**
    *   **Action:** (Requires dev tools) Try to write to `shopItems` collection while `sellerStatus` is 'none'.
    *   **Expected Result:** Firestore Permission Denied error.
*   **Test Case 4.2: Master File Access**
    *   **Action:** Try to open the `prints_master` URL from an Incognito window (unauthenticated).
    *   **Expected Result:** 403 Forbidden / Access Denied.

## 5. Create Post Shop UI (Phase 6)
*   **Test Case 5.1: Unverified User**
    *   **Action:** Go to Create Post -> Upload Image -> Look at "Sell as Print" section.
    *   **Expected Result:** "Seller Verification Required" warning box is visible. "Sell as Print" toggle is hidden or disabled. Button to "Verify Account" opens verification page.
*   **Test Case 5.2: Verifying Dimensions & Earnings**
    *   **Action:** (As Verified Seller) Toggle "Sell as Print" ON.
    *   **Expected Result:** 
        *   "Checking image resolution..." spinner appears briefly.
        *   Original Resolution is displayed (e.g., 4000x6000 px).
        *   List of valid print sizes appears.
        *   "Your Earnings" column shows calculated values (e.g., $2.50).
*   **Test Case 5.3: Low Resolution Warning**
    *   **Action:** Upload a small image (e.g. 500x500px). Toggle Shop ON.
    *   **Expected Result:** Warning message "Resolution too low for print. Minimum 300 DPI required." No sizes are selectable.

## 6. Shopping Cart (Phase 7)
*   **Test Case 6.1: Add to Cart**
    *   **Action:** Go to a Shop Item Detail page. Select a size. Click "Add to Cart".
    *   **Expected Result:** Toast "Added to Cart" appears.
*   **Test Case 6.2: View Cart**
    *   **Action:** Navigate to `/cart`.
    *   **Expected Result:** The item appears in the list with correct size, price, and thumbnail.
*   **Test Case 6.3: Persistence**
    *   **Action:** Reload the page.
    *   **Expected Result:** The item remains in the cart.
*   **Test Case 6.4: Update Quantity**
    *   **Action:** Click "+" button in cart.
    *   **Expected Result:** Quantity updates to 2. Total price updates.
*   **Test Case 6.5: Checkout Stub**
    *   **Action:** Click "Checkout".
    *   **Expected Result:** Alert "Checkout Integration Coming Soon! (Phase 7)" appears.
