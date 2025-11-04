import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Space, Modal, Alert, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined } from '@ant-design/icons';
import { AppHeader } from '../components/Header';
import { CurrentJobCard, AISuggestionsCard } from '../components/CurrentJob';
import { KPISection } from '../components/KPISummary';
import { HistoricalJobsTable, InProgressJobsTable, UpcomingJobsTable } from '../components/JobTables';
import { JobDetailsDrawer } from '../components/JobDetails';
import { dashboardAPI } from '../services/dataService';
import { apiService } from '../services/api.service';
import { useRealTimeJobs } from '../hooks/useRealTimeJobs';
import { useLoading } from '../contexts/LoadingContext';
import type { CurrentJob, HistoricalJob, InProgressJob, UpcomingJob, KPIChartData } from '../types';

const { Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader, updateProgress } = useLoading();

  // Use real-time jobs hook for WebSocket + API integration
  // Fetches job details ONCE on mount, then uses WebSocket for real-time progress updates
  const {
    currentJob: realTimeCurrentJob,
    inProgressJobs: realTimeInProgressJobs,
    allRunningJobs: realTimeRunningJobs,
    isLoading: realTimeLoading,
    isConnected,
    error: realTimeError,
    refreshJobs,
  } = useRealTimeJobs({
    enableWebSocket: true,
    enableAutoRefresh: false, // Disabled - use WebSocket only for updates
  });

  const [currentJob, setCurrentJob] = useState<CurrentJob | null>(null);
  const [historicalJobs, setHistoricalJobs] = useState<HistoricalJob[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<InProgressJob[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJob[]>([]);
  const [chartData, setChartData] = useState<KPIChartData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [_selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [allRunningJobs, setAllRunningJobs] = useState<CurrentJob[]>([]);
  const [inProgressModalOpen, setInProgressModalOpen] = useState(false);
  const [allInProgressJobs, setAllInProgressJobs] = useState<InProgressJob[]>([]);
  const [useRealTimeData, setUseRealTimeData] = useState(true);
  const [appliedSettingsMap, setAppliedSettingsMap] = useState<Record<string, boolean>>({});

  // Update state when real-time data changes
  // This effect runs EVERY TIME WebSocket sends new data
  useEffect(() => {
    if (useRealTimeData && !realTimeLoading) {
      console.log('[Dashboard] 🔄 REAL-TIME UPDATE from WebSocket');
      console.log('  - In-progress jobs:', realTimeInProgressJobs.length);
      console.log('  - Sample progress:', realTimeInProgressJobs[0]?.completion + '%');

      // IMPORTANT: Use ONLY real-time data (from REST API + WebSocket)
      // Apply the appliedSettings flag from our local state
      const jobsWithAppliedSettings = realTimeRunningJobs.map(job => ({
        ...job,
        appliedSettings: appliedSettingsMap[job.jobId] || false
      }));

      setAllRunningJobs(jobsWithAppliedSettings);
      setInProgressJobs(realTimeInProgressJobs);  // This goes to KPISection → InProgressJobsTable
      setAllInProgressJobs(realTimeInProgressJobs);  // This goes to Modal

      // Set current job based on index
      if (jobsWithAppliedSettings.length > 0) {
        const newCurrentJob = jobsWithAppliedSettings[currentJobIndex] || jobsWithAppliedSettings[0];
        console.log('  - Current job progress:', newCurrentJob.completion + '%');
        setCurrentJob(newCurrentJob);
      } else {
        setCurrentJob(realTimeCurrentJob);
      }

      console.log('[Dashboard] ✅ UI state updated - components will re-render');
    } else if (realTimeLoading) {
      console.log('[Dashboard] Loading real-time data...');
    }
  }, [
    realTimeCurrentJob,
    realTimeInProgressJobs,
    realTimeRunningJobs,
    realTimeLoading,
    useRealTimeData,
    currentJobIndex,
    appliedSettingsMap,
  ]);

  // Fallback to mock data ONLY when user explicitly disables real-time data
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

  useEffect(() => {
    // Update current job when index changes
    if (allRunningJobs.length > 0) {
      setCurrentJob(allRunningJobs[currentJobIndex] || allRunningJobs[0]);
    }
  }, [currentJobIndex, allRunningJobs]);

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

    // Update historical/upcoming data every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setDrawerOpen(true);
  };

  const handleViewDetails = () => {
    if (currentJob) {
      setSelectedJobId(currentJob.jobId);
      setDrawerOpen(true);
    }
  };

  const handlePreviousJob = () => {
    if (currentJobIndex > 0) {
      setCurrentJobIndex(prev => prev - 1);
    }
  };

  const handleNextJob = () => {
    if (currentJobIndex < allRunningJobs.length - 1) {
      setCurrentJobIndex(prev => prev + 1);
    }
  };

  const handleApplySettings = (jobId: string) => {
    // Mark this job as having applied settings
    setAppliedSettingsMap(prev => ({
      ...prev,
      [jobId]: true
    }));

    // Recalculate waste risk to 10-20% range for applied settings
    const newWasteRisk = 10 + Math.random() * 10;

    // Update current job if it matches
    if (currentJob?.jobId === jobId) {
      setCurrentJob(prev => prev ? {
        ...prev,
        appliedSettings: true,
        wasteRisk: newWasteRisk
      } : null);
    }

    // Update all running jobs
    setAllRunningJobs(prev =>
      prev.map(job =>
        job.jobId === jobId ? {
          ...job,
          appliedSettings: true,
          wasteRisk: newWasteRisk
        } : job
      )
    );
  };

  const handlePauseJob = async (jobId: string) => {
    const job = allRunningJobs.find(j => j.jobId === jobId);
    if (!job) return;

    const isPaused = job.eventType === 'paused';
    const newStatus = isPaused ? 'in-progress' : 'paused';
    const actionText = isPaused ? 'Resuming' : 'Pausing';

    // Show loader immediately
    showLoader(`${actionText} Job ${jobId}...`);

    // Simulate smooth progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      if (progress <= 90) {
        updateProgress(progress);
      }
    }, 50); // Update every 50ms for smooth animation

    try {
      const response = await apiService.updateJob(jobId, {
        length: parseFloat(job.thickness) || 0,
        width: 100,
        gsm: parseFloat(job.paperGrade.split('-')[1]?.trim()) || 0,
        printing: 1,
        quantity: job.quantity,
        flute: job.flute,
        shift: 'Day',
        experience: 'High',
        status: newStatus
      });

      // Complete the progress
      clearInterval(progressInterval);
      updateProgress(100);

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));

      if (response.success) {
        message.success(isPaused ? 'Job resumed successfully!' : 'Job paused successfully!');
        // Refresh jobs to get updated status
        await refreshJobs();
      } else {
        message.error(`Failed to ${isPaused ? 'resume' : 'pause'} job`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error pausing/resuming job:', error);
      message.error(`Failed to ${isPaused ? 'resume' : 'pause'} job`);
    } finally {
      hideLoader();
    }
  };

  const handleJobUpdated = async () => {
    // Refresh jobs after update
    await refreshJobs();
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AppHeader />
      <Content style={{ padding: '32px' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 700, fontSize: 32 }}>
              Industrial AI Dashboard
            </Title>
            <Typography.Text style={{ color: '#64748b', fontSize: 15 }}>
              AI-Driven Corrugator Waste Reduction Platform
            </Typography.Text>
          </div>

          {/* WebSocket Status Indicator */}
          {useRealTimeData && (
            <Alert
              message={
                isConnected
                  ? 'Hexaview XGBoost Regressor Optimization Model API is running - Real-time progress updates active'
                  : realTimeError
                  ? `WebSocket error: ${realTimeError.message}`
                  : 'Connecting to WebSocket...'
              }
              description={
                isConnected
                  ? 'Job data loaded once. Progress bars update in real-time via WebSocket.'
                  : null
              }
              type={isConnected ? 'success' : realTimeError ? 'error' : 'info'}
              showIcon
              closable
              onClose={() => setUseRealTimeData(false)}
              action={
                isConnected ? (
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => refreshJobs()}
                  >
                    Refresh Data
                  </Button>
                ) : null
              }
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Current Job and AI Suggestions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={18}>
              {currentJob && (
                <CurrentJobCard
                  job={currentJob}
                  onViewDetails={handleViewDetails}
                  onPreviousJob={handlePreviousJob}
                  onNextJob={handleNextJob}
                  currentIndex={currentJobIndex}
                  totalJobs={allRunningJobs.length}
                  onPauseJob={handlePauseJob}
                />
              )}
            </Col>
            <Col xs={24} lg={6}>
              {currentJob && (
                <AISuggestionsCard
                  job={currentJob}
                  onApplySettings={handleApplySettings}
                />
              )}
            </Col>
          </Row>

          {/* KPI Summary and In-Progress Jobs */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <KPISection
                chartData={chartData}
                inProgressJobs={inProgressJobs}
                onJobClick={handleJobClick}
                onViewAll={() => setInProgressModalOpen(true)}
                onViewAnalytics={() => navigate('/analytics')}
              />
            </Col>
          </Row>

          {/* Job Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <HistoricalJobsTable
                jobs={historicalJobs}
                onJobClick={handleJobClick}
                onViewAll={() => navigate('/historical-data')}
              />
            </Col>
            <Col xs={24} xl={12}>
              <UpcomingJobsTable jobs={upcomingJobs} onJobClick={handleJobClick} />
            </Col>
          </Row>
        </Space>
      </Content>

      {/* Job Details Drawer */}
      <JobDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={currentJob}
        onJobUpdated={handleJobUpdated}
      />

      {/* In-Progress Jobs Modal */}
      <Modal
        title="All In-Progress Jobs"
        open={inProgressModalOpen}
        onCancel={() => setInProgressModalOpen(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <div style={{ padding: '16px 0' }}>
          <InProgressJobsTable
            jobs={allInProgressJobs}
            onJobClick={handleJobClick}
            pageSize={10}
            showCard={false}
          />
        </div>
      </Modal>
    </Layout>
  );
};
