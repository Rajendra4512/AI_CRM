# Logitude World Competitive Analysis & Reverse Engineering

**Suite:** Maritime Logistics & Freight Brokerage CRM  
**Primary Competitor:** Logitude World (by Champions Group)  
**Analysis Date:** 2026-11-03  
**Target Profile:** Small-to-Midsize Freight Forwarders, Ocean & Air Cargo Brokers, and NVOCCs (Non-Vessel Operating Common Carriers)  

---

## 1. Product & Business Overview

### 1.1 Company & Positioning
- **Market Standing:** Leading cloud-based freight forwarding software built specifically for independent forwarders operating globally.
- **Core Value Proposition:** Fast cloud-native freight forwarding, quoting, shipping documentation, and accounting in a single web browser.
- **Ideal Customer Profile (ICP):** Independent freight forwarders handling 50 to 2,000 shipments per month across ocean, air, and road freight.

### 1.2 Pricing & Packaging Architecture
- **Pricing Model:** Transparent per-user monthly SaaS subscription.
- **Tiers:**
  - *Starter:* ~$45–$65/user/month (basic shipments & docs).
  - *Advanced:* ~$85–$125/user/month (quotes, full accounting, CRM, and INTTRA container tracking).
  - *Enterprise:* Custom pricing for large forwarder networks with API integrations.

---

## 2. Information Architecture & Workflows

### 2.1 Core Modules & Hierarchy
1. **Quotes & CRM:** Rate management, customer inquiry tracking, spot quote generation, margin markups.
2. **Operations:** Ocean FCL/LCL, Air, and Inland shipments, Master Bill of Lading (MBL), House Bill of Lading (HBL), Air Waybill (AWB), manifest creation.
3. **Tracking & Visibility:** Container status milestones via INTTRA and ocean carrier APIs.
4. **Shared Logistics Portal:** Customer-facing tracking and digital document download portal.

### 2.2 Critical Business Workflow: Ocean Freight Quote to Booking
```
Customer Freight Inquiry ➔ Spot Rate Lookup across Carriers
         │
         ├──► Base Ocean Freight + Surcharges (BAF, THC, PSS)
         │           │
         │           ▼
         │      Margin Markup Applied (e.g., +15%)
         │           │
         ▼           ▼
  Formal Freight Quote Sent (PDF/Email) ➔ Customer Approves
         │
         ▼
  Carrier Vessel Booking Placed ➔ Container Pickup & Gate-In
         │
         ▼
  Bill of Lading (B/L) Issued ➔ Milestone Tracking ➔ Final Invoicing
```

---

## 3. Customer Friction Points & Market Limitations

1. **Manual Rate Sheet Processing:**
   - Ocean carriers email hundreds of PDF and Excel rate sheets every month with dynamic fuel adjustments (BAF) and terminal charges (THC). Forwarders still manually key these into Logitude.
2. **Margin Leakage on Ancillary Surcharges:**
   - Forwarders often misquote or overlook ancillary charges (chassis split fees, demurrage/detention, peak season surcharges), eroding shipment profit margins.
3. **Disconnected Customer CRM:**
   - Logitude's CRM is rudimentary: it tracks customer contact info and quotes, but lacks automated follow-up sequences for unconfirmed spot quotes.

