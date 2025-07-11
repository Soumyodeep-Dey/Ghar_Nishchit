# 🏠 Ghar_Nishchit V0.1

**Ghar_Nishchit** is a web-based rental platform designed for **urban India**, connecting **small landlords** with **tenants** in a simple, transparent, and direct way.

This is **version 0.1** — our MVP focused on **matchmaking only**. Once tenant and landlord connect, our job is done.

---

## 🚀 Project Goals

- Help tenants find verified listings easily.
- Enable small landlords to post and manage rentals.
- Simplify the rental search without intermediaries.
- Start local (Kolkata), scale to Tier-1 metros.

---

## ✨ Key Features

### 🧍 For Tenants
- Browse listings with smart filters (location, rent, bedrooms)
- Free sign-up with OTP (Twilio/MSG91)
- Get **3 free reveals** of landlord contact info
- In-app chat (Socket.io) & contact visibility
- Pay for unlimited reveals after 3 (via Razorpay)

### 🧑‍🌾 For Landlords
- Dashboard to post/edit/delete listings
- Track listing views and tenant inquiries
- Receive ratings from tenants

---

## 🛠 Tech Stack

### Frontend
- Next.js (SSR for SEO)
- Tailwind CSS
- Zustand / Context API
- React Hook Form
- Google Maps API

### Backend
- Node.js + Express (TypeScript)
- MongoDB Atlas
- JWT + OTP Auth
- Socket.io

### Integrations
- Razorpay (Payments)
- Twilio / MSG91 (OTP & SMS)
- Nodemailer + SendGrid (Emails)

### DevOps
- Frontend: Vercel
- Backend: Heroku / AWS / DigitalOcean
- CI/CD: GitHub Actions
- Monitoring: Sentry, LogDNA

---

## 📅 Sprint Breakdown

1. **Auth & Listing CRUD**
2. **Search, Filters & Reveal Credit Tracking**
3. **Subscription + Payments + Chat**
4. **UX Polish, Notifications & Production Deploy**

---

## 🧭 Future Roadmap

- Aadhaar-based e-sign & digital lease
- Background checks & premium listings
- Rent reminders & maintenance requests
- Native mobile apps (iOS & Android)

---

## 🧠 Project Name Meaning

**"Ghar Nishchit"** means *Home, Guaranteed* — a promise of trust and simplicity for millions of renters and landlords in India.

---

## 🤝 Contributing

This project is currently under active development by a small team. PRs and issues are welcome post-MVP.

---

## 📃 License

[MIT License](LICENSE)

---

> Built with ❤️ for Indian renters and landlords who deserve a smoother experience.
