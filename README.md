<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/platform-web-lightgrey.svg" alt="Platform" />
</p>

# Ghar Nishchit 2.0

Ghar Nishchit is a full-stack rental platform for tenants, landlords, and admins. This README reflects the code that is currently implemented in `backend`, `frontend/UI`, and `Ai`.

## What Is Implemented

### Frontend

- Public landing page and authentication screens for login, signup, and forgot password
- Role-based tenant, landlord, and admin routes
- Tenant pages for properties, messages, maintenance, payments, profile updates, contracts, and help/support
- Landlord pages for properties, messages, maintenance, payments, tenants, profile updates, and help/support
- Global chatbot widget loaded from the `Ai` module
- Dark mode provider, language provider, toast notifications, and React Query caching

### Backend

- Express API with route groups for auth, users, properties, favourites, tenants, maintenance, inquiries, notifications, payments, landlord payments, visits, contracts, support, and admin
- JWT-based authentication and refresh flow
- MongoDB persistence through Mongoose
- Neon/Postgres access for the transactional outbox flow
- Razorpay order creation, payment verification, and webhook handlers for tenant and landlord payments
- Background outbox worker started with the server

## Tech Stack

### Frontend (`frontend/UI`)

- React 19
- Vite 7
- React Router DOM 7
- React Query
- Tailwind CSS
- Firebase
- Framer Motion
- React Toastify
- Google Generative AI SDK

### Backend (`backend`)

- Node.js + Express 5
- MongoDB + Mongoose
- PostgreSQL client via `pg`
- JWT authentication
- bcryptjs
- Razorpay
- dotenv and CORS
- Zod

## Repository Structure

```text
Ghar_Nishchit/
├── backend/
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── validations/
├── frontend/
│   └── UI/
│       └── src/
│           ├── App.jsx
│           ├── components/
│           ├── services/
│           ├── styles/
│           ├── utils/
│           └── i18n/
└── Ai/
    ├── Chatbot.jsx
    ├── bot.md
    └── list_models.js
```

## Visual Diagram

For a quicker high-level view of the system structure, open the architecture diagram here:

[Eraser Git Diagrammer](https://eraser.io/git-diagrammer?diagramId=CwHRAeH2658QdmUqyfq6)

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string
- Neon database connection string

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend/UI
npm install
npm run dev
```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
NEONDB_URL=your_neon_database_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
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

If `VITE_GEMINI_API_KEY` is missing, the chatbot will warn at runtime.

## Scripts

### Backend

- `npm run dev` - start the backend with nodemon
- `npm start` - start the backend with Node.js

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## API Modules

The backend currently mounts these route groups:

- `auth`
- `users`
- `properties`
- `favourites`
- `tenants`
- `maintenance`
- `inquiries`
- `notifications`
- `payments`
- `landlord-payments`
- `visits`
- `contracts`
- `support`
- `admin`

## AI Module

The `Ai` folder currently contains:

- `Chatbot.jsx` - in-app chatbot UI and Gemini integration
- `bot.md` - assistant behavior baseline
- `list_models.js` - helper script for listing Gemini models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a pull request

## License

Licensed under ISC. See [LICENSE](LICENSE).

<p align="center">
  <b>Built for renters and landlords who need a simpler workflow.</b>
</p>
