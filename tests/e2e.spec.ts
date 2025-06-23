import { test, expect } from '@playwright/test';

const email = 'testuser@example.com';
const password = 'password123';

test('register, login, and view athlete profile', async ({ page }) => {
  await page.goto('/signup');

  await page.locator('input[type="text"]').first().fill('Test User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('select').selectOption('athlete');
  await page.locator('input[type="text"]').nth(1).fill('Soccer');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForURL(/\/login/);

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('select').selectOption('athlete');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('/athletes/dashboard');
  await page.getByRole('link', { name: 'Edit Profile' }).click();

  await expect(page).toHaveURL('/athletes/profile');
  await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
});
