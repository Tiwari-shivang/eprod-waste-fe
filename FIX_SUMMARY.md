# Fix Summary: InProgressJobsTable Data Source

## Problem

The **InProgressJobsTable** was showing **MOCK DATA** instead of real data from the REST API and WebSocket.

## Root Cause

Found in `src/pages/Dashboard.tsx`:

### Issue #1: Mock Data Overwriting Real Data (Lines 108-130)
```typescript
// BEFORE (WRONG):
useEffect(() => {
  const fetchData = async () => {
    const [historical, inProgress, upcoming, chart] = await Promise.all([
      dashboardAPI.getHistoricalJobs(),
      dashboardAPI.getInProgressJobs(),  // ← MOCK DATA
      dashboardAPI.getUpcomingJobs(),
      dashboardAPI.getKPIChartData(),
    ]);

    setHistoricalJobs(historical);
    setInProgressJobs(inProgress);  // ← OVERWRITING REAL DATA WITH MOCK!
    setUpcomingJobs(upcoming);
    setChartData(chart);
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);  // ← EVERY 5 SECONDS!

  return () => clearInterval(interval);
}, []);
```

**Problem**: This code was:
1. Fetching mock data from `dashboardAPI.getInProgressJobs()`
2. Calling `setInProgressJobs(inProgress)` with mock data
3. **Overwriting** the real data from REST API + WebSocket
4. Running **every 5 seconds**, constantly replacing real data with mock data

### Issue #2: Incorrect Fallback Logic (Lines 71-92)
```typescript
// BEFORE (WRONG):
if (!useRealTimeData || (realTimeRunningJobs.length === 0 && !realTimeLoading)) {
  // This would trigger even when API was loading!
  setInProgressJobs(mockData);
}
```

## Solution

### Fix #1: Remove Mock Data for In-Progress Jobs
```typescript
// AFTER (CORRECT):
useEffect(() => {
  // Fetch other data (historical, upcoming, charts)
  // NOTE: inProgressJobs comes from REST API + WebSocket, NOT from here!
  const fetchData = async () => {
    const [historical, upcoming, chart] = await Promise.all([
      dashboardAPI.getHistoricalJobs(),
      dashboardAPI.getUpcomingJobs(),
      dashboardAPI.getKPIChartData(),
    ]);

    setHistoricalJobs(historical);
    // DO NOT set inProgressJobs here - it comes from useRealTimeJobs!
    setUpcomingJobs(upcoming);
    setChartData(chart);
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);

  return () => clearInterval(interval);
}, []);
```

**Fixed**:
- ✅ Removed `dashboardAPI.getInProgressJobs()` call
- ✅ Removed `setInProgressJobs(inProgress)` line
- ✅ InProgressJobs now comes ONLY from `useRealTimeJobs` hook

### Fix #2: Correct Fallback Logic
```typescript
// AFTER (CORRECT):
useEffect(() => {
  const fetchMockData = async () => {
    console.log('[Dashboard] Using mock data (real-time disabled by user)');
    const [allJobs, allInProgress] = await Promise.all([
      dashboardAPI.getAllRunningJobs(),
      dashboardAPI.getAllInProgressJobs(),
    ]);

    setAllRunningJobs(allJobs);
    setAllInProgressJobs(allInProgress);
    setInProgressJobs(allInProgress.slice(0, 10));
    setCurrentJob(allJobs[currentJobIndex] || allJobs[0] || null);
  };

  // ONLY use mock data if user explicitly disabled real-time
  if (!useRealTimeData) {
    fetchMockData();
  }
  // If useRealTimeData is true, we rely ONLY on realTimeInProgressJobs
  // Even if it's empty, we show empty state (not mock data)
}, [useRealTimeData, currentJobIndex]);
```

**Fixed**:
- ✅ Mock data ONLY loaded when user clicks "X" on WebSocket alert
- ✅ Removed condition that triggered on empty data
- ✅ Added console log for debugging

### Fix #3: Added Debug Logging
```typescript
useEffect(() => {
  if (useRealTimeData && !realTimeLoading) {
    console.log('[Dashboard] Using REAL-TIME data from API + WebSocket');
    console.log('  - In-progress jobs from API:', realTimeInProgressJobs.length);
    console.log('  - Running jobs:', realTimeRunningJobs.length);

    // IMPORTANT: Use ONLY real-time data (from REST API + WebSocket)
    setInProgressJobs(realTimeInProgressJobs);
    setAllInProgressJobs(realTimeInProgressJobs);
    // ...
  }
}, [/* deps */]);
```

## Data Flow (After Fix)

```
┌─────────────────────────────────────────────────────────┐
│         Component Mount                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  useRealTimeJobs Hook                                   │
│  ├─ Fetch from REST API (ONCE)                         │
│  │  GET /job-details?status=in-progress                │
│  │                                                       │
│  ├─ Connect to WebSocket                                │
│  │  ws://localhost:8080/ws/...                         │
│  │                                                       │
│  └─ Merge WebSocket progress with API data              │
│     ↓                                                    │
│  realTimeInProgressJobs                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard Component                                    │
│  ├─ setInProgressJobs(realTimeInProgressJobs) ✓        │
│  └─ NO MOCK DATA ✓                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  KPISection Component                                   │
│  └─ inProgressJobs={inProgressJobs}                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  InProgressJobsTable Component                          │
│  └─ Shows REAL data from REST API + WebSocket ✓        │
└─────────────────────────────────────────────────────────┘
```

## What You'll See Now

### Console Logs (Browser DevTools)
```
[useRealTimeJobs] Merging job data...
  - REST API jobs: 10
  - WebSocket jobs: 9
  ✓ Matched job ed06effb: WS progress=47.8%
  ✓ Matched job 7bfe5075: WS progress=43.6%
  ...
[useRealTimeJobs] Merge complete. Total jobs: 10

[Dashboard] Using REAL-TIME data from API + WebSocket
  - In-progress jobs from API: 10
  - Running jobs: 10
```

### Network Tab
- ✅ **ONE** REST API call to `/job-details?status=in-progress` on mount
- ✅ **Persistent** WebSocket connection
- ✅ **NO** repeated API calls
- ✅ **NO** calls to mock data endpoints (when real-time is enabled)

### InProgressJobsTable Display
- ✅ Job IDs from REST API (e.g., "ed06effb-412d-4c68-b64e-819cab4a3595")
- ✅ Paper Grade from REST API (e.g., "B - 80gsm")
- ✅ Quantity from REST API (e.g., 400 units)
- ✅ **Progress bars update in REAL-TIME from WebSocket**
- ✅ Speed, Temperature from REST API recommendations

## Verification Steps

### 1. Start Backend Services
```bash
# Start REST API on port 5000
python app.py

# Start WebSocket server on port 8080
# (your WebSocket server)
```

### 2. Start Dashboard
```bash
npm run dev
```

### 3. Open Browser Console
You should see:
```
[Dashboard] Using REAL-TIME data from API + WebSocket
  - In-progress jobs from API: 10
  - Running jobs: 10
```

NOT:
```
[Dashboard] Using mock data (real-time disabled by user)
```

### 4. Check Network Tab
- Filter by "Fetch/XHR"
- Should see ONE call to `job-details?status=in-progress`
- Should NOT see repeated calls
- Filter by "WS" to see WebSocket connection

### 5. Watch Progress Bars
- Progress bars should update smoothly
- Updates happen WITHOUT REST API calls
- Only WebSocket frames are sent

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Removed mock data fetching for in-progress jobs |
| `src/pages/Dashboard.tsx` | Fixed fallback logic |
| `src/pages/Dashboard.tsx` | Added debug logging |

## Before vs After

### Before
```
Source of inProgressJobs data:
- Mock data from dashboardAPI.getInProgressJobs() ✗
- Updated every 5 seconds ✗
- Overwrote real data ✗
```

### After
```
Source of inProgressJobs data:
- REST API /job-details?status=in-progress (ONCE) ✓
- WebSocket for progress updates (continuous) ✓
- No mock data interference ✓
```

## Summary

The fix ensures that:
1. ✅ **InProgressJobsTable** receives data ONLY from REST API + WebSocket
2. ✅ **NO mock data** is used (unless user explicitly disables real-time)
3. ✅ **Progress bars** update in real-time from WebSocket
4. ✅ **No polling** - REST API called only once
5. ✅ **Console logs** show data source clearly

The table now displays **100% REAL DATA** from your backend APIs! 🎉
