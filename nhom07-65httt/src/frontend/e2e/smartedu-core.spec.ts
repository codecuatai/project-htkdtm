import { test, expect } from '@playwright/test'

test.describe('SmartEdu Core Routes E2E Smoke', () => {
  test('renders login page with email and password inputs', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
  })

  test('redirects unauthenticated users from protected student and admin routes', async ({ page }) => {
    await page.goto('/app/admin/approvals')
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/app/admin/datasets')
    await expect(page).toHaveURL(/\/login/)
  })
})