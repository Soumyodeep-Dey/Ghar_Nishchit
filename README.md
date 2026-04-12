<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-ISC-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/platform-web-lightgrey?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/status-active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/made%20for-India-orange?style=for-the-badge" alt="Made for India" />
</p>

<h1 align="center">Ghar Nishchit</h1>

<p align="center">
  <b>"Ghar Nishchit" &mdash; <i>Home, Guaranteed.</i></b><br/>
  A promise of trust, simplicity, and transparency for millions of renters and landlords across emerging urban India.
</p>

---

## Table of Contents

- [Overview](#overview)
- [What Makes Us Different](#what-makes-us-different)
- [Business Model](#business-model)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**Ghar Nishchit** is a comprehensive, full-stack property rental management platform built for **emerging urban India**. It connects **landlords** and **tenants** directly — no middlemen, no clutter, no confusion.

The platform provides end-to-end solutions for:

- Property listing and discovery
- Tenant and lease management
- Maintenance request tracking
- Direct landlord-tenant communication
- Analytics and financial reporting

> Starting with **Kolkata**, **Bhubaneswar**, and the **North-East region** — cities with growing rental demand but limited tech solutions.

---

## What Makes Us Different

Most rental platforms in India focus on saturated **metro cities** like Mumbai, Delhi, and Bangalore — leaving millions of renters in emerging cities underserved with overcomplicated apps.

**Ghar Nishchit takes a different approach:**

| Our Approach | Why It Matters |
|---|---|
| **Simple, Minimal Design** | Clean interface with fewer steps — no clutter, no confusion. Built for users who want results, not feature bloat. |
| **Focused on Emerging Markets** | Kolkata, Bhubaneswar, and North-East India — cities with growing demand but limited tech solutions. |
| **Local-First Strategy** | Deep understanding of regional rental practices, pricing patterns, and user behavior in Eastern India. |
| **Minimal Steps to Connect** | From property search to landlord contact in the fewest possible clicks. |
| **Regional Language Support** | Planned support for Bengali, Odia, and other regional languages. |

> While others chase the saturated metro market, we are building for the **next wave of urban India**.

---

## Business Model

### For Landlords

| Plan | Description |
|---|---|
| **Standard Listing Fee** | One-time fee per property listing with a fixed validity period |
| **Featured Listings** | Additional fee to boost property visibility in search results |
| **Verified Badge** | Optional verification service for enhanced trust and credibility |

### For Tenants

| Plan | Features |
|---|---|
| **Free Tier** | Browse listings, save favorites, limited contact reveals |
| **Basic Subscription** | Unlimited property views, direct landlord contact, priority support |
| **Premium Subscription** | All Basic features + early access, advanced filters, document storage |

### Why This Model Works

- **No Hidden Charges** — Clear, upfront pricing with no surprise fees
- **Value for Money** — Landlords pay only when they list; tenants pay only if they need premium features
- **Fair for Emerging Markets** — Pricing designed for Tier-2 and Tier-3 city affordability
- **Scalable** — Subscription model ensures sustainable growth while keeping the platform accessible

---

## Key Features

### For Tenants

| Feature | Description |
|---|---|
| **Smart Property Search** | Browse listings with intelligent filters (location, rent, bedrooms, amenities) |
| **Secure Authentication** | Firebase-powered authentication with email/password and social login |
| **Property Details** | View comprehensive property information with images and amenities |
| **Maintenance Requests** | Submit and track maintenance requests in real-time |
| **Direct Messaging** | Communicate directly with landlords through in-app messaging |
| **Favourites** | Save and organise favourite property listings |
| **Dashboard** | Personalised dashboard with payment history and lease information |

### For Landlords

| Feature | Description |
|---|---|
| **Property Management** | Add, edit, and manage multiple property listings |
| **Tenant Management** | Track tenants, lease agreements, and payment status |
| **Maintenance Tracking** | Receive, assign, and resolve maintenance requests |
| **Payment Management** | Track rent payments and generate financial reports |
| **Analytics Dashboard** | View property performance, occupancy rates, and revenue |
| **Report Generation** | Generate comprehensive reports for properties and tenants |
| **Communication Hub** | Centralised messaging with all tenants |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | Modern UI library with latest concurrent features |
| **Vite** | Latest | Next-generation frontend build tool |
| **Tailwind CSS** | Latest | Utility-first CSS framework |
| **Firebase** | Latest | Authentication and real-time features |
| **Framer Motion** | Latest | Smooth animations and transitions |
| **Recharts** | Latest | Data visualisation and charts |
| **React Router** | v7 | Client-side routing |
| **React Hot Toast** | Latest | Notification system |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ | JavaScript runtime |
| **Express** | ^5.1.0 | Fast, minimalist web framework |
| **MongoDB** | ^6.21.0 | NoSQL database for flexible data storage |
| **Mongoose** | ^8.16.3 | Elegant MongoDB object modelling |
| **JWT (jsonwebtoken)** | ^9.0.2 | Secure token-based authentication |
| **bcryptjs** | ^3.0.2 | Password hashing and security |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | ^17.1.0 | Environment variable management |

### DevOps and Tools

| Technology | Purpose |
|---|---|
| **Nodemon** | Development auto-reload |
| **Prettier** | Code formatting |
| **ESLint** | Code linting and quality |
| **npm** | Package management |

---

## Project Structure

```
Ghar_Nishchit/
|
|-- backend/                        # Node.js + Express REST API
|   |-- src/
|   |   |-- controllers/            # Request handlers
|   |   |   |-- auth.controller.js
|   |   |   |-- property.controller.js
|   |   |   |-- tenant.controller.js
|   |   |   `-- maintenance.controller.js
|   |   |-- models/                 # MongoDB Mongoose schemas
|   |   |   |-- user.model.js
|   |   |   |-- property.model.js
|   |   |   `-- maintenance.model.js
|   |   |-- routes/                 # API route definitions
|   |   |-- middlewares/            # Auth guards and validation
|   |   |-- utils/                  # Shared helper functions
|   |   |-- app.js                  # Express app setup
|   |   `-- index.js                # Server entry point
|   |-- seedMaintenance.js          # Dev seed script - maintenance data
|   |-- seedTenantData.js           # Dev seed script - tenant data
|   `-- package.json
|
|-- frontend/UI/                    # React 19 + Vite SPA
|   |-- src/
|   |   |-- components/
|   |   |   |-- Auth/               # Login, Signup, ForgotPassword
|   |   |   `-- Pages/
|   |   |       |-- LANDLORD/       # Landlord dashboard and features
|   |   |       `-- TENANT/         # Tenant dashboard and features
|   |   |-- services/               # API service layer
|   |   |-- utils/                  # Utility and helper functions
|   |   |-- App.jsx                 # Root application component
|   |   `-- main.jsx                # React DOM entry point
|   `-- package.json
|
`-- Ai/                             # AI/ML features (Coming Soon)
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/ChandraVerse/Ghar_Nishchit.git
cd Ghar_Nishchit
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev       # Development (with Nodemon auto-reload)
npm start         # Production
```

### 3. Setup Frontend

```bash
cd frontend/UI
npm install
```

Create a `.env` file in `frontend/UI/`:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the App

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## API Documentation

### Authentication

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | User login — returns JWT |
| `GET` | `/api/auth/profile` | Yes | Get authenticated user profile |

### Properties

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/properties` | No | Get all property listings |
| `POST` | `/api/properties` | Yes | Create a new property listing |
| `PUT` | `/api/properties/:id` | Yes | Update an existing property |
| `DELETE` | `/api/properties/:id` | Yes | Delete a property listing |

### Maintenance Requests

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Yes | Get all maintenance requests |
| `POST` | `/api/maintenance` | Yes | Submit a new maintenance request |
| `PATCH` | `/api/maintenance/:id` | Yes | Update request status |

### Tenants

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/tenants` | Yes | Get all tenants (landlord only) |
| `GET` | `/api/tenants/:id` | Yes | Get specific tenant details |
| `PUT` | `/api/tenants/:id` | Yes | Update tenant information |

> For detailed API documentation including request/response schemas, see [`backend/MAINTENANCE_API_DOCUMENTATION.md`](./backend/MAINTENANCE_API_DOCUMENTATION.md)

---

## Roadmap

### Mobile Application (React Native)

| Feature | Description |
|---|---|
| **Cross-Platform App** | Single codebase for iOS and Android using React Native |
| **Push Notifications** | Real-time alerts for messages, payments, and maintenance updates |
| **GPS Integration** | Location-based property search with maps |
| **Camera Integration** | Easy property photo uploads and document scanning |
| **Biometric Auth** | Fingerprint and Face ID authentication |
| **Offline Mode** | Access key features without internet connectivity |
| **Mobile Payments** | UPI, Google Pay, PhonePe integration |

### AI-Powered Features

| Feature | Description |
|---|---|
| **AI Chatbot** | 24/7 support with multi-language chat (Hindi, Bengali, Odia, English) |
| **Smart Rent Pricing** | AI-powered rent estimation based on location, amenities, and market trends |
| **Intelligent Search** | Natural language search — "2BHK near metro under 15k" |
| **Image Analysis** | Auto-tag property photos, detect room types, and quality scoring |
| **Fraud Detection** | Identify suspicious listings and protect users from scams |
| **Predictive Analytics** | Forecast occupancy rates, tenant churn, and revenue trends |
| **Document OCR** | Extract information from lease agreements and ID documents |
| **Voice Search** | Search properties using voice commands in regional languages |
| **Maintenance Prediction** | Predict maintenance needs before they become urgent |

### Planned Timeline

| Milestone | Target |
|---|---|
| Aadhaar-based e-sign and digital lease agreements | Q2 2025 |
| Background verification for tenants and landlords | Q2 2025 |
| Premium listings with boosted visibility | Q3 2025 |
| Automated rent reminders and late payment alerts | Q3 2025 |
| In-app rent payment with auto-debit | Q4 2025 |
| Credit score integration for tenant verification | Q4 2025 |
| Society/Apartment management features | Q1 2026 |
| Broker partnership program | Q1 2026 |
| Expansion to North-East India | Q2 2026 |
| Expansion to other Tier-2 and Tier-3 cities | Q3 2026 |

---

## Contributing

Contributions are what make open-source projects thrive. Any contribution you make is greatly appreciated.

### How to Contribute

1. **Fork** the repository
   ```bash
   git clone https://github.com/your-username/Ghar_Nishchit.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit with a meaningful message
   ```bash
   git commit -m "feat: add property image carousel"
   ```

4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub and describe your changes clearly

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

| Prefix | Use For |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes only |
| `style:` | Code style/formatting (no logic change) |
| `refactor:` | Code refactoring without feature changes |
| `test:` | Adding or updating tests |
| `chore:` | Build process or tooling changes |

### Development Guidelines

- Follow the existing code style enforced by **Prettier** and **ESLint**
- Write meaningful, descriptive commit messages
- Add or update tests for new features where applicable
- Update relevant documentation when adding new features
- Keep pull requests focused — one feature or fix per PR
- Be respectful and constructive in code review discussions

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/ChandraVerse/Ghar_Nishchit/issues) and include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behaviour
- Screenshots if applicable
- Your OS, Node.js version, and browser

### Suggesting Features

Have an idea? [Open a feature request issue](https://github.com/ChandraVerse/Ghar_Nishchit/issues) with the label `enhancement` and describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternative approaches you have considered

---

## Security

If you discover a **security vulnerability**, please do **not** open a public issue. Instead, contact the maintainers directly. We take all security reports seriously and will respond promptly.

### Security Best Practices in This Project

- All passwords are hashed with **bcryptjs** before storage
- API routes are protected with **JWT middleware**
- Environment variables keep secrets out of the codebase — never commit your `.env` file
- CORS is configured to restrict unauthorised cross-origin requests

---

## License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 ChandraVerse

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

---

## Acknowledgements

- Inspired by the real rental struggles of tenants and landlords in Eastern India
- Built for Indian renters and landlords who deserve a smoother experience
- Thanks to all open-source contributors whose libraries power this platform

---

<p align="center">
  <b>Star this repository if you find it helpful.</b>
</p>

<p align="center">
  Made in India &nbsp;|&nbsp; <a href="#table-of-contents">Back to Top</a>
</p>
