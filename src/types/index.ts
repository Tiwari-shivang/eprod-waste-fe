export interface CorrugatorLog {
  ts: string;
  site_id: string;
  line_id: string;
  event_type: 'setup' | 'run' | 'adjust' | 'alert';
  trace_id: string;
  job_id: string;
  paper_grade: string;
  flute: string;
  speed_mpm: number;
  steam_c: number;
  glue_gap_um: number;
  moisture_pct: number;
  wrap_arm_pos: number;
  vibration_mm_s: number;
  edge_status: string;
  cloud_fallback: number;
  optimizer: string;
  objective_waste: number;
  objective_throughput: number;
  objective_stability: number;
  candidate_speed_mpm: number;
  candidate_steam_c: number;
  candidate_glue_gap_um: number;
  predicted_setup_waste_kg: number;
  predicted_dry_end_waste_pct: number;
  edge_version: string;
  ingest_ms: number;
  prefilter_ms: number;
  drift_ms: number;
  inference_ms: number;
  decision_ms: number;
  edge_cpu_pct: number;
  edge_mem_pct: number;
  ws_clients: number;
  tsdb_lag_ms: number;
  alerts_queue_depth: number;
  action_id: string;
  effect_eval_window_s: number;
  pre_dry_end_waste_pct: number;
  post_dry_end_waste_pct: number;
  action_effect_waste_saved_kg: number;
  effect_confidence: number;
  action_title: string;
  action_steps_json: string;
  action_confidence: number;
  action_valid_for_s: number;
  action_source: string;
  forecast_horizon_s: number;
  forecast_setup_waste_kg_mean: number;
  forecast_setup_waste_kg_p90: number;
  forecast_setup_waste_kg_p10: number;
  forecast_dry_end_waste_pct_mean: number;
  next_job_id: string;
  changeover_eta_min: number;
  next_paper_grade: string;
  next_flute: string;
  suggested_speed_mpm: number;
  suggested_steam_c: number;
  suggested_glue_gap_um: number;
  expected_setup_waste_kg_low: number;
  expected_setup_waste_kg_high: number;
  operator_response: string;
  operator_latency_ms: number;
  operator_notes: string;
  channel: string;
  drift_method: string;
  drift_score: number;
  drift_status: string;
  drift_threshold: number;
  start_shift_time: string;
  end_shift_time: string;
}

export interface ActionStep {
  step: string;
  delta_c?: number;
  delta_mpm?: number;
}

export interface CurrentJob {
  jobId: string;
  jobName: string;
  quantity: number;
  completion: number;
  wasteRisk: number;
  paperGrade: string;
  flute: string;
  thickness: string;
  predictedSetupWaste: number;
  predictedDryEndWaste: number;
  speed: number;
  steam: number;
  eventType: string; // 'in-progress' | 'paused'
  actionConfidence: number;
  actionTitle: string;
  actionSteps: ActionStep[];
  appliedSettings?: boolean; // Track if AI settings have been applied
}

export interface HistoricalJob {
  jobId: string;
  waste: number;
  saved: number;
  timestamp: string;
  paperGrade: string;
  eventType: string;
  operator: string;
  shiftTime: string;
}

export interface InProgressJob {
  jobId: string;
  paperGrade: string;
  completion: number;
  progress: number;
  flute: string;
  wasteRisk: number;
  predictedSetupWaste?: number;
  productionRequirement?: number;
  speed?: number;
  steam?: number;
  glueGap?: number;
  moisture?: number;
  wrapArm?: number;
  vibrations?: number;
  actionConfidence?: number;
}

export interface UpcomingJob {
  jobId: string;
  paperGrade: string;
  flute: string;
  operator: string;
  thickness: string;
  eta: number;
  changeoverDuration: number;
  expectedWasteLow: number;
  expectedWasteHigh: number;
}

export interface KPIData {
  totalWasteSaved: number;
  wasteSavedPercentage: number;
  activeAlerts: number;
  offlineEvents: number;
  avgAccuracy: number;
}

export interface WasteAlert {
  id: string;
  jobId: string;
  jobName: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  actionTitle: string;
  confidence: number;
}

export interface KPIChartData {
  time: string;
  waste: number;
  predicted: number;
}
