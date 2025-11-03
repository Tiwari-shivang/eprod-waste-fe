import type { JobStatus, JobDetailsResponse, InProgressJobsResponse } from '../types/api.types';
import type { InProgressJob, CurrentJob } from '../types';

/**
 * Calculate waste risk percentage based on generated waste and predicted waste
 * Returns a value between 0-100
 */
export const calculateWasteRisk = (
  generatedWaste: number,
  predictedWaste: number
): number => {
  if (!predictedWaste || predictedWaste === 0) {
    // If no prediction, use a moderate risk level
    return 50;
  }

  // Calculate risk as percentage over prediction
  const riskRatio = (generatedWaste / predictedWaste) * 100;

  // Normalize to 0-100 scale
  // If generated waste is equal to predicted, risk is 50%
  // If it's 2x predicted, risk is 100%
  const risk = Math.min(100, Math.max(0, (riskRatio - 50) * 2 + 50));

  return risk;
};

/**
 * Map API JobStatus to UI InProgressJob type
 * Requires additional job details for complete mapping
 */
export const mapToInProgressJob = (
  jobStatus: JobStatus,
  jobDetails?: JobDetailsResponse['data']
): InProgressJob => {
  const wasteRisk = jobDetails
    ? calculateWasteRisk(jobStatus.generatedWaste, jobDetails.job.predicted_waste)
    : 50; // Default risk if no details

  return {
    jobId: jobStatus.jobId,
    paperGrade: jobDetails?.job.flute || 'Unknown',
    completion: Math.round(jobStatus.progress * 100), // Convert 0-1 to 0-100
    progress: Math.round(jobStatus.progress * 100),
    flute: jobDetails?.job.flute || 'Unknown',
    wasteRisk,
    predictedSetupWaste: jobDetails?.job.predicted_waste || 0,
    productionRequirement: jobDetails?.job.quantity || 0,
    speed: jobDetails?.job.recommendations.speed || 0,
    steam: jobDetails?.job.recommendations.temperature || 0,
    glueGap: 0, // Not available in current API
    moisture: 0, // Not available in current API
    wrapArm: 0, // Not available in current API
    vibrations: 0, // Not available in current API
    actionConfidence: jobDetails?.job.recommendations.fallback ? 0.6 : 0.85,
  };
};

/**
 * Map API job data from InProgressJobsResponse to UI InProgressJob type
 *
 * DATA SOURCES:
 * =============
 * REST API (job) - Provides static job details:
 *   - job_id, flute, gsm, length, width, quantity
 *   - predicted_waste, recommendations (speed, temperature)
 *
 * WebSocket (status) - Provides real-time updates (merged before this function):
 *   - progress (0-1 range)
 *   - generated_waste (kg)
 *   - current_status
 *
 * NOTE: By the time this function is called, the status object has already been
 * merged with WebSocket data in useRealTimeJobs.mergeJobsWithProgress()
 */
export const mapApiJobToInProgressJob = (
  apiJob: InProgressJobsResponse['data'][0]
): InProgressJob => {
  const { job, status } = apiJob;
  const wasteRisk = calculateWasteRisk(status.generated_waste, job.predicted_waste);

  // Get speed and temperature from recommendations (REST API)
  const speed = job.recommendations?.speed || 0;
  const steam = job.recommendations?.temperature || job.recommendations?.temp || 0;

  // Keep decimal precision for progress (0-1 → 0-100 with decimals)
  const progressPercent = Number((status.progress * 100).toFixed(2));

  return {
    jobId: job.job_id,                                    // REST API
    paperGrade: `${job.flute} - ${job.gsm}gsm`,          // REST API
    completion: progressPercent,                          // WEBSOCKET (0-1 → 0-100% with decimals)
    progress: progressPercent,                            // WEBSOCKET (0-1 → 0-100% with decimals)
    flute: job.flute,                                     // REST API
    wasteRisk,                                            // Calculated from WEBSOCKET + REST API
    predictedSetupWaste: job.predicted_waste,            // REST API
    productionRequirement: job.quantity,                  // REST API
    speed,                                                // REST API
    steam,                                                // REST API
    glueGap: job.recommendations?.glue || 0,             // REST API
    moisture: 0,                                          // Not available
    wrapArm: 0,                                           // Not available
    vibrations: 0,                                        // Not available
    actionConfidence: job.recommendations?.fallback ? 0.6 : 0.85,  // REST API
  };
};

/**
 * Map API job data from InProgressJobsResponse to UI CurrentJob type
 */
export const mapApiJobToCurrentJob = (
  apiJob: InProgressJobsResponse['data'][0]
): CurrentJob => {
  const { job, status } = apiJob;

  // Random waste risk between 25-50 for CurrentJob display
  const wasteRisk = 25 + Math.random() * 25; // Random between 25-50

  // Generate a readable job name from job ID
  const jobName = `Job ${job.job_id.substring(0, 8).toUpperCase()}`;

  // Calculate predicted dry end waste (estimate based on generated waste)
  const predictedDryEndWaste = job.predicted_waste * 0.3; // Assuming 30% of total waste

  // Get speed and temperature from recommendations
  const speed = job.recommendations?.speed || 0;
  const steam = job.recommendations?.temperature || job.recommendations?.temp || 0;

  // Keep decimal precision for progress (0-1 → 0-100 with decimals)
  const progressPercent = Number((status.progress * 100).toFixed(2));

  return {
    jobId: job.job_id,
    jobName,
    quantity: job.quantity,
    completion: progressPercent,                          // WEBSOCKET with decimal precision
    wasteRisk,                                            // Random 25-50
    paperGrade: `${job.flute} - ${job.gsm}gsm`,
    flute: job.flute,
    thickness: `${job.length}mm`,
    predictedSetupWaste: job.predicted_waste,
    predictedDryEndWaste,
    speed,
    steam,
    eventType: status.current_status,
    actionConfidence: job.recommendations?.fallback ? 0.6 : 0.85,
    actionTitle: job.recommendations?.fallback
      ? 'Using Fallback Recommendations'
      : 'AI-Optimized Settings Active',
    actionSteps: [
      {
        step: `Set machine speed to ${speed.toFixed(1)} m/min`,
        delta_mpm: speed,
      },
      {
        step: `Adjust steam temperature to ${steam.toFixed(1)}°C`,
        delta_c: steam,
      },
      {
        step: `Monitor ${job.flute} flute handling carefully`,
      },
    ],
  };
};

/**
 * Map API JobStatus + JobDetails to UI CurrentJob type
 */
export const mapToCurrentJob = (
  jobStatus: JobStatus,
  jobDetails: JobDetailsResponse['data']
): CurrentJob => {
  const wasteRisk = calculateWasteRisk(
    jobStatus.generatedWaste,
    jobDetails.job.predicted_waste
  );

  // Generate a readable job name from job ID
  const jobName = `Job ${jobDetails.job.job_id.substring(0, 8).toUpperCase()}`;

  // Calculate predicted dry end waste (estimate based on generated waste)
  const predictedDryEndWaste = jobDetails.job.predicted_waste * 0.3; // Assuming 30% of total waste

  // Get speed and temperature from recommendations
  const speed = jobDetails.job.recommendations?.speed || 0;
  const steam = jobDetails.job.recommendations?.temperature || 0;

  return {
    jobId: jobDetails.job.job_id,
    jobName,
    quantity: jobDetails.job.quantity,
    completion: Math.round(jobStatus.progress * 100),
    wasteRisk,
    paperGrade: `${jobDetails.job.flute} - ${jobDetails.job.gsm}gsm`,
    flute: jobDetails.job.flute,
    thickness: `${jobDetails.job.length}mm`,
    predictedSetupWaste: jobDetails.job.predicted_waste,
    predictedDryEndWaste,
    speed,
    steam,
    eventType: jobStatus.currentStatus,
    actionConfidence: jobDetails.job.recommendations?.fallback ? 0.6 : 0.85,
    actionTitle: jobDetails.job.recommendations?.fallback
      ? 'Using Fallback Recommendations'
      : 'AI-Optimized Settings Active',
    actionSteps: [
      {
        step: `Set machine speed to ${speed.toFixed(1)} m/min`,
        delta_mpm: speed,
      },
      {
        step: `Adjust steam temperature to ${steam.toFixed(1)}°C`,
        delta_c: steam,
      },
      {
        step: `Monitor ${jobDetails.job.flute} flute handling carefully`,
      },
    ],
  };
};

/**
 * Batch map multiple job statuses to InProgressJobs
 */
export const mapToInProgressJobs = (
  jobStatuses: JobStatus[]
): InProgressJob[] => {
  return jobStatuses.map((status) => mapToInProgressJob(status));
};

/**
 * Get job display name from job ID
 */
export const getJobDisplayName = (jobId: string): string => {
  return `Job ${jobId.substring(0, 8).toUpperCase()}`;
};

/**
 * Format timestamp to readable date string
 */
export const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Calculate estimated time remaining based on progress and start time
 */
export const calculateTimeRemaining = (
  progress: number,
  startTime: string | null
): string => {
  if (!startTime || progress === 0) return 'Calculating...';

  try {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = now - start;

    // Estimate total time based on current progress
    const totalEstimated = elapsed / (progress / 100);
    const remaining = totalEstimated - elapsed;

    if (remaining <= 0) return 'Finishing soon';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return 'Unknown';
  }
};
