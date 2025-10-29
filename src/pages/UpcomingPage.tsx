import React, { useEffect, useState } from 'react';
import { Card, Typography, Space } from 'antd';
import { AppHeader } from '../components/Header';
import { UpcomingJobsTable } from '../components/JobTables';
import { dashboardAPI } from '../services/dataService';
import type { UpcomingJob } from '../types';

const { Title, Text } = Typography;

export const UpcomingPage: React.FC = () => {
  const [jobs, setJobs] = useState<UpcomingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getUpcomingJobs();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching upcoming jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AppHeader />
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Upcoming Jobs
            </Title>
            <Text type="secondary">Plan ahead with scheduled production jobs and changeover times</Text>
          </div>

          {/* Jobs Table */}
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }} loading={loading}>
            <UpcomingJobsTable jobs={jobs} />
          </Card>
        </Space>
      </div>
    </div>
  );
};
