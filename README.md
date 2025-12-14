<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/platform-web-lightgrey.svg" alt="Platform" />
</p>

# Ghar Nishchit

> **"Ghar Nishchit"** means *Home, Guaranteed* — a promise of trust and simplicity for millions of renters and landlords in India.

**Ghar Nishchit** is a comprehensive property rental management platform designed for **emerging urban India**, connecting **landlords** with **tenants** in a simple, transparent, and direct way. The platform provides end-to-end solutions for property listing, tenant management, maintenance requests, and seamless communication.

---

## Table of Contents

- [What Makes Us Different](#what-makes-us-different)
- [Business Model](#business-model)
- [Project Goals](#project-goals)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Future Scope](#future-scope)
- [Contributing](#contributing)

---

## What Makes Us Different

Most rental platforms in India focus on **metro cities** like Mumbai, Delhi, and Bangalore — leaving millions of renters and landlords in emerging cities underserved with overcomplicated apps designed for urban power users.

**Ghar Nishchit takes a different approach:**

| Our Approach | Why It Matters |
|--------------|----------------|
| **Simple, Minimal Design** | Clean interface with fewer steps — no clutter, no confusion. Built for users who want results, not features they'll never use. |
| **Focused on Emerging Markets** | We're starting with **Kolkata**, **Bhubaneswar**, and the **North-East region** — cities with growing rental demand but limited tech solutions. |
| **Local-First Strategy** | Deep understanding of regional rental practices, pricing patterns, and user behavior in Eastern India. |
| **Minimal Steps to Connect** | From property search to landlord contact in the fewest possible clicks. No unnecessary sign-up walls or feature bloat. |
| **Regional Language Support** | Planned support for Bengali, Odia, and other regional languages to serve users in their preferred language. |

> While others chase the saturated metro market, we're building for the **next wave of urban India**.

---

## Business Model

We believe in transparent and fair pricing that works for both landlords and tenants.

### For Landlords

| Plan | Description |
|------|-------------|
| **Standard Listing Fee** | One-time fee per property listing with a fixed validity period |
| **Featured Listings** | Additional fee to boost property visibility in search results |
| **Verified Badge** | Optional verification service for enhanced trust and credibility |

### For Tenants

| Plan | Features |
|------|----------|
| **Free Tier** | Browse listings, save favorites, limited contact reveals |
| **Basic Subscription** | Unlimited property views, direct landlord contact, priority support |
| **Premium Subscription** | All Basic features + early access to new listings, advanced filters, document storage |

### Why This Model Works

- **No Hidden Charges**: Clear, upfront pricing with no surprise fees
- **Value for Money**: Landlords pay only when they list; tenants pay only if they need premium features
- **Fair for Emerging Markets**: Pricing designed for Tier-2 and Tier-3 city affordability
- **Scalable**: Subscription model ensures sustainable growth while keeping the platform accessible

---

## Project Goals

- Help tenants find verified rental listings easily
- Enable landlords to manage properties, tenants, and maintenance efficiently
- Simplify the rental ecosystem without intermediaries
- Build trust through transparent communication and verified profiles
- Start with Kolkata and Bhubaneswar, then expand to North-East India and Tier-2 cities

---

## Key Features

### For Tenants

| Feature | Description |
|---------|-------------|
| **Smart Property Search** | Browse listings with intelligent filters (location, rent, bedrooms, amenities) |
| **Secure Authentication** | Firebase-powered authentication with email/password and social login |
| **Property Details** | View comprehensive property information with images and amenities |
| **Maintenance Requests** | Submit and track maintenance requests in real-time |
| **Direct Messaging** | Communicate directly with landlords through in-app messaging |
| **Favorites** | Save and organize favorite property listings |
| **Dashboard** | Personalized dashboard with payment history and lease information |

### For Landlords

| Feature | Description |
|---------|-------------|
| **Property Management** | Add, edit, and manage multiple property listings |
| **Tenant Management** | Track tenants, lease agreements, and payment status |
| **Maintenance Tracking** | Receive, assign, and resolve maintenance requests |
| **Payment Management** | Track rent payments and generate financial reports |
| **Analytics Dashboard** | View property performance, occupancy rates, and revenue |
| **Report Generation** | Generate comprehensive reports for properties and tenants |
| **Communication Hub** | Centralized messaging with all tenants |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI library with latest features |
| **Vite** | Next-generation frontend build tool |
| **Tailwind CSS** | Utility-first CSS framework |
| **Firebase** | Authentication and real-time features |
| **Framer Motion** | Smooth animations and transitions |
| **Recharts** | Data visualization and charts |
| **React Router v7** | Client-side routing |
| **React Hot Toast** | Notifications system |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Fast, minimalist web framework |
| **MongoDB** | NoSQL database for flexible data storage |
| **Mongoose** | Elegant MongoDB object modeling |
| **JWT** | Secure token-based authentication |
| **bcryptjs** | Password hashing and security |

### DevOps and Tools

| Technology | Purpose |
|------------|---------|
| **npm** | Package management |
| **Nodemon** | Development auto-reload |
| **Prettier** | Code formatting |
| **ESLint** | Code linting and quality |

---

## Project Structure

```
Ghar_Nishchit/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── property.controller.js
│   │   │   ├── tenant.controller.js
│   │   │   ├── maintenance.controller.js
│   │   │   └── ...
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── user.model.js
│   │   │   ├── property.model.js
│   │   │   ├── maintenance.model.js
│   │   │   └── ...
│   │   ├── routes/             # API route definitions
│   │   ├── middlewares/        # Auth and validation
│   │   ├── utils/              # Helper functions
│   │   ├── app.js              # Express app setup
│   │   └── index.js            # Server entry point
│   └── package.json
│
├── frontend/UI/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login, Signup, ForgotPassword
│   │   │   └── Pages/
│   │   │       ├── LANDLORD/   # Landlord dashboard and features
│   │   │       └── TENANT/     # Tenant dashboard and features
│   │   ├── services/           # API service layer
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # React entry point
│   └── package.json
│
└── Ai/                         # AI/ML features (Coming Soon)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Ghar_Nishchit.git
   cd Ghar_Nishchit
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   # PORT=5000
   # MONGODB_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret
   
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend/UI
   npm install
   
   # Create .env file with:
   # VITE_API_URL=http://localhost:5000
   # VITE_FIREBASE_CONFIG=your_firebase_config
   
   npm run dev
   ```

4. **Open in browser**
   ```
   Frontend: http://localhost:5173
   Backend:  http://localhost:5000
   ```

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties |
| POST | `/api/properties` | Create new property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

### Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | Get maintenance requests |
| POST | `/api/maintenance` | Create maintenance request |
| PATCH | `/api/maintenance/:id` | Update request status |

### Tenants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | Get all tenants |
| GET | `/api/tenants/:id` | Get tenant details |
| PUT | `/api/tenants/:id` | Update tenant info |

---

## Future Scope

### Mobile Application (React Native)

We're planning to build a cross-platform mobile application using React Native to extend our reach:

| Feature | Description |
|---------|-------------|
| **Cross-Platform App** | Single codebase for iOS and Android using React Native |
| **Push Notifications** | Real-time alerts for messages, payments, and maintenance updates |
| **GPS Integration** | Location-based property search with maps |
| **Camera Integration** | Easy property photo uploads and document scanning |
| **Biometric Auth** | Fingerprint and Face ID authentication |
| **Offline Mode** | Access key features without internet connectivity |
| **Mobile Payments** | UPI, Google Pay, PhonePe integration |

### AI-Powered Chatbot

An intelligent chatbot to enhance user experience:

| Feature | Description |
|---------|-------------|
| **24/7 Support** | AI chatbot for instant query resolution |
| **Property Recommendations** | Suggest properties based on user preferences and history |
| **Maintenance Assistant** | Help tenants describe and categorize maintenance issues |
| **Multi-language Support** | Chat in Hindi, Bengali, Odia, English, and regional languages |
| **Smart FAQ** | Auto-answer common questions about listings, payments, etc. |
| **Intent Recognition** | Understand user needs and route to appropriate actions |

### Advanced AI Features

Leveraging AI/ML to revolutionize the rental experience:

| Feature | Description |
|---------|-------------|
| **Smart Rent Pricing** | AI-powered rent estimation based on location, amenities, and market trends |
| **Intelligent Search** | Natural language property search ("2BHK near metro under 15k") |
| **Image Analysis** | Auto-tag property photos, detect room types, and quality scoring |
| **Predictive Analytics** | Forecast occupancy rates, tenant churn, and revenue trends |
| **Fraud Detection** | Identify suspicious listings and protect users from scams |
| **Personalized Recommendations** | ML-based property matching based on user behavior |
| **Document OCR** | Extract information from lease agreements and ID documents |
| **Voice Search** | Search properties using voice commands in regional languages |
| **Sentiment Analysis** | Analyze reviews and feedback to improve services |
| **Maintenance Prediction** | Predict maintenance needs before they become urgent |

### Planned Roadmap

| Feature | Timeline |
|---------|----------|
| Aadhaar-based e-sign and digital lease agreements | Q2 2025 |
| Background verification for tenants and landlords | Q2 2025 |
| Premium listings with boosted visibility | Q3 2025 |
| Automated rent reminders and late payment alerts | Q3 2025 |
| Rent payment through app with auto-debit | Q4 2025 |
| Credit score integration for tenant verification | Q4 2025 |
| Society/Apartment management features | Q1 2026 |
| Broker partnership program | Q1 2026 |
| Expansion to North-East India | Q2 2026 |
| Expansion to other Tier-2 and Tier-3 cities | Q3 2026 |

---

## Contributing

We welcome contributions from the community. Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Team

Built for Indian renters and landlords who deserve a smoother experience.

---

<p align="center">
  <b>Star this repo if you find it helpful!</b>
</p>

<p align="center">
  <a href="#ghar-nishchit">Back to Top</a>
</p>
