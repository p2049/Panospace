# Stripe & Printful Integration Setup

## 1. Configuration

### Environment Variables (Local)
The `functions/.env` file has been created with your Test Secret Key.
**Note:** You need to add your `STRIPE_WEBHOOK_SECRET` to this file after running `stripe listen`.

### Environment Variables (Production)
Run these commands to set your secrets in Firebase:

```bash
firebase functions:config:set stripe.secret="sk_test_..." stripe.webhook_secret="whsec_..." printful.api_key="YOUR_PRINTFUL_KEY"
```

## 2. Local Testing

### Prerequisites
- Firebase CLI installed
- Stripe CLI installed (`stripe login`)

### Steps
1. **Start Emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Start Stripe Listener (for Webhooks):**
   Open a new terminal:
   ```bash
   stripe listen --forward-to localhost:5001/panospace-7v4ucn/us-central1/stripeWebhook
   ```
   *Copy the `whsec_...` signing secret output by this command and paste it into `functions/.env` as `STRIPE_WEBHOOK_SECRET`.*

3. **Start Frontend:**
   ```bash
   npm run dev
   ```

4. **Test the Flow:**
   - Go to `http://localhost:5173`
   - Log in
   - Click on a Post -> "Buy Print"
   - Complete checkout with a Stripe Test Card (e.g., `4242 4242 4242 4242`)
   - Verify you are redirected to the Success page.
   - Check the `stripe listen` terminal to see the `checkout.session.completed` event.
   - Check the Firebase Emulator UI (Firestore) to see the new `orders` document.

## 3. Printful Integration

### Variant Mapping
In `functions/index.js`, the `PRINT_VARIANTS` object maps sizes to Printful Variant IDs.
Currently, they are set to placeholder IDs (1, 2, 3).

**To get real IDs:**
1. Create a product in Printful.
2. Get the Variant IDs for that product (via API or Printful Dashboard).
3. Update `functions/index.js`:
   ```javascript
   const PRINT_VARIANTS = {
       'small': { id: 12345, name: '12x16"', price: 2500 },
       // ...
   };
   ```

### API Key
Provide your Printful API Key in `functions/.env` (local) or via `functions:config:set` (prod) to enable real order creation.
Without it, the system runs in "Mock Mode" (logs the order but doesn't send it).

## 4. Deployment

1. **Deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Hosting (Frontend):**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 5. Webhook Setup (Production)
1. Go to the Stripe Dashboard -> Developers -> Webhooks.
2. Add Endpoint: `https://us-central1-panospace-7v4ucn.cloudfunctions.net/stripeWebhook`
3. Select event: `checkout.session.completed`.
4. Copy the Signing Secret and set it in Firebase config (see section 1).
