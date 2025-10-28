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

// Helper function to convert log to CurrentJob
const convertToCurrentJob = (log: CorrugatorLog, index: number): CurrentJob => {
  // Cycle through operators
  const operator = OPERATORS[index % OPERATORS.length];

  // Parse action steps JSON and enhance with additional suggestions
  let actionSteps = [];
  try {
    const parsedSteps = JSON.parse(log.action_steps_json || '[]');
    actionSteps = parsedSteps.length > 0 ? parsedSteps : [];
  } catch (e) {
    actionSteps = [];
  }

  // Add more detailed action steps if the original list is empty or has few items
  if (actionSteps.length < 3) {
    actionSteps = [
      { step: 'Adjust steam temperature to optimal range', delta_c: log.candidate_steam_c - log.steam_c },
      { step: 'Optimize machine speed for current material', delta_mpm: log.candidate_speed_mpm - log.speed_mpm },
      { step: 'Fine-tune glue gap for better adhesion', delta_c: 0 },
      { step: 'Monitor edge alignment sensors continuously' },
      { step: 'Verify moisture content is within spec range' },
      { step: 'Check wrap arm positioning for consistency' },
    ];
  }

  // Filter out NaN values and ensure valid numbers
  const safeNumber = (value: any, fallback: number = 0): number => {
    return (typeof value === 'number' && !isNaN(value)) ? value : fallback;
  };

  // Realistic completion percentage that increases over time
  const baseCompletion = 65 + (index % 30);
  const completion = Math.min(95, baseCompletion);

  // Convert dry end waste percentage to kg (assuming average production rate)
  // Typical corrugator produces 150-200 meters/min, let's estimate waste in kg
  const dryEndWasteKg = safeNumber(log.predicted_dry_end_waste_pct) * safeNumber(log.speed_mpm) * 0.8;

  return {
    jobId: log.job_id || `JOB-${index}`,
    jobName: `${log.paper_grade || 'Unknown'} - ${log.flute || 'C'}`,
    operatorId: operator,
    completion: completion,
    wasteRisk: Math.min(safeNumber(log.predicted_dry_end_waste_pct) * 25, 100),
    paperGrade: log.paper_grade || 'Unknown',
    flute: log.flute || 'C',
    thickness: `${log.paper_grade?.match(/\d+/)?.[0] || '140'}gsm`,
    predictedSetupWaste: safeNumber(log.predicted_setup_waste_kg, 85),
    predictedDryEndWaste: safeNumber(dryEndWasteKg, 45),
    speed: safeNumber(log.speed_mpm, 150),
    steam: safeNumber(log.steam_c, 180),
    eventType: log.event_type || 'run',
    actionConfidence: safeNumber(log.action_confidence, 0.75),
    actionTitle: log.action_title || 'Optimize current settings for waste reduction',
    actionSteps: actionSteps,
  };
};

// Get all running jobs for manual navigation
export const getAllRunningJobs = (): CurrentJob[] => {
  const runningJobs = allLogs.filter(log => log.event_type === 'run');

  // Return up to 10 running jobs for navigation
  return runningJobs.slice(0, Math.min(10, runningJobs.length)).map((log, index) => {
    return convertToCurrentJob(log, index);
  });
};

// Get current running job with realistic cycling (deprecated - kept for backward compatibility)
export const getCurrentJob = (): CurrentJob => {
  const allJobs = getAllRunningJobs();
  return allJobs[0] || convertToCurrentJob(allLogs[0], 0);
};

// Get historical jobs (completed jobs) with real data variety
export const getHistoricalJobs = (): HistoricalJob[] => {
  const setupAndAdjustJobs = allLogs.filter(log => log.event_type === 'setup' || log.event_type === 'adjust');
  const startIndex = Math.max(0, setupAndAdjustJobs.length - 15);

  return setupAndAdjustJobs
    .slice(startIndex)
    .map((log, index) => {
      // Generate shift time from timestamp or use provided shift times
      const startTime = log.start_shift_time || new Date(log.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const endDate = new Date(new Date(log.ts).getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      const endTime = log.end_shift_time || endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const shiftTime = `${startTime} - ${endTime}`;

      return {
        jobId: log.job_id,
        waste: log.predicted_setup_waste_kg,
        saved: log.action_effect_waste_saved_kg,
        timestamp: log.ts,
        paperGrade: log.paper_grade,
        eventType: log.event_type,
        operator: OPERATORS[index % OPERATORS.length],
        shiftTime: shiftTime,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};

// Get ALL historical jobs for the modal
export const getAllHistoricalJobs = (): HistoricalJob[] => {
  const setupAndAdjustJobs = allLogs.filter(log => log.event_type === 'setup' || log.event_type === 'adjust');

  return setupAndAdjustJobs
    .map((log, index) => {
      // Generate shift time from timestamp or use provided shift times
      const startTime = log.start_shift_time || new Date(log.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const endDate = new Date(new Date(log.ts).getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      const endTime = log.end_shift_time || endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const shiftTime = `${startTime} - ${endTime}`;

      return {
        jobId: log.job_id,
        waste: log.predicted_setup_waste_kg,
        saved: log.action_effect_waste_saved_kg,
        timestamp: log.ts,
        paperGrade: log.paper_grade,
        eventType: log.event_type,
        operator: OPERATORS[index % OPERATORS.length],
        shiftTime: shiftTime,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Get in-progress jobs with realistic progression (matches Current Job section data)
export const getInProgressJobs = (): InProgressJob[] => {
  const runningJobs = allLogs.filter(log => log.event_type === 'run');

  // Use the same first 10 jobs as Current Job section for consistency
  return runningJobs
    .slice(0, Math.min(10, runningJobs.length))
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
    });
};

// Get ALL in-progress jobs for the modal (matches Current Job section data)
export const getAllInProgressJobs = (): InProgressJob[] => {
  const runningJobs = allLogs.filter(log => log.event_type === 'run');

  // Use same jobs as Current Job section
  return runningJobs
    .slice(0, Math.min(10, runningJobs.length))
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
    });
};

// Get upcoming jobs - using running jobs as upcoming jobs
export const getUpcomingJobs = (): UpcomingJob[] => {
  const runningJobs = allLogs.filter(log => log.event_type === 'run');

  // Get some running jobs to show as upcoming
  const startIndex = Math.max(0, runningJobs.length - 10);
  const selectedJobs = runningJobs.slice(startIndex, startIndex + 5);

  // Ensure at least 3 jobs with realistic mock data if not enough
  const mockJobs: UpcomingJob[] = [
    {
      jobId: 'JOB-2024-001',
      paperGrade: 'K150',
      flute: 'B',
      operator: 'Sarah Chen',
      thickness: '150gsm',
      eta: 25,
      changeoverDuration: 12,
      expectedWasteLow: 75,
      expectedWasteHigh: 95,
    },
    {
      jobId: 'JOB-2024-002',
      paperGrade: 'T140',
      flute: 'C',
      operator: 'Michael Okonkwo',
      thickness: '140gsm',
      eta: 45,
      changeoverDuration: 15,
      expectedWasteLow: 80,
      expectedWasteHigh: 105,
    },
    {
      jobId: 'JOB-2024-003',
      paperGrade: 'K175',
      flute: 'E',
      operator: 'Priya Sharma',
      thickness: '175gsm',
      eta: 65,
      changeoverDuration: 10,
      expectedWasteLow: 65,
      expectedWasteHigh: 85,
    },
  ];

  const upcomingFromLogs = selectedJobs.map((log, idx) => ({
    jobId: log.job_id,
    paperGrade: log.paper_grade,
    flute: log.flute,
    operator: OPERATORS[(idx + 2) % OPERATORS.length],
    thickness: `${log.paper_grade?.match(/\d+/)?.[0] || '140'}gsm`,
    eta: (idx + 1) * 20 + Math.floor(Math.random() * 15), // Random ETA
    changeoverDuration: Math.floor(Math.random() * 10) + 8, // 8-18 minutes
    expectedWasteLow: Math.floor(log.predicted_setup_waste_kg * 0.8),
    expectedWasteHigh: Math.floor(log.predicted_setup_waste_kg * 1.2),
  }));

  // Combine mock jobs with log jobs, ensure at least 3 rows
  const combinedJobs = [...mockJobs, ...upcomingFromLogs];
  return combinedJobs.slice(0, Math.max(3, selectedJobs.length + 3));
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

  return chartLogs.map((log) => {
    // Use forecast as base predicted value
    const predictedBase = log.forecast_setup_waste_kg_mean || log.predicted_setup_waste_kg;

    // Make difference exactly 10-20 kg between actual and predicted
    // 50% chance predicted is higher, 50% chance actual is higher
    const difference = 10 + Math.random() * 10; // Random value between 10-20 kg
    const actualWaste = Math.random() > 0.5
      ? predictedBase + difference  // 50% chance: actual is 10-20kg higher
      : predictedBase - difference;  // 50% chance: actual is 10-20kg lower

    return {
      time: new Date(log.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      waste: Math.round(actualWaste * 10) / 10,
      predicted: Math.round(predictedBase * 10) / 10,
    };
  });
};

// Simulated API calls
export const dashboardAPI = {
  getCurrentJob: () => Promise.resolve(getCurrentJob()),
  getAllRunningJobs: () => Promise.resolve(getAllRunningJobs()),
  getHistoricalJobs: () => Promise.resolve(getHistoricalJobs()),
  getAllHistoricalJobs: () => Promise.resolve(getAllHistoricalJobs()),
  getInProgressJobs: () => Promise.resolve(getInProgressJobs()),
  getAllInProgressJobs: () => Promise.resolve(getAllInProgressJobs()),
  getUpcomingJobs: () => Promise.resolve(getUpcomingJobs()),
  getKPIData: () => Promise.resolve(getKPIData()),
  getWasteAlerts: () => Promise.resolve(getWasteAlerts()),
  getKPIChartData: () => Promise.resolve(getKPIChartData()),
};
