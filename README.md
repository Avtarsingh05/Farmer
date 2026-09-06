# KisanMitra

**Digital agricultural marketplace connecting farmers directly with buyers.**

> Smart India Hackathon 2026 — Problem Statement SIH26033
> *"Multiple intermediaries reduce farmers' earnings and increase consumer prices."*

---

## Overview

KisanMitra is a production-quality web application that enables farmers to list and sell agricultural produce directly to buyers — consumers, retailers, restaurants, wholesalers, and institutions — without unnecessary intermediaries.

Key differentiators:
- **Transparent pricing**: Farmers set their own prices. Buyers see exactly what they're paying and to whom.
- **Direct ordering**: No hidden commissions between farmer and buyer.
- **Verified farmers**: Admin-controlled verification process.
- **Real inventory management**: Prevents overselling with atomic inventory operations.
- **Structured order lifecycle**: State-machine-enforced order status transitions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Routing | React Router v6 |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Storage | Cloudinary (images) |
| Styling | Tailwind CSS v3 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

---

## Architecture

```
src/
├── app/               # Root app, providers, router, route guards
├── components/
│   ├── ui/            # Reusable design system components
│   ├── shared/        # Domain-specific shared components
│   └── layout/        # Navigation and layout wrappers
├── features/          # Feature-specific logic (reserved for growth)
├── hooks/             # Custom React hooks
├── lib/
│   └── firebase/      # Firebase config, auth, Firestore helpers
├── pages/
│   ├── public/        # Landing, market, product detail, farmer profiles
│   ├── auth/          # Login, register, forgot password
│   ├── farmer/        # Farmer dashboard, products, orders, inventory, earnings
│   ├── buyer/         # Buyer dashboard, cart, orders, favorites
│   └── admin/         # Admin panel — users, farmers, products, categories, orders
├── schemas/           # Zod validation schemas
├── services/          # Firebase service functions (data access layer)
├── types/             # TypeScript type definitions
└── utils/             # Pure utilities (currency, date, error messages, state machine)
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project (see Firebase Setup)
- A Cloudinary account (see Cloudinary Setup)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/kisanmitra.git
cd kisanmitra

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Cloudinary values

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

| Variable | Description | Safe in Frontend? |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key | ✅ Yes — access controlled by rules |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ✅ Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ✅ Yes |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset | ✅ Yes (unsigned only) |

> **NEVER put in the frontend:**
> - `CLOUDINARY_API_SECRET` — use Cloud Functions if server-side ops needed
> - `FIREBASE_SERVICE_ACCOUNT_JSON` — admin SDK belongs on the server only
> - Any private API key or database credential

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → Email/Password and Google providers.
3. Enable **Firestore Database** in production mode.
4. Copy your web app config values into `.env.local`.
5. Deploy Firestore security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### Creating the First Admin User

Admin users cannot self-register (for security). To create an admin:

1. Register normally as a buyer or farmer.
2. In the Firebase Console, go to Firestore → `users` collection.
3. Find the document for your user UID.
4. Manually change the `role` field from `'buyer'` to `'admin'`.

This one-time bootstrap step is the only way to create admins. All subsequent admin grants can be done through your admin panel.

---

## Cloudinary Setup

1. Create a [Cloudinary account](https://cloudinary.com/).
2. Go to Settings → Upload → Upload Presets.
3. Create an **unsigned** upload preset.
4. Set allowed formats: `jpg,jpeg,png,webp`
5. Set max file size and any folder structure.
6. Copy the preset name and cloud name into `.env.local`.

---

## Firestore Security Rules

Rules are in `firestore.rules`. Key principles:

- **Users** can only read and update their own profile. Role cannot be self-changed.
- **Farmers** cannot change their own `verificationStatus`.
- **Products** can only be created/edited by the owning farmer.
- **Orders** protect all financial and ownership fields from client manipulation.
- **Inventory** prevents overselling (also validated in `inventoryService.ts`).
- **Notifications, favorites** are strictly user-scoped.
- **Admin routes** have no client-accessible bypass.

---

## Order State Machine

```
pending → accepted → processing → ready_for_dispatch → out_for_delivery → delivered
        ↘ rejected
        ↘ cancelled (pending only, by buyer)
```

Status transitions are validated in `src/utils/orderStateMachine.ts` and enforced in `src/services/orderService.ts`. Firestore rules prevent arbitrary field writes.

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm test             # Run all unit tests (Vitest)
npm run test:watch   # Watch mode tests
npm run lint         # Lint source files
```

---

## Build

```bash
npm run build
```

Output goes to `dist/`. The build is split into vendor, Firebase, and app chunks for optimal loading.

---

## Deployment — Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting (select 'dist' as public directory, yes to SPA)
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) are configured in `firebase.json`.

---

## Testing

```bash
npm test
```

Tests cover:
- Order state machine — all valid and invalid transitions
- Currency formatting — Indian numbering system (₹1,25,000)
- Auth schema — email, password, role, Indian phone validation
- Product schema — quantity, price, unit, quality grade validation

---

## Production Checklist

- [ ] Firebase rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Firestore indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] All env vars set in Firebase Hosting environment or CI/CD
- [ ] `.env` files are in `.gitignore` and never committed
- [ ] No service account JSON in repository
- [ ] Admin user created via Firestore console (no self-registration)
- [ ] Cloudinary upload preset is unsigned and restricted to image types
- [ ] Firebase project is in production mode (no open rules)
- [ ] Error messages do not expose stack traces or internal IDs
- [ ] HTTPS-only deployment confirmed
- [ ] Security headers verified (use securityheaders.com)
- [ ] Run `npm test` — all tests pass
- [ ] `npm run build` completes without TypeScript errors

---

## Currency & Localization

- Default currency: **INR (₹)**
- Number formatting: Indian system — ₹1,25,000 (not ₹125,000)
- Uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- Architecture supports adding regional languages (Hindi, Marathi, etc.) later

---

## Search

Current implementation uses Firestore prefix/field matching. This is sufficient for MVP. When scale requires it, upgrade to:

- [Algolia](https://www.algolia.com/)
- [Typesense](https://typesense.org/) (self-hosted option)
- [Meilisearch](https://www.meilisearch.com/)

The service layer in `productService.ts` is designed to be cleanly replaced.

---

## Payment Integration

Order financial data is tracked in Firestore (`paymentStatus` field). Actual payment processing is not included in this MVP. Architecture is ready for:

- **Razorpay** — recommended for Indian market
- **PayU** — alternative for India
- Integration via Firebase Cloud Functions (server-side payment capture)

---

## Privacy

- Farmer phone numbers are not exposed publicly without consent
- Buyer delivery addresses are visible only to the involved farmer on accepted orders
- Public farmer profiles show only display name, location, and verification status
- User emails are stored but not surfaced in public APIs

---

## License

This project is built for the Smart India Hackathon 2026. All rights reserved.
