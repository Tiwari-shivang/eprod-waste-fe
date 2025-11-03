# API Integration Documentation

This document explains how the corrugator waste dashboard integrates with the backend APIs to provide real-time job monitoring and waste predictions.

## Overview

The dashboard now integrates with three main endpoints:

1. **REST API** (`http://localhost:5000`) - For job details and predictions
2. **WebSocket** (`ws://localhost:8080/ws/653/fctm2qrr/websocket`) - For real-time job status updates
3. **Health Check** - To verify API connectivity

## Architecture

### Components

```
Dashboard (React Component)
    ↓
useRealTimeJobs (React Hook)
    ↓
    ├── useJobWebSocket (WebSocket Hook)
    │   └── Real-time job status updates
    │
    └── apiService (REST API Client)
        └── Job details and predictions
    ↓
dataMapper (Utility)
    └── Transform API data to UI types
```

### Data Flow

1. **Initial Fetch**: Fetches all in-progress jobs from `/job-details?status=in-progress` on mount
2. **WebSocket Connection**: Establishes WebSocket connection for real-time progress updates
3. **Data Merging**: Merges WebSocket progress updates with fetched job data
4. **Data Mapping**: Transforms merged API responses to UI-compatible types
5. **Real-time Updates**: Dashboard UI updates automatically as progress changes
6. **Periodic Refresh**: Re-fetches job data every 30 seconds (configurable)

## API Endpoints

### 1. Health Check
**Endpoint**: `GET /health`
**Response**:
```json
{
  "message": "Waste Optimization Model API is running",
  "status": "healthy"
}
```

### 2. Get Predictions
**Endpoint**: `POST /predict`
**Response**:
```json
{
  "success": true,
  "data": {
    "job_id": "3b5d0e8d-a18d-46e0-a527-74f1a1d4f3eb",
    "optimal_settings": {
      "speed": 121.05,
      "steam": 20.0,
      "temp": 184.21,
      // ... other parameters
    },
    "predicted_min_waste": 0.19
  }
}
```

### 3. Get All In-Progress Jobs
**Endpoint**: `GET /job-details?status=in-progress`
**Response**:
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
    // ... more jobs
  ]
}
```

### 4. Get Job Details (Single Job)
**Endpoint**: `GET /job-details?job_id={id}`
**Response**:
```json
{
  "success": true,
  "data": {
    "job": {
      "job_id": "ed06effb-412d-4c68-b64e-819cab4a3595",
      "flute": "B",
      "gsm": 80.0,
      "predicted_waste": 2.5,
      "recommendations": {
        "speed": 120,
        "temperature": 180
      }
    },
    "status": {
      "current_status": "in-progress",
      "generated_waste": 189.72,
      "progress": 0.4278
    }
  }
}
```

### 5. WebSocket - Real-time Job Updates
**URL**: `ws://localhost:8080/ws/653/fctm2qrr/websocket`
**Response** (Array of job statuses):
```json
[
  {
    "id": "0cf3bb99-5ddd-4a75-9d01-bd938ec51a0a",
    "jobId": "ed06effb-412d-4c68-b64e-819cab4a3595",
    "currentStatus": "in-progress",
    "generatedWaste": 1.23,
    "progress": 0.1117,
    "startTime": "2025-11-02T18:26:12Z"
  }
]
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_BASE_URL=ws://localhost:8080/ws/653/fctm2qrr/websocket

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_FETCH_JOB_DETAILS=true
VITE_JOB_POLLING_INTERVAL=30000
```

### Feature Flags

- `VITE_ENABLE_WEBSOCKET`: Enable/disable WebSocket connection
- `VITE_FETCH_JOB_DETAILS`: Enable/disable fetching detailed job information
- `VITE_JOB_POLLING_INTERVAL`: Cache refresh interval (milliseconds)

## Usage

### Using the Real-time Jobs Hook

```typescript
import { useRealTimeJobs } from './hooks/useRealTimeJobs';

function MyComponent() {
  const {
    currentJob,           // Current job being displayed
    inProgressJobs,       // All in-progress jobs
    allRunningJobs,       // All running jobs with details
    isLoading,            // Loading state
    isConnected,          // WebSocket connection status
    error,                // Error state
    refreshJobs,          // Manual refresh function
  } = useRealTimeJobs({
    enableWebSocket: true,
    enableJobDetails: true,
    pollingInterval: 30000,
  });

  return (
    <div>
      {isConnected && <Badge status="success" text="Connected" />}
      {currentJob && <JobCard job={currentJob} />}
    </div>
  );
}
```

## Data Mapping

The integration includes utilities to transform API data into UI-compatible types:

### API Types → UI Types

| API Type | UI Type | Mapper Function |
|----------|---------|----------------|
| `InProgressJobsResponse['data'][0]` | `InProgressJob` | `mapApiJobToInProgressJob()` |
| `InProgressJobsResponse['data'][0]` | `CurrentJob` | `mapApiJobToCurrentJob()` |
| `JobStatus` | `InProgressJob` | `mapToInProgressJob()` (legacy) |
| `JobStatus + JobDetails` | `CurrentJob` | `mapToCurrentJob()` (legacy) |

### Waste Risk Calculation

The waste risk percentage is calculated as:

```typescript
riskRatio = (generatedWaste / predictedWaste) * 100
risk = Math.min(100, Math.max(0, (riskRatio - 50) * 2 + 50))
```

- If generated waste equals predicted: **50% risk**
- If generated waste is 2x predicted: **100% risk**
- If generated waste is 0: **0% risk**

## Features

### Real-time Updates

- **Hybrid Approach**: Combines REST API for complete job data with WebSocket for real-time progress
- **Initial Load**: Fetches all in-progress jobs with complete details on page load
- **WebSocket Connection**: Automatic reconnection with exponential backoff for progress updates
- **Progress Tracking**: Live progress updates merged with job details
- **Waste Monitoring**: Real-time waste generation tracking
- **Status Indicators**: Visual connection status indicators
- **Periodic Refresh**: Re-fetches complete job data every 30 seconds

### Fallback Mode

If the WebSocket connection fails or the API is unavailable:

1. Dashboard shows a connection error alert
2. Jobs continue to display with last known data (WebSocket not required)
3. User can close the alert to switch to mock data mode
4. Mock data from CSV file is used as ultimate fallback
5. User can refresh the page to retry real API connection

### Performance

- **Single API Call**: Fetches all in-progress jobs in one request
- **Efficient Updates**: WebSocket only sends progress updates, not full job data
- **Smart Merging**: Merges WebSocket progress with cached job details
- **Optimized Re-renders**: Only changed data triggers component updates
- **Configurable Polling**: Adjustable refresh interval (default 30 seconds)

## Troubleshooting

### WebSocket Connection Issues

**Problem**: WebSocket keeps disconnecting

**Solutions**:
1. Verify WebSocket URL in `.env` file
2. Check backend WebSocket server is running
3. Verify network/firewall settings
4. Check browser console for connection errors

### API Errors

**Problem**: "Failed to fetch job details"

**Solutions**:
1. Verify REST API is running on port 5000
2. Check API endpoint URLs in `.env`
3. Verify CORS settings on backend
4. Check network connectivity

### Data Not Updating

**Problem**: Dashboard shows stale data

**Solutions**:
1. Check WebSocket connection status in UI
2. Verify `VITE_ENABLE_WEBSOCKET=true` in `.env`
3. Check browser console for errors
4. Try manual refresh using refresh button
5. Clear cache and reload page

### Performance Issues

**Problem**: Dashboard is slow or laggy

**Solutions**:
1. Increase `VITE_JOB_POLLING_INTERVAL` value
2. Set `VITE_FETCH_JOB_DETAILS=false` to disable detailed fetching
3. Reduce number of jobs displayed in tables
4. Check browser performance in DevTools

## Development

### Running the Backend

Make sure the backend services are running:

```bash
# Start REST API (port 5000)
python app.py

# Start WebSocket server (port 8080)
# (specific command depends on your backend setup)
```

### Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Testing the Integration

1. **Verify API Health**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check WebSocket Connection**:
   - Open browser DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Look for successful connection to WebSocket URL

3. **Monitor Data Flow**:
   - Open browser console
   - Watch for log messages about WebSocket and API calls
   - Verify job data is being received and displayed

## File Structure

```
src/
├── types/
│   └── api.types.ts              # API response type definitions
├── services/
│   └── api.service.ts            # REST API client
├── hooks/
│   ├── useJobWebSocket.ts        # WebSocket connection hook
│   └── useRealTimeJobs.ts        # Combined real-time jobs hook
├── utils/
│   └── dataMapper.ts             # API to UI data mappers
├── components/
│   ├── CurrentJob/
│   │   └── CurrentJobCard.tsx    # Displays current job with real-time data
│   └── JobTables/
│       └── InProgressJobsTable.tsx # In-progress jobs with real-time updates
└── pages/
    └── Dashboard.tsx             # Main dashboard with API integration
```

## Next Steps

1. **Add Error Boundaries**: Wrap components in error boundaries for better error handling
2. **Implement Retry Logic**: Add automatic retry for failed API calls
3. **Add Loading States**: Improve loading indicators throughout the UI
4. **Optimize Performance**: Implement virtual scrolling for large job lists
5. **Add Analytics**: Track API performance and error rates
6. **Implement Caching Strategy**: Use IndexedDB for offline support

## Support

For issues or questions:
- Check browser console for error messages
- Verify backend services are running
- Review environment configuration
- Check network connectivity
