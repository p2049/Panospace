# Panospace - How to Run

## Desktop (Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
  ```bash
   npm install
   ```
3. **Open in browser:**
   - The app will open automatically at `http://localhost:5173`
   - Or manually navigate to that URL

4. **View on phone (same network):**
   - Find your computer's IP address:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - On your phone's browser, go to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

## Phone (Mobile Browser)

### Option 1: Local Network (Development)
1. Make sure your phone and computer are on the same WiFi
2. Run `npm run dev` on your computer
3. Get your computer's local IP address
4. On phone browser: `http://YOUR_IP:5173`

### Option 2: Deployed Versionx
1. Deploy to Firebase Hosting:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
2. Access the live URL Firebase provides
3. Open that URL on your phone's browser
4. Add to home screen for app-like experience:
   - **iOS Safari**: Tap share → "Add to Home Screen"
   - **Android Chrome**: Menu → "Add to Home Screen"

## Testing

Run tests:
```bash
npm test
```

## Backend Functions

Deploy Cloud Functions (for contest, payments, etc.):
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Monthly Contest Schedule

The contest automatically runs on the **1st of every month at midnight UTC**.
No manual intervention needed - it's fully automated via Cloud Scheduler.

## Troubleshooting

- **Port 5173 already in use?** Kill the process or change the port in `vite.config.js`
- **Phone can't connect?** Check firewall settings allow port 5173
- **Build errors?** Run `npm install` again and check Node.js version (16+)
