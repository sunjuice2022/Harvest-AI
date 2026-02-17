# 🛣️ Three Paths to Get Backend Working

Choose your path based on timeline and needs:

---

## **Path 1: Mock Testing (⚡ 15 minutes) — START HERE**

**Good for:** Immediate testing, UI validation, development

```bash
npm run dev:mock -w backend    # Terminal 1
npm run dev -w frontend         # Terminal 2
```

✅ **Pros:**
- No AWS account needed
- Instant setup
- Full end-to-end testing
- Test UI interactions immediately

❌ **Cons:**
- Mock AI responses (hardcoded examples)
- Data lost on restart
- No real Bedrock Claude access

📖 **Guide:** [QUICK_START_MOCK.md](QUICK_START_MOCK.md)

---

## **Path 2: Full AWS Setup (🏗️ 2-3 hours) — PRODUCTION READY**

**Good for:** Real testing, production deployment, team collaboration

```bash
# Step-by-step AWS infrastructure setup
# Then deploy Lambda, DynamoDB, S3, API Gateway
```

✅ **Pros:**
- Real Bedrock Claude 3.5 Sonnet
- Persistent DynamoDB storage
- Production-ready architecture
- Scalable to thousands of users
- Photo upload to S3

❌ **Cons:**
- AWS costs (~$0.50-5/month for testing)
- 2-3 hours setup time
- Requires AWS credentials
- CDK learning curve (but documented)

📖 **Guide:** [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## **Path 3: Hybrid (🔀 1 hour) — RECOMMENDED**

**Good for:** Quick UI testing + real AI responses

```bash
# Use mock backend for UI work
# Switch to real AWS when ready
```

✅ **Pros:**
- Start immediately with mocks
- Switch to real AWS when ready
- No downtime
- Best of both worlds

❌ **Cons:**
- Requires switching code a few times
- Two different test scenarios

📖 **Process:**
1. Start with [QUICK_START_MOCK.md](QUICK_START_MOCK.md) (5 min)
2. Test UI and features (10 min)
3. Follow [BACKEND_SETUP.md](BACKEND_SETUP.md) (1 hour)
4. Switch to real API endpoint

---

## 📊 Decision Matrix

| Need | Path 1 | Path 2 | Path 3 |
|------|--------|--------|--------|
| Test UI now | ✅ | ✅ | ✅ |
| Real AI responses | ❌ | ✅ | ✅ (later) |
| AWS deployment | ❌ | ✅ | ✅ |
| Time to working | 15 min | 3 hours | 1 hour |
| Cost | $0 | $1-5/mo | $0 now, $1-5/mo later |
| Best for | Dev work | Production | Teams |

---

## 🚀 Recommended Approach

### **Phase 1 (Now): Quick Mock Testing**
```bash
# 15 minutes to see everything working
npm run dev:mock -w backend -w frontend  # Mock mode
# Test UI, validate components
# Write unit tests with provided templates
```

### **Phase 2 (Next Day): Real AWS Setup**
```bash
# 1-2 hours to deploy infrastructure
# Follow BACKEND_SETUP.md step by step
# Test with real Bedrock Claude
```

### **Phase 3 (Day 2): Team Integration**
```bash
# Share API endpoint with frontend team
# Deploy Lambda functions
# Enable Cognito authentication
```

---

## ✅ What You Get At Each Phase

### After Path 1 (15 min)
```
✅ Frontend running on http://localhost:5173
✅ Backend API running on http://localhost:3000
✅ Full chat UI functional
✅ Mock diagnosis responses
✅ Upload flow working (simulated)
✅ Session management in memory
❌ No real AWS resources
❌ Data lost on restart
❌ No real Bedrock Claude
```

### After Path 2 (2-3 hours)
```
✅ Everything from Path 1
✅ AWS Lambda deployed
✅ DynamoDB persistent storage
✅ S3 bucket for photo storage
✅ Real Bedrock Claude 3.5 Sonnet
✅ Production-ready API Gateway
✅ Cognito authentication (optional)
✅ Data persists across restarts
✅ Real photo uploads to S3
```

---

## 📝 Quick Start Instructions

### **Choose Your Path:**

#### 🚀 **Option A: Start with Mock (Recommended)**
```bash
# 1. Read QUICK_START_MOCK.md
# 2. Create mock files (copy from guide)
# 3. Run: npm run dev:mock -w backend
# 4. Open http://localhost:5173/diagnosis
# 5. Test everything
```

#### 🏗️ **Option B: Go Full AWS Now**
```bash
# 1. Read BACKEND_SETUP.md
# 2. Complete Steps 1-9
# 3. Deploy CDK infrastructure
# 4. Deploy Lambda functions
# 5. Update API endpoint
```

---

## 🎯 Success Criteria

### ✅ Path 1 Success
```
[  ] Frontend loads without errors
[  ] Mock API responds in 1 second
[  ] Mock diagnosis shows on screen
[  ] Sessions persist during test
[  ] Upload URL generated successfully
```

### ✅ Path 2 Success
```
[  ] DynamoDB table exists in AWS
[  ] Lambda function deployed
[  ] S3 bucket accessible
[  ] Bedrock access granted
[  ] Full end-to-end API test passes
[  ] Real diagnosis from Claude
[  ] Photos upload to S3
```

---

## 🆘 Troubleshooting

### **Mock Server Won't Start**
```bash
# Make sure you have Express installed
npm install express cors -w backend

# Check port 3000 is free
lsof -i :3000
```

### **Frontend Can't Connect**
```bash
# Update .env
VITE_API_URL=http://localhost:3000/api

# Check browser console
# Should see POST to /api/diagnosis/chat
```

### **Bedrock Access Denied**
```bash
# You haven't been granted access yet
# Go to AWS Console > Bedrock > Model Access
# Request access to Claude 3.5 Sonnet
# Wait 5-10 minutes
```

---

## 📞 Next Steps

**Pick one:**

1. **[QUICK_START_MOCK.md](QUICK_START_MOCK.md)** — Get working in 15 minutes
2. **[BACKEND_SETUP.md](BACKEND_SETUP.md)** — Full AWS setup  
3. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** — Write unit tests

---

## 💡 Pro Tips

- Start with mocks to validate UI
- Then add real Bedrock for better testing
- Use mocks during development (faster, no costs)
- Use real AWS in CI/CD pipeline
- Keep both options available for flexibility

---

**Ready? Pick Path 1 or 2 above and follow the guide! 🚀**
