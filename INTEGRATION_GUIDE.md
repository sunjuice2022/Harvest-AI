# Integration Guide — How Everything Works Together

## End-to-End Flow: User Diagnoses Tomato Plant

### Step 1: User Opens App
```
1. Browser loads http://localhost:5173/diagnosis
2. React renders [DiagnosisPage.tsx]
3. useEffect triggers actions.initializeSession()
4. New ChatSession created with empty messages array
5. useDiagnosis hook sets state.session
6. Page shows empty state with "Take Photo" button
```

**Files Involved:**
- `frontend/src/pages/DiagnosisPage.tsx` (line 23-26)
- `frontend/src/hooks/useDiagnosis.ts` (line 36-42)

---

### Step 2: User Clicks "Take Photo"
```
1. User tap "Take Photo" button
2. onClick handler calls setShowPhotoUpload(true)
3. Modal renders [PhotoUpload.tsx]
4. User clicks camera icon → opens camera via <input capture>
5. User takes photo → browser FileReader reads file
6. State updates with preview image
```

**Files Involved:**
- `frontend/src/pages/DiagnosisPage.tsx` (line 63)
- `frontend/src/components/diagnosis/PhotoUpload.tsx` (line 48-61)

---

### Step 3: Photo Upload to S3
```
1. User taps "Done", PhotoUpload calls onPhotoSelected(file)
2. useDiagnosis.uploadPhoto(file) triggered
3. Fetch POST /api/diagnosis/upload → backend
4. [upload.handler.ts] receives request
   - Validates Cognito JWT from Authorization header
   - Extracts userId
   - Generates S3 bucket key: "diagnosis/{userId}/{uploadId}.jpg"
   - Creates PutObjectCommand with presigned URL
   - getSignedUrl returns 10-minute valid presigned URL
5. Returns { presignedUrl, uploadId, expires }
6. Frontend receives presignedUrl
7. Frontend does fetch PUT to S3 with file
8. S3 accepts file upload
9. State updates: selectedImageUrl = presignedUrl (without query params)
10. Preview shows uploaded image
```

**Files Involved:**
- `frontend/src/hooks/useDiagnosis.ts` (line 104-145)
- `backend/src/handlers/diagnosis/upload.handler.ts` (entire file)
- AWS S3 API

---

### Step 4: User Types Message & Sends
```
1. User types "My tomato leaves have yellow spots and brown patches"
2. ChatInput shows message in textarea
3. User presses Enter (or clicks send emoji button)
4. handleSendMessage("My tomato leaves...") triggered
5. useDiagnosis.sendMessage(message, selectedImageUrl) called
```

**Files Involved:**
- `frontend/src/components/diagnosis/ChatInput.tsx` (line 25-32)
- `frontend/src/hooks/useDiagnosis.ts` (line 57-100)

---

### Step 5: API Call to Diagnosis Endpoint
```
1. useDiagnosis hook sets isLoading = true
2. Fetches POST /api/diagnosis/chat
   Body: {
     sessionId: "uuid-1234",
     message: "My tomato leaves have yellow spots...",
     imageUrl: "https://s3.../diagnosis/user123/upload-uuid.jpg"
   }
3. Backend receives request in [diagnosis.handler.ts]
4. Extracts userId from Cognito JWT: "cognito-sub-xyz"
5. Loads existing session from DynamoDB using:
   sessionRepository.getSession("cognito-sub-xyz", "uuid-1234")
6. Session retrieved with previous messages (if any)
```

**Files Involved:**
- `backend/src/handlers/diagnosis/diagnosis.handler.ts` (line 40-60)
- `backend/src/repositories/diagnosis/chatSession.repository.ts` (line 20-28)

---

### Step 6: Bedrock Claude Diagnosis
```
1. diagnosisService.diagnoseCrop(message, imageBase64, sessionMessages)
2. buildSystemPrompt() creates agricultural expert persona:
   "You are an expert agricultural diagnostic AI assistant.
    Identify: diseases, pests, nutrient deficiencies, abiotic stress."
3. Fetch image from presigned URL OR accept base64
4. buildMessageContent() creates multimodal request:
   {
     content: [
       { type: "image", source: { type: "base64", data: "..." } },
       { type: "text", text: "My tomato leaves have yellow spots..." }
     ]
   }
5. InvokeModelCommand sent to Bedrock with:
   - modelId: "anthropic.claude-3-5-sonnet-20241022"
   - systemPrompt: agriculture expertise
   - messages: [ { role: "user", content: [...] } ]
   - max_tokens: 1024
6. Bedrock Claude analyzes image + text
7. Claude responds with JSON:
   {
     condition: "Early Blight",
     conditionType: "disease",
     confidence: 92,
     severity: "warning",
     description: "Early Blight (Alternaria solani) is a fungal disease...",
     treatment: ["Apply fungicide spray", "Remove infected leaves", ...],
     organicAlternatives: ["Neem oil", "Copper sulfate"],
     preventionTips: ["Improve air circulation", "Water at soil level"],
     affectedPlants: ["Tomato", "Potato"]
   }
```

**Files Involved:**
- `backend/src/services/diagnosis/diagnosis.service.ts` (entire file)
- AWS Bedrock API

---

### Step 7: Parse & Validate Response
```
1. parseBedrockResponse(bedrockResponse)
2. Extract JSON from Claude's text response
3. Validate required fields:
   - condition? ✓
   - confidence? ✓ + clamp to 0-100
   - severity? ✓
   - treatment? ✓
4. Auto-escalate if confidence < 60% → escalatedToExpert = true
5. Return structured DiagnosisResult
```

**Files Involved:**
- `backend/src/services/diagnosis/diagnosis.service.ts` (line 70-120)

---

### Step 8: Save to DynamoDB
```
1. Create userMessage ChatMessage:
   {
     id: "msg-uuid-1",
     role: "user",
     content: "My tomato leaves have yellow spots...",
     imageUrl: "https://s3.../...",
     timestamp: 1708123456789
   }
2. Create assistantMessage ChatMessage:
   {
     id: "msg-uuid-2",
     role: "assistant",
     content: "**Early Blight** (92% confidence)...",
     timestamp: 1708123456900,
     diagnosis: { ... }  // Full DiagnosisResult
   }
3. Update session:
   session.messages = [userMessage, assistantMessage]
   session.lastDiagnosis = DiagnosisResult
   session.updatedAt = now
4. sessionRepository.updateSession(session)
5. DynamoDB PutCommand:
   {
     PK: "cognito-sub-xyz",
     SK: "uuid-1234",
     messages: [...],
     lastDiagnosis: {...},
     createdAt: 1708123000000,
     updatedAt: 1708123460000,
     ttl: 1726099200  // 90 days later
   }
```

**Files Involved:**
- `backend/src/handlers/diagnosis/diagnosis.handler.ts` (line 65-85)
- `backend/src/repositories/diagnosis/chatSession.repository.ts` (line 41-50)
- AWS DynamoDB

---

### Step 9: Return Response to Frontend
```
1. diagnosisHandler returns:
   {
     statusCode: 200,
     body: JSON.stringify({
       messageId: "msg-uuid-2",
       diagnosis: {
         condition: "Early Blight",
         confidence: 92,
         severity: "warning",
         treatment: [...],
         ...
       },
       followUpSuggestions: [
         "Take another photo from different angle",
         "What is your treatment approach?"
       ]
     })
   }
2. Frontend receives response
3. useDiagnosis hook updates state:
   updatedSession.messages = [userMessage, assistantMessage]
   state.session = updatedSession
   state.isLoading = false
```

**Files Involved:**
- `frontend/src/hooks/useDiagnosis.ts` (line 76-90)

---

### Step 10: Render Diagnosis Card
```
1. DiagnosisPage component re-renders with new state
2. Renders messages map:
   {state.session.messages.map(msg => 
     <ChatBubble message={msg} isUser={msg.role === "user"} />
   )}
3. ChatBubble renders user message (green bubble with image)
4. ChatBubble renders assistant message:
   - Renders DiagnosisResultCard (inline)
   - Shows: condition, confidence %, severity badge
   - Shows: treatment list (first 3 items)
   - Color: severe = red, warning = amber, info = blue
5. Auto-scroll to bottom:
   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
6. UI shows:
   
   "Early Blight (92%)"
   "Severity: WARNING [Amber Badge]"
   "Treatment:
    • Apply fungicide spray
    • Remove infected leaves
    • Reduce humidity..."
```

**Files Involved:**
- `frontend/src/pages/DiagnosisPage.tsx` (line 91-95)
- `frontend/src/components/diagnosis/ChatBubble.tsx` (entire file)
- Styling: `DiagnosisPage.css`, `ChatBubble.css`

---

### Step 11: User Sends Follow-Up Question
```
1. User types: "Should I use organic or chemical treatment?"
2. Front sends message WITHOUT image URL
3. Backend receives:
   {
     sessionId: "uuid-1234",
     message: "Should I use organic or chemical treatment?",
     imageUrl: undefined
   }
4. Backend loads session → gets previous messages
5. diagnosisService passes conversationHistory to Bedrock
6. Claude uses context: "Previous diagnosis was Early Blight..."
7. Claude responds: "For Early Blight, organic options include..."
8. New message pair added to session
9. Frontend renders new bubbles below
```

**Files Involved:**
- Same as steps 5-10 (multi-turn conversation)

---

### Step 12: User Closes & Reopens App
```
1. User closes app
2. Later, user returns to app
3. DiagnosisPage loads with no session
4. User clicks "Chat History" (or similar button, not yet implemented)
5. Fetches: GET /api/diagnosis/sessions?limit=10
6. Backend returns list of user's sessions:
   [
     {
       sessionId: "uuid-1234",
       messageCount: 2,
       lastMessage: {...},
       lastDiagnosis: { condition: "Early Blight", ...},
       createdAt: 1708123000000,
       updatedAt: 1708123460000
     }
   ]
7. User clicks on session
8. Fetches: GET /api/diagnosis/sessions/uuid-1234
9. Backend returns full session with all messages
10. Frontend renders chat history
```

**Files Involved:**
- `backend/src/handlers/diagnosis/sessions.handler.ts` (entire file)
- `frontend/src/hooks/useDiagnosis.ts` - loadSession() (not yet wired to UI)

---

## Component Dependency Graph

```
DiagnosisPage
  ├── useEffect → actions.initializeSession()
  ├── ChatBubble (render messages)
  │   └── DiagnosisResultCard (inline)
  ├── ChatInput
  │   └── onSendMessage → handleSendMessage
  │       └── actions.sendMessage()
  └── PhotoUpload (conditional modal)
      └── onPhotoSelected → handlePhotoSelected
          └── actions.uploadPhoto()

useDiagnosis (custom hook)
  ├── state.session: ChatSession
  ├── actions.initializeSession()
  │   └── Creates new session, posts nothing
  ├── actions.sendMessage()
  │   └── POST /api/diagnosis/chat
  │       ├── diagnosis.handler.ts
  │       ├── diagnosisService.diagnoseCrop()
  │       │   └── Bedrock (AWS SDK)
  │       └── sessionRepository.updateSession()
  │           └── DynamoDB (AWS SDK)
  ├── actions.uploadPhoto()
  │   └── POST /api/diagnosis/upload
  │       ├── upload.handler.ts
  │       └── S3 getSignedUrl (AWS SDK)
  └── actions.loadSession()
      └── GET /api/diagnosis/sessions/{id}
          └── sessions.handler.ts

Backend-DAO (Data Access)
  ├── DiagnosisService
  │   └── Bedrock Client
  ├── ChatSessionRepository
  │   └── DynamoDB Client
  └── Handlers (Lambda entry points)
      ├── diagnosis.handler
      ├── upload.handler
      └── sessions.handler
```

---

## Data Shape Transformations

### DiagnosisResult (JSON → Frontend)
```typescript
// Bedrock Response
"{ condition: 'Early Blight', confidence: 92, ... }"

// Parsed by DiagnosisService
{
  condition: string;
  confidence: number; // 0-100
  severity: "critical" | "warning" | "info";
  treatment: string[];
  ...
}

// Turned into ChatMessage
{
  id: "msg-uuid",
  role: "assistant",
  diagnosis: {...},
  ...
}

// ChatBubble renders diagnosis card with colors mapped:
severity === "critical" → background: red
severity === "warning" → background: amber
severity === "info" → background: blue
```

---

## Error Handling Flow

### Example: Network Error During Chat

```
1. User sends message
2. Fetch to /api/diagnosis/chat fails (network timeout)
3. catch block in useDiagnosis.sendMessage()
4. Sets state.error = "Network timeout"
5. state.isLoading = false
6. ErrorBanner renders above chat with message
7. User clicks ✕ to dismiss error
8. actions.clearError() clears state.error
9. ErrorBanner disappears
```

**Files Involved:**
- `frontend/src/hooks/useDiagnosis.ts` (line 88-93)
- `frontend/src/pages/DiagnosisPage.tsx` (line 49-56)

---

## State Management Summary

### Global State (Shared Across Components)
```
useDiagnosis Hook (custom provider)
├── session: ChatSession
├── messages: ChatMessage[]
├── isLoading: boolean
├── error: string
└── uploadProgress: number

DiagnosisPage Local State
├── showPhotoUpload: boolean
├── selectedImageUrl: string
└── messagesEndRef: useRef
```

No Redux, no Context API — all state managed via custom hook + props drilling (minimal for this component tree).

---

## Performance Considerations

### Optimization Points

1. **Image Upload**: Client-side resize before S3
   - Not yet implemented, add to PhotoUpload.tsx
   
2. **Lazy Rendering**: Messages added incrementally
   - Already implemented via map() in DiagnosisPage
   
3. **Auto-scroll**: Only scroll on new message
   - Already implemented via messagesEndRef
   
4. **Bedrock Timeout**: 5-second max per request
   - DIAGNOSIS_CONSTANTS.IMAGE_ANALYSIS_TIMEOUT = 5000
   
5. **Session Caching**: Consider IndexedDB for recent sessions
   - Not yet implemented

---

## Testing Strategy

### Unit Tests to Add

1. **DiagnosisService.test.ts**
   - Mock Bedrock responses
   - Test JSON parsing
   - Test error cases

2. **ChatSessionRepository.test.ts**
   - Mock DynamoDB
   - Test CRUD operations

3. **ChatBubble.test.tsx**
   - Snapshot tests
   - Props validation

### E2E Tests to Add

1. Full chat flow with mock Bedrock
2. Photo upload with mock S3
3. Error recovery scenarios

---

**Navigation:** This document explains the complete flow. See [CODE_NAVIGATION.md](CODE_NAVIGATION.md) for file-by-file breakdown.
