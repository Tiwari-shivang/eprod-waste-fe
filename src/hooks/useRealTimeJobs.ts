import { useState, useEffect, useCallback } from 'react';
import { useJobWebSocket } from './useJobWebSocket';
import { apiService } from '../services/api.service';
import { mapApiJobToInProgressJob, mapApiJobToCurrentJob } from '../utils/dataMapper';
import type { InProgressJob, CurrentJob } from '../types';
import type { InProgressJobsResponse } from '../types/api.types';

interface UseRealTimeJobsOptions {
  enableWebSocket?: boolean;
  enableAutoRefresh?: boolean; // Set to false to disable automatic refresh
}

interface UseRealTimeJobsReturn {
  currentJob: CurrentJob | null;
  inProgressJobs: InProgressJob[];
  allRunningJobs: CurrentJob[];
  isLoading: boolean;
  isConnected: boolean;
  error: Error | null;
  refreshJobs: () => Promise<void>;
}

/**
 * Hook that integrates WebSocket real-time job updates with job details API
 * Provides both in-progress jobs and current job data
 */
export const useRealTimeJobs = (
  options: UseRealTimeJobsOptions = {}
): UseRealTimeJobsReturn => {
  const {
    enableWebSocket = true,
    enableAutoRefresh = false, // Disabled by default - use WebSocket only
  } = options;

  const [inProgressJobs, setInProgressJobs] = useState<InProgressJob[]>([]);
  const [allRunningJobs, setAllRunningJobs] = useState<CurrentJob[]>([]);
  const [currentJob, setCurrentJob] = useState<CurrentJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiJobsData, setApiJobsData] = useState<InProgressJobsResponse['data']>([]);

  // Connect to WebSocket for real-time progress updates
  const {
    jobs: wsJobs,
    isConnected,
    error: wsError,
  } = useJobWebSocket({
    autoConnect: enableWebSocket,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  });

  /**
   * Fetch all jobs (in-progress and paused) from API
   * Uses /job-details endpoint without status filter to get ALL jobs
   */
  const fetchInProgressJobs = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch ALL jobs using base endpoint: /job-details (no status filter)
      // This returns both in-progress and paused jobs
      const response = await apiService.getAllJobs();

      const allJobs = response.success && response.data ? response.data : [];

      // Separate jobs by status for logging
      const inProgressJobs = allJobs.filter(job => job.status.current_status === 'in-progress');
      const pausedJobs = allJobs.filter(job => job.status.current_status === 'paused');

      console.log('[useRealTimeJobs] 📥 Fetched ALL jobs from /job-details:');
      console.log('  - In-progress:', inProgressJobs.length);
      console.log('  - Paused:', pausedJobs.length);
      console.log('  - Total jobs:', allJobs.length);

      if (allJobs.length > 0 || response.success) {
        setApiJobsData(allJobs);
        setError(null);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Merge API job data with WebSocket progress updates
   *
   * DATA SOURCES:
   * - Job details (flute, gsm, quantity, recommendations): From REST API (fetched once)
   * - Progress bars: From WebSocket (real-time updates)
   *
   * MATCHING LOGIC:
   * - REST API provides: job.job_id
   * - WebSocket provides: jobId
   * - Match by comparing apiJob.job.job_id === wsJob.jobId
   *
   * REAL-TIME UPDATES:
   * This effect runs every time WebSocket sends new data, ensuring UI updates immediately
   */
  useEffect(() => {
    if (apiJobsData.length === 0) {
      setInProgressJobs([]);
      setAllRunningJobs([]);
      setCurrentJob(null);
      return;
    }

    console.log('[useRealTimeJobs] 🔄 Merging job data...');
    console.log('  - REST API jobs:', apiJobsData.length);
    console.log('  - WebSocket jobs:', wsJobs.length);

    // Create a map of WebSocket jobs by jobId for quick lookup
    // WebSocket format: { jobId: "xxx", progress: 0.11, generatedWaste: 1.23, ... }
    const wsJobMap = new Map(wsJobs.map(job => [job.jobId, job]));

    // Merge API data with WebSocket progress
    const mergedJobs = apiJobsData.map(apiJob => {
      const jobId = apiJob.job.job_id;
      const wsJob = wsJobMap.get(jobId);

      // If we have WebSocket data, use its progress; otherwise use API progress
      if (wsJob) {
        console.log(`  ✓ Matched job ${jobId.substring(0, 8)}: WS progress=${(wsJob.progress * 100).toFixed(1)}%`);
        return {
          ...apiJob,
          status: {
            ...apiJob.status,
            // THESE VALUES COME FROM WEBSOCKET (real-time)
            progress: wsJob.progress,                    // 0-1 range from WebSocket
            generated_waste: wsJob.generatedWaste,       // kg from WebSocket
            current_status: wsJob.currentStatus,         // status from WebSocket
          }
        };
      } else {
        console.log(`  ✗ No WebSocket data for job ${jobId.substring(0, 8)}, using API progress`);
      }

      return apiJob;
    });

    // Map to InProgressJob type
    const mappedInProgressJobs = mergedJobs.map(mapApiJobToInProgressJob);
    setInProgressJobs(mappedInProgressJobs);

    // Map to CurrentJob type (appliedSettings will be managed by Dashboard component)
    const mappedRunningJobs = mergedJobs.map(job => mapApiJobToCurrentJob(job, false));
    setAllRunningJobs(mappedRunningJobs);

    // Set first job as current
    if (mappedRunningJobs.length > 0) {
      setCurrentJob(mappedRunningJobs[0]);
    } else {
      setCurrentJob(null);
    }

    console.log('[useRealTimeJobs] ✅ Merge complete. Total jobs:', mappedInProgressJobs.length);
  }, [apiJobsData, wsJobs]); // Direct dependency - triggers on every WebSocket update

  /**
   * Manual refresh function
   */
  const refreshJobs = useCallback(async () => {
    await fetchInProgressJobs();
  }, [fetchInProgressJobs]);

  // Initial fetch on mount - ONLY ONCE
  useEffect(() => {
    fetchInProgressJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - fetch only once

  // Optional: Set up periodic refresh (disabled by default)
  useEffect(() => {
    if (!enableAutoRefresh) return;

    // Only refresh if auto-refresh is explicitly enabled
    const interval = setInterval(() => {
      console.log('Auto-refreshing job data...');
      fetchInProgressJobs();
    }, 300000); // 5 minutes - very infrequent

    return () => clearInterval(interval);
  }, [enableAutoRefresh, fetchInProgressJobs]);

  // Propagate WebSocket errors
  useEffect(() => {
    if (wsError) {
      setError(wsError);
    }
  }, [wsError]);

  return {
    currentJob,
    inProgressJobs,
    allRunningJobs,
    isLoading,
    isConnected,
    error,
    refreshJobs,
  };
};
