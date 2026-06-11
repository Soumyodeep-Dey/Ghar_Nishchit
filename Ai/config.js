/**
 * Gemini API key — loaded by Vite from Ai/.env and/or frontend/UI/.env (see vite.config.js).
 */
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/** Free-tier friendly default; override with VITE_GEMINI_MODEL in Ai/.env or frontend/UI/.env */
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 
'gemini-3.5-flash';

export const SYSTEM_PROMPT = `You are Landmark AI Assistant, the official AI support bot for the Ghar Nishchit platform.
Ghar Nishchit is a property management platform for landlords and tenants.
If asked how to log in, tell them to click the "Login" button at the top navigation bar, enter their email and password, and select their role (Tenant or Landlord).
Key features: Landlords can manage properties, tenants, maintenance, and payments. Tenants can pay rent, submit maintenance requests, and message landlords.
Always be polite, concise, and helpful!`;

export const QUICK_PROMPTS = [
  'How do I log in?',
  'Browse properties',
  'Submit a maintenance request',
];
