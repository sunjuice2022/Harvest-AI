# Landing Page PRD

## AgriSense AI — Public Landing Page

| Field            | Detail                              |
| ---------------- | ----------------------------------- |
| **Document**     | Landing Page PRD                    |
| **Version**      | 1.0                                 |
| **Date**         | 2026-02-15                          |
| **Author**       | Jenny                               |
| **Parent Doc**   | [PRD](PRD.md)                       |
| **Design Ref**   | [Design Guide](DESIGN_GUIDE.md)     |
| **Coding Ref**   | [Coding Rules](CODING_RULES.md)     |

---

## 1. Purpose

The landing page is the public-facing entry point for AgriSense AI. Its goal is to clearly communicate the platform's value to farmers, build trust, and convert visitors into registered users.

This page is accessible without authentication and serves as the first impression of the product.

---

## 2. Target Audience

| Segment | Description | Primary Goal |
|---------|-------------|--------------|
| **Farmers** | Smallholder and commercial farmers seeking smart tools | Understand how the platform helps their farm |
| **Agronomists** | Agricultural professionals and consultants | See the AI diagnosis and community features |
| **Agricultural Organizations** | Co-ops, government agencies, NGOs | Evaluate the platform for their farmer networks |
| **Investors / Judges** | Hackathon judges, potential partners | Understand the technical vision and AWS architecture |

---

## 3. Page Sections

### 3.1 Hero Section

**Purpose:** Immediately communicate what AgriSense AI is and why it matters.

**Layout:** Full-viewport hero with nature photography background (golden-hour farmland), dark gradient overlay, and centered content.

| Element | Specification |
|---------|--------------|
| Background | Full-bleed agricultural photo (rice fields or wheat at sunset) |
| Overlay | Linear gradient: `transparent` to `rgba(26, 46, 5, 0.85)` |
| Headline | `Display XL` (32px Bold) — "Smart Farming, Powered by AI" |
| Subheadline | `Body` (14px Regular) — "Get real-time weather alerts, instant crop diagnosis from a photo, curated agri news, and a farming community — all in one platform." |
| Primary CTA | `Leaf Green` (#84CC16) pill button — "Get Started" → links to sign-up |
| Secondary CTA | `Light Glass` outline button — "See How It Works" → scrolls to features |
| Stats Bar | 3 glass stat cards below the headline: "24/7 Weather Monitoring", "< 5s Diagnosis", "10,000+ Farmers" |

**Design tokens:**
- Glass stat cards: `Medium Glass` overlay, `radius-md` (12px)
- CTA button: `radius-full`, height 48px, `Leaf Green` background, white text
- Follows Design Guide Section 5.3 (Hero / Welcome Card)

---

### 3.2 Features Section

**Purpose:** Showcase the four core features with visual clarity.

**Layout:** Section title + 2x2 card grid (mobile: single column stack).

**Section Header:**
- Eyebrow: `Body Small`, `Leaf Green` — "FEATURES"
- Title: `Heading 1` (24px SemiBold) — "Everything Your Farm Needs"
- Subtitle: `Body`, `Dark Gray` — "Four AI-powered tools working together to protect and grow your farm."

**Feature Cards (4 cards):**

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| Weather Intelligence | Cloud-Sun | "Weather Alerts" | "7-day forecasts with proactive alerts for extreme heat, frost, flooding, and drought — tailored to your crops." |
| Crop Diagnosis | Scan-Line | "Instant Crop Diagnosis" | "Snap a photo of your crop and get AI-powered diagnosis of diseases, pests, and nutrient issues in under 5 seconds." |
| Agri News | Newspaper | "Curated Agri News" | "AI-summarized news feed personalized to your crops, region, and interests. Never miss a market update or policy change." |
| Community & Marketplace | Users | "Farming Community" | "Connect with local farmers, share knowledge, ask questions, and buy or sell seeds, equipment, and produce." |

**Card Design:**
- Style: `glass-card--light` (White Glass) on light mode
- Border: 1px solid `Light Gray` (#E7E5E4)
- Border radius: `radius-lg` (16px)
- Icon: 48px, `Leaf Green` color, top of card
- Title: `Heading 2` (20px SemiBold)
- Description: `Body` (14px), `Dark Gray`
- Hover: subtle `shadow-md` elevation + translate Y -2px

---

### 3.3 How It Works Section

**Purpose:** Show the simple 3-step user journey to reduce friction.

**Layout:** Section title + horizontal 3-step flow (mobile: vertical stack).

**Steps:**

| Step | Number | Title | Description | Visual |
|------|--------|-------|-------------|--------|
| 1 | "01" | "Set Up Your Farm" | "Create your profile, set your location, and tell us what you grow." | Farm profile illustration |
| 2 | "02" | "Get AI Insights" | "Receive proactive weather alerts, diagnose crops with a photo, and read curated news." | Phone showing diagnosis chat |
| 3 | "03" | "Connect & Grow" | "Join the farming community, share experiences, and trade in the marketplace." | Community feed illustration |

**Step Design:**
- Step number: `Stat Value` (28px Bold), `Leaf Green`
- Connector line between steps: 2px dashed, `Sage` (#A3BE8C)
- Title: `Heading 3` (16px SemiBold)
- Description: `Body Small` (12px), `Medium Gray`

---

### 3.4 AI Technology Section

**Purpose:** Highlight the agentic AI architecture and AWS foundation for technical credibility.

**Layout:** Split layout — text on left, architecture diagram on right (mobile: stacked).

**Content:**
- Eyebrow: `Body Small`, `Leaf Green` — "TECHNOLOGY"
- Title: `Heading 1` — "Autonomous AI Agents Working for You"
- Body paragraphs:
  - "AgriSense AI uses autonomous agents that monitor, analyze, and act on your behalf — 24/7, without you lifting a finger."
  - "Built on Amazon Bedrock and AWS serverless infrastructure for reliability, security, and scale."

**Agent Cards (inline, horizontal scroll on mobile):**

| Agent | Icon | One-liner |
|-------|------|-----------|
| Weather Agent | Thermometer-Sun | "Monitors forecasts and sends alerts before extreme weather hits" |
| Diagnosis Agent | Microscope | "Analyzes crop photos and recommends treatments instantly" |
| News Agent | Newspaper | "Curates and summarizes agricultural news for your feed" |
| Community Agent | Users | "Moderates discussions and connects you with relevant farmers" |

**Agent Card Design:**
- Style: `glass-card` (Dark Glass) on dark background section
- Background of entire section: `Dark Forest` (#1A2E05)
- Text: White
- Agent icon: 32px, `Leaf Green`
- Follows glassmorphism aesthetic from Design Guide

**Architecture Visual:**
- Simplified version of the orchestrator-worker diagram from the PRD
- Use `Leaf Green` for connections, white for agent boxes on dark background

---

### 3.5 Testimonials / Social Proof Section

**Purpose:** Build trust with farmer stories and platform stats.

**Layout:** Stats bar + testimonial cards carousel.

**Stats Bar (4 metrics):**

| Metric | Value | Label |
|--------|-------|-------|
| Farmers | "10,000+" | "Active Farmers" |
| Diagnoses | "50,000+" | "Crops Diagnosed" |
| Alerts | "99.9%" | "Alert Uptime" |
| Response | "< 5s" | "Diagnosis Speed" |

**Stats Design:**
- Background: `Off White` or soft green tint `#F0F7E6`
- Value: `Display` (28px Bold), `Near Black`
- Label: `Body Small`, `Medium Gray`
- Layout: 4-column row (mobile: 2x2 grid)

**Testimonial Cards (3 cards, horizontal scroll):**
- Avatar: 48px circle
- Quote: `Body` (14px), italic
- Name: `Heading 3` (16px SemiBold)
- Detail: `Body Small`, `Medium Gray` — farm type + location
- Card style: White background, `shadow-sm`, `radius-lg`

---

### 3.6 CTA Section

**Purpose:** Final conversion push before footer.

**Layout:** Full-width banner with dark background and centered content.

**Content:**
- Background: `Dark Forest` (#1A2E05) with subtle agricultural photo at 10% opacity
- Title: `Display` (28px Bold), White — "Start Growing Smarter Today"
- Subtitle: `Body`, White 80% opacity — "Join thousands of farmers using AI to protect their crops and improve their yields."
- Primary CTA: `Leaf Green` pill button — "Create Free Account"
- Secondary CTA: White outline pill button — "Talk to Our Team"

---

### 3.7 Footer

**Purpose:** Navigation, legal, and contact information.

**Layout:** 4-column grid (mobile: stacked accordion).

| Column | Links |
|--------|-------|
| **Product** | Features, How It Works, Pricing, Download App |
| **Resources** | Blog, Help Center, API Docs, Status Page |
| **Community** | Forum, Events, Partner Program, Expert Network |
| **Company** | About Us, Careers, Contact, Privacy Policy, Terms of Service |

**Footer Design:**
- Background: `Near Black` (#1C1917)
- Text: `Medium Gray`, links turn White on hover
- Logo: AgriSense AI logo + tagline in `Body Small`
- Bottom bar: Copyright + social media icon links
- Border top: 1px solid `rgba(255, 255, 255, 0.1)`

---

## 4. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| **Mobile** (< 640px) | Single column. Hero stats stack vertically. Feature cards stack. Steps go vertical. Testimonials become horizontal scroll. Footer columns stack as accordion. |
| **Tablet** (640–1024px) | 2-column grids. Hero shows full-width. Feature cards 2x2. Steps horizontal. |
| **Desktop** (> 1024px) | Full layout as described. Max content width 1280px, centered. AI section is side-by-side. |

---

## 5. Interactions & Animations

| Element | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Hero headline | Fade in + slide up | Page load | 600ms, `ease-out` |
| Hero stat cards | Fade in + slide up (staggered 100ms) | Page load | 400ms, `ease-out` |
| Feature cards | Fade in + slide up | Scroll into viewport | 300ms, `ease-out` |
| How It Works steps | Fade in sequentially (staggered 200ms) | Scroll into viewport | 400ms, `ease-out` |
| Agent cards | Scale from 0.95 to 1 + fade in | Scroll into viewport | 300ms, `ease-out` |
| Stats counters | Count up from 0 to target value | Scroll into viewport | 1500ms, `ease-in-out` |
| CTA buttons | Scale to 0.97 on press, 1.02 on hover | User interaction | 100ms, `ease-in` |
| Testimonial carousel | Horizontal slide | Auto-play 5s + swipe | 300ms, `ease-in-out` |

All animations respect `prefers-reduced-motion` — disabled entirely when user prefers reduced motion.

---

## 6. SEO & Meta

| Tag | Value |
|-----|-------|
| `<title>` | "AgriSense AI — Smart Farming Powered by AI" |
| `<meta description>` | "Get real-time weather alerts, instant AI crop diagnosis, curated agricultural news, and a farming community marketplace. Built on AWS." |
| `<meta keywords>` | "agriculture AI, smart farming, crop diagnosis, weather alerts, farming community, agri marketplace, Amazon Bedrock" |
| Open Graph title | "AgriSense AI — Smart Farming Powered by AI" |
| Open Graph description | "AI-powered platform for weather alerts, crop diagnosis, agri news, and community marketplace." |
| Open Graph image | Hero section screenshot or branded social card (1200x630) |
| Canonical URL | `https://agrisense.ai` |

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| Largest Contentful Paint (LCP) | < 2.5 seconds |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Total Page Weight | < 1.5 MB |
| Lighthouse Performance Score | > 90 |

**Implementation Notes:**
- Hero background image: WebP format, lazy-load below-fold images
- Fonts: Preconnect to Google Fonts, use `font-display: swap`
- Icons: Inline SVG or icon sprite (no icon font library)
- Animations: CSS-only where possible, JS for scroll-triggered via Intersection Observer
- No external tracking scripts on initial load (defer analytics)

---

## 8. Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets 4.5:1 (body) / 3:1 (large text) against backgrounds |
| Keyboard navigation | All interactive elements focusable with visible focus ring (`Leaf Green` 2px outline) |
| Screen reader | Semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`), ARIA labels on glass cards and icon-only buttons |
| Alt text | All images and illustrations have descriptive alt text |
| Skip link | "Skip to main content" link visible on focus |
| Reduced motion | All animations disabled when `prefers-reduced-motion: reduce` |
| Touch targets | Minimum 44x44px for all buttons and links |

---

## 9. Page Component Map

Reference for developers — maps each section to its component file following [Coding Rules](CODING_RULES.md) structure:

```
frontend/src/
├── pages/
│   └── LandingPage.tsx              # Page-level component, composes all sections
├── components/
│   └── landing/
│       ├── HeroSection.tsx          # Section 3.1
│       ├── HeroSection.css
│       ├── FeaturesSection.tsx      # Section 3.2
│       ├── FeaturesSection.css
│       ├── HowItWorksSection.tsx    # Section 3.3
│       ├── HowItWorksSection.css
│       ├── TechnologySection.tsx    # Section 3.4
│       ├── TechnologySection.css
│       ├── TestimonialsSection.tsx   # Section 3.5
│       ├── TestimonialsSection.css
│       ├── CtaSection.tsx           # Section 3.6
│       ├── CtaSection.css
│       ├── Footer.tsx               # Section 3.7
│       └── Footer.css
├── hooks/
│   └── useScrollAnimation.ts       # Intersection Observer hook for scroll animations
└── constants/
    └── landing.constants.ts         # Feature cards data, steps data, testimonials data
```

**Component rules (per Coding Rules):**
- One component per file. Named export.
- No inline styles. CSS file per component using design tokens.
- Data (feature cards, steps, testimonials) extracted to `landing.constants.ts` (DRY).
- Animation hook shared via `useScrollAnimation.ts` (Single Responsibility).
- Max 30 lines per function, max 300 lines per file.

---

## 10. Requirements Traceability

| Landing Page Section | PRD Requirement IDs |
|---------------------|---------------------|
| Hero — stat cards | W-01, C-03 |
| Feature: Weather | W-01, W-02, W-03, W-04, W-05, W-06 |
| Feature: Diagnosis | C-01, C-02, C-03, C-04, C-05, C-06 |
| Feature: News | N-01, N-02, N-04 |
| Feature: Community | M-01, M-02, M-04, M-05, M-06 |
| AI Technology | PRD Section 5 (Agent Architecture) |
| Social Proof | PRD Section 10 (Success Metrics) |

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Visitor → Sign-up conversion rate | > 5% |
| Average time on page | > 45 seconds |
| Bounce rate | < 50% |
| CTA click-through rate | > 8% |
| Mobile vs Desktop split | 70/30 mobile-first |
| Lighthouse score | > 90 across all categories |

---

*This document defines the landing page scope. All design decisions reference the [Design Guide](DESIGN_GUIDE.md). All code follows the [Coding Rules](CODING_RULES.md).*
