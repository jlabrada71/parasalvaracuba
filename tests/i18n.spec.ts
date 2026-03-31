import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Internationalization (i18n)', () => {
  test('should load in Spanish by default', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveURL(BASE_URL + '/')

    // Check for Spanish text
    await expect(page.locator('h1')).toContainText('Ideas para Cuba')
    await expect(page.locator('.subtitle')).toContainText('Envía y vota ideas')
  })

  test('should display language switcher buttons', async ({ page }) => {
    await page.goto(BASE_URL)

    // Check for language switcher buttons
    const langSwitcher = page.locator('.lang-switcher')
    await expect(langSwitcher).toBeVisible()

    // Check for all three language buttons
    await expect(page.locator('text=Español')).toBeVisible()
    await expect(page.locator('text=English')).toBeVisible()
    await expect(page.locator('text=Português')).toBeVisible()
  })

  test('should switch to English when clicking English button', async ({ page }) => {
    await page.goto(BASE_URL)

    // Click English button
    await page.locator('a:has-text("English")').click()

    // Should navigate to /en/
    await expect(page).toHaveURL(BASE_URL + '/en/')

    // Should show English text
    await expect(page.locator('h1')).toContainText('Ideas for Cuba')
    await expect(page.locator('.subtitle')).toContainText('Submit and vote on ideas')
    await expect(page.locator('text=+ New Idea')).toBeVisible()
  })

  test('should switch to Portuguese when clicking Português button', async ({ page }) => {
    await page.goto(BASE_URL)

    // Click Portuguese button
    await page.locator('a:has-text("Português")').click()

    // Should navigate to /pt/
    await expect(page).toHaveURL(BASE_URL + '/pt/')

    // Should show Portuguese text
    await expect(page.locator('h1')).toContainText('Ideias para Cuba')
    await expect(page.locator('.subtitle')).toContainText('Envie e vote em ideias')
    await expect(page.locator('text=+ Nova ideia')).toBeVisible()
  })

  test('should translate navigation links correctly in Spanish', async ({ page }) => {
    await page.goto(BASE_URL)

    // Check Spanish nav text
    await expect(page.locator('text=+ Nueva idea')).toBeVisible()
    await expect(page.locator('text=Configuración')).toBeVisible()
  })

  test('should translate navigation links correctly in English', async ({ page }) => {
    await page.goto(BASE_URL + '/en/')

    // Check English nav text
    await expect(page.locator('text=+ New Idea')).toBeVisible()
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('should translate navigation links correctly in Portuguese', async ({ page }) => {
    await page.goto(BASE_URL + '/pt/')

    // Check Portuguese nav text
    await expect(page.locator('text=+ Nova ideia')).toBeVisible()
    await expect(page.locator('text=Configurações')).toBeVisible()
  })

  test('should maintain locale when navigating to settings', async ({ page }) => {
    await page.goto(BASE_URL + '/en/')

    // Click Settings link
    await page.locator('text=Settings').click()

    // Should stay on English locale
    await expect(page).toHaveURL(BASE_URL + '/en/settings')

    // Page should be in English
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('should maintain locale when navigating to create idea page', async ({ page }) => {
    await page.goto(BASE_URL + '/pt/')

    // Click "Nova ideia" button
    await page.locator('text=+ Nova ideia').click()

    // Should stay on Portuguese locale
    await expect(page).toHaveURL(BASE_URL + '/pt/ideas/create')

    // Page should be in Portuguese
    await expect(page.locator('h1')).toContainText('Enviar uma nova ideia')
  })

  test('should set correct lang attribute on html element', async ({ page }) => {
    await page.goto(BASE_URL)

    // Check Spanish
    let htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('es')

    // Switch to English
    await page.locator('a:has-text("English")').click()
    htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('en')

    // Switch to Portuguese
    await page.locator('a:has-text("Português")').click()
    htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('pt')
  })

  test('should persist locale in cookie when switching languages', async ({ context, page }) => {
    const newPage = await context.newPage()
    await newPage.goto(BASE_URL)

    // Switch to English
    await newPage.locator('a:has-text("English")').click()
    await expect(newPage).toHaveURL(BASE_URL + '/en/')

    // Check that cookie was set
    const cookies = await context.cookies()
    const localeCookie = cookies.find(c => c.name === 'parasalvara_locale')
    expect(localeCookie).toBeTruthy()
    expect(localeCookie?.value).toBe('en')

    await newPage.close()
  })

  test('should restore locale from cookie on page reload', async ({ context, page }) => {
    await page.goto(BASE_URL)

    // Switch to Portuguese
    await page.locator('a:has-text("Português")').click()
    await expect(page).toHaveURL(BASE_URL + '/pt/')

    // Reload the page
    await page.reload()

    // Should still be on Portuguese
    await expect(page).toHaveURL(BASE_URL + '/pt/')
    await expect(page.locator('h1')).toContainText('Ideias para Cuba')
  })

  test('should translate "load more" button', async ({ page }) => {
    await page.goto(BASE_URL)

    // Spanish
    await expect(page.locator('text=Cargar más')).toBeVisible()

    // Switch to English
    await page.locator('a:has-text("English")').click()
    await expect(page.locator('text=Load more')).toBeVisible()

    // Switch to Portuguese
    await page.locator('a:has-text("Português")').click()
    await expect(page.locator('text=Carregar mais')).toBeVisible()
  })

  test('should have active state on current language button', async ({ page }) => {
    await page.goto(BASE_URL)

    // Spanish button should have active class
    const spanishBtn = page.locator('a:has-text("Español")')
    await expect(spanishBtn).toHaveClass(/active/)

    // Switch to English
    await page.locator('a:has-text("English")').click()

    // English button should now have active class
    const englishBtn = page.locator('a:has-text("English")')
    await expect(englishBtn).toHaveClass(/active/)

    // Spanish button should not have active class
    await expect(spanishBtn).not.toHaveClass(/active/)
  })

  test('should translate all page headings correctly', async ({ page }) => {
    // Spanish
    await page.goto(BASE_URL)
    await expect(page.locator('h1')).toContainText('Ideas para Cuba')

    // English
    await page.goto(BASE_URL + '/en/')
    await expect(page.locator('h1')).toContainText('Ideas for Cuba')

    // Portuguese
    await page.goto(BASE_URL + '/pt/')
    await expect(page.locator('h1')).toContainText('Ideias para Cuba')
  })
})
