const { test, expect } = require('@playwright/test');

test('contact form submits without navigating and preserves scroll position', async ({ page }) => {
  await page.route('**/api/inquiry', async route => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    const payload = request.postDataJSON();
    expect(payload.name).toBe('Test Customer');
    expect(payload.email).toBe('test@example.com');
    expect(payload.message).toBe('Automated form test.');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Thanks — your message was sent successfully. R&J Productions will get back to you soon.'
      })
    });
  });

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const form = page.locator('#contactForm');
  await form.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 120));

  const scrollBefore = await page.evaluate(() => window.scrollY);
  expect(scrollBefore).toBeGreaterThan(0);

  await page.locator('#c-name').fill('Test Customer');
  await page.locator('#c-email').fill('test@example.com');
  await page.locator('#c-message').fill('Automated form test.');
  await form.locator('button[type="submit"]').click();

  await expect(page.locator('#contactSuccess')).toBeVisible();
  await expect(page.locator('#contactSuccess')).toContainText('sent successfully');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/index\.html/);

  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(120);
});
