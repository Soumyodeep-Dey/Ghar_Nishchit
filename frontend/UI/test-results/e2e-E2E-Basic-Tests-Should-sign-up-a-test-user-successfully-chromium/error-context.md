# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> E2E Basic Tests >> Should sign up a test user successfully
- Location: tests\e2e.spec.js:25:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Registered successfully!')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Registered successfully!')

```

```yaml
- region "Notifications Alt+T":
  - img
  - text: Phone already registered
  - button "close"
  - progressbar "notification timer"
- link "Back to Home":
  - /url: /
- text: Ghar.Nishchit Premium Living
- heading "Join the Evolution of Rental." [level=2]
- list:
  - listitem: Verified Premium Listings
  - listitem: AI-Powered Matching Engine
  - listitem: 24/7 Priority Concierge
- img "User"
- img "User"
- img "User"
- img "User"
- text: Joining 500+ today
- heading "Create Account" [level=3]
- paragraph: Start your premium journey with us.
- button "Sign up with Google"
- text: or Full Name
- textbox "John Doe": Automated Test User
- text: Email Address
- textbox "you@example.com": testuser_1778832218687@example.com
- text: Phone Number
- textbox "+91 00000 00000": "1234567890"
- text: Account Type landlord tenant Password
- textbox "••••••••": TestPassword123!
- button
- button "Create Account"
- paragraph:
  - text: Already have an account?
  - link "Sign In":
    - /url: /login
- heading "Ghar.Nishchit" [level=1]
- button
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('E2E Basic Tests', () => {
  4  |   
  5  |   test('Should load landing page', async ({ page }) => {
  6  |     // Go to landing page
  7  |     await page.goto('http://localhost:5173/');
  8  |     
  9  |     // Check if the title or an element exists
  10 |     await expect(page).toHaveTitle(/Ghar/);
  11 |   });
  12 | 
  13 |   test('Should navigate to Login and show validation error', async ({ page }) => {
  14 |     // Navigate to Login
  15 |     await page.goto('http://localhost:5173/login');
  16 |     
  17 |     // Click Sign In button without entering credentials
  18 |     await page.click('button:has-text("Sign In Now")');
  19 |     
  20 |     // Because required fields, the browser might block it or show our toast.
  21 |     // Since it's a native required form field, we check if the form submits.
  22 |     // If we want to simulate a failure from backend, we could type invalid creds.
  23 |   });
  24 | 
  25 |   test('Should sign up a test user successfully', async ({ page }) => {
  26 |     await page.goto('http://localhost:5173/signup');
  27 |     
  28 |     const uniqueEmail = `testuser_${Date.now()}@example.com`;
  29 |     
  30 |     await page.fill('input[name="name"]', 'Automated Test User');
  31 |     await page.fill('input[name="email"]', uniqueEmail);
  32 |     await page.fill('input[name="phone"]', '1234567890');
  33 |     
  34 |     // Select role (assuming standard radio buttons for 'tenant' or 'landlord')
  35 |     // We click the label containing 'tenant'
  36 |     await page.click('text=Tenant');
  37 | 
  38 |     await page.fill('input[name="password"]', 'TestPassword123!');
  39 |     
  40 |     await page.click('button:has-text("Create Account")');
  41 |     
  42 |     // Expect the success toast
> 43 |     await expect(page.locator('text=Registered successfully!')).toBeVisible({ timeout: 5000 });
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  44 |   });
  45 | 
  46 | });
  47 | 
```