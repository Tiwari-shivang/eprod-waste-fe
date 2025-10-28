import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Space, Modal } from 'antd';
import { CurrentJobCard, AISuggestionsCard } from '../components/CurrentJob';
import { KPISection } from '../components/KPISummary';
import { HistoricalJobsTable, InProgressJobsTable, UpcomingJobsTable } from '../components/JobTables';
import { JobDetailsDrawer } from '../components/JobDetails';
import { dashboardAPI } from '../services/dataService';
import type { CurrentJob, HistoricalJob, InProgressJob, UpcomingJob, KPIChartData } from '../types';

const { Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [currentJob, setCurrentJob] = useState<CurrentJob | null>(null);
  const [historicalJobs, setHistoricalJobs] = useState<HistoricalJob[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<InProgressJob[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJob[]>([]);
  const [chartData, setChartData] = useState<KPIChartData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [_selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [allRunningJobs, setAllRunningJobs] = useState<CurrentJob[]>([]);
  const [historicalModalOpen, setHistoricalModalOpen] = useState(false);
  const [inProgressModalOpen, setInProgressModalOpen] = useState(false);
  const [allHistoricalJobs, setAllHistoricalJobs] = useState<HistoricalJob[]>([]);
  const [allInProgressJobs, setAllInProgressJobs] = useState<InProgressJob[]>([]);

  useEffect(() => {
    // Fetch all running jobs once on mount
    const fetchJobs = async () => {
      const [allJobs, allHistorical, allInProgress] = await Promise.all([
        dashboardAPI.getAllRunningJobs(),
        dashboardAPI.getAllHistoricalJobs(),
        dashboardAPI.getAllInProgressJobs(),
      ]);
      setAllRunningJobs(allJobs);
      setCurrentJob(allJobs[0] || null);
      setAllHistoricalJobs(allHistorical);
      setAllInProgressJobs(allInProgress);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Update current job when index changes
    if (allRunningJobs.length > 0) {
      setCurrentJob(allRunningJobs[currentJobIndex] || allRunningJobs[0]);
    }
  }, [currentJobIndex, allRunningJobs]);

  useEffect(() => {
    // Fetch other data (not current job)
    const fetchData = async () => {
      const [historical, inProgress, upcoming, chart] = await Promise.all([
        dashboardAPI.getHistoricalJobs(),
        dashboardAPI.getInProgressJobs(),
        dashboardAPI.getUpcomingJobs(),
        dashboardAPI.getKPIChartData(),
      ]);

      setHistoricalJobs(historical);
      setInProgressJobs(inProgress);
      setUpcomingJobs(upcoming);
      setChartData(chart);
    };

    fetchData();

    // Simulate real-time updates every 5 seconds (excluding current job)
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

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
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
                />
              )}
            </Col>
            <Col xs={24} lg={6}>
              {currentJob && <AISuggestionsCard job={currentJob} />}
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
              />
            </Col>
          </Row>

          {/* Job Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <HistoricalJobsTable
                jobs={historicalJobs}
                onJobClick={handleJobClick}
                onViewAll={() => setHistoricalModalOpen(true)}
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
      />

      {/* Historical Jobs Modal */}
      <Modal
        title="All Historical Jobs"
        open={historicalModalOpen}
        onCancel={() => setHistoricalModalOpen(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <div style={{ padding: '16px 0' }}>
          <HistoricalJobsTable
            jobs={allHistoricalJobs}
            onJobClick={handleJobClick}
            pageSize={10}
            showCard={false}
          />
        </div>
      </Modal>

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
