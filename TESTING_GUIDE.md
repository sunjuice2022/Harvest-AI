# 🧪 Testing Guide — Crop Diagnosis Chatbot

## Overview

There are **2 testing strategies**:

1. **Manual Testing** — Quick validation without infrastructure (TODAY)
2. **Automated Testing** — Unit + integration tests with mocks (Phase 1)

---

## 🚀 Manual Testing (No Setup Required)

### Option 1: Test Frontend Components in Isolation

Since we don't have backend infrastructure deployed yet, test React components locally:

```bash
# 1. Install dependencies
npm install

# 2. Start frontend dev server
npm run dev -w frontend

# 3. Open browser
# http://localhost:5173
```

### What to Test Manually

#### ✅ **UI Rendering**
1. Open `/diagnosis` page
2. Verify:
   - [ ] Hero section shows empty state with icon
   - [ ] "Upload Photo" and "Type Description" buttons visible
   - [ ] Input bar at bottom with emoji buttons
   - [ ] Glassmorphism styling applied (green accents, dark forest background)

#### ✅ **Photo Upload Flow**
1. Click "📸 Upload Photo" button
2. Select an image from camera rollor gallery
3. Verify:
   - [ ] Image preview shows in modal
   - [ ] "Done" button visible
   - [ ] Can clear image with ✕ button
   - [ ] Progress bar appears during upload (mock)

#### ✅ **Message Input**
1. Type a message: "What's wrong with my tomato?"
2. Verify:
   - [ ] Text appears in textarea
   - [ ] Send button (📤) enabled
   - [ ] Shift+Enter adds newline (multi-line support)
   - [ ] Enter sends message

#### ✅ **Chat UI**
1. Send a message without image
2. Verify:
   - [ ] User message appears in green bubble (right side)
   - [ ] Message timestamp shows
   - [ ] Auto-scroll to latest message

#### ✅ **Error Handling**
1. Try uploading a file > 10MB
2. Verify:
   - [ ] Error banner shows "File too large"
   - [ ] Can dismiss error with ✕
   - [ ] Input still works after error

---

## 🧑‍💻 Backend Testing With Mocks

Since actual AWS services aren't deployed yet, mock them locally:

### Setup Mock Environment

Create [backend/src/mocks/bedrock.mock.ts](backend/src/mocks/bedrock.mock.ts):

```typescript
/**
 * Mock Bedrock responses for testing without AWS account
 */

import type { DiagnosisResult } from "@harvest-ai/shared";

export const MOCK_BEDROCK_RESPONSES = {
  tomato_leaf_disease: {
    condition: "Early Blight",
    conditionType: "disease",
    confidence: 92,
    severity: "warning",
    description:
      "Early Blight (Alternaria solani) is a fungal disease affecting tomato leaves.",
    treatment: [
      "Apply fungicide spray (Mancozeb or Chlorothalonil)",
      "Remove infected leaves from bottom 12 inches",
      "Improve air circulation",
      "Water at soil level only",
    ],
    organicAlternatives: ["Neem oil spray", "Copper sulfate solution"],
    preventionTips: [
      "Use mulch to prevent soil splashing",
      "Space plants 24-36 inches apart",
      "Avoid overhead watering",
    ],
    affectedPlants: ["Tomato", "Potato"],
    escalatedToExpert: false,
  } as DiagnosisResult,

  unknown_condition: {
    condition: "Unidentified",
    conditionType: "disease",
    confidence: 25,
    severity: "info",
    description: "Unable to identify condition from image. Try another angle.",
    treatment: ["Consult local agronomist"],
    escalatedToExpert: true,
  } as DiagnosisResult,
};

export function getMockDiagnosis(keyword: string): DiagnosisResult {
  const lower = keyword.toLowerCase();
  if (lower.includes("tomato") || lower.includes("blight")) {
    return MOCK_BEDROCK_RESPONSES.tomato_leaf_disease;
  }
  return MOCK_BEDROCK_RESPONSES.unknown_condition;
}
```

---

## 🧪 Unit Tests

### Frontend Component Tests

Create [frontend/src/components/diagnosis/__tests__/ChatBubble.test.tsx](frontend/src/components/diagnosis/__tests__/ChatBubble.test.tsx):

```typescript
import { render, screen } from "@testing-library/react";
import { ChatBubble } from "../ChatBubble";
import type { ChatMessage } from "@harvest-ai/shared";

describe("ChatBubble", () => {
  it("renders user message in green bubble", () => {
    const message: ChatMessage = {
      id: "1",
      role: "user",
      content: "What's wrong with my tomato?",
      timestamp: Date.now(),
    };

    render(<ChatBubble message={message} isUser={true} />);

    expect(screen.getByText("What's wrong with my tomato?")).toBeInTheDocument();
    const bubble = screen.getByText("What's wrong with my tomato?").closest(
      ".chat-bubble"
    );
    expect(bubble).toHaveClass("user");
  });

  it("renders assistant message with diagnosis card", () => {
    const message: ChatMessage = {
      id: "2",
      role: "assistant",
      content: "This is Early Blight",
      timestamp: Date.now(),
      diagnosis: {
        condition: "Early Blight",
        conditionType: "disease",
        confidence: 92,
        severity: "warning",
        description: "Fungal disease",
        treatment: ["Spray fungicide"],
      },
    };

    render(<ChatBubble message={message} isUser={false} />);

    expect(screen.getByText("Early Blight")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
  });

  it("displays image if present", () => {
    const message: ChatMessage = {
      id: "3",
      role: "user",
      content: "Check this image",
      imageUrl: "https://example.com/image.jpg",
      timestamp: Date.now(),
    };

    render(<ChatBubble message={message} isUser={true} />);

    const img = screen.getByAltText("uploaded");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });
});
```

### Backend Service Tests

Create [backend/src/services/diagnosis/__tests__/diagnosis.service.test.ts](backend/src/services/diagnosis/__tests__/diagnosis.service.test.ts):

```typescript
import { DiagnosisService } from "../diagnosis.service";

// Mock Bedrock
jest.mock("@aws-sdk/client-bedrock-runtime");

describe("DiagnosisService", () => {
  let service: DiagnosisService;

  beforeEach(() => {
    service = new DiagnosisService({ region: "us-east-1" });
  });

  it("should parse valid Bedrock response", async () => {
    const mockBedrockResponse = {
      content: [
        {
          text: JSON.stringify({
            condition: "Early Blight",
            confidence: 92,
            severity: "warning",
            conditionType: "disease",
            description: "Fungal disease",
            treatment: ["Apply fungicide"],
          }),
        },
      ],
    };

    // Mock the Bedrock response
    const diagnosis = service["parseBedrockResponse"](
      mockBedrockResponse,
      "yellow spots"
    );

    expect(diagnosis.condition).toBe("Early Blight");
    expect(diagnosis.confidence).toBe(92);
    expect(diagnosis.severity).toBe("warning");
  });

  it("should clamp confidence to 0-100", async () => {
    const mockResponse = {
      content: [
        {
          text: JSON.stringify({
            condition: "Test",
            confidence: 150, // Invalid
            severity: "info",
            treatment: [],
          }),
        },
      ],
    };

    const diagnosis = service["parseBedrockResponse"](mockResponse, "test");
    expect(diagnosis.confidence).toBe(100);
  });

  it("should auto-escalate low confidence to expert", async () => {
    const mockResponse = {
      content: [
        {
          text: JSON.stringify({
            condition: "Unknown",
            confidence: 30, // Low confidence
            severity: "info",
            treatment: [],
          }),
        },
      ],
    };

    const diagnosis = service["parseBedrockResponse"](mockResponse, "test");
    expect(diagnosis.escalatedToExpert).toBe(true);
  });

  it("should return default diagnosis for invalid response", async () => {
    const mockResponse = { content: [{ text: "Not JSON" }] };

    const diagnosis = service["parseBedrockResponse"](mockResponse, "test");
    expect(diagnosis.condition).toBe("Unidentified");
    expect(diagnosis.confidence).toBe(0);
    expect(diagnosis.escalatedToExpert).toBe(true);
  });
});
```

### Repository Tests

Create [backend/src/repositories/diagnosis/__tests__/chatSession.repository.test.ts](backend/src/repositories/diagnosis/__tests__/chatSession.repository.test.ts):

```typescript
import { ChatSessionRepository } from "../chatSession.repository";
import type { ChatSession } from "@harvest-ai/shared";

// Mock DynamoDB
jest.mock("@aws-sdk/lib-dynamodb");

describe("ChatSessionRepository", () => {
  let repo: ChatSessionRepository;

  beforeEach(() => {
    repo = new ChatSessionRepository("us-east-1");
  });

  it("should create a new session", async () => {
    const session: ChatSession = {
      sessionId: "session-123",
      userId: "user-456",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await repo.createSession(session);

    // In real test with mock, verify send() was called
    // Verify the item had TTL set
  });

  it("should retrieve a session", async () => {
    // Mock GetCommand response
    const mockSession = {
      PK: "user-456",
      SK: "session-123",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await repo.getSession("user-456", "session-123");
    // Verify result matches expected structure
  });

  it("should update a session with new messages", async () => {
    const session: ChatSession = {
      sessionId: "session-123",
      userId: "user-456",
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: "Test message",
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await repo.updateSession(session);
    // Verify PutCommand was called with updated timestamp
  });

  it("should list user sessions with limit", async () => {
    const sessions = await repo.getUserSessions("user-456", 10);
    // Verify QueryCommand was called with limit
    expect(sessions).toBeInstanceOf(Array);
  });
});
```

---

## 🔧 Setup Testing Infrastructure

### 1. Install Testing Tools

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  ts-jest \
  @types/jest
```

### 2. Create Jest Config

Create [backend/jest.config.js](backend/jest.config.js):

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@harvest-ai/shared$": "<rootDir>/../shared/src",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.types.ts",
    "!src/**/*.constants.ts",
  ],
};
```

Create [frontend/jest.config.js](frontend/jest.config.js):

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### 3. Add Test Scripts

Update [backend/package.json]:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🏃 Run Tests

### Run All Tests

```bash
# Backend tests
npm run test -w backend

# Frontend tests
npm run test -w frontend

# All tests
npm run test
```

### Run Specific Test File

```bash
npm run test -w backend -- diagnosis.service.test.ts
```

### Watch Mode (Rerun on file change)

```bash
npm run test:watch -w frontend
```

### Coverage Report

```bash
npm run test:coverage -w backend
# Check coverage/index.html
```

---

## 📝 Integration Test Example

Create [backend/src/__tests__/diagnosis.integration.test.ts](backend/src/__tests__/diagnosis.integration.test.ts):

```typescript
import { DiagnosisService } from "../services/diagnosis/diagnosis.service";
import { ChatSessionRepository } from "../repositories/diagnosis/chatSession.repository";
import type { ChatSession } from "@harvest-ai/shared";
import { randomUUID } from "crypto";

/**
 * Integration test: Full chat flow from API to DB
 */
describe("Diagnosis Integration", () => {
  let service: DiagnosisService;
  let repo: ChatSessionRepository;

  beforeEach(() => {
    service = new DiagnosisService({ region: "us-east-1" });
    repo = new ChatSessionRepository("us-east-1");
  });

  it("should complete full diagnosis flow: message → Bedrock → DynamoDB", async () => {
    // 1. Create session
    const session: ChatSession = {
      sessionId: randomUUID(),
      userId: "test-user-123",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 2. Send message to service
    const userMessage = "My tomato has yellow spots with brown concentric rings";
    const diagnosis = await service.diagnoseCrop(userMessage);

    // 3. Verify diagnosis
    expect(diagnosis).toBeDefined();
    expect(diagnosis.confidence).toBeGreaterThanOrEqual(0);
    expect(diagnosis.confidence).toBeLessThanOrEqual(100);
    expect(diagnosis.treatment).toBeInstanceOf(Array);

    // 4. Add to session
    session.messages.push({
      id: randomUUID(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    });

    session.messages.push({
      id: randomUUID(),
      role: "assistant",
      content: `${diagnosis.condition} detected`,
      timestamp: Date.now(),
      diagnosis,
    });

    // 5. Save to DynamoDB
    await repo.updateSession(session);

    // 6. Retrieve and verify
    const retrieved = await repo.getSession(session.userId, session.sessionId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.messages.length).toBe(2);
    expect(retrieved?.lastDiagnosis?.condition).toBe(diagnosis.condition);
  });
});
```

---

## ✅ Testing Checklist

### Manual Tests (Do Today)
- [ ] UI renders without errors
- [ ] Input field accepts text
- [ ] Photo upload modal appears
- [ ] Error banner dismisses
- [ ] Styling matches design guide

### Unit Tests (Phase 1)
- [ ] DiagnosisService JSON parsing
- [ ] ChatBubble component rendering
- [ ] chatSession.repository CRUD operations
- [ ] Error handling in all layers

### Integration Tests (Phase 1)
- [ ] End-to-end: message → Bedrock → DB
- [ ] Photo upload: presigned URL generation
- [ ] Session retrieval: query by userId

### E2E Tests (Phase 2)
- [ ] Full user journey: upload photo → diagnosis → history
- [ ] Cross-browser (Chrome, Safari, Firefox)
- [ ] Mobile (iOS, Android)

---

## 🐛 Debugging Tips

### Frontend Debugging

```javascript
// In DiagnosisPage.tsx
console.log("Current session:", state.session);
console.log("Messages:", state.session?.messages);
console.log("Is loading:", state.isLoading);
console.log("Error:", state.error);
```

### Backend Local Testing

```bash
# Test Bedrock connection (with AWS creds)
AWS_REGION=us-east-1 aws bedrock list-foundation-models

# Test DynamoDB table exists
aws dynamodb describe-table --table-name ChatSessions

# View CloudWatch Logs
aws logs tail /aws/lambda/diagnosis-chat --follow
```

### Browser DevTools

```javascript
// Check useDiagnosis state in React DevTools
// Check Network tab → API calls
// Check Console → error messages
```

---

## 📚 Test Template

Copy and modify this template for new tests:

```typescript
describe("Feature Name", () => {
  let service: ServiceClass;

  beforeEach(() => {
    service = new ServiceClass();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should [expected behavior]", async () => {
    // Arrange
    const input = { /* setup */ };

    // Act
    const result = await service.method(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it("should handle [error case]", async () => {
    // Arrange
    const input = { /* invalid input */ };

    // Act & Assert
    await expect(service.method(input)).rejects.toThrow("Error message");
  });
});
```

---

## 🚀 Next Steps

1. **Today:** Manual testing of UI components
2. **Tomorrow:** Set up Jest + write unit tests
3. **Phase 1:** Add integration tests with mocked AWS
4. **Infrastructure Ready:** Test with real Bedrock & DynamoDB
5. **Phase 2:** E2E tests with Cypress/Playwright

---

## 📖 References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [AWS SDK Mocking](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/testing.html)

---

**Ready to test?** Start with the manual UI tests in the first section. No AWS setup required! ✅
