import React from 'react';
import { Card, Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UpcomingJob } from '../../types';

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
      width: 180,
      ellipsis: true,
      render: (text: string) => (
        <Text
          style={{ cursor: 'pointer', color: '#1677ff', fontWeight: 500 }}
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
      width: 140,
      ellipsis: true,
    },
    {
      title: 'Flute Type',
      dataIndex: 'flute',
      key: 'flute',
      width: 90,
      align: 'center',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Thickness',
      dataIndex: 'thickness',
      key: 'thickness',
      width: 100,
      align: 'center',
    },
    {
      title: 'Change Over',
      dataIndex: 'changeoverDuration',
      key: 'changeoverDuration',
      width: 110,
      align: 'center',
      render: (value: number) => (
        <Tag color="processing">{value} min</Tag>
      ),
      sorter: (a, b) => a.changeoverDuration - b.changeoverDuration,
    },
    {
      title: 'Expected Waste',
      key: 'expectedWaste',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Text strong style={{ fontSize: 13, color: '#faad14' }}>
          {record.expectedWasteLow.toFixed(0)}-{record.expectedWasteHigh.toFixed(0)} kg
        </Text>
      ),
    },
  ];

  return (
    <Card title="Upcoming Jobs" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <style>{`
        .upcoming-jobs-table .ant-table-tbody > tr > td {
          padding: 8px 12px !important;
        }
        .upcoming-jobs-table .ant-table-thead > tr > th {
          padding: 10px 12px !important;
          font-weight: 600;
        }
      `}</style>
      <Table
        className="upcoming-jobs-table"
        columns={columns}
        dataSource={jobs}
        rowKey="jobId"
        pagination={{
          pageSize: 5,
          size: 'small',
          showSizeChanger: false,
        }}
        size="small"
        scroll={{ x: 950 }}
      />
    </Card>
  );
};
