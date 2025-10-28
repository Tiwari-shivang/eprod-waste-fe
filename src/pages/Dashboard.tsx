import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { CurrentJobCard, AISuggestionsCard } from '../components/CurrentJob';
import { KPISection } from '../components/KPISummary';
import { HistoricalJobsTable, InProgressJobsTable, UpcomingJobsTable } from '../components/JobTables';
import { JobDetailsDrawer } from '../components/JobDetails';
import { WastePredictionAlerts } from '../components/WastePrediction';
import { dashboardAPI } from '../services/dataService';
import type { CurrentJob, HistoricalJob, InProgressJob, UpcomingJob, KPIData, WasteAlert, KPIChartData } from '../types';

const { Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [currentJob, setCurrentJob] = useState<CurrentJob | null>(null);
  const [historicalJobs, setHistoricalJobs] = useState<HistoricalJob[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<InProgressJob[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJob[]>([]);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [alerts, setAlerts] = useState<WasteAlert[]>([]);
  const [chartData, setChartData] = useState<KPIChartData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [_selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all data
    const fetchData = async () => {
      const [current, historical, inProgress, upcoming, kpi, wasteAlerts, chart] = await Promise.all([
        dashboardAPI.getCurrentJob(),
        dashboardAPI.getHistoricalJobs(),
        dashboardAPI.getInProgressJobs(),
        dashboardAPI.getUpcomingJobs(),
        dashboardAPI.getKPIData(),
        dashboardAPI.getWasteAlerts(),
        dashboardAPI.getKPIChartData(),
      ]);

      setCurrentJob(current);
      setHistoricalJobs(historical);
      setInProgressJobs(inProgress);
      setUpcomingJobs(upcoming);
      setKpiData(kpi);
      setAlerts(wasteAlerts);
      setChartData(chart);
    };

    fetchData();

    // Simulate real-time updates every 5 seconds
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

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0 }}>
              Industrial AI Dashboard
            </Title>
            <Typography.Text type="secondary">
              AI-Driven Corrugator Waste Reduction Platform
            </Typography.Text>
          </div>

          {/* Current Job and AI Suggestions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={18}>
              {currentJob && <CurrentJobCard job={currentJob} onViewDetails={handleViewDetails} />}
            </Col>
            <Col xs={24} lg={6}>
              {currentJob && <AISuggestionsCard job={currentJob} />}
            </Col>
          </Row>

          {/* KPI Summary */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {kpiData && <KPISection kpiData={kpiData} chartData={chartData} />}
            </Col>
          </Row>

          {/* Waste Prediction & Alerts */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <WastePredictionAlerts alerts={alerts} />
            </Col>
          </Row>

          {/* Job Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <HistoricalJobsTable jobs={historicalJobs} onJobClick={handleJobClick} />
            </Col>
            <Col xs={24} xl={12}>
              <InProgressJobsTable jobs={inProgressJobs} onJobClick={handleJobClick} />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
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
    </Layout>
  );
};
