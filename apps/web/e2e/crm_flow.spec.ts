import { test, expect } from '@playwright/test'

test.describe('SalesFortis Multi-Vertical CRM End-to-End Suite', () => {

  test('Public Landing Page displays branding and vertical cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('SalesFortis')
    await expect(page.locator('text=Choose Your Industry Vertical')).toBeVisible()
    await expect(page.locator('text=Commercial Subcontractor & Trade Suite')).toBeVisible()
    await expect(page.locator('text=Clinical Trials & Patient Recruitment Suite')).toBeVisible()
    await expect(page.locator('text=Maritime Logistics & Freight Brokerage Suite')).toBeVisible()
  })

  test('Navigation to Construction Vertical marketing page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Explore Construction CRM')
    await expect(page).toHaveURL(/.*\/vertical\/construction/)
    await expect(page.locator('h1:has-text("Commercial Subcontractor")')).toBeVisible()
  })

  test('Sign In portal allows one-click authentication into CRM Dashboard', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h2')).toContainText('SalesFortis CRM')
    await page.click('text=One-Click Instant Demo Access')
    await expect(page).toHaveURL(/.*\/app\/dashboard/)
    await expect(page.locator('h1')).toContainText('Executive CRM Dashboard')
    await expect(page.locator('text=Total Pipeline Value')).toBeVisible()
  })

  test('Leads Pipeline allows adding a new deal to Kanban board', async ({ page }) => {
    await page.goto('/app/leads')
    await expect(page.locator('h1')).toContainText('Leads & Opportunity Pipeline')
    await expect(page.locator('text=Inbound Leads')).toBeVisible()

    // Open add modal
    await page.click('text=+ Add Opportunity')
    await page.fill('input[placeholder="e.g. Structural Steel Package"]', 'Seismic Retrofit Package')
    await page.fill('input[placeholder="e.g. Bechtel Infrastructure"]', 'AECOM Infrastructure')
    await page.fill('input[placeholder="e.g. $500,000"]', '$750,000')
    await page.click('button:has-text("Save Deal")')

    // Verify newly added deal appears on board
    await expect(page.locator('text=Seismic Retrofit Package')).toBeVisible()
    await expect(page.locator('text=AECOM Infrastructure')).toBeVisible()
  })

  test('Vertical Hub allows switching between Construction, Clinical, and Maritime', async ({ page }) => {
    await page.goto('/app/verticals')
    await expect(page.locator('h1')).toContainText('Vertical Workflow Engine')

    // Construction tab active by default
    await expect(page.locator('text=Construction RFQs & Change Events')).toBeVisible()

    // Switch to Clinical Trials
    await page.click('text=Clinical Trials & CTMS')
    await expect(page.locator('text=Active Protocol Lifecycles')).toBeVisible()
    await expect(page.locator('text=PROTO-NC-004')).toBeVisible()

    // Switch to Maritime
    await page.click('text=Maritime & Freight Brokerage')
    await expect(page.locator('text=Vessel Bookings & Bills of Lading')).toBeVisible()
    await expect(page.locator('text=BL-MAEU-9821')).toBeVisible()
  })
})
