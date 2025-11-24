# ☕ Café Voltaire
### **QR‑Based Customer Rewards Platform**

A modern loyalty system for cafés where customers scan QR codes to earn points. Points are securely processed through Firebase Cloud Functions, stored in Firestore, and displayed in the React app. Café Voltaire provides a simple, modern, and scalable way for small businesses to offer digital rewards.

---

## 🌟 Overview
Café Voltaire allows customers to:
- Scan in‑store QR codes.
- Earn points tied to predefined “earn codes.”
- View updated totals in real time.

The backend ensures each QR code can only be used once per user and updates points using Firestore transactions.

This project includes:
- React (Vite) frontend
- Express + TypeScript backend
- Firebase Authentication
- Firestore database
- Firebase Cloud Functions
- Production seeding scripts for Firestore

---

## 🚀 Features
- 📱 **QR‑based point earning**
- 🔐 **Firebase Auth user accounts**
- 🔥 **Cloud Functions for secure point transactions**
- 🧮 **Atomic Firestore updates using transactions**
- 📦 **Pre‑generated earn codes with point values**
- ⛔ **Double‑claim prevention**
- 🧪 **Production seeding for users and earn codes**

---

## 🧰 Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Backend:** Express, ts-node-dev
- **Database:** Firestore
- **Auth:** Firebase Authentication
- **Cloud Functions:** Firebase Functions
- **Admin SDK:** Firebase Admin (for seeds + functions)

---

## 🏗 Architecture
```
React App ── scans QR ──▶ httpsCallable()
      │                   (earnPointsWithQr)
      ▼
Firebase Cloud Function
      │   Transaction
      ▼
Firestore
  ├── users/{uid}
  ├── preGeneratedEarnCodes/{codeId}
  └── userClaimedCodes/{uid_codeId}
```

---

## 📁 Project Structure
```
Cafe-Voltaire/
│
├─ src/                     # React frontend + Express backend
│   ├─ App.tsx
│   ├─ main.tsx
│   └─ server.ts
│
├─ functions/               # Firebase Cloud Functions
│   └─ index.js             # earnPointsWithQr
│
├─ firebase-scripts/        # Seeding scripts
│   ├─ seedEarnCodes.js
│   └─ seedUsers.js
│
├─ firebase.json
├─ firestore.rules
├─ firestore.indexes.json
├─ package.json
└─ README.md
```

---

## 🧪 Getting Started
### 1. Clone the Repository
```bash
git clone https://github.com/mod-io/Cafe-Voltaire.git
cd Cafe-Voltaire
```

### 2. Install dependencies
```bash
npm install
```

---

## 🔐 Environment Setup
Create a `.env.local` file:
```
VITE_FB_API_KEY=YOUR_API_KEY
VITE_FB_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FB_PROJECT_ID=YOUR_PROJECT_ID
VITE_FB_APP_ID=YOUR_APP_ID
```

---

## ▶️ Running the Project
### Start backend (Express)
```bash
npm run dev
```

### Start frontend (React + Vite)
```bash
npm run dev:frontend
```

### Build for production
```bash
npm run build
npm run build:frontend
```

---

## ☁️ Cloud Function: earnPointsWithQr
This function:
- Authenticates the user
- Validates the scanned earn code
- Prevents double-claiming
- Updates user point totals in a transaction
- Logs redemption

Deploy it:
```bash
firebase deploy --only functions
```

---

## 🗄 Firestore Data Model
### `users/{uid}`
```json
{
  "pointTotal": 25,
  "createdAt": "<timestamp>"
}
```

### `preGeneratedEarnCodes/{codeId}`
```json
{
  "pointValue": 10
}
```

### `userClaimedCodes/{uid_codeId}`
```json
{
  "userId": "uid",
  "codeId": "COFFEE_BOOST_1",
  "claimedAt": "<timestamp>"
}
```

---

## 🌱 Seeding Production Data
Both seed scripts require a Firebase service account file (not committed). Set env variable first:

### Windows PowerShell
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\keys\cafe-voltaire.json"
```

---
### Seed Earn Codes
All default codes:
```bash
npm run seed:codes
```

Single code:
```bash
npm run seed:codes -- COFFEE_BOOST_1 25
```

---
### Seed Users
All default test users:
```bash
npm run seed:users
```

Single user:
```bash
npm run seed:users -- TEST_USER_123
```

---

## 🚀 Deployment
### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore
```

---

## 📌 Roadmap
- Reward redemption flow
- Café admin dashboard
- QR code generator UI
- Analytics dashboard
- Role-based admin accounts
- Dark mode

---

## 🤝 Contributing
1. Create a feature branch
2. Commit your changes
3. Push to GitHub
4. Open a Pull Request

---

## 👥 Contributors
- **Stephen** — Firebase integration, backend logic, production seeds
- **Cole** — Core backend setup and infrastructure
- **UF CEN3031 Team** — Frontend and project structure

---

### ☕ Built for Café Voltaire — A Modern Digital Rewards Experience

