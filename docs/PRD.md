# Product Requirements Document (PRD)

## Harvest AI — Agentic AI Platform for Agriculture

| Field            | Detail                              |
| ---------------- | ----------------------------------- |
| **Product Name** | Harvest AI                        |
| **Version**      | 1.0                                 |
| **Date**         | 2026-02-21                          |
| **Author**       | Jenny                               |
| **Stack**        | AWS Cloud-Native, Agentic AI        |
| **Target Users** | Farmers, Agronomists, Rural Communities |

---

## 1. Executive Summary

Harvest AI is a cloud-native, agentic AI platform designed to empower farmers with real-time agricultural intelligence. The platform combines weather monitoring, AI-powered crop diagnosis, agricultural news aggregation, and a community marketplace — all orchestrated by autonomous AI agents running on AWS.

The system leverages an **agentic AI architecture** where specialized agents autonomously gather data, make decisions, and take actions on behalf of farmers — proactively alerting them to weather risks, diagnosing crop issues from photos, curating relevant news, and facilitating community interactions.

---

## 2. Problem Statement

Farmers face significant challenges:

- **Unpredictable weather** causes crop loss due to lack of timely, localized alerts.
- **Crop diseases and pest damage** go undiagnosed until it's too late — access to agronomists is limited and expensive.
- **Information fragmentation** — agricultural news, market prices, and best practices are scattered across many sources.
- **Isolation** — farmers lack a dedicated community platform to share knowledge, ask questions, and trade goods locally.

---

## 3. Product Vision

> A single AI-powered platform where farmers receive proactive weather alerts, get instant crop diagnosis from a photo, stay informed with curated agri news, and connect with a thriving farming community — all powered by autonomous AI agents.

---

## 4. Feature Requirements

### 4.1 Weather Intelligence Agent

**Description:** An autonomous agent that continuously monitors weather data for the farmer's location and proactively sends alerts.

| ID | Requirement | Priority |
|----|-------------|----------|
| W-01 | Display 7-day weather forecast with hourly breakdown | P0 |
| W-02 | High temperature alert (configurable threshold, default >35°C) | P0 |
| W-03 | Low temperature alert (configurable threshold, default <5°C) | P0 |
| W-04 | Flood risk alert based on rainfall accumulation and regional data | P0 |
| W-05 | Drought/dry weather alert based on consecutive dry days and soil moisture | P0 |
| W-06 | Push notifications (mobile) and SMS alerts for critical weather events | P0 |
| W-07 | Manual city selector — 35 Australian cities across all states/territories, grouped by state (GPS auto-detection deferred to a future release) | P1 |
| W-08 | Historical weather data and trend visualization | P2 |
| W-09 | Agent autonomously correlates weather patterns with crop calendars and provides actionable recommendations (e.g., "Delay planting by 3 days due to incoming frost") | P1 |
| W-10 | 7-day weather outlook block in the advisory card — plain-language forecast derived from forecast data covering rain, frost, heat stress, humidity, wind, and best operating day | P1 |

**Agentic Behavior:**
- The Weather Agent runs on a schedule (every 30 minutes), fetches forecast data, evaluates alert thresholds, and autonomously decides whether to notify the farmer.
- It learns farmer preferences over time (crop type, region, sensitivity levels).
- It can chain actions: detect flood risk → check farmer's crop type → generate tailored mitigation advice → send alert.

---

### 4.2 Crop Diagnosis AI Chatbot

**Description:** A multimodal AI chatbot that accepts text and photo uploads to provide instant diagnosis of crop diseases, pest damage, nutrient deficiencies, and abiotic stress.

| ID | Requirement | Priority |
|----|-------------|----------|
| C-01 | Text-based conversational chatbot for agricultural questions | P0 |
| C-02 | Photo upload capability (camera capture and gallery upload) | P0 |
| C-03 | Instant diagnosis of plant diseases from photos (< 5 seconds) | P0 |
| C-04 | Pest damage identification and treatment recommendations | P0 |
| C-05 | Nutrient deficiency detection (e.g., nitrogen, phosphorus, potassium) | P0 |
| C-06 | Abiotic stress identification (heat, drought, waterlogging, salt) | P0 |
| C-07 | Multi-turn conversation with context retention | P1 |
| C-08 | Diagnosis confidence score and severity rating | P1 |
| C-09 | Treatment and remedy recommendations with local product availability | P1 |
| C-10 | Chat history and diagnosis log per user | P1 |
| C-11 | Multi-language support (English + regional languages) | P2 |
| C-12 | Voice input support | P2 |

**Agentic Behavior:**
- The Diagnosis Agent receives a photo → analyzes it using a vision model → identifies the issue → autonomously searches its knowledge base for treatments → generates a comprehensive response.
- It can escalate: if confidence is low, the agent autonomously flags the case for community expert review.
- Follow-up: the agent proactively checks in after 3 days ("How is the treatment working? Would you like to send a follow-up photo?").

---

### 4.3 Agricultural News Aggregator

**Description:** An AI-curated news feed delivering the latest agricultural news, market prices, government policies, and farming innovations.

| ID | Requirement | Priority |
|----|-------------|----------|
| N-01 | Aggregated news feed from trusted agricultural sources | P0 |
| N-02 | AI-generated summaries for each article | P0 |
| N-03 | Categorization: Market Prices, Weather, Policy, Technology, Crop-specific | P1 |
| N-04 | Personalized feed based on farmer's crops, region, and interests | P1 |
| N-05 | Save/bookmark articles | P2 |
| N-06 | Share articles to community feed | P2 |
| N-07 | Daily digest notification (configurable) | P1 |

**Agentic Behavior:**
- The News Agent autonomously crawls and aggregates content on a schedule.
- It filters, ranks, and summarizes articles based on relevance to each farmer's profile.
- It detects breaking news (e.g., new pest outbreak in region) and triggers immediate push notifications.

---

### 4.4 AgriCommunity — Social & Marketplace

**Description:** A social platform for farmers to share experiences, ask questions, and buy/sell agricultural goods — similar to Facebook Marketplace with community forum capabilities.

| ID | Requirement | Priority |
|----|-------------|----------|
| M-01 | User profiles with farm details (location, crops, area) | P0 |
| M-02 | Community feed — post text, photos, and videos | P0 |
| M-03 | Like, comment, and share functionality | P0 |
| M-04 | Question & Answer section with topic tagging | P0 |
| M-05 | Marketplace: list items for sale (seeds, equipment, produce, etc.) | P0 |
| M-06 | Marketplace: search and filter by category, location, price | P0 |
| M-07 | Direct messaging between buyers and sellers | P1 |
| M-08 | Expert badge system for verified agronomists | P1 |
| M-09 | AI-powered content moderation | P1 |
| M-10 | Location-based feed (see posts from nearby farmers) | P1 |
| M-11 | Trending topics and popular discussions | P2 |
| M-12 | Group creation (by crop type, region, etc.) | P2 |

**Agentic Behavior:**
- The Community Agent monitors posts and can autonomously answer common questions or suggest relevant past discussions.
- It detects marketplace spam/fraud and auto-moderates.
- It identifies trending agricultural issues in a region and surfaces them to relevant farmers.

---

### 4.5 Multilingual Voice Assistant

**Description:** A global language selector and voice input system that allows Australian farmers from diverse cultural backgrounds to use Harvest AI in their preferred language. All AI responses are generated in the selected language. Voice input is captured via the browser microphone and transcribed using AWS Transcribe.

**Supported Languages (Australia-focused):**

| Code | Language | Community |
|------|----------|-----------|
| `en-AU` | English (Australian) | Default |
| `zh-CN` | Mandarin Chinese | Largest non-English speaking group in Australia |
| `zh-HK` | Cantonese | Chinese-Australian farming communities |
| `vi-VN` | Vietnamese | Vietnamese-Australian horticulture sector |
| `hi-IN` | Hindi | Indian-Australian farming communities |
| `it-IT` | Italian | Traditional Italian market gardeners |
| `ar-SA` | Arabic | Growing Arab-Australian farming communities |

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| V-01 | Global language selector available in Settings/Profile, with all 7 supported languages | P2 |
| V-02 | Selected language persists across sessions (stored in `preferences.language` in DynamoDB) | P2 |
| V-03 | All Claude AI responses generated in the user's selected language (system prompt instructs language) | P2 |
| V-04 | Microphone button in Crop Diagnosis chat input bar — tapping begins audio capture | P2 |
| V-05 | Recorded audio sent to backend → Lambda calls AWS Transcribe → transcribed text returned in selected language | P2 |
| V-06 | Transcribed text auto-fills the chat input field; user can review and edit before sending | P2 |
| V-07 | Voice input supported in all 7 languages via AWS Transcribe language codes | P2 |
| V-08 | Language change takes effect immediately on next AI interaction — no page reload required | P2 |
| V-09 | UI labels, placeholders, and static text translated via i18n (react-i18next) for all 7 languages | P2 |
| V-10 | Microphone permission denied state handled gracefully with clear error message | P2 |

**Known Limitation — Aboriginal & Torres Strait Islander Languages:**
AWS Transcribe does not support any Australian Aboriginal or Indigenous languages (Yolŋu Matha, Pitjantjatjara, Warlpiri, Arrernte, Kriol, etc.) as of 2025, and no production-ready commercial STT API currently does. For Aboriginal community users:
- The language selector (V-01) and AI response translation (V-03) will be offered for the 7 supported languages above.
- Voice input (V-04 to V-07) will be unavailable for unsupported languages — the microphone button is hidden and replaced with a text-only notice.
- Future path: Explore partnership with [AIATSIS](https://aiatsis.gov.au/) or community-led transcription projects to build custom ASR models. This is tracked as a separate future initiative.

**Voice Input Flow:**
```
User taps 🎙️ → Browser MediaRecorder captures audio → Audio sent to POST /api/voice/transcribe
→ Lambda invokes AWS Transcribe (language: user.preferences.language)
→ Transcribed text returned → Auto-filled in chat input → User reviews → Sends to AI
```

**Language & AI Response Flow:**
```
User selects language in Settings → Stored in DynamoDB preferences.language
→ All subsequent API calls include Accept-Language header
→ Backend appends "Respond in [language]" to Claude system prompt
→ AI responds in farmer's language
```

---

### 4.6 Authentication UI

**Description:** A UI-only sign-in/sign-up flow providing a complete user experience ahead of full AWS Cognito integration.

| ID | Requirement | Priority |
|----|-------------|----------|
| A-01 | Sign-in page at `/login` — email + password form with validation | P1 |
| A-02 | Sign-up page at `/signup` — name, email, password, confirm password with validation (min 8 chars, passwords must match) | P1 |
| A-03 | Auth-aware navbar on Home page — shows "Log In" link when signed out; user name + "Sign Out" button when signed in | P1 |
| A-04 | Session persistence across page refreshes via `localStorage` (`harvest_ai_user` key) | P1 |
| A-05 | AWS Cognito integration — replace mock auth with real Cognito User Pools | P2 |

**Current Implementation:**
- Mock/UI-only — any valid non-empty credentials are accepted.
- The `useAuth` hook manages auth state with `localStorage` persistence.
- Design uses the existing glassmorphism card pattern and design tokens.
- All routes (`/login`, `/signup`) are integrated into React Router.

---

## 5. Agentic AI Architecture

### 5.1 Agent Orchestration

The platform uses an **orchestrator-worker pattern** where a central orchestrator agent delegates tasks to specialized worker agents.

```
                    +-------------------------+
                    |   Orchestrator Agent     |
                    |  (Amazon Bedrock Agents) |
                    +-------------------------+
                     /     |       |        \
                    v      v       v         v
             +--------+ +------+ +------+ +-----------+
             |Weather | |Crop  | |News  | |Community  |
             |Agent   | |Diag  | |Agent | |Agent      |
             |        | |Agent | |      | |           |
             +--------+ +------+ +------+ +-----------+
```

### 5.2 Agent Capabilities

Each agent has:
- **Autonomy:** Can make decisions and take actions without human intervention.
- **Tool Use:** Agents can call APIs, query databases, invoke Lambda functions, and use other AWS services.
- **Memory:** Agents maintain conversation history and user context via session state.
- **Planning:** Agents break complex requests into sub-tasks and execute them step by step.
- **Collaboration:** Agents can delegate to or consult other agents (e.g., Diagnosis Agent asks Weather Agent for recent conditions to refine diagnosis).

---

## 6. Technical Architecture (AWS)

### 6.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                  │
│  React / React Native (Web + Mobile)                            │
│  Hosted on AWS Amplify                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           v
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                   │
│  Amazon API Gateway (REST + WebSocket)                          │
│  AWS AppSync (GraphQL for community/real-time)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          v                v                v
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Amazon      │  │  AWS Lambda  │  │  Amazon Bedrock  │
│  Bedrock     │  │  Functions   │  │  Agents          │
│  (Foundation │  │  (Business   │  │  (Orchestrator + │
│   Models)    │  │   Logic)     │  │   Worker Agents) │
└──────┬───────┘  └──────┬───────┘  └────────┬─────────┘
       │                 │                    │
       v                 v                    v
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  Amazon DynamoDB (User data, chat history, community posts)     │
│  Amazon S3 (Photos, media, news cache)                          │
│  Amazon OpenSearch (Search: marketplace, news, community)       │
│  Amazon RDS/Aurora (Relational data if needed)                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 AWS Services Mapping

| Service | Purpose |
|---------|---------|
| **Amazon Bedrock** | Foundation models (Claude) for chatbot, diagnosis, summarization |
| **Amazon Bedrock Agents** | Agentic orchestration — autonomous agents with tool use and planning |
| **Amazon Bedrock Knowledge Bases** | RAG for agricultural knowledge (diseases, treatments, best practices) |
| **AWS Lambda** | Serverless compute for business logic, API handlers, agent tools |
| **Amazon API Gateway** | REST API endpoints, WebSocket for real-time chat |
| **AWS AppSync** | GraphQL API for community feed, real-time subscriptions |
| **Amazon DynamoDB** | NoSQL storage for user profiles, chat sessions, posts, listings |
| **Amazon S3** | Object storage for uploaded photos, media, news cache |
| **Amazon Rekognition** | Image preprocessing and label detection (supplements Bedrock vision) |
| **Amazon SNS** | Push notifications for alerts |
| **Amazon SES** | Email notifications |
| **Amazon Pinpoint** | SMS alerts for weather warnings |
| **Amazon Location Service** | Geolocation for weather, nearby community, marketplace |
| **Amazon OpenSearch** | Full-text search for marketplace, news, community posts |
| **Amazon EventBridge** | Event-driven scheduling (weather polling, news aggregation) |
| **AWS Step Functions** | Complex agent workflow orchestration |
| **Amazon CloudWatch** | Monitoring, logging, alerting |
| **Amazon Cognito** | User authentication and authorization |
| **AWS Amplify** | Frontend hosting and CI/CD |
| **AWS WAF** | Web application firewall for API protection |
| **Amazon Transcribe** | Speech-to-text for multilingual voice input (V-05, V-07) |

### 6.3 External Integrations

| Integration | Purpose |
|-------------|---------|
| OpenWeather API / Tomorrow.io | Weather forecast data |
| Government Agriculture Portals | Policy updates, subsidies, market prices |
| RSS / News APIs | Agricultural news aggregation |
| Google Maps API | Mapping and location services (optional, supplement to Amazon Location) |

---

## 7. Data Model (High Level)

### User
```
{
  userId: string (PK)
  email: string
  name: string
  phone: string
  location: { lat, lng, region, country }
  farmDetails: { crops: [], area: number, soilType: string }
  preferences: { tempHighAlert, tempLowAlert, language, notifications }
  createdAt: timestamp
}
```

### ChatSession
```
{
  sessionId: string (PK)
  userId: string (SK)
  messages: [{ role, content, imageUrl?, timestamp }]
  diagnosis: { condition, confidence, severity, treatment }
  createdAt: timestamp
}
```

### CommunityPost
```
{
  postId: string (PK)
  userId: string
  type: "discussion" | "question" | "marketplace"
  content: string
  mediaUrls: [string]
  tags: [string]
  location: { lat, lng }
  likes: number
  comments: [{ userId, content, timestamp }]
  listingDetails?: { price, category, condition, status }
  createdAt: timestamp
}
```

### WeatherAlert
```
{
  alertId: string (PK)
  userId: string (SK)
  type: "high_temp" | "low_temp" | "flood" | "drought"
  severity: "info" | "warning" | "critical"
  message: string
  recommendation: string
  acknowledged: boolean
  createdAt: timestamp
}
```

---

## 8. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Availability** | 99.9% uptime |
| **Latency** | Chatbot response < 5 seconds; Weather alerts < 1 minute from detection |
| **Scalability** | Support 100K+ concurrent users |
| **Security** | End-to-end encryption, OWASP Top 10 compliance, SOC 2 |
| **Data Privacy** | GDPR compliant, user data encryption at rest and in transit |
| **Offline Support** | Cached weather data and saved articles available offline (mobile) |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Multi-language** | English (default), extensible to regional languages |

---

## 9. User Journeys

### Journey 1: Weather Alert
1. Farmer registers and sets location + crop type.
2. Weather Agent detects incoming heavy rainfall (flood risk).
3. Agent correlates with farmer's rice paddy crop → generates tailored advice.
4. Farmer receives push notification: "Heavy rain expected in 6 hours. Risk of flooding in your area. Recommended: check drainage channels and delay fertilizer application."
5. Farmer taps notification → opens app with full forecast + action checklist.

### Journey 2: Crop Diagnosis
1. Farmer notices yellow spots on tomato leaves.
2. Opens chatbot → takes a photo → asks "What's wrong with my tomato plant?"
3. Diagnosis Agent analyzes the image → identifies **Early Blight (Alternaria solani)** with 92% confidence.
4. Agent responds with: diagnosis, severity (moderate), recommended fungicide treatment, organic alternatives, and prevention tips.
5. Three days later, agent proactively asks: "How is your tomato plant doing? Would you like to share a follow-up photo?"

### Journey 3: Community Marketplace
1. Farmer has surplus organic fertilizer to sell.
2. Posts listing in AgriCommunity marketplace with photos and price.
3. Nearby farmers see the listing in their location-based feed.
4. Interested buyer sends a direct message → they negotiate and arrange pickup.
5. Community Agent suggests the post to farmers who recently asked about organic fertilizers.

---

## 10. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Monthly Active Users (MAU) | 10,000+ |
| Chatbot Diagnosis Accuracy | > 85% |
| Weather Alert Delivery Time | < 60 seconds |
| Average Chatbot Response Time | < 5 seconds |
| Community Posts per Day | 500+ |
| Marketplace Listings per Month | 1,000+ |
| User Retention (30-day) | > 40% |
| NPS Score | > 50 |

---

## 11. Release Plan

| Phase | Scope | Timeline |
|-------|-------|----------|
| **Phase 1 — MVP** | Weather alerts + Crop diagnosis chatbot (text + photo) | 8 weeks |
| **Phase 2 — Content** | News aggregator + personalized feed | 4 weeks |
| **Phase 3 — Community** | Community feed + Q&A + Marketplace | 6 weeks |
| **Phase 4 — Intelligence** | Advanced agentic features: proactive follow-ups, cross-agent collaboration, learning from user feedback | 4 weeks |
| **Phase 5 — Scale** | Multilingual voice assistant (7 languages, AWS Transcribe voice input, global language selector, i18n UI), offline mode, analytics dashboard | 6 weeks |

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low diagnosis accuracy for rare diseases | User trust erosion | Continuously fine-tune models; add "consult an expert" escalation path |
| Weather API downtime | Missed critical alerts | Use multiple weather data providers with failover |
| Low community adoption | Empty marketplace, no engagement | Seed content with agricultural experts; gamification (badges, points) |
| High AWS costs at scale | Budget overrun | Implement cost controls, use reserved capacity, optimize Lambda cold starts |
| Content moderation failures | Spam/fraud in marketplace | AI moderation + community reporting + manual review queue |
| Connectivity issues in rural areas | Users unable to access platform | Offline caching, SMS fallback for critical alerts, lightweight mobile app |

---

## 13. Open Questions

1. ~~Which specific regional languages should be prioritized for Phase 5?~~ **Resolved:** Australian-focused — English (default), Mandarin, Cantonese, Vietnamese, Hindi, Italian, Arabic. See section 4.5.
2. Should the marketplace support in-app payments, or keep transactions off-platform?
3. What is the monetization strategy (freemium, subscription, ads, government subsidized)?
4. Are there specific government agricultural databases or APIs to integrate with?
5. Should we build a native mobile app (React Native) or start with a Progressive Web App (PWA)?

---

*This document is a living artifact and will be updated as requirements evolve.*