# Implementation Plan

## AgriSense AI — Phased Development Plan

| Field            | Detail                              |
| ---------------- | ----------------------------------- |
| **Document**     | Implementation Plan                 |
| **Version**      | 2.0                                 |
| **Date**         | 2026-02-15                          |
| **Author**       | Jenny                               |
| **Parent Doc**   | [PRD](PRD.md)                       |
| **Design Ref**   | [Design Guide](DESIGN_GUIDE.md)     |
| **Coding Ref**   | [Coding Rules](CODING_RULES.md)     |

---

## 1. Phase Overview

```
Phase 0          Phase 1         Phase 2          Phase 3          Phase 4          Phase 5
Foundation  ──▶  Core MVP   ──▶  Content &   ──▶  Intelligence ──▶  Scale &     ──▶  Production
& Setup          Features        Community        & Agents         Polish           & Launch
```

| Phase | Name | Focus |
|-------|------|-------|
| **0** | Foundation & Setup | Project scaffolding, AWS infrastructure, auth, CI/CD |
| **1** | Core MVP Features | Landing page, weather intelligence, crop diagnosis chatbot |
| **2** | Content & Community | News aggregator, community feed, marketplace |
| **3** | Intelligence & Agents | Agentic behavior, proactive notifications, cross-agent collaboration |
| **4** | Scale & Polish | Performance, testing, accessibility, multi-language |
| **5** | Production & Launch | Production deployment, monitoring, go-live |

---

## 2. Pre-Requisites

Complete before Phase 0 begins:

| Dependency | Action | Status |
|------------|--------|--------|
| AWS Account | Ensure access with admin permissions | [ ] |
| AWS CLI | Configured with credentials (`aws configure`) | [ ] |
| AWS CDK | Installed globally (`npm install -g aws-cdk`) | [ ] |
| Node.js 18+ | Installed via nvm or direct install | [ ] |
| Amazon Bedrock | Request model access for Claude in AWS Console | [ ] |
| OpenWeather API | Sign up and get API key (free tier) | [ ] |
| GitHub Repo | Create repository, push initial docs | [ ] |
| Domain (optional) | Register domain or use Amplify default URL | [ ] |
| Sample crop images | Collect 10+ images of diseased crops for testing | [ ] |
| RSS feed URLs | Identify 3–5 agricultural news RSS sources | [ ] |

---

## 3. Phase 0 — Foundation & Setup

**Goal:** Establish the project structure, deploy core AWS infrastructure, and set up the development workflow.

### 0.1 Project Scaffolding

- [ ] Initialize monorepo with npm workspaces (`shared/`, `backend/`, `frontend/`, `infrastructure/`)
- [ ] Create root configs: `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `.eslintrc.json`, `.prettierrc`
- [ ] Create `CLAUDE.md` for AI coding tool instructions
- [ ] Set up shared types and constants (`shared/types/index.ts`, `shared/constants/index.ts`)
- [ ] Initialize Git repo, create `main` and `dev` branches, push to GitHub

### 0.2 AWS Infrastructure Foundation

- [ ] Create CDK app entry point (`infrastructure/bin/app.ts`)
- [ ] Build **Auth Stack**: Cognito User Pool, User Pool Client, Identity Pool
- [ ] Build **API Stack**: API Gateway REST API with Cognito authorizer, CORS config
- [ ] Deploy Auth + API stacks to AWS dev environment
- [ ] Verify Cognito sign-up/login flow via AWS Console

### 0.3 Frontend Foundation

- [ ] Set up React + Vite + TypeScript with path aliases (`@/`)
- [ ] Create `global.css` with all design tokens from Design Guide (CSS variables)
- [ ] Set up React Router with route structure
- [ ] Build authenticated app shell with `BottomNav.tsx`
- [ ] Build protected route wrapper

### 0.4 Backend Foundation

- [ ] Set up Lambda handler template pattern (thin handlers, service layer, repository layer)
- [ ] Build shared utilities: `apiResponse.util.ts`, `env.util.ts`
- [ ] Build backend constants: DynamoDB table names, S3 bucket names

### 0.5 CI/CD Pipeline

- [ ] Set up AWS Amplify for frontend hosting (connect GitHub repo)
- [ ] Configure Amplify build settings (install → build → deploy)
- [ ] Set up branch-based deployments: `dev` → preview, `main` → production
- [ ] Verify automatic deployment on push

**Phase 0 Deliverable:** Monorepo scaffolded. Auth + API Gateway on AWS. Frontend dev server running. CI/CD pipeline active.

**Phase 0 Exit Criteria:**
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts frontend on localhost:3000
- [ ] Cognito sign-up/login works via AWS Console
- [ ] API Gateway returns 401 for unauthenticated requests
- [ ] Push to `dev` triggers Amplify build

---

## 4. Phase 1 — Core MVP Features

**Goal:** Build the landing page, authentication UI, weather intelligence, and crop diagnosis chatbot.

### 1.1 Landing Page

Per [Landing Page PRD](LANDING_PAGE_PRD.md):

- [ ] Build `LandingPage.tsx` page shell
- [ ] Build `HeroSection.tsx` — full-viewport hero with background image, glassmorphism stat cards, dual CTAs
- [ ] Build `FeaturesSection.tsx` — 2x2 feature card grid (Weather, Diagnosis, News, Community)
- [ ] Build `HowItWorksSection.tsx` — 3-step flow (Set Up, Get AI Insights, Connect & Grow)
- [ ] Build `TechnologySection.tsx` — dark section with agent cards and architecture diagram
- [ ] Build `TestimonialsSection.tsx` — stats bar + testimonial carousel
- [ ] Build `CtaSection.tsx` — dark CTA banner
- [ ] Build `Footer.tsx` — 4-column footer
- [ ] Implement `useScrollAnimation.ts` hook (Intersection Observer for scroll-triggered animations)
- [ ] Extract static data to `landing.constants.ts` (feature cards, steps, testimonials)
- [ ] Responsive testing across mobile, tablet, desktop breakpoints
- [ ] Add SEO meta tags and Open Graph tags

### 1.2 Authentication UI

- [ ] Build sign-up page (email, password, name)
- [ ] Build email confirmation page
- [ ] Build login page
- [ ] Build forgot password flow
- [ ] Build profile setup page (location, crops, farm area, soil type)
- [ ] Integrate Cognito auth flow (sign-up → confirm → login → JWT tokens)
- [ ] Store JWT in memory, refresh token handling
- [ ] Build auth context/provider for global auth state

### 1.3 Weather Intelligence

**Backend:**
- [ ] Build **Weather Stack** CDK: DynamoDB table (WeatherAlerts), Lambda functions, EventBridge schedule (30-min)
- [ ] Build `weather.service.ts` — fetch forecast from OpenWeather API, parse response
- [ ] Build `weather.service.ts` — evaluate alert thresholds (high temp, low temp, flood risk, drought)
- [ ] Build `weatherAlert.handler.ts` — Lambda handler for scheduled polling
- [ ] Build `weatherForecast.handler.ts` — Lambda handler for on-demand forecast API
- [ ] Build `weatherAlert.repository.ts` — DynamoDB CRUD for alerts
- [ ] Build API endpoints:
  - `GET /api/weather/forecast?lat={lat}&lng={lng}` — 7-day forecast
  - `GET /api/weather/alerts` — user's active alerts
  - `PUT /api/weather/alerts/{alertId}/acknowledge` — dismiss alert
- [ ] Deploy Weather Stack

**Frontend:**
- [ ] Build `HomePage.tsx` — weather dashboard layout
- [ ] Build `WeatherCard.tsx` — current conditions with glassmorphism card (temp, humidity, wind, icon)
- [ ] Build `ForecastList.tsx` — 7-day forecast horizontal scroll cards
- [ ] Build `AlertBanner.tsx` — dismissible alert cards with severity color coding
- [ ] Build `useWeatherData.ts` hook — fetch forecast and alerts, polling interval
- [ ] Wire up browser Geolocation API with manual location override in profile

### 1.4 Crop Diagnosis Chatbot

**Backend:**
- [ ] Build **Diagnosis Stack** CDK: S3 bucket (media uploads with lifecycle), DynamoDB table (ChatSessions), Lambda functions
- [ ] Build `diagnosis.prompts.ts` — system prompt for crop disease/pest/nutrient/abiotic stress diagnosis
- [ ] Build `diagnosis.agent.ts` — Bedrock Agent definition with tool use
- [ ] Build `diagnosis.service.ts` — invoke Bedrock Claude with multimodal input (image + text), parse structured diagnosis
- [ ] Build `diagnosis.handler.ts` — Lambda handler for chat requests
- [ ] Build `chatSession.repository.ts` — DynamoDB CRUD for sessions and messages
- [ ] Build API endpoints:
  - `POST /api/diagnosis/upload` — returns presigned S3 URL for photo upload
  - `POST /api/diagnosis/chat` — send message (text + optional imageUrl), receive diagnosis
  - `GET /api/diagnosis/sessions` — list past sessions
  - `GET /api/diagnosis/sessions/{sessionId}` — get full session with messages
- [ ] Deploy Diagnosis Stack
- [ ] Test with 10+ sample crop disease images, verify accuracy

**Frontend:**
- [ ] Build `DiagnosisPage.tsx` — chat interface layout per Design Guide Section 5.6
- [ ] Build `ChatBubble.tsx` — user bubbles (Leaf Green, right) and bot bubbles (Dark Glass, left)
- [ ] Build `PhotoUpload.tsx` — camera capture + gallery upload with image preview
- [ ] Build `DiagnosisResultCard.tsx` — condition name, confidence %, severity badge, treatment text
- [ ] Build `ChatInput.tsx` — message input bar with camera icon and send button
- [ ] Build `ChatHistory.tsx` — list of past diagnosis sessions
- [ ] Build `useDiagnosis.ts` hook — manages chat state, sends messages, handles upload flow
- [ ] Wire up full flow: type or upload → send to API → stream/display response

**Phase 1 Deliverable:** Landing page live. Users can sign up, view weather, and diagnose crops with photos.

**Phase 1 Exit Criteria:**
- [ ] Landing page renders all 7 sections with animations
- [ ] Landing page Lighthouse score > 90
- [ ] User can sign up, confirm email, log in
- [ ] Weather dashboard shows 7-day forecast for user's location
- [ ] Weather alerts display for configured thresholds
- [ ] User can upload a crop photo and receive diagnosis in < 10 seconds
- [ ] Diagnosis includes condition, confidence, severity, and treatment
- [ ] Multi-turn chat context is retained within a session

---

## 5. Phase 2 — Content & Community

**Goal:** Add the agricultural news feed, community social features, and marketplace.

### 2.1 Agricultural News

**Backend:**
- [ ] Build **News Stack** CDK: DynamoDB table (NewsArticles), Lambda for aggregation, EventBridge schedule (hourly)
- [ ] Build `news.service.ts` — fetch from RSS feeds, parse entries
- [ ] Build `news.service.ts` — summarize articles via Bedrock Claude
- [ ] Build `news.agent.ts` — News Agent for categorization and relevance scoring
- [ ] Build `newsArticle.repository.ts` — DynamoDB CRUD for articles
- [ ] Build `news.handler.ts` — Lambda handler for news API
- [ ] Build API endpoints:
  - `GET /api/news` — paginated news feed with optional category filter
  - `GET /api/news/{articleId}` — single article detail
  - `POST /api/news/bookmark` — save article for user
- [ ] Deploy News Stack
- [ ] Seed initial news from 3–5 RSS sources

**Frontend:**
- [ ] Build `NewsPage.tsx` — news feed layout with category filter pills
- [ ] Build `NewsCard.tsx` — article card (image, title, AI summary, source, date)
- [ ] Build `CategoryPills.tsx` — horizontal scroll filter (All, Market, Weather, Policy, Tech, Crops)
- [ ] Build `NewsDetail.tsx` — expanded article view with full summary and source link
- [ ] Build `useNewsData.ts` hook — paginated fetch with category filter
- [ ] Build bookmark/save functionality

### 2.2 Community Feed

**Backend:**
- [ ] Build **Community Stack** CDK: DynamoDB table (CommunityPosts), DynamoDB table (Comments), S3 bucket (community media), Lambda functions
- [ ] Build `community.service.ts` — CRUD for posts, comments, likes
- [ ] Build `communityPost.repository.ts` — DynamoDB queries with GSI for feed sorting
- [ ] Build `community.handler.ts` — Lambda handler
- [ ] Build API endpoints:
  - `GET /api/community/posts` — paginated feed (recent, popular, nearby)
  - `POST /api/community/posts` — create post (discussion or question)
  - `GET /api/community/posts/{postId}` — post detail with comments
  - `POST /api/community/posts/{postId}/comments` — add comment
  - `POST /api/community/posts/{postId}/like` — toggle like
  - `POST /api/community/upload` — presigned URL for media upload
- [ ] Deploy Community Stack

**Frontend:**
- [ ] Build `CommunityPage.tsx` — tabbed layout (Feed / Q&A / Marketplace)
- [ ] Build `PostCard.tsx` — post with author avatar, content, media, like/comment counts
- [ ] Build `CommentSection.tsx` — comment thread on post detail
- [ ] Build `CreatePostForm.tsx` — new post form with media upload
- [ ] Build `QuestionCard.tsx` — Q&A styled card with tags
- [ ] Build `useCommunityFeed.ts` hook — paginated feed with tab filters

### 2.3 Marketplace

**Backend (extends Community Stack):**
- [ ] Add marketplace listing fields to CommunityPosts table (price, category, condition, status)
- [ ] Build marketplace-specific queries: filter by category, location, price range
- [ ] Build API endpoints:
  - `GET /api/marketplace/listings` — paginated with filters
  - `POST /api/marketplace/listings` — create listing
  - `PUT /api/marketplace/listings/{listingId}/status` — mark sold/expired

**Frontend:**
- [ ] Build `MarketplaceTab.tsx` — grid layout with search and filters
- [ ] Build `MarketplaceCard.tsx` — listing card (image, title, price, location, status badge)
- [ ] Build `CreateListingForm.tsx` — new listing form (photos, price, category, description)
- [ ] Build `ListingDetail.tsx` — expanded view with all details and seller info
- [ ] Build `MarketplaceFilters.tsx` — category, price range, location radius filters

**Phase 2 Deliverable:** News feed with AI summaries. Community feed with posts, comments, likes. Marketplace with listings and filters.

**Phase 2 Exit Criteria:**
- [ ] News feed shows categorized articles with AI-generated summaries
- [ ] News articles refresh on schedule (hourly)
- [ ] Users can create posts (discussion, question, marketplace)
- [ ] Users can comment and like posts
- [ ] Marketplace listings display with category and price filters
- [ ] Media uploads work for community posts and marketplace listings

---

## 6. Phase 3 — Intelligence & Agents

**Goal:** Elevate the platform from CRUD operations to true agentic AI behavior with proactive actions, cross-agent collaboration, and intelligent notifications.

### 3.1 Weather Agent — Proactive Intelligence

- [ ] Implement crop calendar correlation — agent cross-references weather forecast with farmer's crop growth stage
- [ ] Build actionable recommendation engine — "Delay planting by 3 days due to incoming frost"
- [ ] Implement learning from farmer preferences — adjust alert sensitivity based on dismiss/acknowledge patterns
- [ ] Build multi-day pattern detection — consecutive dry days → drought warning escalation
- [ ] Add rainfall accumulation tracking for flood risk modeling

### 3.2 Diagnosis Agent — Follow-Up & Escalation

- [ ] Build proactive follow-up system — agent sends check-in 3 days after diagnosis ("How is the treatment working?")
- [ ] Implement confidence-based escalation — low confidence diagnoses flagged for community expert review
- [ ] Build treatment tracking — user marks treatment as applied, agent monitors recovery
- [ ] Implement diagnosis history analysis — detect recurring issues and suggest preventive measures
- [ ] Add Bedrock Knowledge Base for agricultural diseases, treatments, and best practices (RAG)

### 3.3 News Agent — Smart Curation

- [ ] Build personalized feed ranking based on farmer's crops, region, and reading history
- [ ] Implement breaking news detection — agent triggers immediate push notification for urgent regional alerts (pest outbreak, policy change)
- [ ] Build daily digest generation — agent compiles personalized summary and sends morning notification
- [ ] Add relevance scoring based on farmer profile matching

### 3.4 Community Agent — Moderation & Assistance

- [ ] Build AI content moderation — detect spam, inappropriate content, fraudulent listings
- [ ] Implement auto-answer for common questions — agent responds with relevant past discussions
- [ ] Build trending topic detection — surface regional agricultural issues to relevant farmers
- [ ] Implement marketplace fraud detection — flag suspicious pricing or duplicate listings
- [ ] Build expert suggestion — route complex questions to verified agronomists

### 3.5 Cross-Agent Collaboration

- [ ] Build orchestrator routing — user queries automatically routed to the right agent
- [ ] Implement context sharing — Diagnosis Agent queries Weather Agent for recent conditions to refine diagnosis
- [ ] Build event-driven collaboration — Weather Agent detects pest-favorable conditions → alerts Diagnosis Agent → Community Agent surfaces relevant prevention tips
- [ ] Implement unified notification pipeline — all agents feed into a single, prioritized notification stream

### 3.6 Notification System

- [ ] Build `notification.service.ts` — SNS push, SES email, Pinpoint SMS
- [ ] Build notification preferences UI (per-agent, per-type, per-channel)
- [ ] Implement notification priority and deduplication
- [ ] Build notification history page
- [ ] Wire up EventBridge → Agent → Notification pipeline for all agents

**Phase 3 Deliverable:** Agents operate autonomously — proactive weather advice, follow-up diagnoses, personalized news, and community moderation.

**Phase 3 Exit Criteria:**
- [ ] Weather Agent generates crop-specific recommendations
- [ ] Diagnosis Agent sends proactive follow-ups
- [ ] News Agent delivers personalized daily digest
- [ ] Community Agent auto-moderates posts and answers common questions
- [ ] Cross-agent context sharing works (weather → diagnosis refinement)
- [ ] Push notifications delivered for all critical agent events

---

## 7. Phase 4 — Scale & Polish

**Goal:** Harden the platform with testing, performance optimization, accessibility compliance, and preparation for scale.

### 4.1 Testing

**Unit Tests (target coverage per Coding Rules):**
- [ ] `weather.service.ts` — forecast parsing, alert threshold evaluation, recommendation generation
- [ ] `diagnosis.service.ts` — Bedrock request/response, structured diagnosis parsing
- [ ] `news.service.ts` — RSS parsing, summary generation
- [ ] `community.service.ts` — CRUD operations, moderation logic
- [ ] `notification.service.ts` — delivery channel routing, deduplication
- [ ] `apiResponse.util.ts`, `env.util.ts` — utility functions
- [ ] All repository classes — DynamoDB query construction and response mapping

**Integration Tests:**
- [ ] Weather polling Lambda → DynamoDB → SNS alert pipeline
- [ ] Diagnosis flow: S3 upload → Bedrock invocation → DynamoDB session save
- [ ] News aggregation: RSS fetch → Bedrock summary → DynamoDB save
- [ ] Community post creation → moderation check → feed display
- [ ] Auth flow: Cognito sign-up → confirm → login → API access

**End-to-End Tests:**
- [ ] Full user journey: Landing → Sign-up → Dashboard → Weather → Diagnosis → News → Community
- [ ] Cross-browser: Chrome, Safari, Firefox (desktop + mobile)
- [ ] Mobile device testing on real devices (iOS Safari, Android Chrome)

### 4.2 Performance Optimization

- [ ] Lighthouse audit: all pages score > 90
- [ ] Optimize images: convert to WebP, responsive `srcset`, lazy loading below fold
- [ ] Implement code splitting per route (React.lazy + Suspense)
- [ ] Add loading skeletons for all data-fetching components
- [ ] Optimize Lambda cold starts: minimize bundle size, use provisioned concurrency for critical functions
- [ ] Implement DynamoDB read caching (DAX or application-level cache)
- [ ] Set up CloudFront caching headers for static assets
- [ ] Bundle analysis: eliminate unused dependencies

### 4.3 Accessibility (WCAG 2.1 AA)

- [ ] Audit all color contrast ratios (4.5:1 body, 3:1 large text)
- [ ] Verify keyboard navigation for all interactive elements
- [ ] Add ARIA labels to glassmorphism cards, icon buttons, and dynamic content
- [ ] Implement "Skip to main content" link
- [ ] Verify screen reader compatibility (VoiceOver, NVDA)
- [ ] Ensure all images and illustrations have descriptive alt text
- [ ] Verify touch targets >= 44x44px for all buttons
- [ ] Test with `prefers-reduced-motion: reduce` — all animations disabled

### 4.4 Security Hardening

- [ ] Audit all API endpoints for proper Cognito authorization
- [ ] Validate and sanitize all user input at API boundary
- [ ] Implement rate limiting on API Gateway
- [ ] Set up AWS WAF rules for common attack patterns
- [ ] Verify S3 buckets are private, served via presigned URLs only
- [ ] Audit IAM policies — ensure least privilege per Lambda function
- [ ] Ensure CORS is restricted to specific origins (not `*`)
- [ ] Verify no secrets in client-side code or Git history

### 4.5 Multi-Language (Optional)

- [ ] Set up i18n framework (react-i18next)
- [ ] Extract all UI strings to translation files
- [ ] Add language selector in profile settings
- [ ] Translate to priority regional languages
- [ ] Implement Bedrock translation for diagnosis responses

**Phase 4 Deliverable:** Full test suite passing. Lighthouse > 90. WCAG 2.1 AA compliant. Security hardened.

**Phase 4 Exit Criteria:**
- [ ] Unit test coverage meets targets (Services 80%, Repos 70%, Utils 90%)
- [ ] All integration tests pass
- [ ] Lighthouse performance > 90 on all pages
- [ ] Zero WCAG 2.1 AA violations
- [ ] Security audit passed with no critical/high findings
- [ ] No console errors or TypeScript warnings

---

## 8. Phase 5 — Production & Launch

**Goal:** Deploy to production, set up monitoring, perform final verification, and go live.

### 5.1 Production Infrastructure

- [ ] Create production CDK context/stage with production-grade settings
- [ ] Deploy all stacks to production: Auth, API, Weather, Diagnosis, News, Community
- [ ] Configure DynamoDB on-demand capacity (production) vs provisioned (dev)
- [ ] Set up S3 lifecycle policies for media buckets (archive old uploads)
- [ ] Configure Lambda reserved concurrency for critical functions
- [ ] Set up AWS Secrets Manager for all production secrets

### 5.2 Frontend Deployment

- [ ] Configure Amplify production branch (`main`)
- [ ] Set up custom domain with Route 53 + ACM SSL certificate
- [ ] Configure Amplify environment variables (production API URL, Cognito IDs)
- [ ] Verify CloudFront distribution and caching behavior
- [ ] Deploy frontend and verify production URL

### 5.3 Monitoring & Alerting

- [ ] Set up CloudWatch Dashboard: Lambda invocations, errors, duration; API Gateway latency, 4xx/5xx; DynamoDB read/write capacity
- [ ] Set up CloudWatch Alarms:
  - Lambda error rate > 1%
  - API Gateway 5xx rate > 0.5%
  - DynamoDB throttling events
  - Bedrock invocation failures
- [ ] Configure alarm notifications to SNS → email/Slack
- [ ] Set up CloudWatch Logs Insights queries for common debugging scenarios
- [ ] Set up X-Ray tracing for end-to-end request visibility

### 5.4 Production Verification

- [ ] Smoke test all user journeys on production:
  - Landing page loads with all sections
  - Sign-up with real email → confirmation → login
  - Weather forecast displays for detected location
  - Weather alerts trigger for configured thresholds
  - Photo upload → Bedrock diagnosis → response displayed
  - News feed loads with categorized articles
  - Community post creation and display
  - Marketplace listing creation and browsing
- [ ] Verify EventBridge schedules running (weather polling, news aggregation)
- [ ] Verify SNS/SES notifications delivered
- [ ] Verify Bedrock IAM permissions in production
- [ ] Load test: simulate 100 concurrent users

### 5.5 Launch

- [ ] Tag release `v1.0.0` in Git
- [ ] Create GitHub release with changelog
- [ ] Final team walkthrough of all features
- [ ] Go live — switch DNS to production (if using custom domain)
- [ ] Monitor CloudWatch dashboard for first 24 hours
- [ ] Set up on-call rotation for critical alert response

**Phase 5 Deliverable:** Platform live on AWS production. Monitoring active. All features verified.

**Phase 5 Exit Criteria:**
- [ ] All CDK stacks deployed to production without errors
- [ ] Frontend accessible on production URL with SSL
- [ ] All smoke tests pass on production
- [ ] CloudWatch alarms and dashboard active
- [ ] No critical errors in first 24 hours of monitoring
- [ ] Release tagged in Git

---

## 9. AWS Resources by Phase

| Phase | Stacks Deployed | Key Resources |
|-------|----------------|---------------|
| **0** | Auth, API | Cognito User Pool, API Gateway, Amplify |
| **1** | Weather, Diagnosis | DynamoDB x2, S3, Lambda x4, EventBridge, Bedrock Agent |
| **2** | News, Community | DynamoDB x2, S3, Lambda x4, EventBridge |
| **3** | — (extends existing) | SNS, SES, Pinpoint, Bedrock Knowledge Base, Step Functions |
| **4** | — (no new infra) | WAF, DAX (optional) |
| **5** | Monitoring | CloudWatch Dashboard, Alarms, X-Ray, Route 53, ACM |

---

## 10. Git Workflow

### Branches

- `main` — production (protected, deploy on merge)
- `dev` — development integration
- `feature/*` — individual feature branches

### Branch Strategy per Phase

```
Phase 0: feature/project-setup → dev
Phase 1: feature/landing-page → dev
         feature/auth → dev
         feature/weather → dev
         feature/diagnosis → dev
Phase 2: feature/news → dev
         feature/community → dev
         feature/marketplace → dev
Phase 3: feature/weather-agent → dev
         feature/diagnosis-agent → dev
         feature/news-agent → dev
         feature/community-agent → dev
         feature/notifications → dev
Phase 4: feature/testing → dev
         feature/performance → dev
         feature/accessibility → dev
Phase 5: dev → main (production release)
```

---

## 11. Environment Strategy

| Environment | Purpose | Deployment Trigger |
|-------------|---------|-------------------|
| **Local** | Development and debugging | `npm run dev` |
| **Dev** | Integration testing | Push to `dev` branch → Amplify preview |
| **Production** | Live platform | Merge `dev` → `main` → Amplify production |

### Local Development

```bash
npm run dev                  # Frontend on localhost:3000
npm run test                 # Run all tests
npm run lint                 # Run ESLint
cd infrastructure && cdk deploy --all --context stage=dev  # Deploy to dev AWS
```

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Bedrock model access not approved | Apply early. Fallback: use Bedrock API directly with Claude Sonnet (no agent framework). |
| OpenWeather API rate limits | Cache responses in DynamoDB with 30-min TTL. Free tier = 1000 calls/day. |
| CDK deployment failures | Deploy incrementally, one stack at a time. Keep stacks independent. |
| Diagnosis accuracy too low | Iterate on system prompt. Show confidence score to set expectations. Add "consult expert" fallback. |
| High AWS costs | Use on-demand DynamoDB, monitor with Cost Explorer, set billing alarms. |
| Low community adoption | Seed content with agricultural experts. Gamification (badges, points). |
| Rural connectivity issues | Offline caching for weather and news. SMS fallback for critical alerts. Lightweight mobile-optimized pages. |

---

## 13. Definition of Done (Full Platform)

The platform is "done" when all of the following are true:

- [ ] Landing page is live and accessible without login
- [ ] User can sign up, confirm email, log in, and manage farm profile
- [ ] Weather dashboard shows 7-day forecast with hourly breakdown
- [ ] Weather alerts fire proactively for high/low temp, flood, and drought
- [ ] Weather Agent generates crop-specific actionable recommendations
- [ ] User can upload a crop photo and receive diagnosis in < 5 seconds
- [ ] Diagnosis includes condition, confidence, severity, treatment, and prevention tips
- [ ] Diagnosis Agent sends proactive follow-up after 3 days
- [ ] News feed displays categorized articles with AI-generated summaries
- [ ] News Agent delivers personalized daily digest
- [ ] Community feed supports posts, comments, likes, and media uploads
- [ ] Marketplace supports listing creation, search, and filtering
- [ ] Community Agent moderates content and answers common questions
- [ ] Push, email, and SMS notifications delivered for critical events
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Lighthouse performance > 90 on all pages
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Unit test coverage meets targets
- [ ] All CDK stacks deployed to production
- [ ] CloudWatch monitoring and alerting active
- [ ] No critical errors in production

---

*Each phase builds on the previous one. Phases can run in parallel where dependencies allow (e.g., frontend and backend within the same phase). All development follows the [Coding Rules](CODING_RULES.md) and [Design Guide](DESIGN_GUIDE.md).*
