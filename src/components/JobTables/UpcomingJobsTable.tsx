import React from 'react';
import { Card, Table, Typography, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UpcomingJob } from '../../types';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UpcomingJobsTableProps {
  jobs: UpcomingJob[];
  onJobClick?: (jobId: string) => void;
}

export const UpcomingJobsTable: React.FC<UpcomingJobsTableProps> = ({ jobs, onJobClick }) => {
  const columns: ColumnsType<UpcomingJob> = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Text
          style={{ cursor: 'pointer', color: '#1677ff' }}
          onClick={() => onJobClick?.(text)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Paper Grade',
      dataIndex: 'paperGrade',
      key: 'paperGrade',
      ellipsis: true,
    },
    {
      title: 'Flute',
      dataIndex: 'flute',
      key: 'flute',
      width: 80,
      align: 'center',
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <Text>{value} min</Text>
        </Space>
      ),
      sorter: (a, b) => a.eta - b.eta,
    },
    {
      title: 'Changeover',
      dataIndex: 'changeoverDuration',
      key: 'changeoverDuration',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color="processing">{value} min</Tag>
      ),
      sorter: (a, b) => a.changeoverDuration - b.changeoverDuration,
    },
    {
      title: 'Expected Waste',
      key: 'expectedWaste',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.expectedWasteLow.toFixed(0)} - {record.expectedWasteHigh.toFixed(0)} kg
        </Text>
      ),
    },
  ];

  return (
    <Card title="Upcoming Jobs" bordered={false}>
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="jobId"
        pagination={{
          pageSize: 5,
          size: 'small',
          showSizeChanger: false,
        }}
        size="small"
        scroll={{ x: 800 }}
      />
    </Card>
  );
};
