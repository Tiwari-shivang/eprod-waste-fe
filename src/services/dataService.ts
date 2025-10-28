import csvData from '../data/corrugator_logs_synthetic_enriched.csv?raw';
import type {
  CorrugatorLog,
  CurrentJob,
  HistoricalJob,
  InProgressJob,
  UpcomingJob,
  KPIData,
  WasteAlert,
  KPIChartData,
} from '../types';

// Parse CSV data
const parseCSV = (csv: string): CorrugatorLog[] => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1, -1).map(line => {
    const values = line.split(',');
    const obj: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      // Convert numeric strings to numbers
      if (value && !isNaN(Number(value)) && value.trim() !== '') {
        obj[header.trim()] = Number(value);
      } else {
        obj[header.trim()] = value;
      }
    });

    return obj as CorrugatorLog;
  });
};

const allLogs = parseCSV(csvData);

// Real-world operator names
const OPERATORS = ['John Martinez', 'Sarah Chen', 'Michael Okonkwo', 'Priya Sharma', 'David Rodriguez'];

// Session-based data indices for realistic cycling
let currentJobIndex = Math.floor(Math.random() * Math.min(allLogs.length, 100));
let operatorIndex = 0;

// Get current running job with realistic cycling
export const getCurrentJob = (): CurrentJob => {
  // Cycle through running jobs for variety
  const runningJobs = allLogs.filter(log => log.event_type === 'run');
  if (runningJobs.length === 0) {
    currentJobIndex = 0;
  } else {
    currentJobIndex = (currentJobIndex + 1) % runningJobs.length;
  }

  const latestJob = runningJobs[currentJobIndex] || allLogs[0];

  // Cycle through operators
  operatorIndex = (operatorIndex + 1) % OPERATORS.length;
  const operator = OPERATORS[operatorIndex];

  // Parse action steps JSON
  let actionSteps = [];
  try {
    actionSteps = JSON.parse(latestJob.action_steps_json || '[]');
  } catch (e) {
    actionSteps = [];
  }

  // Realistic completion percentage that increases over time
  const baseCompletion = 65 + (currentJobIndex % 30);
  const completion = Math.min(95, baseCompletion);

  return {
    jobId: latestJob.job_id,
    jobName: `${latestJob.paper_grade} - ${latestJob.flute}`,
    operatorId: operator,
    completion: completion,
    wasteRisk: Math.min(latestJob.predicted_dry_end_waste_pct * 25, 100),
    paperGrade: latestJob.paper_grade,
    flute: latestJob.flute,
    thickness: `${latestJob.paper_grade.match(/\d+/)?.[0] || '140'}gsm`,
    predictedSetupWaste: latestJob.predicted_setup_waste_kg,
    predictedDryEndWaste: latestJob.predicted_dry_end_waste_pct,
    speed: latestJob.speed_mpm,
    steam: latestJob.steam_c,
    eventType: latestJob.event_type,
    actionConfidence: latestJob.action_confidence,
    actionTitle: latestJob.action_title,
    actionSteps: actionSteps,
  };
};

// Get historical jobs (completed jobs) with real data variety
export const getHistoricalJobs = (): HistoricalJob[] => {
  const setupAndAdjustJobs = allLogs.filter(log => log.event_type === 'setup' || log.event_type === 'adjust');
  const startIndex = Math.max(0, setupAndAdjustJobs.length - 15);

  return setupAndAdjustJobs
    .slice(startIndex)
    .map(log => ({
      jobId: log.job_id,
      waste: log.predicted_setup_waste_kg,
      saved: log.action_effect_waste_saved_kg,
      confidence: log.action_confidence,
      timestamp: log.ts,
      paperGrade: log.paper_grade,
      eventType: log.event_type,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};

// Get in-progress jobs with realistic progression
export const getInProgressJobs = (): InProgressJob[] => {
  const runningJobs = allLogs.filter(log => log.event_type === 'run');
  const startIndex = Math.max(0, runningJobs.length - 8);

  return runningJobs
    .slice(startIndex)
    .map((log, idx) => {
      const baseProgress = 25 + (idx * 10);
      const completion = Math.min(85, baseProgress + Math.floor(Math.random() * 15));

      return {
        jobId: log.job_id,
        paperGrade: log.paper_grade,
        completion: completion,
        progress: completion,
        flute: log.flute,
        wasteRisk: Math.min(log.predicted_dry_end_waste_pct * 22, 100),
      };
    })
    .slice(0, 6);
};

// Get upcoming jobs with real scheduling data
export const getUpcomingJobs = (): UpcomingJob[] => {
  const jobsWithNext = allLogs.filter(log => log.next_job_id && log.next_paper_grade);
  const startIndex = Math.max(0, jobsWithNext.length - 8);

  return jobsWithNext
    .slice(startIndex)
    .map(log => ({
      jobId: log.next_job_id,
      paperGrade: log.next_paper_grade,
      flute: log.next_flute,
      eta: log.changeover_eta_min,
      changeoverDuration: Math.floor(log.changeover_eta_min * 0.65),
      expectedWasteLow: log.expected_setup_waste_kg_low,
      expectedWasteHigh: log.expected_setup_waste_kg_high,
    }))
    .slice(0, 5);
};

// Get KPI data with realistic calculations
export const getKPIData = (): KPIData => {
  // Calculate from recent logs for current session metrics
  const recentLogs = allLogs.slice(-100);
  const totalSaved = recentLogs.reduce((sum, log) => sum + (log.action_effect_waste_saved_kg || 0), 0);
  const recentAlerts = recentLogs.filter(log => log.event_type === 'alert');
  const avgConfidence = recentLogs.reduce((sum, log) => sum + (log.action_confidence || 0), 0) / recentLogs.length;

  // Calculate waste reduction percentage
  const totalWaste = recentLogs.reduce((sum, log) => sum + (log.predicted_setup_waste_kg || 0), 0);
  const wasteReductionPct = totalWaste > 0 ? Math.min((totalSaved / totalWaste) * 100, 25) : 18;

  return {
    totalWasteSaved: Math.round(totalSaved * 10) / 10,
    wasteSavedPercentage: Math.round(wasteReductionPct * 10) / 10,
    activeAlerts: recentAlerts.length,
    offlineEvents: Math.floor(recentAlerts.length * 0.15),
    avgAccuracy: Math.round(avgConfidence * 100 * 10) / 10,
  };
};

// Get waste alerts with real-world severity classification
export const getWasteAlerts = (): WasteAlert[] => {
  const alertJobs = allLogs.filter(log => log.event_type === 'alert');
  const startIndex = Math.max(0, alertJobs.length - 12);

  return alertJobs
    .slice(startIndex)
    .map(log => {
      // Determine severity based on waste predictions and risk factors
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (log.predicted_dry_end_waste_pct > 3.5 || log.predicted_setup_waste_kg > 110) {
        severity = 'high';
      } else if (log.predicted_dry_end_waste_pct > 2.8 || log.predicted_setup_waste_kg > 90) {
        severity = 'medium';
      }

      return {
        id: log.trace_id,
        jobId: log.job_id,
        severity,
        message: log.action_title,
        timestamp: log.ts,
        actionTitle: log.action_title,
        confidence: log.action_confidence,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
};

// Get KPI chart data with time series
export const getKPIChartData = (): KPIChartData[] => {
  const chartLogs = allLogs.slice(-25);

  return chartLogs.map(log => ({
    time: new Date(log.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    waste: Math.round(log.predicted_setup_waste_kg * 10) / 10,
    predicted: Math.round(log.forecast_setup_waste_kg_mean * 10) / 10,
  }));
};

// Simulated API calls
export const dashboardAPI = {
  getCurrentJob: () => Promise.resolve(getCurrentJob()),
  getHistoricalJobs: () => Promise.resolve(getHistoricalJobs()),
  getInProgressJobs: () => Promise.resolve(getInProgressJobs()),
  getUpcomingJobs: () => Promise.resolve(getUpcomingJobs()),
  getKPIData: () => Promise.resolve(getKPIData()),
  getWasteAlerts: () => Promise.resolve(getWasteAlerts()),
  getKPIChartData: () => Promise.resolve(getKPIChartData()),
};
