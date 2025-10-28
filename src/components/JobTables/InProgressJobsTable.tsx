import React from 'react';
import { Card, Table, Progress, Typography, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { InProgressJob } from '../../types';

const { Text } = Typography;

interface InProgressJobsTableProps {
  jobs: InProgressJob[];
  onJobClick?: (jobId: string) => void;
}

export const InProgressJobsTable: React.FC<InProgressJobsTableProps> = ({ jobs, onJobClick }) => {
  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'success';
    if (risk < 60) return 'warning';
    return 'error';
  };

  const columns: ColumnsType<InProgressJob> = [
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
      title: 'Completion',
      dataIndex: 'completion',
      key: 'completion',
      width: 150,
      render: (value: number) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text style={{ fontSize: 12 }}>{value}%</Text>
          <Progress
            percent={value}
            size="small"
            strokeColor="#1677ff"
            showInfo={false}
          />
        </Space>
      ),
      sorter: (a, b) => a.completion - b.completion,
    },
    {
      title: 'Waste Risk',
      dataIndex: 'wasteRisk',
      key: 'wasteRisk',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color={getRiskColor(value)}>
          {value.toFixed(0)}%
        </Tag>
      ),
      sorter: (a, b) => a.wasteRisk - b.wasteRisk,
    },
  ];

  return (
    <Card title="In-Progress Jobs" bordered={false}>
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
        scroll={{ x: 600 }}
      />
    </Card>
  );
};
