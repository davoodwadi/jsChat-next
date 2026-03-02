# Background Processing Architecture for Long-Running Tasks

## Problem Statement

- **Current Limitation:** Edge runtime has 300-second timeout
- **Requirement:** Support long-running tasks (deep research, complex analysis) that take 10+ minutes
- **Solution:** Decouple UI from processing via background jobs with polling

---

## Architecture Overview

### 1. **Task Lifecycle**
```
User submits task → API route returns task ID immediately
                 → Task is stored in the botMessage history. Stored next to status, thought etc. 
                 → API processes the task outside client and server SDK
                 → Status updates: "processing" → "completed" or "failed"
                 → User polls for results or gets push notification
```

Current botMessage in `/lib/chatUtils.js`
newBotEntry = {
    key: JSON.stringify(array),
    globalIdBot: newGlobalIdBot,
    content: tempChunks,
    role: "bot",
    status: "reading", // pending | reading | done
    model: model,
    modelConfig,
    ...extraContent,
};
add 
background: true/false
taskID: from the api/string


### 2. **Core Components**

#### B. API Routes

**Submit Task** (`POST /app/api/chat/route.js`)
- Accept task parameters
- check `data?.modelConfig?.deepResearch;`
- if so, simulate a long running task and return an interactionId


**Poll Task Status** (`GET /app/api/chat/route.js`)
- Return current task status + progress
- backend checks if task is completed or pending
- if completed, return the results
- the client changes the message to completed. Polling is never done again.
