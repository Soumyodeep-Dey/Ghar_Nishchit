import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

const dashboardByRole = {
  tenant: '/tenant',
  landlord: '/landlord',
  admin: '/admin',
};

const jwt = (role) => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.test-signature`;
};

const mockApi = async (page, { role = 'tenant', loginStatus = 200 } = {}) => {
  await page.route('**/api/**', async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname === '/api/auth/login') {
      if (loginStatus !== 200) {
        return route.fulfill({
          status: loginStatus,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: jwt(role),
          refreshToken: jwt(role),
          user: {
            _id: '507f1f77bcf86cd799439011',
            name: `Test ${role}`,
            email: `${role}@example.test`,
            role,
          },
        }),
      });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
};

const submitLogin = async (page) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('user@example.test');
  await page.locator('input[name="password"]').fill('ValidPassword123!');
  await page.getByRole('button', { name: /Sign In Now/i }).click();
};

test('landing page loads with the expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ghar/i);
});

for (const [role, dashboard] of Object.entries(dashboardByRole)) {
  test(`${role} login redirects to ${dashboard}`, async ({ page }) => {
    await mockApi(page, { role });
    await submitLogin(page);
    await expect(page).toHaveURL(new RegExp(`${dashboard}$`));
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('user'))?.role))
      .toBe(role);
  });
}

test('invalid credentials remain on login and show the API error', async ({ page }) => {
  await mockApi(page, { loginStatus: 401 });
  await submitLogin(page);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Invalid credentials')).toBeVisible();
});

test('an unauthenticated visitor is redirected away from a protected route', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});

test('a tenant session cannot open the admin dashboard', async ({ page }) => {
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, {
    token: jwt('tenant'),
    user: { _id: '507f1f77bcf86cd799439011', role: 'tenant', name: 'Test tenant' },
  });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/$/);
});
