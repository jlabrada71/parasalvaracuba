import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

type Page = import('@playwright/test').Page

/** Wait until Nuxt has hydrated, so clicks hit the Vue handlers and not a native form submit. */
async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const nuxt = (window as any).useNuxtApp?.()
    return !!nuxt && nuxt.isHydrating === false
  })
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/en/login')
  await hydrated(page)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
}

test('anonymous visitors are redirected from /admin to /login', async ({ page }) => {
  await page.goto('/en/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('wrong password shows a generic error', async ({ page }) => {
  await login(page, ADMIN_EMAIL, 'definitely-wrong-password')
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password')
})

test('admin invites a user who accepts and logs in; a non-admin cannot reach /admin', async ({ page, browser }) => {
  const invitee = `e2e-${Date.now()}@example.com`

  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await expect(page).toHaveURL(/\/admin$/)

  await page.getByLabel('Email').fill(invitee)
  await page.getByRole('button', { name: 'Create invitation' }).click()
  const link = await page.getByLabel(/Invitation link/).inputValue()
  expect(link).toMatch(/\/invite\//)
  await expect(page.getByRole('cell', { name: invitee, exact: true })).toBeVisible()

  const ctx = await browser.newContext()
  const guest = await ctx.newPage()
  const guestLink = link.replace(/(\/\/[^/]+)\//, '$1/en/')
  await guest.goto(guestLink)
  await hydrated(guest)
  await guest.getByLabel('Password', { exact: true }).fill('e2e-password-12345')
  await guest.getByLabel('Confirm password').fill('e2e-password-12345')
  await guest.getByRole('button', { name: 'Create account' }).click()
  await expect(guest).toHaveURL(/\/en\/?$/)

  await guest.goto('/en/admin')
  await expect(guest).toHaveURL(/\/login$/)

  // link is single-use
  await guest.goto(guestLink)
  await expect(guest.getByRole('alert')).toHaveText('This invitation is invalid or has expired.')
  await ctx.close()
})
