# Crop Diagnosis Chatbot — Code Navigation Guide

## Quick Navigation

### Frontend Components

#### Main Page
- **[DiagnosisPage.tsx](frontend/src/pages/DiagnosisPage.tsx)** — Main orchestrator, session initialization, layout
  - Imports: `useDiagnosis`, `ChatBubble`, `ChatInput`, `PhotoUpload`
  - Handles: session init, message sending, photo upload modal, auto-scroll
  - Styles: `DiagnosisPage.css` — glassmorphism layout, animations

#### Chat Display
- **[ChatBubble.tsx](frontend/src/components/diagnosis/ChatBubble.tsx)** — Individual message bubbles
  - Shows: user/assistant messages, images, diagnosis cards
  - Includes: `DiagnosisResultCard` component
  - Styles: `ChatBubble.css` — green for user, glass for assistant

#### Input Components
- **[ChatInput.tsx](frontend/src/components/diagnosis/ChatInput.tsx)** — Message input bar
  - Features: textarea with emoji buttons, Shift+Enter for submit
  - Styles: `ChatInput.css` — glassmorphism border, disabled states

- **[PhotoUpload.tsx](frontend/src/components/diagnosis/PhotoUpload.tsx)** — Camera/gallery upload
  - Features: camera capture + file upload, preview, progress bar
  - Styles: `PhotoUpload.css` — dashed border, clear button

#### Custom Hooks
- **[useDiagnosis.ts](frontend/src/hooks/useDiagnosis.ts)** — State management
  - State: session, isLoading, error, uploadProgress
  - Actions: initializeSession, sendMessage, uploadPhoto, loadSession, clearError
  - Calls: `/api/diagnosis/chat`, `/api/diagnosis/upload`, `/api/diagnosis/sessions`

---

### Backend Handlers

#### Diagnosis Chat
- **[diagnosis.handler.ts](backend/src/handlers/diagnosis/diagnosis.handler.ts)**
  - Endpoint: `POST /api/diagnosis/chat`
  - Flow: Extract userId → Parse request → Get session → Invoke service → Save to DB → Return response
  - Dependencies: `DiagnosisService`, `ChatSessionRepository`

#### Photo Upload
- **[upload.handler.ts](backend/src/handlers/diagnosis/upload.handler.ts)**
  - Endpoint: `POST /api/diagnosis/upload`
  - Flow: Validate user → Generate presigned URL → Return URL + metadata
  - Expires: 10 minutes
  - Allowed: JPEG, PNG, WebP

#### Session Management
- **[sessions.handler.ts](backend/src/handlers/diagnosis/sessions.handler.ts)**
  - Endpoint: `GET /api/diagnosis/sessions`  (list)
  - Endpoint: `GET /api/diagnosis/sessions/{sessionId}` (detail)
  - Returns: Session list with metadata or full session with all messages

---

### Backend Services

#### Diagnosis Service
- **[diagnosis.service.ts](backend/src/services/diagnosis/diagnosis.service.ts)**
  - Handles: Bedrock Claude invocation
  - Methods:
    - `diagnoseCrop(message, imageBase64, conversationHistory)` → `DiagnosisResult`
    - `buildSystemPrompt()` — agriculture expertise instructions
    - `buildMessageContent()` — format text + image for Claude
    - `parseBedrockResponse()` — extract JSON from Claude response
  - Auto-escalate: confidence < 60% → escalatedToExpert = true
  - Model: `anthropic.claude-3-5-sonnet-20241022`

---

### Backend Repositories

#### Chat Session Repository
- **[chatSession.repository.ts](backend/src/repositories/diagnosis/chatSession.repository.ts)**
  - Table: DynamoDB `ChatSessions`
  - Key Schema: PK (userId) + SK (sessionId)
  - Methods:
    - `getSession(userId, sessionId)` → ChatSession
    - `createSession(session)` — new session
    - `updateSession(session)` — save messages
    - `getUserSessions(userId, limit)` — query user's sessions
  - Features: TTL auto-expiry (90 days), sorted by recency

---

### Backend Models

#### Chat Session Data Model
- **[chatSession.model.ts](backend/src/models/diagnosis/chatSession.model.ts)**
  - DynamoDB Item Schema: PK, SK, messages, lastDiagnosis, createdAt, updatedAt, ttl
  - Transformations: `toChatSession()` and `toChatSessionItem()`
  - Interfaces: `ChatSessionItem`, `ChatMessageItem`

---

### Shared Types & Constants

#### Type Definitions
- **[diagnosis.types.ts](shared/src/diagnosis.types.ts)**
  - `DiagnosisResult` — condition, confidence, severity, treatment, etc.
  - `ChatMessage` — role, content, imageUrl, timestamp, diagnosis
  - `ChatSession` — sessionId, userId, messages, metadata
  - `DiagnosisRequest` / `DiagnosisResponse` — API contracts

#### Constants
- **[diagnosis.constants.ts](backend/src/constants/diagnosis.constants.ts)**
  - `DIAGNOSIS_CONSTANTS` — table names, model ID, timeouts, thresholds
  - `DIAGNOSIS_SEVERITY_BADGES` — color mapping for UI
  - `CROP_TYPES` — predefined crop list

---

## Data Flow Diagrams

### Chat Message Flow
```
User Types Message + Image
        ↓
[ChatInput.tsx] → [useDiagnosis.ts]
        ↓
POST /api/diagnosis/chat
        ↓
[diagnosis.handler.ts] → Validate + Extract userId
        ↓
[diagnosis.service.ts] → Invoke Bedrock Claude
        ↓
[diagnosis.service.ts] → Parse JSON Response → DiagnosisResult
        ↓
[chatSession.repository.ts] → Save to DynamoDB
        ↓
Response with DiagnosisResult
        ↓
[ChatBubble.tsx] → Render Diagnosis Card
```

### Photo Upload Flow
```
User Selects Photo
        ↓
[PhotoUpload.tsx] → [useDiagnosis.ts]
        ↓
POST /api/diagnosis/upload
        ↓
[upload.handler.ts] → Generate Presigned URL
        ↓
Return URL to Frontend (10-min expiry)
        ↓
Frontend PUT to S3 with File
        ↓
[PhotoUpload.tsx] → Show Preview + URL
        ↓
User Sends Message with Image URL
        ↓
[useDiagnosis.ts] → Include imageUrl in chat request
```

---

## Import Paths

### Frontend (@harvest-ai/frontend)
```typescript
import { useDiagnosis } from "@/hooks/useDiagnosis";
import { ChatBubble } from "@/components/diagnosis/ChatBubble";
import type { DiagnosisResult, ChatSession } from "@harvest-ai/shared";
```

### Backend (@harvest-ai/backend)
```typescript
import { DiagnosisService } from "@/services/diagnosis/diagnosis.service";
import { ChatSessionRepository } from "@/repositories/diagnosis/chatSession.repository";
import { DIAGNOSIS_CONSTANTS } from "@/constants/diagnosis.constants";
import type { DiagnosisResult } from "@harvest-ai/shared";
```

---

## Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| [DiagnosisPage.tsx](frontend/src/pages/DiagnosisPage.tsx) | Main chat UI | ~130 |
| [useDiagnosis.ts](frontend/src/hooks/useDiagnosis.ts) | State + API | ~220 |
| [diagnosis.service.ts](backend/src/services/diagnosis/diagnosis.service.ts) | Bedrock logic | ~150 |
| [diagnosis.handler.ts](backend/src/handlers/diagnosis/diagnosis.handler.ts) | API endpoint | ~120 |
| [chatSession.repository.ts](backend/src/repositories/diagnosis/chatSession.repository.ts) | DB CRUD | ~80 |
| [diagnosis.types.ts](shared/src/diagnosis.types.ts) | Type contracts | ~60 |

**Total Lines of Code:** ~1,000+ (excluding comments and tests)

---

## Configuration Files

| File | Purpose |
|------|---------|
| [package.json](package.json) | Root monorepo config, workspaces |
| [tsconfig.json](tsconfig.json) | Root TypeScript config |
| [frontend/tsconfig.json](frontend/tsconfig.json) | Frontend-specific config, path aliases |
| [backend/tsconfig.json](backend/tsconfig.json) | Backend-specific config |
| [shared/tsconfig.json](shared/tsconfig.json) | Shared module config |

---

## Development Workflow

### Adding a New Feature

1. **Define Types** → `shared/src/diagnosis.types.ts`
2. **Create Backend Service** → `backend/src/services/diagnosis/`
3. **Create Backend Handler** → `backend/src/handlers/diagnosis/`
4. **Create Frontend Component** → `frontend/src/components/diagnosis/`
5. **Add Hook State** → `frontend/src/hooks/useDiagnosis.ts`
6. **Wire to Page** → `frontend/src/pages/DiagnosisPage.tsx`
7. **Style** → Create `.css` file alongside component
8. **Test** → Unit + integration tests

### Best Practices

- ✅ Keep components < 300 lines
- ✅ Keep functions < 30 lines
- ✅ No more than 3 parameters (use objects for more)
- ✅ Use TypeScript strict mode
- ✅ Add JSDoc comments for complex functions
- ✅ Extract magic strings to constants
- ✅ Handle errors gracefully
- ✅ Mock dependencies in tests

---

## Debugging Tips

### Frontend
```javascript
// Check useDiagnosis state
const [state, actions] = useDiagnosis();
console.log("Current session:", state.session);
console.log("Is loading:", state.isLoading);
console.log("Error:", state.error);

// Test API call
actions.sendMessage("Test message");
```

### Backend
```bash
# Test Bedrock connection
AWS_REGION=us-east-1 aws bedrock list-foundation-models

# Check DynamoDB table
aws dynamodb describe-table --table-name ChatSessions

# View S3 presigned URL
curl -X POST http://localhost:3000/api/diagnosis/upload \
  -H "Authorization: Bearer {token}"
```

---

## Related Documentation

- [DIAGNOSIS_README.md](./DIAGNOSIS_README.md) — Full implementation guide
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) — Feature status
- [docs/PRD.md](./docs/PRD.md) — Requirements
- [docs/CODING_RULES.md](./docs/CODING_RULES.md) — Style guide
- [docs/DESIGN_GUIDE.md](./docs/DESIGN_GUIDE.md) — UI design system

---

**Last Updated:** February 17, 2026  
**Maintainer:** AI Assistant
