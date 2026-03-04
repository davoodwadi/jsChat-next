# Error Logging System - Implementation Guide

## What Was Implemented

A comprehensive client-side error logging system to debug the Brave/iOS send button exception:

### 1. **Error Logger Utility** (`lib/errorLogger.js`)
- Captures JavaScript exceptions with full context
- Detects Brave browser and device information
- Stores errors in localStorage (last 10 errors)
- Sends errors to server for persistent storage
- Non-blocking: won't crash app if logging fails

### 2. **Server Endpoint** (`app/api/error-logs/route.js`)
- **POST /api/error-logs** - Stores errors in MongoDB (`chat.errorLogs` collection)
- **GET /api/error-logs** - Retrieves errors with filtering options
- Adds server-side metadata (IP, timestamp, user-agent)
- Special console logging for Brave/iOS errors

### 3. **Instrumented Chat Flow** (`lib/chatUtils.js`)
- Logs API errors (400/500 responses)
- Logs streaming errors (fetch, ReadableStream failures)
- Captures timing, model, endpoint, request metadata
- Shows user-friendly error toasts

### 4. **Debug UI** (`components/recursiveChat/UserMessage.jsx`)
- Debug button (🐛) in development mode
- View recent errors from localStorage
- Shows device info (Brave, iOS indicators)
- Expandable technical details

---

## How to Debug the Brave/iOS Issue

### Step 1: Test on Desktop First
1. Start the dev server: `npm run dev` or `pnpm dev`
2. Open the chat page
3. Try sending a message
4. If errors occur, you'll see:
   - Error toast with description
   - Bug icon (🐛) in the message input
   - Click the bug icon to view error details

### Step 2: Test on iPhone Brave
1. Ensure your app is accessible on the network (use ngrok or deploy to staging)
2. Open the chat in Brave browser on iPhone
3. Try sending a message
4. If it fails:
   - The error is **automatically logged to the database**
   - Check your server console for: `🔴 [BRAVE/iOS ERROR]`

### Step 3: Retrieve and Analyze Errors

#### Option A: View in Database
```javascript
// Connect to MongoDB and query the errorLogs collection
use chat;
db.errorLogs.find({"deviceInfo.isBrave": true}).sort({serverTimestamp: -1}).limit(10);
```

#### Option B: Use the API
```bash
# Get all Brave errors
curl "http://localhost:3000/api/error-logs?isBrave=true&limit=20"

# Get errors by context
curl "http://localhost:3000/api/error-logs?context=chat-send-stream-error"
```

#### Option C: Check localStorage on Phone
On iPhone Brave, enable developer tools:
1. Settings → Privacy & Security → Advanced → "Web Inspector"
2. Connect iPhone to Mac via USB
3. Mac Safari → Develop → [Your iPhone] → Inspect
4. Console: `localStorage.getItem('errorLogs')`

---

## Common Issues to Look For

Based on the error logs, check for:

### 1. **Fetch Failures**
- **Context**: `chat-send-api-error`
- **Cause**: CORS, network policies, Brave shields blocking requests
- **Fix**: Add CORS headers, check Brave shields settings

### 2. **Stream Reading Failures**
- **Context**: `chat-send-stream-error`
- **Metadata**: Look for `hasReader: false`
- **Cause**: Brave/iOS may not support `response.body.getReader()`
- **Fix**: Implement fallback to `response.text()` instead of streaming

### 3. **JSON Parsing Failures**
- **Error Message**: "Failed to parse JSON"
- **Cause**: Malformed stream chunks, encoding issues
- **Fix**: Check server response format, ensure UTF-8 encoding

### 4. **AbortError** (Expected)
- User clicked stop button
- This is normal, not a bug

---

## Database Schema

The `chat.errorLogs` collection stores:

```javascript
{
  timestamp: "2026-03-04T10:30:45.123Z",        // Client timestamp
  serverTimestamp: ISODate("2026-03-04T10:30:45.500Z"), // Server timestamp
  context: "chat-send-stream-error",             // Where error occurred
  error: {
    name: "TypeError",
    message: "Cannot read property 'getReader' of undefined",
    stack: "..."                                  // Full stack trace
  },
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    platform: "iPhone",
    isBrave: true,
    screenResolution: "390x844",
    viewport: "390x664",
    connectionType: "4g"
  },
  metadata: {
    model: "gpt-4",
    endpoint: "chat",
    isOldMessage: false,
    fetchStatus: 200,
    hasReader: false                              // Key diagnostic!
  },
  url: "https://yourapp.com/chat",
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0..."                    // Server-side user-agent
}
```

---

## Next Steps After Finding the Error

### If `hasReader: false` → ReadableStream not supported
Add fallback in `chatUtils.js`:
```javascript
if (!data.body || !data.body.getReader) {
  // Fallback: read entire response as text
  const text = await data.text();
  // Process text line by line instead of streaming
}
```

### If Fetch fails with CORS error
Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

### If Brave shields blocking requests
- Check if error only occurs with shields UP
- Add your domain to Brave's allowed list
- Or: disable aggressive fingerprinting for your site

---

## Testing Checklist

- [ ] Desktop Chrome: Send message → Success
- [ ] Desktop Brave: Send message → Success
- [ ] iPhone Safari: Send message → Success
- [ ] iPhone Brave: Send message → Check error logs
- [ ] View error in database/API
- [ ] Identify root cause from error metadata
- [ ] Implement fix based on error type
- [ ] Re-test on iPhone Brave

---

## Cleanup (Optional)

After debugging, you can:
1. Keep the logging system (recommended for production monitoring)
2. Remove the debug UI button from `UserMessage.jsx`
3. Disable localStorage storage in production
4. Set up automated error alerts (email notifications for critical errors)

---

## Production Recommendations

1. **Add error rate monitoring**: Alert if > 10 errors/hour
2. **Filter sensitive data**: Don't log authentication tokens or personal data
3. **Retention policy**: Clear logs older than 30 days
4. **Privacy compliance**: Inform users about error logging in privacy policy
