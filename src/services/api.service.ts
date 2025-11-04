import type {
  HealthResponse,
  PredictResponse,
  JobDetailsResponse,
  InProgressJobsResponse,
  UpdateJobRequest,
  UpdateJobResponse
} from '../types/api.types';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws/653/fctm2qrr/websocket';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_URL: WS_BASE_URL,
  ENDPOINTS: {
    HEALTH: '/health',
    PREDICT: '/predict',
    JOB_DETAILS: '/job-details',
    UPDATE_JOB: '/update-job',
  }
};

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  }

  /**
   * Get optimal settings prediction
   */
  async getPrediction(jobData: Record<string, unknown>): Promise<PredictResponse> {
    return this.fetch<PredictResponse>(API_CONFIG.ENDPOINTS.PREDICT, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  /**
   * Get detailed job information by job ID
   */
  async getJobDetails(jobId: string): Promise<JobDetailsResponse> {
    return this.fetch<JobDetailsResponse>(
      `${API_CONFIG.ENDPOINTS.JOB_DETAILS}?job_id=${jobId}`
    );
  }

  /**
   * Get all jobs (both in-progress and paused) with their details and status
   * Endpoint: /job-details (without status filter)
   * The status is distinguished by the status.current_status field
   */
  async getAllJobs(): Promise<InProgressJobsResponse> {
    return this.fetch<InProgressJobsResponse>(
      API_CONFIG.ENDPOINTS.JOB_DETAILS
    );
  }

  /**
   * Get all in-progress jobs with their details and status
   * Note: This endpoint returns both 'in-progress' and 'paused' jobs
   * The status is distinguished by the status.current_status field
   */
  async getInProgressJobs(): Promise<InProgressJobsResponse> {
    return this.fetch<InProgressJobsResponse>(
      `${API_CONFIG.ENDPOINTS.JOB_DETAILS}?status=in-progress`
    );
  }

  /**
   * Update job details and/or status
   * @param jobId - Job ID to update
   * @param data - Updated job data
   */
  async updateJob(jobId: string, data: UpdateJobRequest): Promise<UpdateJobResponse> {
    return this.fetch<UpdateJobResponse>(
      `${API_CONFIG.ENDPOINTS.UPDATE_JOB}?job_id=${jobId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }
}

// Export singleton instance
export const apiService = new ApiService(API_CONFIG.BASE_URL);

// Export WebSocket URL for hook
export const WS_URL = API_CONFIG.WS_URL;
