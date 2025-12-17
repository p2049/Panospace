# 🎨 PanoSpace - Professional Photography Marketplace

> **A premium social platform and marketplace connecting photographers with art enthusiasts, powered by AI-driven discovery and seamless print-on-demand fulfillment.**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-MVP-yellow.svg)]()
[![Tech](https://img.shields.io/badge/tech-React%20%7C%20Firebase%20%7C%20Stripe-blue.svg)]()

---

## 🚀 **Vision & Market Opportunity**

PanoSpace is positioned to capture the **$4.2B photography marketplace** by offering what Instagram, VSCO, and 500px lack:

- **Dual Account System**: Separate artist and standard user experiences
- **Direct Monetization**: Built-in print-on-demand marketplace (40% platform take)
- **Smart Discovery**: EXIF-aware, discipline-based feed algorithm
- **Creator-First**: No ads on artist feeds, preserving artistic integrity

**Target Market**:
- 52M photographers worldwide (Statista 2024)
- $3.5B TAM in photography prints & merchandise
- 15% CAGR in creator economy platforms

---

## 🌌 **Philosophy**

> **"Products Fade. Worlds Endure."**

PanoSpace isn't just a product — it's a **living aesthetic**, a **visual universe** designed to outlast technology trends. We're building creative mythology that will inspire generations, the way analog film, space imagery, and cinematic moods have transcended decades.

**Read our full philosophy**: [docs/PHILOSOPHY.md](docs/PHILOSOPHY.md)

---

## 💰 **Revenue Model**

### Primary Revenue Streams:

1. **Print-on-Demand Marketplace** (60% of revenue target)
   - Platform takes 40% of profit margin
   - Artist receives 60% of profit margin
   - Automated fulfillment via Printful
   - Zero inventory risk

2. **Premium Subscriptions** (30% of revenue target)
   - Artist Pro: $19.99/mo - Advanced analytics, priority discover, portfolio site
   - Standard Plus: $4.99/mo - Ad-free, unlimited uploads, analytics

3. **Platform Services** (10% of revenue target)
   - Featured listings
   - Promoted posts
   - Portfolio hosting
   - Print fulfillment for enterprise

**Unit Economics**:
- Average print sale: $49.99
- Platform profit per sale: ~$8-12
- Customer acquisition cost: $15-25 (organic)
- Lifetime value: $75-125 (3-5 purchases/year)

---

## 🏗️ **Architecture**

### Technology Stack:

**Frontend:**
- React 18 + TypeScript
- Vite (fast builds)
- React Router v6
- Firebase SDK v10

**Backend:**
- Firebase Cloud Functions (TypeScript)
- Firestore (NoSQL database)
- Firebase Storage
- Firebase Authentication

**Payments & Fulfillment:**
- Stripe (payment processing)
- Printful API (print-on-demand)

**Infrastructure:**
- Firebase Hosting
- Cloud CDN
- Automated deployments via GitHub Actions

### System Architecture:

```
┌─────────────────┐
│   React Web App │
│  (Vite + TS)    │
└────────┬────────┘
         │
         ├─── Firebase Auth ───> User Sessions
         │
         ├─── Firestore ───────> Posts, Users, Shop Items
         │
         ├─── Cloud Storage ───> Image CDN
         │
         └─── Cloud Functions ─┬─> Post Lifecycle
                               ├─> Shop Item Creation  
                               ├─> Stripe Webhooks
                               ├─> Printful Orders
                               ├─> Search Indexing
                               └─> Analytics Events

External Services:
  - Stripe Payment Intent API
  - Printful Fulfillment API
  - (Optional) Algolia Search
```

---

## 📊 **Key Features**

### For Photographers (Artists):

- ✅ **Portfolio Showcase**: Multi-image posts with EXIF data
- ✅ **Print Marketplace**: One-click publish to shop
- ✅ **Revenue Dashboard**: Track earnings, sales, engagement
- ✅ **Smart Discovery**: Algorithm surfaces work to right audience
- ✅ **Manual EXIF Entry**: Complete metadata even without camera data
- ✅ **Discipline Tags**: Categorize as landscape, portrait, wildlife, etc.

### For Art Enthusiasts (Standard Users):

- ✅ **Curated Feed**: Personalized based on interests
- ✅ **Seamless Purchase**: Stripe checkout, delivered to door
- ✅ **Artist Support**: Direct support to favorite photographers
- ✅ **Social Features**: Follow, like, share, comment
- ✅ **Search & Discovery**: Find art by location, technique, subject

### Platform Features:

- ✅ **Dual Account Types**: Artist vs Standard experiences
- ✅ **Analytics Engine**: Track DAU, MAU, GMV, conversion
- ✅ **Viral Mechanics**: Share URLs with UTM tracking
- ✅ **Open Graph**: Rich social previews
- ✅ **Mobile-First**: Responsive design
- ✅ **Security**: Firestore rules, storage rules, input validation

---

## 🛠️ **Setup & Development**

### Prerequisites:

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Firebase CLI
```

### Installation:

```bash
# Clone repository
git clone https://github.com/your-org/panospace.git
cd panospace

# Install dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

### Environment Configuration:

Create `.env` in project root:

```env
# Firebase (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe (from Stripe Dashboard)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Optional: Algolia
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_key
```

Create `functions/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRINTFUL_API_KEY=your_printful_key
```

### Run Development Server:

```bash
# Start Firebase emulators (recommended)
firebase emulators:start

# Start local dev environment (RUNS VERCEL DEV)
# REQUIRED: Must use this to support API routes /api/*
npm run dev

# Visit: http://localhost:3000
```

### Production Build:

```bash
# Build frontend
npm run build

# Test production build locally
npm run preview

# Deploy to Firebase
firebase deploy
```

---

## 🧪 **Testing**

### Run Test Suite:

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Strategy:

- **Unit Tests**: Domain logic, utilities, calculations
- **Integration Tests**: Firebase interactions, API calls
- **E2E Tests**: Critical user flows (signup, post, purchase)
- **Performance Tests**: Firestore query optimization

**Coverage Targets**:
- Domain layer: 80%+
- Critical paths: 100%
- Overall: 70%+

---

## 📦 **Deployment**

### Deployment Checklist:

- [ ] Run tests: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Functions build: `cd functions && npm run build`
- [ ] Update Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Update security rules: `firebase deploy --only firestore:rules,storage:rules`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Deploy hosting: `firebase deploy --only hosting`

### CI/CD Pipeline:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Test
    - Build
    - Deploy to Firebase
    - Smoke tests
```

---

## 📈 **Analytics & Metrics**

### Key Performance Indicators:

**User Growth**:
- DAU (Daily Active Users)
- MAU (Monthly Active Users)
- Week 1 Retention
- Month 1 Retention

**Revenue**:
- GMV (Gross Merchandise Volume)
- Platform Revenue (40% of profit)
- Average Order Value (AOV)
- Conversion Rate (shop view → purchase)

**Engagement**:
- Posts per artist per month
- Likes per post
- Shares per post
- Shop views per post

**Viral Growth**:
- Viral Coefficient (shares/user)
- Referral Rate
- Organic vs Paid acquisition

### Viewing Metrics:

```bash
# Access analytics collection in Firestore Console
# Or build admin dashboard at /admin (future feature)
```

---

## 🔐 **Security**

### Firestore Security Rules:

```javascript
// Users can only edit their own profile
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}

// Users can only edit their own posts
match /posts/{postId} {
  allow read: if true;
  allow write: if request.auth.uid == resource.data.authorId;
}

// Shop items are read-only (managed by Cloud Functions)
match /shopItems/{itemId} {
  allow read: if true;
  allow write: if false; // Only Cloud Functions can write
}
```

### Best Practices Implemented:

- ✅ Input validation on all Cloud Functions
- ✅ Rate limiting on expensive operations
- ✅ Stripe webhook signature verification
- ✅ Storage rules prevent public writes
- ✅ No sensitive data in client code
- ✅ Environment variables for secrets

---

## 🗺️ **Roadmap**

### MVP (Current):

- [x] User authentication & profiles
- [x] Multi-image post creation
- [x] Shop marketplace
- [x] Stripe checkout
- [x] Basic search
- [x] Like/follow system

### Version 1.1 (Next 30 days):

- [ ] Real Printful integration (order fulfillment)
- [ ] Artist earnings dashboard
- [ ] Email notifications
- [ ] Premium subscriptions
- [ ] Advanced search filters

### Version 1.2 (Next 60 days):

- [ ] Mobile app (React Native)
- [ ] In-app messaging
- [ ] Collections/galleries
- [ ] Collaborative posts
- [ ] Print mockup generator

### Version 2.0 (Next 90 days):

- [ ] Artist Pro tools (analytics, portfolio site)
- [ ] Marketplace for workshops/courses
- [ ] NFT integration (digital art sales)
- [ ] AI-powered discovery
- [ ] Referral program

---

## 👥 **Team**

**Founder**: [Your Name]
**Tech Stack**: React, TypeScript, Firebase, Stripe, Printful
**Investors**: [If any]

---

## 📄 **License**

Proprietary - All rights reserved

---

## 📞 **Contact & Support**

- **Website**: https://panospace.app
- **Email**: hello@panospace.app
- **Discord**: [Community Link]
- **Twitter**: @panospace

---

## 🙏 **Acknowledgments**

Built with:
- React & Vite
- Firebase
- Stripe
- Printful
- Love for photography

---

**Last Updated**: November 2025  
**Version**: 2.0.0 (MVP)  
**Status**: Active Development → Seeking Investment

