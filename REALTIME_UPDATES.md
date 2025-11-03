# Real-Time Updates - No Refresh Required! ⚡

This document explains how the dashboard displays **REAL-TIME updates** without requiring page refresh.

## 🎯 Overview

The dashboard uses a **reactive data flow** that automatically updates the UI whenever WebSocket sends new data:

```
WebSocket Server → WebSocket Hook → useRealTimeJobs Hook → Dashboard → Components
     (sends)          (receives)        (merges)           (updates)    (re-render)
```

## 🔄 Data Flow (Real-Time)

### Step 1: WebSocket Receives Data
**File**: `src/hooks/useJobWebSocket.ts`

When WebSocket server sends new progress data:
```typescript
ws.onmessage = (event) => {
  const parsed = /* parse SockJS frame */;
  console.log('[WebSocket] ✅ Received update:', parsed.length, 'jobs');
  setJobs(parsed);  // ← Triggers React state update
};
```

**What happens**:
- WebSocket receives message from server
- Parses SockJS frame format (`a[...]`)
- Calls `setJobs()` with new data
- **React automatically triggers re-render of dependent components**

---

### Step 2: Merge with API Data
**File**: `src/hooks/useRealTimeJobs.ts`

Every time `wsJobs` changes, this effect runs:
```typescript
useEffect(() => {
  console.log('[useRealTimeJobs] 🔄 Merging job data...');

  // Match jobs by ID and merge
  const mergedJobs = apiJobsData.map(apiJob => {
    const wsJob = wsJobMap.get(apiJob.job.job_id);
    if (wsJob) {
      return {
        ...apiJob,
        status: {
          ...apiJob.status,
          progress: wsJob.progress,  // ← FROM WEBSOCKET (REAL-TIME)
        }
      };
    }
    return apiJob;
  });

  setInProgressJobs(mappedInProgressJobs);  // ← Triggers React state update
  setAllRunningJobs(mappedRunningJobs);     // ← Triggers React state update

}, [apiJobsData, wsJobs]);  // ← Runs every time wsJobs changes
```

**What happens**:
- WebSocket data (`wsJobs`) changes → Effect runs
- Merges WebSocket progress with REST API job details
- Calls `setInProgressJobs()` and `setAllRunningJobs()`
- **React automatically propagates updates to Dashboard component**

---

### Step 3: Dashboard Updates
**File**: `src/pages/Dashboard.tsx`

Every time `realTimeInProgressJobs` changes, this effect runs:
```typescript
useEffect(() => {
  console.log('[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket');
  console.log('  - Sample progress:', realTimeInProgressJobs[0]?.completion + '%');

  setInProgressJobs(realTimeInProgressJobs);  // ← Update local state
  setCurrentJob(realTimeRunningJobs[0]);       // ← Update current job

  console.log('[Dashboard] ✅ UI state updated - components will re-render');

}, [realTimeInProgressJobs, realTimeRunningJobs]);
```

**What happens**:
- Hook data changes → Effect runs
- Updates Dashboard's local state
- **React automatically re-renders all child components**

---

### Step 4: Components Re-render
**Files**:
- `src/components/JobTables/InProgressJobsTable.tsx`
- `src/components/CurrentJob/CurrentJobCard.tsx`

Components receive new props and automatically re-render:
```typescript
// InProgressJobsTable receives new jobs prop
<InProgressJobsTable jobs={inProgressJobs} />

// Progress bar automatically updates
<Progress percent={job.completion} />  // ← New value from WebSocket
```

**What happens**:
- Parent component passes new `jobs` prop
- Ant Design `<Progress>` component receives new `percent` value
- **Progress bar smoothly animates to new value**
- **NO PAGE REFRESH REQUIRED!**

---

## 📊 Console Output (When Working Correctly)

When your dashboard is working correctly, you'll see this in the browser console:

```
[WebSocket] ✅ Received update: 10 jobs
[WebSocket] Sample job progress: 0.478

[useRealTimeJobs] 🔄 Merging job data...
  - REST API jobs: 10
  - WebSocket jobs: 10
  ✓ Matched job ed06effb: WS progress=47.8%
  ✓ Matched job 7bfe5075: WS progress=43.7%
  ...
[useRealTimeJobs] ✅ Merge complete. Total jobs: 10

[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket
  - In-progress jobs: 10
  - Sample progress: 48%
  - Current job progress: 48%
[Dashboard] ✅ UI state updated - components will re-render
```

**This sequence repeats automatically every time WebSocket sends new data** (typically every few seconds).

---

## 🔍 How to Verify Real-Time Updates

### 1. Start Your Backend Services

```bash
# Terminal 1: REST API
python app.py  # Port 5000

# Terminal 2: WebSocket server
# Your WebSocket server on port 8080
```

### 2. Start Dashboard

```bash
cd corrugator-waste-dashboard
npm run dev
```

### 3. Open Browser Console (F12)

You should see:
- ✅ `[WebSocket] ✅ Received update` - Every few seconds
- ✅ `[useRealTimeJobs] 🔄 Merging job data...` - Every few seconds
- ✅ `[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket` - Every few seconds

### 4. Watch the Progress Bars

**In InProgressJobsTable:**
- Progress bars should **smoothly animate** from current to new value
- Percentage numbers should **update automatically**
- **NO page refresh needed**

**In CurrentJobCard:**
- Large horizontal progress bar should **update in real-time**
- Percentage text should **change automatically**
- **NO page refresh needed**

### 5. Network Tab Verification

**What you SHOULD see:**
- ✅ ONE REST API call to `/job-details?status=in-progress` (on mount)
- ✅ Persistent WebSocket connection (stays open)
- ✅ WebSocket frames being sent/received continuously

**What you should NOT see:**
- ❌ Repeated REST API calls to `/job-details`
- ❌ HTTP polling
- ❌ Connection dropping and reconnecting constantly

---

## 🚨 Troubleshooting

### Problem: "I still have to refresh the page"

**Possible causes:**

#### 1. WebSocket Not Connecting
**Check console for:**
```
WebSocket error: ...
```

**Solution:**
- Verify WebSocket server is running on port 8080
- Check `.env` file has correct `VITE_WS_BASE_URL`
- Ensure WebSocket URL is accessible from browser

#### 2. WebSocket Not Sending Data
**Check console for:**
```
[WebSocket] ✅ Received update: 10 jobs
```

**If you DON'T see this:**
- WebSocket server is not broadcasting data
- Check server logs to see if it's sending messages
- Verify the SockJS message format

#### 3. React Not Re-rendering
**Check console for:**
```
[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket
```

**If you DON'T see this:**
- State updates are not propagating
- Check browser console for React errors
- Try refreshing page once to clear any stale state

#### 4. Wrong WebSocket Format
**Check the raw WebSocket message:**

Open DevTools → Network → WS → Click WebSocket connection → Messages tab

**Expected format:**
```
a["[{\"jobId\":\"xxx\",\"progress\":0.48,...}]"]
```

**If format is different:**
- Update parsing logic in `useJobWebSocket.ts`
- See lines 66-91 for parsing logic

---

## 🎯 Key Points

1. **REST API called ONCE** on mount for job details
2. **WebSocket provides ONLY progress updates** (continuous)
3. **React handles all re-rendering automatically**
4. **NO manual refresh required**
5. **NO polling - pure WebSocket push**

---

## 📁 Files Involved

| File | Purpose | Real-Time Logic |
|------|---------|-----------------|
| `src/hooks/useJobWebSocket.ts` | WebSocket connection | `ws.onmessage` → `setJobs()` |
| `src/hooks/useRealTimeJobs.ts` | Data merging | `useEffect([wsJobs])` → merge → `setInProgressJobs()` |
| `src/pages/Dashboard.tsx` | State management | `useEffect([realTimeInProgressJobs])` → `setInProgressJobs()` |
| `src/components/JobTables/InProgressJobsTable.tsx` | Display | Receives `jobs` prop → re-renders |
| `src/components/CurrentJob/CurrentJobCard.tsx` | Display | Receives `job` prop → re-renders |

---

## ✅ Summary

Your dashboard is configured for **AUTOMATIC REAL-TIME UPDATES**:

- ✅ WebSocket receives data every few seconds
- ✅ React automatically merges with API data
- ✅ Components automatically re-render
- ✅ Progress bars automatically animate to new values
- ✅ **NO page refresh required!**

If you're still seeing issues, check the **Troubleshooting** section above and verify the console logs.
