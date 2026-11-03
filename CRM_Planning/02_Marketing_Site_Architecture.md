# Stage 2: Marketing Site Architecture

## Overview
Marketing site with vertical-specific content that loads based on user selection. First page is a welcome screen asking customer to choose industry vertical.

## Site Structure

### Welcome Screen (Landing Page)
- URL: localhost:5000/ (or root)
- Purpose: Brand introduction to SalesFortis, vertical selection
- Elements:
  - Hero section with SalesFortis branding
  - Three vertical cards with icons/descriptions
    1. Commercial Subcontractor & Trade Suite (Construction)
    2. Clinical Trials & Patient Recruitment Suite (Clinical)
    3. Maritime Logistics & Freight Brokerage Suite (Maritime)
  - Each card links to vertical-specific marketing page
  - CTA to learn more or start trial

### Vertical-Specific Marketing Pages
After selection, user enters marketing pages for that vertical only. Routes:
- /construction or /vertical/construction
- /clinical or /vertical/clinical  
- /maritime or /vertical/maritime

Each page should include:
- Industry-specific terminology and workflows (based on Procore/Contractor Foreman, TrialX/RealTime CTMS, Logitude World/Magaya)
- Hero section with vertical-specific value proposition
- Key features tailored to vertical
- Use cases/workflows
- Pricing/marketing plan teaser
- Customer testimonials placeholder
- CTA to sign up/start trial (leads to app registration)
- Footer

## Design Requirements
- Professional, enterprise-grade appearance
- Modern responsive design
- Industry-appropriate imagery/icons
- Clear CTAs
- SEO-friendly structure
- Fast loading

## Logo
Need to create/design a professional logo for SalesFortis. Consider:
- Wordmark "SalesFortis" (combination suggesting sales + fortress/strength)
- Maybe abstract symbol representing growth/fortification
- Professional color palette (blues, grays, maybe accent color)
- SVG format for web

## Technology
- Can be served by same FastAPI app or static files
- Integrated into monolithic app routing
- Same container as main app
- Routed based on domain/path - marketing on localhost:5000, app on app.localhost:5000 (or path-based routing /app)
