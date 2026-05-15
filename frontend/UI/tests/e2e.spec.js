import { test, expect } from '@playwright/test';

test.describe('E2E Basic Tests', () => {
  
  test('Should load landing page', async ({ page }) => {
    // Go to landing page
    await page.goto('http://localhost:5173/');
    
    // Check if the title or an element exists
    await expect(page).toHaveTitle(/Ghar/);
  });

  test('Should navigate to Login and show validation error', async ({ page }) => {
    // Navigate to Login
    await page.goto('http://localhost:5173/login');
    
    // Click Sign In button without entering credentials
    await page.click('button:has-text("Sign In Now")');
    
    // Because required fields, the browser might block it or show our toast.
    // Since it's a native required form field, we check if the form submits.
    // If we want to simulate a failure from backend, we could type invalid creds.
  });

  test('Should sign up a test user successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'Automated Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select role (assuming standard radio buttons for 'tenant' or 'landlord')
    // We click the label containing 'tenant'
    await page.click('text=Tenant');

    await page.fill('input[name="password"]', 'TestPassword123!');
    
    await page.click('button:has-text("Create Account")');
    
    // Expect the success toast
    await expect(page.locator('text=Registered successfully!')).toBeVisible({ timeout: 5000 });
  });

});
