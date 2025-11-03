# Data Flow Documentation

This document explains EXACTLY how data flows from the backend APIs to the UI components, specifically for the InProgressJobsTable and CurrentJobCard.

## Overview

The dashboard uses a **HYBRID APPROACH**:
- **REST API**: Fetched ONCE on mount for complete job details
- **WebSocket**: Continuous real-time updates for progress ONLY

## Data Sources

### 1. REST API (Fetched Once)
**Endpoint**: `GET http://localhost:5000/job-details?status=in-progress`

**Response Structure**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "job": {
        "job_id": "ed06effb-412d-4c68-b64e-819cab4a3595",
        "experience": "High",
        "flute": "B",
        "gsm": 80.0,
        "length": 150.0,
        "width": 100.0,
        "quantity": 400,
        "predicted_waste": 2.5,
        "printing": 1,
        "shift": "Day",
        "recommendations": {
          "fallback": true,
          "speed": 120,
          "temperature": 180
        }
      },
      "status": {
        "status_id": "0cf3bb99-5ddd-4a75-9d01-bd938ec51a0a",
        "current_status": "in-progress",
        "generated_waste": 219.3,
        "progress": 0.4775,
        "start_time": "2025-11-02T18:26:12",
        "end_time": null,
        "time_taken": null
      }
    }
  ]
}
```

**What We Use**:
- ✅ `job.job_id` - Unique identifier
- ✅ `job.flute` - Flute type (B, C, E, etc.)
- ✅ `job.gsm` - Paper weight
- ✅ `job.quantity` - Production quantity
- ✅ `job.predicted_waste` - AI prediction
- ✅ `job.recommendations` - AI-suggested settings (speed, temperature)
- ❌ `status.progress` - IGNORED (we use WebSocket instead)

### 2. WebSocket (Real-Time Updates)
**URL**: `ws://localhost:8080/ws/653/fctm2qrr/websocket`

**Response Structure** (SockJS format):
```json
[
  {
    "id": "0cf3bb99-5ddd-4a75-9d01-bd938ec51a0a",
    "jobId": "ed06effb-412d-4c68-b64e-819cab4a3595",
    "currentStatus": "in-progress",
    "generatedWaste": 1.23,
    "timeTaken": 0,
    "startTime": "2025-11-02T18:26:12Z",
    "endTime": null,
    "progress": 0.4775
  }
]
```

**What We Use**:
- ✅ `jobId` - For matching with REST API data
- ✅ `progress` - Real-time progress (0-1 range)
- ✅ `generatedWaste` - Current waste generated
- ✅ `currentStatus` - Current job status

## Matching Logic

### How Jobs are Matched

```typescript
// REST API provides
const apiJobId = apiJob.job.job_id;  // "ed06effb-412d-4c68-b64e-819cab4a3595"

// WebSocket provides
const wsJobId = wsJob.jobId;         // "ed06effb-412d-4c68-b64e-819cab4a3595"

// Match by comparing
if (apiJobId === wsJobId) {
  // Use WebSocket progress for this job
}
```

### Code Location

**File**: `src/hooks/useRealTimeJobs.ts:104-106`

```typescript
const jobId = apiJob.job.job_id;
const wsJob = wsJobMap.get(jobId);  // Lookup by jobId
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Component Mount                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 1: Fetch Job Details (ONCE)                   │
│                                                                  │
│  GET http://localhost:5000/job-details?status=in-progress      │
│                                                                  │
│  Returns:                                                        │
│  - job_id, flute, gsm, quantity                                │
│  - predicted_waste, recommendations                             │
│  - Initial status (progress, generated_waste)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           STEP 2: Store in State (apiJobsData)                  │
│                                                                  │
│  const [apiJobsData, setApiJobsData] = useState([]);           │
│  setApiJobsData(response.data);                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         STEP 3: Connect to WebSocket (Continuous)               │
│                                                                  │
│  ws://localhost:8080/ws/653/fctm2qrr/websocket                 │
│                                                                  │
│  Receives every few seconds:                                    │
│  [{ jobId: "xxx", progress: 0.48, generatedWaste: 1.23 }]     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          STEP 4: Store in State (wsJobs)                        │
│                                                                  │
│  const { jobs: wsJobs } = useJobWebSocket();                   │
│  // wsJobs updates automatically as WebSocket sends data       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│     STEP 5: Merge Data (mergeJobsWithProgress)                  │
│                                                                  │
│  For each job from REST API:                                    │
│    1. Get job_id from REST API data                            │
│    2. Find matching WebSocket job by jobId                     │
│    3. If found: Replace progress with WebSocket value          │
│    4. Keep all other fields from REST API                      │
│                                                                  │
│  Code:                                                           │
│  const wsJob = wsJobMap.get(apiJob.job.job_id);               │
│  if (wsJob) {                                                   │
│    return {                                                      │
│      ...apiJob,                                                 │
│      status: {                                                   │
│        ...apiJob.status,                                        │
│        progress: wsJob.progress,         // FROM WEBSOCKET     │
│        generated_waste: wsJob.generatedWaste,  // FROM WS      │
│      }                                                           │
│    };                                                            │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│       STEP 6: Map to UI Types (mapApiJobToInProgressJob)        │
│                                                                  │
│  Convert merged data to InProgressJob:                          │
│  {                                                               │
│    jobId: job.job_id,                    // REST API           │
│    paperGrade: "B - 80gsm",              // REST API           │
│    completion: 48,                        // WEBSOCKET (%)      │
│    quantity: 400,                         // REST API           │
│    speed: 120,                            // REST API           │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           STEP 7: Update Component State                        │
│                                                                  │
│  setInProgressJobs(mappedInProgressJobs);                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│      STEP 8: Render InProgressJobsTable                         │
│                                                                  │
│  <InProgressJobsTable jobs={inProgressJobs} />                 │
│                                                                  │
│  Each row shows:                                                │
│  - Job ID (REST API)                                           │
│  - Paper Grade (REST API)                                      │
│  - Progress Bar (WEBSOCKET) ← REAL-TIME UPDATES               │
│  - Quantity (REST API)                                         │
│  - Speed (REST API)                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Data Flow

### InProgressJobsTable

**File**: `src/components/JobTables/InProgressJobsTable.tsx`

**Input**: `jobs: InProgressJob[]`

**What Each Column Shows**:

| Column | Data Source | Updates |
|--------|-------------|---------|
| Job ID | REST API | Never |
| Paper Grade | REST API | Never |
| Flute | REST API | Never |
| **Completion** | **WebSocket** | **Real-time** |
| Predicted Waste | REST API | Never |
| Production Req | REST API | Never |
| Speed | REST API | Never |
| Temperature | REST API | Never |
| AI Confidence | REST API | Never |
| Waste Risk | WebSocket + REST API | Real-time (calculated) |

**Progress Bar Code** (Line 102-115):
```tsx
{
  title: 'Completion',
  dataIndex: 'completion',
  render: (value: number) => (
    // REAL-TIME PROGRESS FROM WEBSOCKET
    <Progress
      percent={value}  // This value comes from WebSocket
      size="small"
      strokeColor="#1677ff"
      showInfo={false}
    />
  ),
}
```

### CurrentJobCard

**File**: `src/components/CurrentJob/CurrentJobCard.tsx`

**Input**: `job: CurrentJob`

**What Each Field Shows**:

| Field | Data Source | Updates |
|-------|-------------|---------|
| Job Name | REST API | Never |
| Quantity | REST API | Never |
| **Progress Bar** | **WebSocket** | **Real-time** |
| Paper Grade | REST API | Never |
| Flute | REST API | Never |
| Thickness | REST API | Never |
| Speed | REST API | Never |
| AI Suggestions | REST API | Never |

**Progress Bar Code** (Line 109-123):
```tsx
{/* Progress Bar - REAL-TIME FROM WEBSOCKET */}
<div style={{ padding: '16px', background: '#f0f7ff', ... }}>
  <Text strong>{job.completion}%</Text>  {/* WebSocket */}
  <Progress
    percent={job.completion}  {/* WebSocket progress */}
    strokeColor="#1677ff"
    showInfo={false}
    strokeWidth={12}
  />
</div>
```

## Console Logs

When the application runs, you'll see these logs in the browser console:

```
[useRealTimeJobs] Merging job data...
  - REST API jobs: 10
  - WebSocket jobs: 9
  ✓ Matched job ed06effb: WS progress=47.8%
  ✓ Matched job 7bfe5075: WS progress=43.6%
  ✓ Matched job d1ccbce8: WS progress=41.8%
  ...
[useRealTimeJobs] Merge complete. Total jobs: 10
```

**What This Means**:
- ✓ = Job successfully matched, using WebSocket progress
- ✗ = Job not in WebSocket data, using REST API progress

## Verification Steps

To verify the integration is working correctly:

### 1. Check Browser Console
```javascript
// You should see:
[useRealTimeJobs] Merging job data...
  - REST API jobs: 10
  - WebSocket jobs: 9
  ✓ Matched job ed06effb: WS progress=47.8%
```

### 2. Check Network Tab
- **REST API**: Should see ONE call to `/job-details?status=in-progress` on mount
- **WebSocket**: Should see persistent connection to `ws://localhost:8080/...`
- **No Polling**: Should NOT see repeated REST API calls

### 3. Watch Progress Bars
- Progress bars should update smoothly
- Updates happen WITHOUT any REST API calls
- Only WebSocket frames are sent/received

### 4. Check React DevTools
```javascript
// In InProgressJobsTable props:
jobs: [
  {
    jobId: "ed06effb-412d-4c68-b64e-819cab4a3595",
    completion: 48,  // This number should change in real-time
    paperGrade: "B - 80gsm",  // This stays constant
    quantity: 400,  // This stays constant
  }
]
```

## Example Timeline

```
Time    Event
─────   ─────────────────────────────────────────────────────
0:00    User opens dashboard
0:01    REST API called → Fetches 10 jobs
0:02    Jobs displayed with initial progress (from REST API)
0:03    WebSocket connects
0:04    WebSocket sends first update → Progress bars update
0:06    WebSocket sends update → Progress bars update
0:08    WebSocket sends update → Progress bars update
...     (WebSocket continues sending updates)
```

**Note**: REST API is NEVER called again unless user clicks "Refresh Data" button.

## Code Locations

| Component | File | Lines |
|-----------|------|-------|
| Data Fetching | `src/hooks/useRealTimeJobs.ts` | 56-73 |
| WebSocket Connection | `src/hooks/useJobWebSocket.ts` | 37-124 |
| Data Merging | `src/hooks/useRealTimeJobs.ts` | 87-144 |
| Data Mapping | `src/utils/dataMapper.ts` | 76-103 |
| InProgressJobsTable | `src/components/JobTables/InProgressJobsTable.tsx` | 97-116 |
| CurrentJobCard | `src/components/CurrentJob/CurrentJobCard.tsx` | 109-123 |

## Summary

### What Comes from REST API (Once)
- Job ID, Paper Grade, Flute, Thickness
- Quantity, Production Requirements
- AI Recommendations (speed, temperature)
- Predicted waste values
- Initial job configuration

### What Comes from WebSocket (Real-time)
- **Progress** (0-1 range, converted to 0-100%)
- **Generated Waste** (kg)
- **Current Status** (in-progress, completed, etc.)

### How They Work Together
1. REST API provides the complete job picture
2. WebSocket updates ONLY the changing values (progress, waste)
3. Matching happens by `job_id` === `jobId`
4. UI displays merged data with real-time progress bars
5. No polling - maximum efficiency
