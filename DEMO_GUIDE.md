# Demo Guide - Real-Time WebSocket Updates ⚡

## 🔥 URGENT FIX APPLIED

**Problem**: WebSocket wasn't updating progress bars in real-time
**Root Cause**: Was using raw WebSocket instead of **STOMP protocol**
**Solution**: Completely rewrote WebSocket hook to use STOMP over SockJS

---

## ✅ What Was Fixed

### 1. **Installed STOMP Libraries**
```bash
npm install @stomp/stompjs sockjs-client @types/sockjs-client
```

### 2. **Rewrote WebSocket Hook**
**File**: `src/hooks/useJobWebSocket.ts`

**Before**: Raw WebSocket with manual SockJS parsing ❌
```typescript
const ws = new WebSocket(WS_URL);
ws.onmessage = (event) => {
  // Manual parsing of SockJS frames
};
```

**After**: STOMP protocol (like your working HTML) ✅
```typescript
const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    client.subscribe('/topic/in-progress', (message) => {
      const jobs = JSON.parse(message.body);
      setJobs(jobs);  // ← Triggers React re-render automatically!
    });
  }
});
```

### 3. **Key Changes**
- ✅ Uses `SockJS('http://localhost:8080/ws')` - same as working HTML
- ✅ Subscribes to `/topic/in-progress` - exact same topic
- ✅ Automatic reconnection with heartbeat
- ✅ Every message triggers `setJobs()` → React re-renders components
- ✅ Progress bars update automatically with decimal precision

---

## 🚀 How to Run for Demo

### Step 1: Start Backend (Already Running?)
```bash
# Terminal 1: REST API
python app.py  # Port 5000

# Terminal 2: WebSocket STOMP server
# Your server on port 8080
```

### Step 2: Start Dashboard
```bash
cd corrugator-waste-dashboard
npm run dev
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🎯 What You'll See (REAL-TIME!)

### Console Output (F12)
```
[WebSocket] Connecting to STOMP server at http://localhost:8080/ws
[WebSocket] ✅ Connected to STOMP server
[WebSocket] ✅ Subscribed to /topic/in-progress

[WebSocket] ✅ Received update: 10 jobs
[WebSocket] Sample job progress: 0.4785

[useRealTimeJobs] 🔄 Merging job data...
  ✓ Matched job ed06effb: WS progress=47.8%

[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket
  - Sample progress: 47.85%
[Dashboard] ✅ UI state updated - components will re-render
```

**This repeats automatically every few seconds!**

### UI Updates (AUTOMATIC!)

**InProgressJobsTable:**
```
┌────────────────────────────────────────┬────────────┐
│ Job ID                                 │ Completion │
├────────────────────────────────────────┼────────────┤
│ ed06effb-412d-4c68-b64e-819cab4a3595  │ 47.85% ▰▰▰▰│
│ 7bfe5075-98ab-4d36-a0ef-c3f2e1234567  │ 43.62% ▰▰▰ │
│ d1ccbce8-a3f1-4b23-9c12-456789abcdef  │ 51.09% ▰▰▰▰│
└────────────────────────────────────────┴────────────┘
```

**Progress updates automatically** ← NO REFRESH!

**CurrentJobCard:**
```
╔════════════════════════════════════╗
║ Current Job                        ║
╠════════════════════════════════════╣
║ Job Name: JOB ED06EFFB             ║
║ Quantity: 400 units                ║
║                                    ║
║ Job Progress          47.85%       ║
║ [▰▰▰▰▰▰▰▰▰▰░░░░░░░░]              ║
║                                    ║
║ Waste Risk: 32%  ← Random 25-50    ║
╚════════════════════════════════════╝
```

**Progress bar animates automatically** ← NO REFRESH!

---

## 🔍 Quick Verification Checklist

Before demo, verify:

✅ **1. STOMP Connection**
- Console shows: `✅ Connected to STOMP server`
- Console shows: `✅ Subscribed to /topic/in-progress`

✅ **2. Real-Time Updates**
- Console shows: `✅ Received update: X jobs` (repeating)
- Progress bars are animating
- Decimal values visible (e.g., `47.85%`)

✅ **3. Network Tab**
- WebSocket connection to `localhost:8080/ws` (SockJS)
- Connection stays open (not reconnecting constantly)
- Frames being sent/received in WS tab

✅ **4. UI Components**
- InProgressJobsTable shows real job IDs (not "JOB-001")
- CurrentJobCard shows decimal progress (e.g., `47.85%`)
- Waste Risk between 25-50 (e.g., `32%`)

---

## 🎬 Demo Script

### 1. Show Connection (5 seconds)
"The dashboard connects to the STOMP WebSocket server on port 8080..."
- Point to console: `✅ Connected to STOMP server`
- Point to alert: "WebSocket connected - Real-time progress updates active"

### 2. Show Real-Time Updates (10 seconds)
"Watch the progress bars update automatically without page refresh..."
- Point to InProgressJobsTable progress bars animating
- Point to CurrentJobCard horizontal progress bar
- Point to decimal precision: `47.85%`

### 3. Show Console Updates (5 seconds)
"Every few seconds, the server broadcasts updates via STOMP..."
- Show console logs: `✅ Received update: 10 jobs`
- Show merge logs: `✓ Matched job...`

### 4. Show Network Activity (5 seconds)
"The WebSocket connection stays open continuously..."
- Open Network tab → WS
- Show persistent connection
- Show frames being sent/received

---

## 🆘 Troubleshooting (If Needed During Demo)

### Issue: "Disconnected" or "Connection Failed"
**Quick Fix:**
1. Check WebSocket server is running on port 8080
2. Refresh page once (Ctrl+R)
3. Should auto-reconnect within 5 seconds

### Issue: "Progress not updating"
**Quick Check:**
1. Console should show: `✅ Received update` repeating
2. If not → WebSocket server not broadcasting
3. Check server logs

### Issue: "Shows mock data"
**Quick Fix:**
1. Look for console log: `[Dashboard] Using mock data`
2. If yes → Click X on alert to toggle real-time back on
3. Should see: `[Dashboard] Using REAL-TIME data`

---

## 📦 Package Versions (Demo Environment)

```json
{
  "@stomp/stompjs": "^7.0.0",
  "sockjs-client": "^1.6.1",
  "@types/sockjs-client": "^1.5.4"
}
```

---

## 🎯 Key Demo Points

1. **"Exact Same Protocol"** - Uses STOMP over SockJS, same as your test HTML
2. **"Real-Time Updates"** - Progress bars animate without page refresh
3. **"Decimal Precision"** - Shows accurate progress like 47.85%
4. **"Automatic Reconnection"** - If connection drops, auto-reconnects
5. **"React Reactivity"** - Every WebSocket message triggers React re-render

---

## ✅ Build Status

```bash
✓ 4002 modules transformed
✓ built in 11.46s
```

**All systems ready for demo!** 🚀

---

## 📞 Emergency Contact Points

If something breaks during demo:
1. **Refresh page** (Ctrl+R) - usually fixes 90% of issues
2. **Check console** - will show exact error
3. **Restart WebSocket server** - if connection issues
4. **Use test HTML** - as fallback if needed

---

**Good luck with your demo!** 🍀
