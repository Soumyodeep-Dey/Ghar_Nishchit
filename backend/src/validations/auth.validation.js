import { z } from "zod";

const password = z.string().min(8).max(128);
const email = z.string().email().max(254).transform((value) => value.toLowerCase().trim());

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(20),
    email,
    role: z.enum(["tenant", "landlord"]),
    password,
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({ email, password: z.string().min(1).max(128) }).strict(),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1).max(4096) }).strict(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1).max(128),
    newPassword: password,
  }).strict(),
});
