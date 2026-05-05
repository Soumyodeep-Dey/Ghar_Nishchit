<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/platform-web-lightgrey.svg" alt="Platform" />
</p>

# Ghar Nishchit 2.0

> **"Ghar Nishchit"** means *Home, Guaranteed* - a promise of trust and simplicity for renters and landlords across emerging urban India.

Ghar Nishchit is a full-stack rental platform that connects tenants and landlords directly with clear workflows for property discovery, tenancy, payments, maintenance, and communication.

This **2.0 README** keeps the original 1.0 vision and market positioning, while documenting the project as it exists today across `backend`, `frontend/UI`, and `Ai`.

---

## Table of Contents

- [1.0 Vision, 2.0 Delivery](#10-vision-20-delivery)
- [What Makes Us Different](#what-makes-us-different)
- [Current Product Features](#current-product-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Modules](#api-modules)
- [AI Module](#ai-module)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 1.0 Vision, 2.0 Delivery

### What stays from 1.0

- Focus on underserved Tier-2/Tier-3 and emerging urban markets
- Minimal, low-friction experience for both landlords and tenants
- Trust-first rental ecosystem without unnecessary middle layers
- Long-term plan for regional language support and AI-powered assistance

### What improves in 2.0

- Real module-level documentation for the current codebase
- Updated stack and scripts for frontend and backend
- Clear environment setup for local development
- API module overview aligned with actual route/controller structure
- AI assistant coverage based on implemented chatbot components

---

## What Makes Us Different

Most rental platforms optimize for saturated metro markets. Ghar Nishchit is designed for high-growth markets where users need clarity, speed, and practical workflows.

- **Simple first**: fewer steps from search to contact
- **Local-first context**: built with Eastern and emerging city behavior in mind
- **Direct interactions**: tenants and landlords communicate without bloated flows
- **Trust focus**: verified profiles, structured contracts, and transparent operations

---

## Current Product Features

### Tenant-side

- Account authentication and role-based access
- Property browsing and detail view
- Favorites and inquiry flow
- Contract and payment visibility
- Maintenance request lifecycle
- Tenant-landlord messaging interface

### Landlord-side

- Property CRUD and listing management
- Tenant overview and lifecycle operations
- Payment and contract management
- Maintenance tracking and updates
- Notifications and communication workflows
- Report and dashboard-oriented pages

---

## Tech Stack

### Frontend (`frontend/UI`)

- React 19 + Vite 7
- React Router DOM 7
- Tailwind CSS
- Firebase
- Framer Motion
- Toast notifications (`react-toastify`)
- Gemini SDK client (`@google/generative-ai`) for chatbot integration

### Backend (`backend`)

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- bcryptjs for password hashing
- Razorpay integration
- dotenv and CORS

### Tooling

- ESLint + Prettier
- Nodemon for backend development

---

## Repository Structure

```text
Ghar_Nishchit/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── db/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── utils/
│   └── package.json
│
├── frontend/
│   └── UI/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Auth/
│       │   │   └── Pages/
│       │   │       ├── LANDLORD/
│       │   │       └── TENANT/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── App.jsx
│       │   └── main.jsx
│       └── package.json
│
└── Ai/
    ├── Chatbot.jsx
    ├── bot.md
    └── list_models.js
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)

### 1) Clone and install

```bash
git clone https://github.com/your-username/Ghar_Nishchit.git
cd Ghar_Nishchit
```

### 2) Start backend

```bash
cd backend
npm install
npm run dev
```

### 3) Start frontend

```bash
cd ../frontend/UI
npm install
npm run dev
```

### 4) Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000` (or your configured backend port)

---

## Environment Variables

Create a `.env` file in each module where needed.

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`frontend/UI/.env`)

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_BASE=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

> If `VITE_GEMINI_API_KEY` is missing, the chatbot will warn users at runtime.

---

## Scripts

### Backend

- `npm run dev` - start backend with nodemon
- `npm start` - run production-like backend start

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build locally
- `npm run lint` - run ESLint checks

---

## API Modules

The backend currently exposes route groups for:

- `auth`
- `user`
- `property`
- `tenant`
- `maintenance`
- `payment`
- `contract`
- `favourites`
- `inquiry`
- `visit`
- `notification`

For request-level details, refer to backend route and controller files under `backend/src/routes` and `backend/src/controllers`.

---

## AI Module

The `Ai` folder currently includes:

- `Chatbot.jsx`: in-app chatbot UI and Gemini model integration
- `bot.md`: assistant behavior and response baseline
- `list_models.js`: utility script to list available Gemini models

Current assistant positioning:

- Name: **Landmark AI Assistant**
- Scope: support guidance for both tenant and landlord journeys
- Behavior: concise, polite, product-aware responses

---

## Roadmap

The product roadmap remains aligned with the 1.0 direction:

- Expansion into more Tier-2 and Tier-3 markets
- Richer payment and lease workflows
- Mobile app strategy
- Deeper AI support (recommendations, smarter intent handling, multilingual support)
- Advanced trust and verification features

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes with clear messages
4. Push your branch
5. Open a Pull Request

---

## License

Licensed under ISC. See [LICENSE](LICENSE).

---

<p align="center">
  <b>Built for Indian renters and landlords who deserve a smoother experience.</b>
</p>
