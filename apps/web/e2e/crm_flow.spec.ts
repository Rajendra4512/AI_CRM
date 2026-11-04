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

  test('Construction Tab calculates Live SOV billing and retainage', async ({ page }) => {
    await page.goto('/app/verticals')
    await expect(page.locator('text=Live Schedule of Values (SOV) Billing Calculator')).toBeVisible()
    await expect(page.locator('text=Net Payment Due')).toBeVisible()
    await expect(page.locator('text=10% Retainage Held')).toBeVisible()
  })

  test('Clinical Tab enforces consent guardrail before randomizing', async ({ page }) => {
    await page.goto('/app/verticals')
    await page.click('text=Clinical Trials & CTMS')
    await expect(page.locator('text=GCP Compliance Consent & Randomization Guardrail')).toBeVisible()

    // Click randomize with consent checked
    await page.click('button:has-text("Randomize Subject →")')
    await expect(page.locator('text=Regulatory consent verified')).toBeVisible()
  })

  test('Maritime Tab generates live ocean freight quote with surcharges', async ({ page }) => {
    await page.goto('/app/verticals')
    await page.click('text=Maritime & Freight Brokerage')
    await expect(page.locator('text=Instant Ocean Freight Rate Quote Generator')).toBeVisible()
    await expect(page.locator('text=Total Freight Quote')).toBeVisible()
    // Select Transatlantic
    await page.selectOption('select >> nth=0', 'TRANSATLANTIC')
    await expect(page.locator('text=11 Days Transit')).toBeVisible()
  })

  for (const v of [
    {
      industry: 'construction',
      cardCta: 'Explore Construction CRM',
      marketingUrl: /.*\/vertical\/construction/,
      authorizedTab: 'Construction & Trades',
      forbiddenTabs: ['Clinical Trials & CTMS', 'Maritime & Freight Brokerage'],
      suiteBadge: 'Construction Suite',
      suiteHeading: 'Construction RFQs & Change Events'
    },
    {
      industry: 'clinical',
      cardCta: 'Explore Clinical CRM',
      marketingUrl: /.*\/vertical\/clinical/,
      authorizedTab: 'Clinical Trials & CTMS',
      forbiddenTabs: ['Construction & Trades', 'Maritime & Freight Brokerage'],
      suiteBadge: 'Clinical Suite',
      suiteHeading: 'Active Protocol Lifecycles'
    },
    {
      industry: 'maritime',
      cardCta: 'Explore Maritime CRM',
      marketingUrl: /.*\/vertical\/maritime/,
      authorizedTab: 'Maritime & Freight Brokerage',
      forbiddenTabs: ['Construction & Trades', 'Clinical Trials & CTMS'],
      suiteBadge: 'Maritime Suite',
      suiteHeading: 'Vessel Bookings & Bills of Lading'
    }
  ]) {
    test(`Full E2E Journey (${v.industry}): Marketing -> Selection -> Registration -> Provisioning -> Login -> Authorized Dashboard & Logout`, async ({ page }) => {
      const uid = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
      const orgName = `E2E ${v.industry.toUpperCase()} Org ${uid}`
      const email = `e2e_${v.industry}_${uid}@salesfortis.com`
      const password = 'SecurePassword123!'

      // 1. Marketing Home -> Industry Selection
      await page.goto('/')
      await page.click(`text=${v.cardCta}`)
      await expect(page).toHaveURL(v.marketingUrl)

      // 2. Click Start Free Trial -> Industry-preselected Registration
      await page.click('button.cta-btn:has-text("Start Free Trial")')
      await expect(page).toHaveURL(new RegExp(`.*\\/register\\?industry=${v.industry}`))
      await expect(page.locator('select[name="industry"]')).toHaveValue(v.industry)

      // 3. Provision Tenant Workspace via real API
      await page.fill('input[name="firstName"]', 'Jordan')
      await page.fill('input[name="lastName"]', 'Taylor')
      await page.fill('input[name="companyName"]', orgName)
      await page.fill('input[name="email"]', email)
      await page.fill('input[name="password"]', password)
      await page.click('button:has-text("Provision Workspace →")')

      // 4. Tenant Provisioned -> Transitions to Login
      await expect(page.locator('[role="status"]')).toContainText(orgName)
      await page.fill('input[name="password"]', password)
      await page.click('button:has-text("Sign In to Portal →")')

      // 5. Authorized CRM Dashboard displays provisioned tenant & industry badge
      await expect(page).toHaveURL(/.*\/app\/dashboard/)
      await expect(page.getByTestId('tenant-badge')).toContainText(orgName)
      await expect(page.getByTestId('industry-badge')).toContainText(v.suiteBadge)

      // 6. Vertical Suites strictly scoped to entitled industry
      await page.click('text=Vertical Suites')
      await expect(page).toHaveURL(/.*\/app\/verticals/)
      await expect(page.locator(`.v-tab-btn:has-text("${v.authorizedTab}")`)).toBeVisible()
      await expect(page.locator(`text=${v.suiteHeading}`)).toBeVisible()
      for (const forbidden of v.forbiddenTabs) {
        await expect(page.locator(`.v-tab-btn:has-text("${forbidden}")`)).toHaveCount(0)
      }

      // 7. Sign Out terminates session and guards protected route
      await page.click('text=Sign Out')
      await expect(page).toHaveURL(/.*\/login/)
      await page.goto('/app/dashboard')
      await expect(page).toHaveURL(/.*\/login/)
    })
  }

  test('Choosing Clinical vertical strictly isolates Dashboard, Leads Pipeline, and Vertical Suites to Clinical only', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Explore Clinical CRM')
    await expect(page).toHaveURL(/.*\/vertical\/clinical/)

    // Click Sign In from Clinical Marketing -> pre-scoped to Clinical
    await page.click('button:has-text("Sign In")')
    await expect(page).toHaveURL(/.*\/login\?industry=clinical/)
    await page.click('button:has-text("Sign In to Portal →")')

    // 1. Dashboard shows ONLY Clinical operations & insights
    await expect(page).toHaveURL(/.*\/app\/dashboard/)
    await expect(page.locator('h1')).toContainText('Clinical Trials & Recruitment Dashboard')
    await expect(page.locator('text=STUDY-ONCO-401')).toBeVisible()
    await expect(page.locator('text=RFQ-2026-081')).toHaveCount(0)
    await expect(page.locator('text=SHP-EU-8924')).toHaveCount(0)
    await expect(page.locator('text=RFQ Scope Revision Warning')).toHaveCount(0)

    // 2. Leads Pipeline shows ONLY Clinical deals
    await page.click('text=Leads & Pipeline')
    await expect(page).toHaveURL(/.*\/app\/leads/)
    await expect(page.locator('text=Cardiology Registry Pilot')).toBeVisible()
    await expect(page.locator('text=HVAC Retrofit Bid')).toHaveCount(0)
    await expect(page.locator('text=Charter Feeder Contract')).toHaveCount(0)

    // 3. Vertical Suites shows ONLY Clinical tab
    await page.click('text=Vertical Suites')
    await expect(page).toHaveURL(/.*\/app\/verticals/)
    await expect(page.locator('.v-tab-btn:has-text("Clinical Trials & CTMS")')).toBeVisible()
    await expect(page.locator('.v-tab-btn:has-text("Construction & Trades")')).toHaveCount(0)
    await expect(page.locator('.v-tab-btn:has-text("Maritime & Freight Brokerage")')).toHaveCount(0)
  })

  test('Construction Reference Workbench: Isolated Sandbox -> AIA G703 Continuation Sheet & CSI Spec Delta AI', async ({ page }) => {
    await page.goto('/login')
    await page.click('button:has-text("Construction Subcontractor Sandbox")')
    await expect(page).toHaveURL(/.*\/app\/dashboard/)
    await page.click('text=Vertical Suites')
    await expect(page).toHaveURL(/.*\/app\/verticals/)
    await expect(page.locator('.v-tab-btn:has-text("Clinical Trials & CTMS")')).toHaveCount(0)

    // Verify G703 multi-line continuation table & Spec AI
    await expect(page.locator('text=Description of Work')).toBeVisible()
    await page.click('button:has-text("Run CSI Spec Analysis")')
    await expect(page.locator('text=Detected CSI Divisions')).toBeVisible()
  })

  test('Clinical CTMS Workbench: HIPAA Safe Harbor PII Block & Protocol Eligibility CRC Sign-Off', async ({ page }) => {
    await page.goto('/login')
    await page.click('button:has-text("Clinical Trials & CTMS Sandbox")')
    await expect(page).toHaveURL(/.*\/app\/dashboard/)
    await page.click('text=Vertical Suites')

    // Test Safe Harbor PII rejection (HTTP 422)
    await page.click('button:has-text("Load Sample PII to Test Block")')
    await page.click('button:has-text("+ Register Referral")')
    await expect(page.locator('text=PHI_SAFEGUARD')).toBeVisible()

    // Test Protocol AI criteria extraction & coordinator human verification
    await page.click('button:has-text("Extract I/E Criteria & Stage for CRC")')
    await expect(page.locator('text=REGULATORY GUARDRAIL')).toBeVisible()
    await page.locator('button:has-text("Verify Criterion (CRC)")').first().click()
    await expect(page.locator('text=CRC Verified ✓')).toBeVisible()
  })

  test('Maritime Freight Tower: Carrier Tariff Normalization, Broker Approval & HBL Issuance', async ({ page }) => {
    await page.goto('/login')
    await page.click('button:has-text("Maritime & Freight Tower Sandbox")')
    await expect(page).toHaveURL(/.*\/app\/dashboard/)
    await page.click('text=Vertical Suites')
    await expect(page.locator('.v-tab-btn:has-text("Construction & Trades")')).toHaveCount(0)

    await page.click('button:has-text("Normalize & Stage Rate Sheet")')
    await expect(page.locator('text=Carrier Rate Card Governance Ledger')).toBeVisible()

    await page.click('button:has-text("Issue House Bill of Lading (HBL)")')
    await expect(page.locator('text=Issued House Bills of Lading Register')).toBeVisible()
  })

  test('Mobile Responsive Viewport (390x844) renders Marketing & CRM Workbench cleanly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('SalesFortis')
    await expect(page.locator('text=Commercial Subcontractor & Trade Suite')).toBeVisible()
  })
})
