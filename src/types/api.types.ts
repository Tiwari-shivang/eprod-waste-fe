// API Response Types

export interface HealthResponse {
  message: string;
  status: string;
}

export interface OptimalSettings {
  experience: string;
  flute: string;
  glue: number;
  gsm: number;
  length: number;
  pressure: number;
  printing: number;
  quantity: number;
  shift: string;
  speed: number;
  steam: number;
  temp: number;
  width: number;
}

export interface PredictResponse {
  success: boolean;
  data: {
    job_id: string;
    optimal_settings: OptimalSettings;
    predicted_min_waste: number;
  };
}

export interface JobStatus {
  id: string;
  jobId: string;
  currentStatus: 'in-progress' | 'completed' | 'pending';
  generatedWaste: number;
  timeTaken: number | null;
  startTime: string | null;
  endTime: string | null;
  progress: number; // 0-1 range from API
}

export interface JobRecommendations {
  fallback?: boolean;
  speed?: number;
  temperature?: number;
  // Extended recommendations from /predict endpoint
  experience?: string;
  flute?: string;
  glue?: number;
  gsm?: number;
  length?: number;
  pressure?: number;
  printing?: number;
  quantity?: number;
  shift?: string;
  steam?: number;
  temp?: number;
  width?: number;
}

export interface JobData {
  job_id: string;
  experience: string;
  flute: string;
  gsm: number;
  length: number;
  predicted_waste: number;
  printing: number;
  quantity: number;
  recommendations: JobRecommendations;
  shift: string;
  width: number;
}

export interface JobDetailsResponse {
  success: boolean;
  data: {
    job: JobData;
    status: {
      status_id: string;
      current_status: string;
      generated_waste: number;
      progress: number;
      start_time: string | null;
      end_time: string | null;
      time_taken: number | null;
    };
  };
}

export interface InProgressJobsResponse {
  success: boolean;
  count: number;
  data: Array<{
    job: JobData;
    status: {
      status_id: string;
      current_status: string;
      generated_waste: number;
      progress: number;
      start_time: string | null;
      end_time: string | null;
      time_taken: number | null;
    };
  }>;
}

export type JobStatusArray = JobStatus[];
