import React, { useEffect, useState } from 'react';
import { Card, Typography, Space } from 'antd';
import { AppHeader } from '../components/Header';
import { InProgressJobsTable } from '../components/JobTables';
import { dashboardAPI } from '../services/dataService';
import type { InProgressJob } from '../types';

const { Title, Text } = Typography;

export const InProgressPage: React.FC = () => {
  const [jobs, setJobs] = useState<InProgressJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getAllInProgressJobs();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching in-progress jobs:', error);
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
              In Progress Jobs
            </Title>
            <Text type="secondary">Monitor all currently running production jobs</Text>
          </div>

          {/* Jobs Table */}
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }} loading={loading}>
            <InProgressJobsTable jobs={jobs} pageSize={10} showCard={false} />
          </Card>
        </Space>
      </div>
    </div>
  );
};
