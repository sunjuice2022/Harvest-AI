# Crop Diagnosis AI Chatbot — Implementation Guide

## Overview

The Crop Diagnosis AI Chatbot (Feature 2) is a multimodal AI chatbot built with React on the frontend and AWS Lambda with Amazon Bedrock on the backend. It enables farmers to diagnose crop diseases, pests, nutrient deficiencies, and abiotic stress by uploading photos and describing symptoms.

## Architecture

### Frontend (React + TypeScript)

```
frontend/src/
├── components/diagnosis/
│   ├── ChatBubble.tsx        # Individual chat message component
│   ├── ChatBubble.css        # Glassmorphism styling for messages
│   ├── ChatInput.tsx         # Message input bar with send button
│   ├── ChatInput.css         # Input styling
│   ├── PhotoUpload.tsx       # Camera capture + gallery upload
│   └── PhotoUpload.css       # Upload UI styling
├── pages/
│   ├── DiagnosisPage.tsx     # Main chat interface orchestrator
│   └── DiagnosisPage.css     # Page layout and animations
└── hooks/
    └── useDiagnosis.ts       # Custom hook managing diagnosis state
```

### Backend (Node.js + TypeScript)

```
backend/src/
├── handlers/diagnosis/
│   ├── diagnosis.handler.ts  # POST /api/diagnosis/chat
│   ├── upload.handler.ts     # POST /api/diagnosis/upload (presigned URL)
│   └── sessions.handler.ts   # GET /api/diagnosis/sessions (list & detail)
├── services/diagnosis/
│   └── diagnosis.service.ts  # Bedrock Claude invocation, response parsing
├── repositories/diagnosis/
│   └── chatSession.repository.ts  # DynamoDB CRUD for sessions
├── models/diagnosis/
│   └── chatSession.model.ts  # Data model transformations
└── constants/
    └── diagnosis.constants.ts  # Config, table names, thresholds
```

### Shared Types

```
shared/src/
└── diagnosis.types.ts  # Type contracts between frontend & backend
```

## Data Flow

### Diagnosis Chat Flow

1. **User uploads photo + sends message**
   - Frontend: `useDiagnosis` hook uploads file to S3 (presigned URL)
   - Backend: Returns presigned public URL

2. **User sends chat message**
   - Frontend: Sends message + image URL to `/api/diagnosis/chat`
   - Backend: `diagnosis.handler.ts` receives request
   - Backend: `DiagnosisService` invokes Bedrock Claude with multimodal input
   - Backend: Parses Claude's JSON response into structured `DiagnosisResult`
   - Backend: `ChatSessionRepository` saves session + messages to DynamoDB
   - Backend: Returns diagnosis with confidence, severity, treatment

3. **Chat bubbles render**
   - Frontend: `ChatBubble` displays diagnosis card with severity color
   - Frontend: Auto-scroll to latest message

## Key Components

### `useDiagnosis` Hook

Manages entire diagnosis session lifecycle:

```typescript
const [state, actions] = useDiagnosis();

// state = { session, isLoading, error, uploadProgress }
// actions = { initializeSession, sendMessage, uploadPhoto, loadSession, clearError }
```

**State Properties:**
- `session`: Current chat session with messages and diagnosis history
- `isLoading`: Loading state while calling API
- `error`: Human-readable error message
- `uploadProgress`: Photo upload progress (0-100)

**Actions:**
- `initializeSession()`: Create new session on mount
- `sendMessage(text, imageUrl)`: Send chat message, returns DiagnosisResult
- `uploadPhoto(file)`: Upload file to S3, returns presigned URL
- `loadSession(sessionId)`: Load previous session from backend
- `clearError()`: Clear error message

### `DiagnosisPage` Component

Main orchestrator component handling:

- Session initialization
- Chat message display with auto-scroll
- Empty state with action buttons
- Error banner with dismissal
- Photo upload modal
- Keyboard shortcuts (Shift+Enter for multi-line)

### `DiagnosisService` (Backend)

Handles Bedrock Claude integration:

```typescript
const service = new DiagnosisService({ region: "us-east-1" });
const diagnosis = await service.diagnoseCrop(
  userMessage,
  imageBase64,
  conversationHistory
);
```

**Responsibilities:**
- Build system prompt for agricultural expertise
- Format multimodal message content (text + image)
- Invoke Bedrock Claude 3.5 Sonnet
- Parse JSON response from Claude
- Validate diagnosis fields
- Auto-escalate low confidence to expert review

### `ChatSessionRepository` (Backend)

DynamoDB operations for chat sessions:

```typescript
const repo = new ChatSessionRepository();
await repo.createSession(session);
const fetched = await repo.getSession(userId, sessionId);
await repo.updateSession(session);
const userSessions = await repo.getUserSessions(userId, limit);
```

**Features:**
- Uses PK (userId) + SK (sessionId) for efficient queries
- TTL auto-expiry (90 days)
- Supports querying user's session history sorted by recency

## API Endpoints

### POST /api/diagnosis/chat

Send chat message and receive diagnosis.

**Request:**
```json
{
  "sessionId": "uuid",
  "userId": "cognito-sub",
  "message": "My tomato leaves have yellow spots",
  "imageUrl": "https://s3.../image.jpg"
}
```

**Response:**
```json
{
  "messageId": "uuid",
  "diagnosis": {
    "condition": "Early Blight",
    "conditionType": "disease",
    "confidence": 92,
    "severity": "warning",
    "description": "Early Blight (Alternaria solani) is a fungal disease...",
    "treatment": ["Apply fungicide spray", "Remove infected leaves"],
    "organicAlternatives": ["Neem oil", "Copper sulfate"],
    "preventionTips": ["Improve air circulation", "Water at soil level"],
    "affectedPlants": ["Tomato", "Potato"],
    "escalatedToExpert": false
  },
  "followUpSuggestions": ["What is your current treatment approach?"]
}
```

### POST /api/diagnosis/upload

Get presigned URL for S3 photo upload.

**Request:**
```json
{ "userId": "cognito-sub" }
```

**Response:**
```json
{
  "presignedUrl": "https://s3.../...",
  "uploadId": "uuid",
  "expires": 1674123456
}
```

### GET /api/diagnosis/sessions

List user's recent chat sessions.

**Query Params:**
- `limit`: Max sessions to return (default: 10)

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "uuid",
      "messageCount": 5,
      "lastMessage": { ... },
      "lastDiagnosis": { ... },
      "createdAt": 1674123456,
      "updatedAt": 1674123789
    }
  ],
  "count": 1
}
```

### GET /api/diagnosis/sessions/{sessionId}

Get full session details including all messages.

**Response:**
```json
{
  "sessionId": "uuid",
  "messages": [ ... ],
  "lastDiagnosis": { ... },
  "createdAt": 1674123456,
  "updatedAt": 1674123789
}
```

## Environment Variables

### Backend (.env)

```bash
AWS_REGION=us-east-1
CHAT_SESSIONS_TABLE=ChatSessions
MEDIA_BUCKET=agrisense-media
```

### Frontend (.env)

```bash
REACT_APP_API_URL=https://api.agrisense.example.com
REACT_APP_AUTH_REGION=us-east-1
```

## Database Schema

### ChatSessions (DynamoDB)

```
PK: userId (String)
SK: sessionId (String)
messages: ChatMessageItem[] (List)
lastDiagnosis: DiagnosisResult (Map)
createdAt: number (Number, Unix timestamp)
updatedAt: number (Number, Unix timestamp)
ttl: number (Number, for auto-expiry)
```

## Design System

### Colors (from Design Guide)

- **Leaf Green:** `#84CC16` - CTAs, active states
- **Dark Forest:** `#1A2E05` - Dark backgrounds
- **Alert Red:** `#EF4444` - Critical severity
- **Warning Amber:** `#F59E0B` - Warning severity
- **Info Blue:** `#3B82F6` - Info severity

### Typography

- **Display:** Plus Jakarta Sans, Bold 700, 28px
- **Heading:** SemiBold 600, 20px
- **Body:** Inter, Regular 400, 14px
- **Caption:** Regular 400, 12px

### Glassmorphism

- **Dark Glass:** `rgba(26, 46, 5, 0.70) + blur(16px)`
- **Medium Glass:** `rgba(26, 46, 5, 0.50) + blur(12px)`

## Requirements Coverage

### P0 (Complete MVP)

- [x] **C-01** - Text-based conversational chatbot
- [x] **C-02** - Photo upload (camera capture + gallery)
- [x] **C-03** - Instant diagnosis (< 5 seconds target with Bedrock)
- [x] **C-04** - Pest damage identification
- [x] **C-05** - Nutrient deficiency detection
- [x] **C-06** - Abiotic stress identification

### P1 (Phase 3)

- [ ] **C-07** - Multi-turn conversation with context retention (hooks in place, needs conversation memory)
- [ ] **C-08** - Diagnosis confidence score + severity rating (ready, needs frontend display enhancement)
- [ ] **C-09** - Treatment recommendations with local product availability (ready for pharmacy integration)
- [ ] **C-10** - Chat history and diagnosis log (ready, needs history UI page)

### P2 (Phase 5)

- [ ] **C-11** - Multi-language support
- [ ] **C-12** - Voice input support

## Testing Strategy

### Unit Tests

- `DiagnosisService.test.ts` - Mock Bedrock responses
- `ChatSessionRepository.test.ts` - Mock DynamoDB
- `ChatBubble.test.tsx` - Snapshot tests for components

### Integration Tests

- End-to-end chat flow with sample crop images
- Presigned URL generation and S3 upload
- Session persistence and retrieval

### Manual Testing

1. **Happy Path:**
   - Upload tomato leaf image → Receive Early Blight diagnosis
   - Send follow-up question → Get contextual response

2. **Edge Cases:**
   - Upload non-image file → Error handling
   - Network timeout → Retry mechanism
   - Large image (>10MB) → Client-side rejection

3. **Cross-browser:**
   - Chrome, Safari, Firefox
   - iOS Safari (camera access)
   - Android Chrome (camera access)

## Performance Considerations

- **Image compression:** Client-side resize before S3 upload
- **Lazy loading:** Chat messages rendered incrementally
- **Debouncing:** Limit API calls on rapid user input
- **Caching:** Store recent sessions in IndexedDB
- **Bedrock timeout:** 5-second limit for diagnosis request

## Security Considerations

- **Authentication:** Cognito JWT in Authorization header
- **Authorization:** User can only access their own sessions
- **Image privacy:** S3 presigned URLs expire in 10 minutes
- **CORS:** API Gateway restricted to frontend origin
- **Input validation:** Message length limit, image type validation

## Future Enhancements

### Phase 3 — Intelligence & Agents

- Proactive follow-up: Agent sends check-in 3 days after diagnosis
- Confidence-based escalation: Low confidence → expert review
- Treatment tracking: User marks treatment applied, agent monitors recovery

### Phase 4 — Scale & Polish

- Chat history pagination
- Export diagnosis as PDF report
- Share diagnosis with agronomist
- Diagnosis statistics (most common issues in region)

### Phase 5 — Advanced Features

- Multi-language support (Hindi, Spanish, Portuguese, etc.)
- Voice input: "Describe symptoms..."
- Offline support: Cache recent sessions
- AR overlay: Identify crop issues by camera

## Troubleshooting

### Common Issues

**Issue:** "Bedrock not accessible"
- Solution: Ensure model access granted in AWS Console for `anthropic.claude-3-5-sonnet-20241022`

**Issue:** "DynamoDB table not found"
- Solution: Ensure CDK deployment created ChatSessions table in correct region

**Issue:** "Presigned URL expired"
- Solution: Upload must complete within 10 minutes of URL generation

**Issue:** Chat not sending
- Solution: Check Cognito JWT token validity and API Gateway authorizer config

## References

- [AWS Bedrock Claude Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/)
- [React 19 Documentation](https://react.dev)
- [Design Guide](../DESIGN_GUIDE.md)
- [PRD](../PRD.md)
- [Coding Rules](../CODING_RULES.md)

---

**Status:** MVP Implementation Complete (Phase 1)  
**Last Updated:** February 17, 2026  
**Author:** AI Assistant
