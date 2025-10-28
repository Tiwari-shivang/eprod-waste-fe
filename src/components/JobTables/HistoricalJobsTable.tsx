import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { HistoricalJob } from '../../types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface HistoricalJobsTableProps {
  jobs: HistoricalJob[];
  onJobClick?: (jobId: string) => void;
}

export const HistoricalJobsTable: React.FC<HistoricalJobsTableProps> = ({ jobs, onJobClick }) => {
  const columns: ColumnsType<HistoricalJob> = [
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
      title: 'Waste (kg)',
      dataIndex: 'waste',
      key: 'waste',
      width: 120,
      align: 'right',
      render: (value: number) => <Text strong>{value.toFixed(1)}</Text>,
      sorter: (a, b) => a.waste - b.waste,
    },
    {
      title: 'Saved (kg)',
      dataIndex: 'saved',
      key: 'saved',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <Text strong style={{ color: value > 0 ? '#52c41a' : '#8c8c8c' }}>
          {value > 0 ? '+' : ''}
          {value.toFixed(1)}
        </Text>
      ),
      sorter: (a, b) => a.saved - b.saved,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color={value > 0.8 ? 'success' : value > 0.6 ? 'warning' : 'default'}>
          {(value * 100).toFixed(0)}%
        </Tag>
      ),
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (value: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(value).format('MM/DD HH:mm')}
        </Text>
      ),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
  ];

  return (
    <Card title="Historical Jobs" bordered={false}>
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
